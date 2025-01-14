import JSONAPIError from './jsonapi-error';
import HttpAdapter, { ResponsePayload, HttpAdapterConstructor } from './http-adapter';
import { SerializerOptions, DeserializerOptions } from 'jsonapi-serializer';
declare type ModelConstructor = {
    id?: string | number;
    links?: object;
    meta?: object;
    [k: string]: any;
};
declare type Collection<T> = T[] & {
    links?: object;
    meta?: object;
};
declare const ErrorsSymbol: unique symbol;
declare const PersistedSymbol: unique symbol;
declare const LinksSymbol: unique symbol;
declare const MetaSymbol: unique symbol;
declare class Model {
    static baseURL: string;
    static _type: string;
    id: string;
    private [ErrorsSymbol];
    private [PersistedSymbol];
    private [LinksSymbol];
    private [MetaSymbol];
    constructor(args?: ModelConstructor);
    get errors(): JSONAPIError;
    set errors(errors: JSONAPIError);
    get persisted(): boolean;
    set persisted(persisted: boolean);
    get links(): object;
    set links(links: object);
    get meta(): object;
    set meta(meta: object);
    static urlParams(): string[] | null;
    hasMany<T extends Model>(Klass: new (args: object) => T, array?: object[]): Array<T>;
    belongsTo<T extends Model>(Klass: new (args: object) => T, object?: object): T;
    hasOne<T extends Model>(Klass: new (args: object) => T, object?: object): T;
    isRelationship(key: string): boolean;
    isAttribute(key: string): boolean;
    static keysForAttributes(): string[];
    static keysForRelationships(): string[];
    attributes(): object;
    static toQueryString(params?: object, prefix?: string): string;
    static constructBaseURL(args?: object): string;
    constructBaseURL(): string | never;
    serializerOptions(): SerializerOptions;
    static deserializerOptions: DeserializerOptions;
    serialize(): object;
    static deserialize(response: object): Promise<Model> | Promise<Collection<Model>>;
    validate(): void;
    get valid(): boolean;
    static adapter: HttpAdapter;
    static configureAdapter(object?: HttpAdapterConstructor): void;
    static fetch(id: any, args?: {}, query?: any): Promise<Model>;
    static fetchAll(args?: object): Promise<Collection<Model>>;
    static query(query: any, args: any): Promise<Collection<Model>>;
    private _update;
    private _create;
    private processErrorResponse;
    save(): Promise<Model>;
    static destroy(id: any, args?: {}): Promise<ResponsePayload>;
    destroy(): Promise<ResponsePayload>;
    static new(args?: ModelConstructor): Model;
}
export = Model;
