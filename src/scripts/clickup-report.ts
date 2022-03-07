import _ from "lodash";
import path from "path";
import { Codec, string } from "purify-ts/Codec";

import { ClickupApi } from "../data/ClickupApi";
import { TimeSummaryClickupRepository } from "../data/TimeSummaryClickupRepository";
import { parseDate } from "../date-utils";
import { ShowTimeSummaryUseCase } from "../domain/usecases/ShowTimeSummaryUseCase";
import { parseArgs } from "./arguments-parser";
import { getValidatedJsonFile } from "./json";

function main() {
    const args = parseArgs({
        description: "Show time report from ClickUp",
        options: {
            startDate: {
                short: "-d",
                long: "--start-date",
                help: "Start date",
                required: true,
                mapper: String,
                metavar: "YYYY-MM-DD",
            },
            endDate: {
                short: "-e",
                long: "--end-date",
                help: "End date",
                required: false,
                mapper: String,
                metavar: "YYYY-MM-DD",
            },
        },
    });
    const startDate = parseDate(args.startDate);
    const endDate = args.endDate ? parseDate(args.endDate).endOf("day") : startDate.endOf("month");

    const configPath = path.join(__dirname, "../..", "config.json");
    console.error("Using config file:", configPath);
    const config = getValidatedJsonFile({
        path: configPath,
        codec: Codec.interface({
            token: string,
            teamName: string,
            userEmail: string,
        }),
    });

    const cacheDir = path.join(__dirname, "../..", "cache");
    const api = new ClickupApi({ token: config.token, cacheDir });
    const userFilter = { teamName: config.teamName, userEmail: config.userEmail };
    const timeSummaryRepository = new TimeSummaryClickupRepository(api, userFilter);
    const showTimeSummary = new ShowTimeSummaryUseCase(timeSummaryRepository);

    showTimeSummary.execute({
        dateRange: {
            start: startDate.toJSDate(),
            end: endDate.toJSDate(),
        },
    });
}

main();
