import _ from "lodash";
import { ArgumentParser } from "argparse";
import { Codec, Either, string, number, optional } from "purify-ts";

export interface Option {
    short: string;
    long: string;
    help: string;
    metavar?: string;
    required?: boolean;
    type: OptionType;
}

export function parseArgs<Options extends OptionsRecord>(allOptions: {
    description: string;
    options: Options;
}): Expand<GetType<Options>> {
    const { description, options } = allOptions;
    const parser = new ArgumentParser({ description: description });
    const optionsCodecs = getCodec(options);
    const argsCodec = Codec.interface(optionsCodecs);

    _(options).each((option, key) => {
        parser.add_argument(option.short, option.long, {
            help: option.help,
            required: option.required,
            dest: key,
            metavar: option.metavar,
        });
    });

    return getOrThrowError(argsCodec.decode(parser.parse_args()));
}

/* Internal */

const mapping = {
    string: string,
    number: number,
};

type Expand<T> = {} & { [P in keyof T]: T[P] };

type OptionsRecord = Record<string, Option>;

type OptionTypeMapping = { string: string; number: number };

type UnionOfCodecTypes = Codec<OptionTypeMapping[keyof OptionTypeMapping]>;

type OptionType = keyof OptionTypeMapping;

type GetType<Opts extends OptionsRecord> = {
    [K in keyof Opts]:
        | OptionTypeMapping[Opts[K]["type"]]
        | (Opts[K]["required"] extends true ? never : undefined);
};

type GetCodec<Opts extends OptionsRecord> = {
    [K in keyof GetType<Opts>]: Codec<GetType<Opts>[K]>;
};

function getCodec<Options extends OptionsRecord>(options: Options): GetCodec<Options> {
    const options2 = _.mapValues(options, option => {
        const type = mapping[option.type];
        return option.required ? type : optional(type as UnionOfCodecTypes);
    });
    return (options2 as unknown) as GetCodec<Options>;
}

function getOrThrowError<Data>(either: Either<string, Data>): Data {
    return either.mapLeft(err => new Error(err)).unsafeCoerce();
}

/* Testing */

type Options = {
    date: { short: string; long: string; help: string; required: true; type: "string" };
    length: { short: string; long: string; help: string; required: false; type: "number" };
};

type OptionsType = GetType<Options>;

const _testOptionsType1: OptionsType = { date: "2020", length: undefined };
const _testOptionsType2: OptionsType = { date: "2020", length: 10 };
