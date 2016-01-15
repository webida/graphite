/*
 * Copyright (c) 2012-2015 S-Core Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @file Introduction
 * @since 1.0.0
 * @author hw.shim@samsung.com
 */

define([
    'external/genetic/genetic',
    'graphite/base/logger/formater'
], function (
    genetic,
    formater
) {
    'use strict';

    var id = 0;

    function Base() {
        this._uid_ = id++;
        var cls = this.constructor.name;
        var args = ['%c#' + this._uid_ + ' <= new ' + cls
                + '(' + this.explain(arguments) + ')', 'color:green'];
        this.invoke('info', args, {
            type: 'constructor'
        });
    }

    genetic.inherits(Base, Object, {

        _filterArgs: function (args) {
            if (typeof args === 'object' && 'length' in args) {
                args = this.explain(args);
            }
            if ( typeof args === 'undefined') {
                args = '';
            }
            return args;
        },

        desc: function (fnName, args, result, color) {
            args = this._filterArgs(args);
            var msgs = [this + '.' + fnName + '(' + args + ')'];
            if (result) {
                msgs[0] += ' =>';
                msgs.push(result);
            }
            if ( typeof color === 'string') {
                msgs[0] = '%c' + msgs[0];
                msgs.push('color:' + color);
            }
            this.invoke('info', msgs);
        },

        log: function () {
            this.invoke('log', arguments);
        },

        info: function () {
            this.invoke('info', arguments);
        },

        warn: function () {
            this.invoke('warn', arguments);
        },

        invoke: function (action, args, options) {
            args = formater(args, action, this, options);
            console[action].apply(console, args);
        },

        explain: function(arrayLike, isFunc) {
            var arr = [];
            for (var i in arrayLike) {
                if (typeof arrayLike[i] == 'function') {
                    if (isFunc) {
                        arr.push(arrayLike[i]);
                    }
                } else {
                    if (arrayLike[i] === null) {
                        arr.push('null');
                    } else {
                        arr.push(arrayLike[i]);
                    }
                }
            }
            return arr.join(', ');
        },

        isInterface: function (method, args) {
            args = this._filterArgs(args);
            throw new Error(method + '(' + args + ') should be '
                    + 'implemented by ' + this.constructor.name);
        },

        getInstanceOf: function (cst, args) {
            var arr = ([]).slice.call(args);
            arr = [null].concat(arr);
            return new (Function.prototype.bind.apply(cst, arr));
        },

        toString: function () {
            return '<' + this.constructor.name + '>#' + this._uid_;
        }
    }); 

    return Base;
});
