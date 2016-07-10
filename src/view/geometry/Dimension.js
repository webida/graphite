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
         * Creates and returns a copy of this Dimension.
         * @return {Dimension}
         */
        copy: function () {
            return new Dimension(this);
        },

        /**
         * Returns true if either dimension is
         * less than or equal to 0.
         * @return {boolean}
         */
        isEmpty: function () {
            return (this.w <= 0) || (this.h <= 0);
        },

        /**
         * Returns whether the given Object is equivalent to this Dimension.
         * @param {Dimension} dim
         * @return {boolean}
         */
        equals: function (dim) {
            if (dim instanceof Dimension) {
                return (dim.w === this.w && dim.h == this.h);
            }
            return false;
        },

        /**
         * Creates and returns a new Dimension whose size will be
         * reduced by the width and height of the given Dimension.
         * @param {Dimension} d
         * @return {Dimension}
         *//**
         * Creates and returns a new Dimension whose size will be
         * reduced by the width and height of the given Dimension.
         * @param {number} w
         * @param {number} h
         * @return {Dimension}
         */
        getShrinked: function () {
            var len = arguments.length;
            if (len === 1) {
                return this.copy().shrink(arguments[0]);
            } else if (len === 2) {
                return this.copy().shrink(arguments[0], arguments[1]);
            }
        },

        /**
         * Shrinks the size of this Dimension by the width and height
         * values of the given Dimension.
         * @param {Dimension} d
         * @return {Dimension}
         *//**
         * Reduces the width of this Dimension by w, and reduces the height
         * of this Dimension by h. Returns this for convenience.
         * @param {number} w
         * @param {number} h
         * @return {Dimension}
         */
        shrink: function () {
            var len = arguments.length;
            if (len === 1 && arguments[0] instanceof Dimension) {
                this.w -= arguments[0].w;
                this.h -= arguments[0].h;
            } else if (len === 2 && math.isAllNumber(arguments)) {
                this.w -= arguments[0];
                this.h -= arguments[1];
            }
            return this;
        }
    });

    /**
     * Creates a new Dimension representing the MAX of two provided Dimensions.
     * @param {Dimension} d1
     * @param {Dimension} d2
     * @return {Dimension}
     */
    Dimension.max = function (d1, d2) {
        return new Dimension(Math.max(d1.w, d2.w), Math.max(d1.h, d2.h));
    };

    /**
     * Creates a new Dimension representing the MIN of two provided Dimensions.
     * @param {Dimension} d1
     * @param {Dimension} d2
     * @return {Dimension}
     */
    Dimension.min = function (d1, d2) {
        return new Dimension(Math.min(d1.w, d2.w), Math.min(d1.h, d2.h));
    };

    Dimension.SINGLETON = new Dimension();

    return Dimension;
});
