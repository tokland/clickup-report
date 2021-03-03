export interface DateRange {
    start: Date;
    end: Date;
}

export interface TimeTask {
    taskName: string;
    taskId: string;
    folderName: string;
    date: Date;
    duration: number; // hours
}

export interface TimeSummary {
    dateRange: DateRange;
    total: number;
    timeTasks: TimeTask[];
    timeByFolder: Array<{ folderName: string; duration: number }>;
}
