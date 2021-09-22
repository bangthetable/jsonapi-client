declare type ResponseHeadersForEach = (value: string, key: string) => void;
declare type FetchResponse = {
    ok: boolean;
    status: number;
    statusText: string;
    headers: {
        forEach: (callback: ResponseHeadersForEach) => void;
    };
    text: () => Promise<string>;
};
declare type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
declare type RequestHeaders = {
    'content-type': 'application/json';
    [k: string]: string;
};
export declare type ResponsePayload = {
    status: number;
    statusText: string;
    headers: object;
    data?: object | undefined;
};
export declare type HttpResponse = Promise<ResponsePayload>;
export declare type HttpAdapterConstructor = {
    host?: string;
    baseURL?: string;
    namespace?: string;
    headers?: object;
};
interface HttpAdapterInterface {
    host: string;
    namespace: string;
    headers: RequestHeaders;
    get(url: string): HttpResponse;
    post(url: string, data: object): HttpResponse;
    put(url: string, data: object): HttpResponse;
    patch(url: string, data: object): HttpResponse;
    delete(url: string): HttpResponse;
}
declare class HttpAdapter implements HttpAdapterInterface {
    host: string;
    namespace: string;
    headers: RequestHeaders;
    constructor(args?: HttpAdapterConstructor);
    extractResponseHeaders(response: FetchResponse): object;
    request(method: HttpMethod, url: string, data?: object): HttpResponse;
    get(url: string): HttpResponse;
    post(url: string, data: object): HttpResponse;
    put(url: string, data: object): HttpResponse;
    patch(url: string, data: object): HttpResponse;
    delete(url: string): HttpResponse;
}
export default HttpAdapter;
