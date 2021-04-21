import _ from "lodash";
import { ArgumentParser } from "argparse";

export interface Option<T> {
    short: string;
    long: string;
    help: string;
    metavar?: string;
    required?: boolean;
    mapper(s: string): T;
}

export function parseArgs<Options extends OptionsRecord>(parseOptions: {
    description: string;
    options: Options;
}): Expand<GetType<Options>> {
    const { description, options } = parseOptions;
    const parser = new ArgumentParser({ description: description });

    _(options).each((option, key) => {
        parser.add_argument(option.short, option.long, {
            dest: key,
            help: option.help,
            required: option.required,
            metavar: option.metavar,
        });
    });

    const args = parser.parse_args();
    return mapArgs(args, options);
}

function mapArgs<Options extends OptionsRecord>(
    args: Record<string, any>,
    options: Options
): GetType<Options> {
    return _.mapValues(options, (option, key) => {
        const value = args[key];
        const res = value === undefined ? undefined : option.mapper(value);
        return res as any;
    });
}

/* Internal */

type Expand<T> = {} & { [P in keyof T]: T[P] };

type OptionsRecord = Record<string, Option<unknown>>;

type GetType<Opts extends OptionsRecord> = {
    [K in keyof Opts]:
        | ReturnType<Opts[K]["mapper"]>
        | (Opts[K]["required"] extends true ? never : undefined);
};

/* Testing */

type Options = {
    date: {
        short: string;
        long: string;
        help: string;
        required: true;
        mapper(s: string): string;
    };
    length: {
        short: string;
        long: string;
        help: string;
        required: false;
        mapper: (s: string) => number;
    };
};

type OptionsType = GetType<Options>;

// TODO: asserts

const _testOptionsType1: OptionsType = { date: "2020", length: undefined };
const _testOptionsType2: OptionsType = { date: "2020", length: 10 };
