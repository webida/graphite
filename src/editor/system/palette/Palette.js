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
 * @file Palette
 * @since 1.0.0
 * @author hw.shim@samsung.com
 */

define([
    'external/genetic/genetic',
    'graphite/base/BaseEmitter'
], function (
    genetic,
    BaseEmitter
) {
    'use strict';

    /**
     * A Palette.
     * @constructor
     */
    function Palette() {
        BaseEmitter.apply(this, arguments);
    }

    genetic.inherits(Palette, BaseEmitter, {

        /**
         * Explain
         * @param {}
         * @return {Array}
         */
        aaaa: function () {
            return this.bbb;
        }
    });

    return Palette;
});
