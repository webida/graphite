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
 * @file Math utility
 * @author: hw.shim@samsung.com
 */

define(function (module) {
    'use strict';

    function isArray(o) {
        if (typeof o === 'object'
                && 'length' in o
                && typeof o.length === 'number') {
            return true;
        }
        return false;
    }

    function filterArray(args) {
        var arr;
        if (isArray(args[0])) {
            arr = args[0];
        } else {
            arr = args;
        }
        return arr;
    }

    return {

        isNegativeSome: function () {
            var arg, args = filterArray(arguments);
            for (var i = 0; i < args.length; i++) {
                arg = args[i];
                if (typeof arg === 'number'
                        && arg < 0) {
                    return true;
                }
            }
            return false;
        },

        isZeroAll: function () {
            var arg, args = filterArray(arguments);
            for (var i = 0; i < args.length; i++) {
                arg = args[i];
                if (arg !== 0) {
                    return false;
                }
            }
            return true;
        },

        isAllNumber: function () {
            var args = filterArray(arguments);
            for (var i = 0; i < args.length; i++) {
                if (typeof args[i] !== 'number') {
                    return false;
                }
            }
            return true;
        }
    };
});
