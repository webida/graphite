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
    'graphite/base/logger/Logger'
], function (
    genetic,
    Logger
) {
    'use strict';

    var id = 0;

    function getFnName(fn) {
        var cName = fn.toString();
        return cName.substring(9, cName.indexOf('('));
    }

    function Base() {
        this._uid_ = id++;
        var cls = this.constructor.name || getFnName(this.constructor);
        var args = ['%c#' + this._uid_ + ' <= new ' + cls
                + '(' + this.explain(arguments) + ')', 'color:green'];
        this.invoke('info', args, {
            type: 'constructor'
        });
    }

    function filterArgs(args) {
        if (args && typeof args === 'object' && 'length' in args) {
            args = this.explain(args);
        }
        if ( typeof args === 'undefined') {
            args = '';
        }
        return args;
    }

    genetic.inherits(Base, Logger, {

        desc: function (fnName, args, result, color) {
            args = filterArgs.call(this, args);
            var msgs = [this + '.' + fnName + '(' + args + ')'];
            if (arguments[2]) {
                msgs[0] += ' =>';
                msgs.push(result);
            }
            if ( typeof color === 'string') {
                msgs[0] = '%c' + msgs[0];
                msgs.push('color:' + color);
            }
            this.invoke('info', msgs);
        },

        isInterface: function (method, args) {
            args = filterArgs.call(this, args);
            throw new Error(method + '(' + args + ') should be '
                    + 'implemented by ' + this.constructor.name);
        },

        toString: function () {
            var cName = this.constructor.name
                    || getFnName(this.constructor);
            return '<' + cName + '>' + '#' + this._uid_;
        }
    }); 

    return Base;
});
