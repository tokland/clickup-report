export interface TimeSummary {
    dateRange: DateRange;
    total: number;
    timeTasks: TimeTask[];
    timeByFolder: Array<{ folderName: string; duration: number }>;
}

export interface TimeTask {
    taskName: string;
    taskId: string;
    projectName: string;
    date: Date;
    duration: number; // hours
    note: string;
}

export interface DateRange {
    start: Date;
    end: Date;
}
