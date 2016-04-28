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
 * Genetic utility
 *
 * @since: 2015.06.11
 * @author: hw.shim
 */

define(function () {
    'use strict';
    return {
        /**
         * Inherit prototype props from parent
         * and add new prototypes.
         */
        inherits: function (child, parent, props) {
            var propsKey, propsKeyLen, key;
            child.prototype = Object.create(parent.prototype);
            if (typeof props === 'object') {
                propsKey = Object.getOwnPropertyNames(props);
                propsKeyLen = propsKey.length;
                for (var i = 0; i < propsKeyLen; i++) {
                    key = propsKey[i];
                    child.prototype[key] = props[key];
                }
            }
            child.prototype.constructor = child;
        },

        /**
         * Simply mixin object arguments.
         * @example
         * var mixed = genetic.mixin({a:1}, {b:2});
         * // mixed will be {a:1, b:2}
         */
        mixin: function () {
            var source, target = {};
            var argLen = arguments.length;
            var propLen, props, j, prop;
            for (var i = 0; i < argLen; i++) {
                source = arguments[i];
                props = Object.getOwnPropertyNames(source);
                propLen = props.length;
                for (j = 0; j < propLen; j++) {
                    prop = props[j];
                    target[prop] = source[prop];
                }
            }
            return target;
        },

        /**
         * Pass any arguments to the given class
         * then returns new instance of the class.
         * @param {Function} cst - constructor
         * @param {Arguments} args - arguments
         * @example
         * var color = genetic.getInstanceOf(Color, arguments);
         */
        getInstanceOf: function (cst, args) {
            var arr = ([]).slice.call(args);
            arr = [null].concat(arr);
            return new (Function.prototype.bind.apply(cst, arr));
        }
    };
});
