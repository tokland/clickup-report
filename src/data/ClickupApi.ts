import _ from "lodash";
import QueryString from "qs";
import axiosCacheAdapter from "axios-cache-adapter";

import {
    ApiDate,
    Folder,
    FolderId,
    FutureData,
    GetTasksOptions,
    TaskId,
    TaskToSave,
    UserId,
} from "./ClickupApi.types";
import { List, Space, SpaceId, Task, Team, TimeEntry } from "./ClickupApi.types";
import { Future } from "../utils/future";
import { axiosRequest, defaultBuilder } from "./axios/future-axios";
import { FilesystemStore } from "./axios/FilesystemStore";
import { AxiosInstance } from "axios";

const initialPage = 0;

export class ClickupApi {
    instance: AxiosInstance;
    baseUrl = "https://api.clickup.com/api/v2";

    constructor(private options: { token: string; cacheDir: string }) {
        const store = new FilesystemStore({ cacheDir: options.cacheDir });

        this.instance = axiosCacheAdapter.setup({
            cache: { maxAge: 24 * 60 * 60 * 1000, store },
        });
    }

    private get<T>(
        endpoint: string,
        options: { cache?: boolean; params?: Record<string, string> } = {}
    ): FutureData<T> {
        const { cache = true, params = {} } = options;
        const query = QueryString.stringify(params, { addQueryPrefix: true });
        const url = this.baseUrl + endpoint + query;

        return axiosRequest<T>(this.instance, defaultBuilder, {
            headers: { Authorization: this.options.token },
            method: "GET",
            url: url,
            cache: { ignoreCache: !cache },
        });
    }

    private post<T>(endpoint: string, data: object): FutureData<T> {
        const url = this.baseUrl + endpoint;

        return axiosRequest<T>(this.instance, defaultBuilder, {
            headers: { Authorization: this.options.token },
            method: "POST",
            url: url,
            data: data,
        });
    }

    public getTeams(): FutureData<Team[]> {
        return this.get<{ teams: Team[] }>("/team").map(res => res.teams);
    }

    public getTimeEntries(options: {
        teamId: string;
        startDate: Date;
        endDate: Date;
        assignee: UserId[] | undefined;
    }): FutureData<TimeEntry[]> {
        const { teamId, startDate, endDate, assignee } = options;
        return this.get<{ data: TimeEntry[] }>(`/team/${teamId}/time_entries`, {
            cache: false,
            params: {
                start_date: getApiDate(startDate),
                end_date: getApiDate(endDate),
                ...(assignee ? { assignee: assignee.join(",") } : {}),
            },
        }).map(res => res.data);
    }

    public getTask(options: { taskId: TaskId }): FutureData<Task> {
        return this.get<Task>(`/task/${options.taskId}`);
    }

    public saveTask(task: TaskToSave): FutureData<Task> {
        return this.post<Task>(`/list/${task.list.id}/task`, task);
    }

    public getSpaces(options: { teamId: string }): FutureData<Space[]> {
        const { teamId } = options;
        return this.get<{ spaces: Space[] }>(`/team/${teamId}/space`).map(res => res.spaces);
    }

    public getFolder(options: { spaceId: SpaceId }): FutureData<Folder[]> {
        return this.get<{ folders: Folder[] }>(`/space/${options.spaceId}/folder`).map(
            res => res.folders
        );
    }

    public getLists(options: { folderId: FolderId }): FutureData<List[]> {
        return this.get<{ lists: List[] }>(`/folder/${options.folderId}/list`).map(
            res => res.lists
        );
    }

    public getTasks(options: GetTasksOptions): FutureData<Task[]> {
        const page = options.page || initialPage;
        const url = `/list/${options.listId}/task?include_closed=true&subtasks=true&page=${page}`;

        return this.get<{ tasks: Task[] }>(url)
            .map(res => res.tasks)
            .flatMap(tasks =>
                tasks.length >= 100 && options.page === undefined
                    ? this.getNextPageTasks(tasks, options)
                    : Future.success(tasks)
            );
    }

    private getNextPageTasks(tasks: Task[], options: GetTasksOptions): FutureData<Task[]> {
        const prevPage = options.page || initialPage;

        return this.getTasks({ ...options, page: prevPage + 1 }).map(nextPageTasks =>
            _.concat(tasks, nextPageTasks)
        );
    }
}

function getApiDate(date: Date): ApiDate {
    return date.getTime().toString();
}
