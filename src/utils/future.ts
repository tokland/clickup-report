import {
    buildCancellablePromise,
    CancellablePromise,
    Cancellation,
    pseudoCancellable,
} from "real-cancellable-promise";

type ParallelOptions = { concurrency: number };

export type Cancel = (() => void) | undefined;

interface CaptureAsync {
    <T>(async: Future<T>): Promise<T>;
    error: <T>(error: Error) => Promise<T>;
}

export class Future<T> {
    private constructor(private _promise: () => CancellablePromise<T>) {}

    static success<T>(data: T): Future<T> {
        return new Future(() => CancellablePromise.resolve(data));
    }

    static error<T>(error: Error): Future<T> {
        return new Future(() => CancellablePromise.reject(error));
    }

    static fromPromise<T>(promise: Promise<T>): Future<T> {
        return new Future(() => pseudoCancellable(promise));
    }

    static fromComputation<T>(
        computation: (resolve: (value: T) => void, reject: (error: Error) => void) => Cancel
    ): Future<T> {
        let cancel: Cancel = () => {};

        return new Future(() => {
            const promise = new Promise<T>((resolve, reject) => {
                cancel = computation(resolve, reject);
            });

            return new CancellablePromise(promise, cancel || (() => {}));
        });
    }

    run(onSuccess: (data: T) => void, onError: (error: Error) => void): Cancel {
        return this._promise().then(onSuccess, err => {
            if (err instanceof Cancellation) {
                // no-op
            } else if (err instanceof Error) {
                onError(err);
            } else {
                onError(new Error("Unknown error"));
            }
        }).cancel;
    }

    tap(cb: (data: T) => void): Future<T> {
        return this.map(data => {
            cb(data);
            return data;
        });
    }

    map<U>(fn: (data: T) => U): Future<U> {
        return new Future(() => this._promise().then(fn));
    }

    flatMap<U>(fn: (data: T) => Future<U>): Future<U> {
        return new Future(() => this._promise().then(data => fn(data)._promise()));
    }

    chain<U>(fn: (data: T) => Future<U>): Future<U> {
        return this.flatMap(fn);
    }

    toPromise(): Promise<T> {
        return this._promise();
    }

    toVoid(): Future<void> {
        return this.map(() => undefined);
    }

    static join2<T, S>(async1: Future<T>, async2: Future<S>): Future<[T, S]> {
        return new Future(() => {
            return CancellablePromise.all<T, S>([async1._promise(), async2._promise()]);
        });
    }

    static joinObj<Obj extends Record<string, Future<any>>>(
        obj: Obj,
        options: ParallelOptions = { concurrency: 1 }
    ): Future<{ [K in keyof Obj]: Obj[K] extends Future<infer U> ? U : never }> {
        const asyncs = Object.values(obj);

        return Future.parallel(asyncs, options).map(values => {
            const keys = Object.keys(obj);
            const pairs = keys.map((key, idx) => [key, values[idx]]);
            return Object.fromEntries(pairs);
        });
    }

    static sequential<T>(asyncs: Future<T>[]): Future<T[]> {
        return Future.block(async $ => {
            const output: T[] = [];
            for (const async of asyncs) output.push(await $(async));
            return output;
        });
    }

    static parallel<T>(asyncs: Future<T>[], options: ParallelOptions): Future<T[]> {
        return new Future(() =>
            buildCancellablePromise(async $ => {
                const queue: CancellablePromise<void>[] = [];
                const output: T[] = new Array(asyncs.length);

                for (const [idx, async] of asyncs.entries()) {
                    const queueItem$ = async._promise().then(res => {
                        queue.splice(queue.indexOf(queueItem$), 1);
                        output[idx] = res;
                    });

                    queue.push(queueItem$);

                    if (queue.length >= options.concurrency)
                        await $(CancellablePromise.race(queue));
                }

                await $(CancellablePromise.all(queue));
                return output;
            })
        );
    }

    static sleep(ms: number): Future<number> {
        return new Future(() => CancellablePromise.delay(ms)).map(() => ms);
    }

    static void(): Future<void> {
        return Future.success(undefined);
    }

    static block<U>(blockFn: (captureAsync: CaptureAsync) => Promise<U>): Future<U> {
        return new Future((): CancellablePromise<U> => {
            return buildCancellablePromise(capturePromise => {
                const captureAsync: CaptureAsync = async => capturePromise(async._promise());

                captureAsync.error = function <T>(err: Error) {
                    return capturePromise(CancellablePromise.reject(err)) as Promise<T>;
                };

                return blockFn(captureAsync);
            });
        });
    }
}
