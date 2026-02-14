import { Day } from "./Day";
import { Async, DateRange, TimeSummary } from "./entities";
import { WorkLog } from "./WorkLog";

export interface TimeSummaryRepository {
    get(dateRange: TimeSummaryRepositoryGetOptions): Async<TimeSummary>;
}

export type TimeSummaryRepositoryGetOptions = DateRange & {
    allUsers: boolean;
};

export interface WorkLogRepository {
    get(options: { from: Day; to: Day }): Async<WorkLog[]>;
    save(worklog: WorkLog): Async<WorklogResponse>;
}

type WorklogResponse = {
    url: string;
};
