import { TimeSummaryClickupRepository, UserFilter } from "../data/TimeSummaryClickupRepository";
import { ShowSummaryByUserAndListUseCase } from "../domain/usecases/ShowSummaryByUserAndListUseCase";
import { getConfig } from "./common";

function main() {
    const { api, config, startDate, endDate } = getConfig();
    const userFilter: UserFilter = { teamName: config.teamName, userEmail: undefined };
    const timeSummaryRepository = new TimeSummaryClickupRepository(api, userFilter);
    const showTimeSummary = new ShowSummaryByUserAndListUseCase(timeSummaryRepository);

    showTimeSummary.execute({
        dateRange: { start: startDate.toJSDate(), end: endDate.toJSDate() },
    });
}

main();
