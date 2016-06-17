/*
 * Copyright (c) 2012-2016 S-Core Co., Ltd.
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
 * @file Selection
 * @since 1.0.0
 * @author hw.shim@samsung.com
 */

define([
    'external/genetic/genetic',
    'graphite/base/Base'
], function (
    genetic,
    Base
) {
    'use strict';

    /**
     * A Selection.
     * @constructor
     */
    function Selection(arg) {
        Base.apply(this, arguments);
        this._elements = [];
        if (arg instanceof Array) {
            this._elements = arg;
        } else if (arg) {
            this._elements.push(arg);
        }
    }

    genetic.inherits(Selection, Base, {

        /**
         * Converts to Array
         * @return {Array}
         */
        toArray: function () {
            return Array.prototype.slice.call(this._elements);
        },

        /**
         * @return {boolean}
         */
        isEmpty: function () {
            return this._elements.length === 0;
        }
    });

    return Selection;
});
