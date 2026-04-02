import { Day } from "./Day";
import { Async, DateRange, OffDay, TimeEntry, TimeSummary } from "./entities";
import { WorkLog } from "./WorkLog";

export interface TimeSummaryRepository {
    get(dateRange: TimeSummaryRepositoryGetOptions): Async<TimeSummary>;
}

export interface WorkLogRepository {
    get(options: { from: Day; to: Day }): Async<WorkLog[]>;
    save(worklog: WorkLog): Async<{ url: string }>;
}

export interface OffDayRepository {
    getList(options: { name: string; from: Day; to: Day }): Async<OffDay[]>;
}

export interface TimeEntryRepository {
    get(options: { userId: string; from: Day; to: Day }): Async<TimeEntry[]>;
}

export type TimeSummaryRepositoryGetOptions = DateRange & { allUsers: boolean };
