import _ from "lodash";
import fs from "fs";
import path from "path";
import { ArgumentParser } from "argparse";
import { Codec, Either, optional, string } from "purify-ts";

import { ClickupApi } from "../data/ClickupApi";
import { TimeSummaryClickupRepository } from "../data/TimeSummaryClickupRepository";
import { parseDate } from "../utils";
import { ShowTimeSummaryUseCase } from "../domain/usecases/ShowTimeSummaryUseCase";

function main() {
    const parser = new ArgumentParser({
        description: "Show time report from ClickUp",
    });

    parser.add_argument("-d", "--start-date", {
        help: "Start date, ISO format YYYY-MM-DD",
        required: true,
        dest: "startDate",
    });
    parser.add_argument("-e", "--end-date", {
        help: "End date, ISO format YYYY-MM-DD",
        dest: "endDate",
    });

    const args = getOrThrowError(argsCodec.decode(parser.parse_args()));
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

const argsCodec = Codec.interface({
    startDate: string,
    endDate: optional(string),
});

main();
