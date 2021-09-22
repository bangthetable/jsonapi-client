"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var JSONAPIError = /** @class */ (function () {
    function JSONAPIError(args) {
        if (args === void 0) { args = {}; }
        var errors = Array.isArray(args.errors) ? args.errors : [];
        this.errors = errors.map(this.processError);
    }
    JSONAPIError.prototype.processError = function (error) {
        var object = {};
        if (error.id) {
            object.id = error.id;
        }
        if (error.status) {
            object.status = error.status;
        }
        if (error.code) {
            object.code = error.code;
        }
        if (error.title) {
            object.title = error.title;
        }
        if (error.detail) {
            object.detail = error.detail;
        }
        if (error.meta) {
            object.meta = error.meta;
        }
        if (error.links) {
            if (error.links.about) {
                object.links = {
                    about: error.links.about,
                };
            }
        }
        if (error.source) {
            object.source = {};
            if (error.source.pointer) {
                object.source.pointer = error.source.pointer;
            }
            if (error.source.parameter) {
                object.source.parameter = error.source.parameter;
            }
        }
        return object;
    };
    JSONAPIError.prototype.clear = function () {
        this.errors = [];
    };
    JSONAPIError.prototype.count = function () {
        return this.errors.length;
    };
    JSONAPIError.prototype.parsePointer = function (pointer) {
        if (pointer === '/data') {
            return 'base';
        }
        if (pointer.indexOf('/data/attributes/') === 0) {
            return pointer.substring('/data/attributes/'.length, pointer.length);
        }
    };
    JSONAPIError.prototype.extract = function () {
        var _this = this;
        return this.errors.reduce(function (a, b) {
            if (b.source) {
                var key = void 0;
                key = b.source.parameter;
                if (!key && b.source.pointer) {
                    key = _this.parsePointer(b.source.pointer);
                }
                if (key) {
                    if (a.hasOwnProperty(key)) {
                        a[key].push(b);
                    }
                    else {
                        a[key] = [b];
                    }
                }
            }
            return a;
        }, {});
    };
    JSONAPIError.prototype.add = function (error) {
        this.errors.push(this.processError(error));
    };
    return JSONAPIError;
}());
exports.default = JSONAPIError;
