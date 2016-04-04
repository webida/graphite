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
 * @file Provides support for transformation of scaling, translation and rotation.
 * @since 1.0.0
 * @author youngd.hwang@samsung.com
 */

define([
    'external/genetic/genetic',
    'graphite/view/geometry/Point',
    'graphite/base/Base'
], function (
    genetic,
    Point,
    Base
) {
    'use strict';

    /**
     * A Transform.
     * @constructor
     */
    function Transform() {
        Base.apply(this, arguments);
        this._scaleX = 1;
        this._scaleY = 1;
        this._cos = 1;
    }

    genetic.inherits(Transform, Base, {

        /**
         * Sets the value for the amount of scaling to be done.
         * @param {number} x
         * @param {number} y
         * @return {Transform}
         *//**
         * Sets the value for the amount of scaling to be done.
         * @param {number} scale
         * @return {Transform}
         */
        scale: function (x, y) {
            this.desc('scale', arguments);
            if (arguments.length === 2) {
                this._scaleX = x;
                this._scaleY = y;
            } else if (arguments.length === 1) {
                this._scaleX = this._scaleY = x;
            }
            return this;
        },

        /**
         * Sets the rotation angle.
         * @param {number} angle
         * @return {Transform}
         */
        rotation: function (angle) {
            this.desc('rotation', arguments);
            this._cos = Math.cos(angle);
            this._sin = Math.sin(angle);
            return this;
        },

        /**
         * Sets the translation amounts.
         * @param {number} x
         * @param {number} y
         * @return {Transform}
         */
        translation: function (x, y) {
            this._dx = x;
            this._dy = y;
            return this;
        },

        /**
         * Returns a new transformed Point of the input Point
         * based on the transform values set.
         * @param {Point} point
         * @return {Point}
         */
        transformed: function (point) {
            var x = point.x;
            var y = point.y;
            var temp;
            x *= this._scaleX;
            y *= this._scaleY;

            temp = x * this._cos - y * this._sin;
            y = x * this._sin + y * this._cos;
            x = temp;

            return new Point(Math.round(x + this._dx), Math.round(y + this._dy));
        }
    });

    return Transform;
});
