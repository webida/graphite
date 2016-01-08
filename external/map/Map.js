'use strict';
(function (global) {

    function MapIterator(map) {
        this._map = map;
    }

    MapIterator.prototype = Object.create(Object.prototype, {
        
        '_cursor': {
            value: 0,
            writable: true
        },
        
        '_map': {
            writable: true
        },
        
        'next': {
            value: function () {
                return this._map.get(this._cursor++);
            }
        },

        '_hasNext': {
            value: function () {
                var map = this._map;
                var cursor = this._cursor;
                var maxIndex;
                if (!map) {
                    return false;
                }
                maxIndex = map.size - 1;
                if (cursor <= maxIndex) {
                    return true;
                }
                return false;
            }
        },
    });

    function _Map() {
        this._keys = [];
        this._values = [];
    }

    _Map.prototype = Object.create(Object.prototype, {

        '_keys': {
            writable: true
        },

        '_values': {
            writable: true
        },

        'size': {
            value: 0,
            writable: true
        },

        'set': {
            value: function (key, value) {
                var index = this._keys.indexOf(key);
                if (index > -1) {
                    this._values[index] = value;
                } else {
                    this._keys.push(key);
                    this._values.push(value);
                    this.size++;
                }
                return this;
            }
        },

        'get': {
            value: function (key) {
                var index = this._keys.indexOf(key);
                if (index > -1) {
                    return this._values[index];
                }
                return undefined;
            }
        },

        'has': {
            value: function (key) {
                if (this._keys.indexOf(key) > -1) {
                    return true;
                } else {
                    return false;
                }
            }
        },

        'forEach': {
            value: function (callback, thisArg) {
                var that = this;
                var values = this._values;
                this._keys.forEach(function (key, i) {
                    callback.call(thisArg, values[i], key, that);
                });
            }
        },

        'delete': {
            value: function (key) {
                var index = this._keys.indexOf(key);
                if (index > -1) {
                    this._keys.splice(index, 1);
                    var r = this._values.splice(index, 1);
                    this.size--;
                    return true;
                } else {
                    return false;
                }
            }
        },

        'clear': {
            value: function () {
                this._keys = [];
                this._values = [];
                this.size = 0;
            }
        },

        'entries': {
            value: function () {
                return new MapIterator(this);
            }
        }
    });

    var result;

    if (typeof Map === 'undefined') {
        result = _Map;
    } else {
        result = Map;
    }

    if (global && typeof global.define === 'function') {
        define(function (require, exports, module) {
            module.exports = result;
        });
    } else {
        module.exports = result;
    }
}(this));
