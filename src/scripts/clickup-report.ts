import _ from "lodash";

import { TimeSummaryClickupRepository } from "../data/TimeSummaryClickupRepository";
import { ShowTimeSummaryUseCase } from "../domain/usecases/ShowTimeSummaryUseCase";
import { getConfig } from "./common";

function main() {
    const { api, config, startDate, endDate } = getConfig();
    const userFilter = { teamName: config.teamName, userEmail: config.userEmail };
    const timeSummaryRepository = new TimeSummaryClickupRepository(api, userFilter);
    const showTimeSummary = new ShowTimeSummaryUseCase(timeSummaryRepository);

    showTimeSummary.execute({
        dateRange: { start: startDate.toJSDate(), end: endDate.toJSDate() },
    });
}

main();
