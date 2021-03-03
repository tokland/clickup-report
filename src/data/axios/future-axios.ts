import axios, { AxiosResponse, AxiosRequestConfig, AxiosInstance } from "axios";
import { Future } from "../../utils/future";

type AxiosRequest = AxiosRequestConfig;

export interface AxiosBuilder<E, D = unknown> {
    mapResponse(response: AxiosResponse<unknown>): ["success", D] | ["error", E];
    mapNetworkError: (request: AxiosRequestConfig, message: string) => E;
}

export function axiosRequest<E, D>(
    instance: AxiosInstance,
    builder: AxiosBuilder<E>,
    request: AxiosRequest
): Future<E, D> {
    return Future.fromComputation<E, D>((resolve, reject) => {
        const source = axios.CancelToken.source();

        const fullRequest: AxiosRequest = {
            ...request,
            validateStatus: _status => true,
            cancelToken: source.token,
        };

        instance
            .request(fullRequest)
            .then(res => {
                const { fromCache = false } = res.request;
                if (!fromCache)
                    console.debug((fullRequest.method || "GET").toUpperCase(), fullRequest.url);

                const result = builder.mapResponse(res);
                if (result[0] === "success") {
                    resolve(result[1] as D);
                } else {
                    reject(result[1]);
                }
            })
            .catch(err => {
                const message = (err && err.message) || "Unknown error";
                reject(builder.mapNetworkError(fullRequest, message));
            });

        return () => source.cancel();
    });
}

export type DefaultError = string;

export type DefaultFutureData<Data> = Future<DefaultError, Data>;

export const defaultBuilder: AxiosBuilder<DefaultError> = {
    mapResponse: res => {
        if (res.status >= 200 && res.status < 300) {
            return ["success", res.data];
        } else {
            return ["error", `[${res.status}] ${JSON.stringify(res.data)}`];
        }
    },
    mapNetworkError: (_req, message) => message,
};
