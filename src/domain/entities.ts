import { Future } from "../utils/future";

export type TimeSummary = {
    dateRange: DateRange;
    total: number;
    timeTasks: TimeTask[];
    timeByFolder: Array<{ folderName: string; duration: number }>;
};

export type TimeTask = {
    username: string;
    taskName: string;
    taskId: string;
    list: { name: string };
    projectName: string;
    date: Date;
    duration: number; // hours
    note: string;
    billable: boolean;
};

export type DateRange = {
    start: Date;
    end: Date;
};

export type Async<Data> = Future<Data>;
