import { DefaultFutureData } from "./axios/future-axios";

export type Endpoint = "/team" | `/team/${string}/time_entries`;

export type ApiDate = string; // msecs from 1970
export type DurationMs = string; // msecs

type TeamId = string;

export interface Team {
    id: TeamId;
    name: string;
    members: Member[];
}

export interface Member {
    user: {
        id: UserId;
        username: string;
        email: string;
        color: string;
        initials: string;
        role: number;
        last_active: string;
    };
}

export type UserId = number;

export type TimeEntryId = string;

export interface TimeEntry {
    id: TimeEntryId;
    wid: TeamId;
    billable: boolean;
    start: ApiDate;
    end: ApiDate;
    duration: DurationMs;
    description: string;
    tags: [];
    source: "clickup";
    at: ApiDate;
    task: string | { id: TaskId; name: string } | undefined; // "0" when no task assigned
    user: {
        id: UserId;
        username: string;
        email: string;
        color: string;
        initials: string;
        profilePicture: string | null;
    };
}

export type SpaceId = string;

export interface Space {
    id: SpaceId;
    name: string;
}

export type FolderId = string;

export interface Folder {
    id: FolderId;
    name: string;
    lists: Array<{ id: string; name: string }>;
}

export type ListId = string;

export interface List {
    id: ListId;
    name: string;
}

export type TaskId = string;

export interface Task {
    id: TaskId;
    name: string;
    team_id: string;
    url: string;
    parent: TaskId;
    list: {
        id: ListId;
        name: string;
    };
    project: {
        id: string;
        name: string;
    };
    folder: {
        id: FolderId;
        name: string;
    };
    space: {
        id: SpaceId;
    };
}

export interface GetTasksOptions {
    listId: ListId;
    page?: number;
}

export type { DefaultFutureData as FutureData };
