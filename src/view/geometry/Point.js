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
    'graphite/base/Base',
    './Dimension'
], function (
    genetic,
    math,
    Base,
    Dimension
) {
    'use strict';

    /**
     * A Point represents a point (x, y) in 2-dimensional space.
     * @constructor
     */
    function Point() {
        Base.apply(this, arguments);
        var args = arguments;
        var argLen = args.length;
        if (argLen === 1 && args[0] instanceof Point) {
            this.x = args[0].x;
            this.y = args[0].y;
        } else if (argLen === 2 && math.isAllNumber(args)) {
            this.x = args[0];
            this.y = args[1];
        }
    }


    genetic.inherits(Point, Base, {

        /** @member {number} */
        x: 0,

        /** @member {number} */
        y: 0,

        /**
         * Sets location for this Point.
         * @param {number} x
         * @param {number} y
         * @return {Point}
         */
        location: function () {
            var args = arguments;
            if (args.length === 2) {
                this.x = args[0];
                this.y = args[1];
            }
            return this;
        },

        /**
         * Translates this Point by the given dx, dy.
         * @param {number} dx
         * @param {number} dy
         * @return {Point}
         *//**
         * Translates this Point by the given Point.
         * @param {Point} point
         * @return {Point}
         *//**
         * Translates this Point by the given Dimension.
         * @param {Dimension} dim
         * @return {Point}
         */
        translate: function (dx, dy) {
            this.desc('translate', arguments);
            var args = arguments;
            var argLen = args.length;
            if (argLen === 1) {
                var a = args[0];
                if (a instanceof Point) {
                    this.x += a.x;
                    this.y += a.y;
                } else if (a instanceof Dimension) {
                    this.x += a.w;
                    this.y += a.h;
                }
            } else if (argLen === 2
                && math.isAllNumber(args)) {
                this.x += args[0];
                this.y += args[1];
            }
            this.info('translated -> ' + this);
            return this;
        },

        /**
         * Creates a new Point which is translated
         * by the specified x and y values.
         * @param {number} dx
         * @param {number} dy
         * @return {Point}
         *//**
         * Creates a new Point which is translated
         * by the specified Point.
         * @param {Point} point
         * @return {Point}
         *//**
         * Creates a new Point which is translated
         * by the specified Dimension.
         * @param {Dimension} dim
         * @return {Point}
         */
        translated: function () {
            var copy = this.copy();
            return copy.traslate.apply(copy, arguments);
        },

        /**
         * Returns a copy of this Point
         * @return {Point}
         */
        copy: function () {
            return new Point(this);
        },

        /**
         * Negates the x and y values of this Point
         * @return {Point}
         */
        negate: function () {
            this.x = -this.x;
            this.y = -this.y;
            return this;
        },

        /**
         * Calculaates the difference in between this Point and the one specified
         * @param {Point} point
         * @return {Dimension}
         */
        difference: function (point) {
            return new Dimension(this.x - point.x, this.y - point.y);
        },

        /**
         * For convenience, this tells position for
         * x,y of this Rectangle.
         * @return {string}
         */
        toString: function () {
            return Base.prototype.toString.call(this) + 
                    '[' + this.x + ',' + this.y + ']';
        },
    });

    Point.SINGLETON = new Point();

    return Point;
});
