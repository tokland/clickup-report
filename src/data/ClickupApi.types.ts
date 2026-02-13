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

type Reference = {
    id: ListId;
    name?: string;
    hidden?: boolean;
    access?: boolean;
};

type BaseTask = {
    name: string;
    text_content: string;
    description: string;
    list: Reference;
    parent: TaskId | null;
    custom_fields: Array<{
        id: string;
        name: string;
        type: "short_text" | "text" | "signature" | "date";
        value: string;
        value_options?: unknown;
        required: boolean;
    }>;
};

export type TaskToSave = BaseTask & {
    status: string;
    assignees: Array<UserId>;
};

export type Task = BaseTask & {
    id: TaskId;
    url: string;
    assignees: Array<{ id: UserId }>;
    status: { id: string };
    sharing: { public: boolean };
    team_id: string;
    project: Reference;
    folder: Reference;
    space: Reference;
};

export interface GetTasksOptions {
    listId: ListId;
    page?: number;
}

export type { DefaultFutureData as FutureData };
