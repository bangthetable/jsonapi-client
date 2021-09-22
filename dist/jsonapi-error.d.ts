declare type MetaObject = object;
declare type LinksObject = {
    about: string | {
        href: string;
        meta?: MetaObject;
    };
};
declare type ErrorSourceObject = {
    pointer?: string;
    parameter?: string;
};
declare type ErrorObject = {
    id?: string;
    links?: LinksObject;
    status?: string;
    code?: string;
    title?: string;
    detail?: string;
    source?: ErrorSourceObject;
    meta?: MetaObject;
};
declare type ExtractedErrors = {
    [k: string]: Array<ErrorObject>;
};
interface JSONAPIError {
    errors: Array<ErrorObject>;
    add(error: ErrorObject): void;
    count(): number;
    clear(): void;
    extract(): ExtractedErrors;
}
declare class JSONAPIError {
    errors: Array<ErrorObject>;
    constructor(args?: {
        errors?: Array<object>;
    });
    private processError;
    parsePointer(pointer: string): string | undefined;
}
export default JSONAPIError;
