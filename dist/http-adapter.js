"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var fetchImport = require("isomorphic-fetch");
var fetch = (fetchImport.default || fetchImport);
var HttpVerb;
(function (HttpVerb) {
    HttpVerb["Get"] = "GET";
    HttpVerb["Post"] = "POST";
    HttpVerb["Put"] = "PUT";
    HttpVerb["Patch"] = "PATCH";
    HttpVerb["Delete"] = "DELETE";
})(HttpVerb || (HttpVerb = {}));
var HttpAdapter = /** @class */ (function () {
    function HttpAdapter(args) {
        if (args === void 0) { args = {}; }
        this.host = args.host || args.baseURL || '';
        this.namespace = args.namespace || '';
        this.headers = __assign({ 'content-type': 'application/json' }, args.headers);
    }
    HttpAdapter.prototype.extractResponseHeaders = function (response) {
        var object = {};
        response.headers.forEach(function (value, key) {
            object[key] = value;
        });
        return object;
    };
    HttpAdapter.prototype.request = function (method, url, data) {
        var _this = this;
        var endpoint = this.host + this.namespace + url;
        var options = {
            method: method,
            headers: this.headers,
        };
        if (data) {
            options.body = JSON.stringify(data);
        }
        return fetch(endpoint, options).then(function (response) {
            var payload = {
                status: response.status,
                statusText: response.statusText,
                headers: _this.extractResponseHeaders(response),
            };
            return response.text().then(function (text) {
                try {
                    payload.data = JSON.parse(text);
                }
                catch (err) {
                    payload.data = undefined;
                }
                finally {
                    if (response.ok) {
                        return payload;
                    }
                    throw payload;
                }
            });
        });
    };
    HttpAdapter.prototype.get = function (url) {
        return this.request(HttpVerb.Get, url);
    };
    HttpAdapter.prototype.post = function (url, data) {
        return this.request(HttpVerb.Post, url, data);
    };
    HttpAdapter.prototype.put = function (url, data) {
        return this.request(HttpVerb.Put, url, data);
    };
    HttpAdapter.prototype.patch = function (url, data) {
        return this.request(HttpVerb.Patch, url, data);
    };
    HttpAdapter.prototype.delete = function (url) {
        return this.request(HttpVerb.Delete, url);
    };
    return HttpAdapter;
}());
exports.default = HttpAdapter;
