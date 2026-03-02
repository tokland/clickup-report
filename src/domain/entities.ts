import { Future } from "../utils/future";
import { Day } from "./Day";
import { Struct } from "./Struct";

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

type OffDayAttrs = {
    name: string;
    day: Day;
};

export class OffDay extends Struct<OffDayAttrs>() {
    asString(): string {
        return `${this.name} (${this.day.asString()})`;
    }
}

export type Async<Data> = Future<Data>;
