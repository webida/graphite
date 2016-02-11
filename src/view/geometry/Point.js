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
    'graphite/base/Base'
], function (
    genetic,
    Base
) {
    'use strict';

    /**
     * A Point represents a point (x, y) in 2-dimensional space.
     * @constructor
     */
    function Point() {
        Base.apply(this, arguments);
        var args = arguments;
        if (args.length === 1 && args[0] instanceof Point) {
            this.x = args[0].x;
            this.y = args[0].y;
        } else if (args.length === 2
                && typeof args[0] === 'number'
                && typeof args[1] === 'number') {
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
         */
        translate: function (dx, dy) {
            this.desc('translate', arguments);
            this.x += dx;
            this.y += dy;
            this.info('translated -> ' + this);
            return this;
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
