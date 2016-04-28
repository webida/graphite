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
    'external/math/math',
    'graphite/base/Base'
], function (
    genetic,
    math,
    Base
) {
    'use strict';

    /**
     * A Dimension.
     * @constructor
     */
    function Dimension() {
        Base.apply(this, arguments);
        var args = arguments;
        var argLen = args.length;
        if (argLen === 1 && args[0] instanceof Dimension) {
            this.w = args[0].w;
            this.h = args[0].h;
        } else if (argLen === 2 && math.isAllNumber(args)) {
            this.w = args[0];
            this.h = args[1];
        }
    }

    genetic.inherits(Dimension, Base, {

        /** @member {number} */
        w: 0,

        /** @member {number} */
        h: 0,

        /**
         * Explain
         * @param {}
         * @return {Array}
         */
        aaaa: function () {
            return this.bbb;
        }
    });

    Dimension.SINGLETON = new Dimension();

    return Dimension;
});
