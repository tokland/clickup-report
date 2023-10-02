export interface TimeSummary {
    dateRange: DateRange;
    total: number;
    timeTasks: TimeTask[];
    timeByFolder: Array<{ folderName: string; duration: number }>;
}

export interface TimeTask {
    username: string;
    taskName: string;
    taskId: string;
    list: { name: string };
    projectName: string;
    date: Date;
    duration: number; // hours
    note: string;
    billable: boolean;
}

export interface DateRange {
    start: Date;
    end: Date;
}
