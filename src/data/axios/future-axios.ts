import axios, { AxiosResponse, AxiosRequestConfig, AxiosInstance } from "axios";
import { Future } from "../../utils/future";

type AxiosRequest = AxiosRequestConfig;

export interface AxiosBuilder<D = unknown> {
    mapResponse(response: AxiosResponse<unknown>): ["success", D] | ["error", Error];
    mapNetworkError: (request: AxiosRequestConfig, error: Error) => Error;
}

export function axiosRequest<D>(
    instance: AxiosInstance,
    builder: AxiosBuilder,
    request: AxiosRequest
): Future<D> {
    return Future.fromComputation<D>((resolve, reject) => {
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

export type DefaultError = Error;

export type DefaultFutureData<Data> = Future<Data>;

export const defaultBuilder: AxiosBuilder = {
    mapResponse: res => {
        if (res.status >= 200 && res.status < 300) {
            return ["success", res.data];
        } else {
            return ["error", new Error(`[${res.status}] ${JSON.stringify(res.data)}`)];
        }
    },
    mapNetworkError: (_req, error) => new Error(`[Network Error] ${error.message}`),
};
