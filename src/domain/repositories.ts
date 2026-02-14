import { Day } from "./Day";
import { Async, DateRange, TimeSummary } from "./entities";
import { WorkLog } from "./WorkLog";

export interface TimeSummaryRepository {
    get(dateRange: TimeSummaryRepositoryGetOptions): Async<TimeSummary>;
}

export interface WorkLogRepository {
    get(options: { from: Day; to: Day }): Async<WorkLog[]>;
    save(worklog: WorkLog): Async<{ url: string }>;
}

export type TimeSummaryRepositoryGetOptions = DateRange & { allUsers: boolean };
