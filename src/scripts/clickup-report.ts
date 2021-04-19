import _ from "lodash";
import fs from "fs";
import path from "path";
import { Codec, Either, string } from "purify-ts";

import { ClickupApi } from "../data/ClickupApi";
import { TimeSummaryClickupRepository } from "../data/TimeSummaryClickupRepository";
import { parseDate } from "../utils";
import { ShowTimeSummaryUseCase } from "../domain/usecases/ShowTimeSummaryUseCase";
import { parseArgs } from "./arguments-parser";

function main() {
    const args = parseArgs({
        description: "Show time report from ClickUp",
        options: {
            startDate: {
                short: "-d",
                long: "--start-date",
                help: "Start date",
                required: true as const,
                type: "string" as const,
                metavar: "YYYY-MM-DD",
            },
            endDate: {
                short: "-e",
                long: "--end-date",
                help: "End date",
                required: false as const,
                type: "string" as const,
                metavar: "YYYY-MM-DD",
            },
        },
    });
    const startDate = parseDate(args.startDate);
    const endDate = args.endDate ? parseDate(args.endDate) : startDate.endOf("month");

    const configPath = path.join(__dirname, "../../config.json");
    console.debug("Using config file:", configPath);
    const configNotValidated = JSON.parse(fs.readFileSync(configPath, "utf8"));
    const config = getOrThrowError(configCodec.decode(configNotValidated));

    const cacheDir = path.join(__dirname, "../../cache");
    const api = new ClickupApi({ token: config.token, cacheDir });
    const timeSummaryRepository = new TimeSummaryClickupRepository(api, config);
    const showTimeSummary = new ShowTimeSummaryUseCase(timeSummaryRepository);

    showTimeSummary.execute({
        dateRange: {
            start: startDate.toJSDate(),
            end: endDate.toJSDate(),
        },
    });
}

export function getOrThrowError<Data>(either: Either<string, Data>): Data {
    return either.mapLeft(err => new Error(err)).unsafeCoerce();
}

const configCodec = Codec.interface({
    token: string,
    teamName: string,
    userEmail: string,
});

main();
