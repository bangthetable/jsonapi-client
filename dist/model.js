"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var Serializer = require("jsonapi-serializer/lib/serializer");
var Deserializer = require("jsonapi-serializer/lib/deserializer");
var jsonapi_error_1 = require("./jsonapi-error");
var http_adapter_1 = require("./http-adapter");
var ErrorsSymbol = Symbol('errors');
var PersistedSymbol = Symbol('persisted');
var RelationshipSymbol = Symbol('relationship');
var LinksSymbol = Symbol('links');
var MetaSymbol = Symbol('meta');
var Model = /** @class */ (function () {
    function Model(args) {
        if (args === void 0) { args = {}; }
        this.id = !!args.id ? String(args.id) : Math.random().toString(36).substring(2, 15);
        this.errors = new jsonapi_error_1.default();
        this.persisted = !!args.id;
        this.links = args.links || {};
        this.meta = args.meta || {};
    }
    Object.defineProperty(Model.prototype, "errors", {
        get: function () {
            return this[ErrorsSymbol];
        },
        set: function (errors) {
            this[ErrorsSymbol] = errors;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Model.prototype, "persisted", {
        get: function () {
            return this[PersistedSymbol];
        },
        set: function (persisted) {
            this[PersistedSymbol] = persisted;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Model.prototype, "links", {
        get: function () {
            return this[LinksSymbol];
        },
        set: function (links) {
            this[LinksSymbol] = links;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Model.prototype, "meta", {
        get: function () {
            return this[MetaSymbol];
        },
        set: function (meta) {
            this[MetaSymbol] = meta;
        },
        enumerable: true,
        configurable: true
    });
    Model.urlParams = function () {
        return this.baseURL.match(/:\w+/g);
    };
    Model.prototype.hasMany = function (Klass, array) {
        if (array === void 0) { array = []; }
        var many = array.map(function (object) { return new Klass(object); });
        many[RelationshipSymbol] = Klass;
        return many;
    };
    Model.prototype.belongsTo = function (Klass, object) {
        if (object === void 0) { object = {}; }
        var one = new Klass(object);
        one[RelationshipSymbol] = Klass;
        return one;
    };
    Model.prototype.hasOne = function (Klass, object) {
        if (object === void 0) { object = {}; }
        var one = new Klass(object);
        one[RelationshipSymbol] = Klass;
        return one;
    };
    Model.prototype.isRelationship = function (key) {
        return this.hasOwnProperty(key) && Object.getOwnPropertySymbols(this[key] || {}).indexOf(RelationshipSymbol) > -1;
    };
    Model.prototype.isAttribute = function (key) {
        return (this.hasOwnProperty(key) &&
            key !== 'id' &&
            typeof key !== 'function' &&
            Object.getOwnPropertySymbols(this[key] || {}).indexOf(RelationshipSymbol) === -1);
    };
    Model.keysForAttributes = function () {
        var model = new this();
        var keys = [];
        for (var key in model) {
            if (this.prototype.isAttribute.call(model, key)) {
                keys.push(key);
            }
        }
        return keys;
    };
    Model.keysForRelationships = function () {
        var model = new this();
        var keys = [];
        for (var key in model) {
            if (this.prototype.isRelationship.call(model, key)) {
                keys.push(key);
            }
        }
        return keys;
    };
    Model.prototype.attributes = function () {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        var object = {};
        for (var key in this) {
            if (this.isAttribute(key)) {
                object[key] = this[key];
            }
        }
        return object;
    };
    Model.toQueryString = function (params, prefix) {
        var _this = this;
        if (params === void 0) { params = {}; }
        if (prefix === void 0) { prefix = ''; }
        var query = Object.keys(params).map(function (k) {
            var key = k;
            var value = params[key];
            if (params.constructor === Array) {
                key = encodeURIComponent(prefix + "[]");
            }
            else if (params.constructor === Object) {
                key = prefix ? prefix + "[" + key + "]" : key;
            }
            if (typeof value === 'object') {
                return _this.toQueryString(value, key);
            }
            return key + "=" + encodeURIComponent(value);
        });
        return __spreadArrays(query).join('&');
    };
    Model.constructBaseURL = function (args) {
        if (args === void 0) { args = {}; }
        var urlParams = this.urlParams();
        if (!urlParams) {
            return this.baseURL;
        }
        var url = this.baseURL;
        urlParams.forEach(function (item) {
            url = url.replace(item, args[item.substring(1)]);
        });
        return url;
    };
    Model.prototype.constructBaseURL = function () {
        var urlParams = Model.urlParams();
        if (!urlParams) {
            // eslint-disable-next-line
            // @ts-ignore
            return this.constructor.baseURL;
        }
        throw new Error('Missing url params: ' +
            urlParams.join(', ') +
            '.\n' +
            // eslint-disable-next-line
            // @ts-ignore
            'Override the #constructBaseURL() method of ' +
            this.constructor.name +
            '.');
    };
    Model.prototype.serializerOptions = function () {
        var _this = this;
        var object = {};
        // eslint-disable-next-line
        // @ts-ignore
        var keysForAttributes = this.constructor.keysForAttributes();
        // eslint-disable-next-line
        // @ts-ignore
        var keysForRelationships = this.constructor.keysForRelationships();
        object.attributes = __spreadArrays(keysForAttributes, keysForRelationships);
        keysForRelationships.forEach(function (key) {
            var Relationship = _this[key][RelationshipSymbol];
            object[key] = {
                ref: 'id',
                attributes: Relationship.keysForAttributes(),
            };
        });
        return object;
    };
    Model.prototype.serialize = function () {
        // eslint-disable-next-line
        // @ts-ignore
        var _type = this.constructor._type;
        if (!_type) {
            throw new Error('Resource object missing jsonapi type.\nSet static property _type to the model class.');
        }
        return new Serializer(_type, this.serializerOptions()).serialize(this);
    };
    Model.deserialize = function (response) {
        var _this = this;
        return new Deserializer(this.deserializerOptions).deserialize(response).then(function (data) {
            if (Array.isArray(data)) {
                var collection = data.map(function (object) { return new _this(object); });
                if (data.links) {
                    collection.links = data.links;
                }
                if (data.meta) {
                    collection.meta = data.meta;
                }
                return collection;
            }
            return new _this(data);
        });
    };
    // Run model validations in this hook
    // Ex:
    // class Foo extends Model {
    //   validate() {
    //     if (isBlank(this.name)) {
    //       this.errors.add({
    //         code: 'blank',
    //         source: {
    //           pointer: '/data/attributes/name'
    //         }
    //       });
    //     }
    //   }
    // }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    Model.prototype.validate = function () { };
    Object.defineProperty(Model.prototype, "valid", {
        get: function () {
            this.errors.clear();
            this.validate();
            return this.errors.count() === 0;
        },
        enumerable: true,
        configurable: true
    });
    Model.configureAdapter = function (object) {
        if (object === void 0) { object = {}; }
        this.adapter = new http_adapter_1.default(object);
    };
    Model.fetch = function (id, args, query) {
        var _this = this;
        if (args === void 0) { args = {}; }
        var requestURL = this.constructBaseURL(args) + "/" + id;
        if (typeof query === 'object') {
            requestURL += "?" + this.toQueryString(query);
        }
        return (this.adapter
            .get(requestURL)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .then(function (response) { return _this.deserialize(response.data); }));
    };
    Model.fetchAll = function (args) {
        var _this = this;
        if (args === void 0) { args = {}; }
        return (this.adapter
            .get(this.constructBaseURL(args))
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .then(function (response) { return _this.deserialize(response.data); }));
    };
    Model.query = function (query, args) {
        var _this = this;
        var requestURL = this.constructBaseURL(args);
        var queryString = this.toQueryString(query);
        return (this.adapter
            .get(requestURL + "?" + queryString)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .then(function (response) { return _this.deserialize(response.data); }));
    };
    Model.prototype._update = function () {
        // eslint-disable-next-line
        // @ts-ignore
        return this.constructor.adapter.patch(this.constructBaseURL() + "/" + this.id, this.serialize());
    };
    Model.prototype._create = function () {
        // eslint-disable-next-line
        // @ts-ignore
        return this.constructor.adapter.post(this.constructBaseURL(), this.serialize());
    };
    Model.prototype.processErrorResponse = function (response) {
        this.errors = new jsonapi_error_1.default(response.data);
        throw response;
    };
    Model.prototype.save = function () {
        var _this = this;
        if (!this.valid)
            return Promise.reject(new Error('Unprocessable Entity'));
        return (this.persisted ? this._update() : this._create())
            .then(function (response) {
            // eslint-disable-next-line
            // @ts-ignore
            return _this.constructor.deserialize(response.data);
        })
            .catch(this.processErrorResponse.bind(this));
    };
    Model.destroy = function (id, args) {
        if (args === void 0) { args = {}; }
        return this.adapter.delete(this.constructBaseURL(args) + "/" + id);
    };
    Model.prototype.destroy = function () {
        // eslint-disable-next-line
        // @ts-ignore
        return this.constructor.adapter.delete(this.constructBaseURL() + "/" + this.id);
    };
    Model.new = function (args) {
        if (args === void 0) { args = {}; }
        return new this(args);
    };
    Model.baseURL = '';
    Model._type = '';
    Model.deserializerOptions = {
        keyForAttribute: 'camelCase',
    };
    return Model;
}());
module.exports = Model;
