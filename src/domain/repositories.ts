import { Async, DateRange, TimeSummary } from "./entities";
import { WorkLog } from "./WorkLog";

export interface TimeSummaryRepository {
    get(dateRange: TimeSummaryRepositoryGetOptions): Async<TimeSummary>;
}

export interface TimeSummaryRepositoryGetOptions extends DateRange {
    allUsers: boolean;
}

export interface WorkLogRepository {
    save(worklog: WorkLog): Async<WorklogResponse>;
}

type WorklogResponse = {
    url: string;
};
