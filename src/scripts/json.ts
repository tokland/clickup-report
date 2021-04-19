import fs from "fs";

import { Codec, Either } from "purify-ts";

export function getValidatedJsonFile<T>(options: { path: string; codec: Codec<T> }) {
    const { path, codec } = options;
    const value = JSON.parse(fs.readFileSync(path, "utf8"));
    return getOrThrowError(codec.decode(value));
}

function getOrThrowError<Data>(either: Either<string, Data>): Data {
    return either.mapLeft(err => new Error(err)).unsafeCoerce();
}
