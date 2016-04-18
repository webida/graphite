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
 * @file Represents a 2-dimensional directional Vector.
 * @since 1.0.0
 * @author youngd.hwang@samsung.com
 */

define([
    'external/genetic/genetic',
    'external/math/math',
    'graphite/base/Base',    
    'graphite/view/geometry/Point',
], function (
    genetic,
    math,
    Base,
    Point
) {
    'use strict';

    /**
     * A Vector represents a 2-dimensional directional Vector.
     * @constructor
     */
    function Vector() {
        Base.apply(this, arguments);
        var args = arguments;
        if (args.length === 1 && args[0] instanceof Point) {
            this.x = args[0].x;
            this.y = args[0].y;
        } else if (args.length === 2) {
            if ( (args[0] instanceof Point && args[1] instanceof Point) 
                    || (args[0] instanceof Vector && args[1] instanceof Vector) ) {
                this.x = args[1].x - args[0].x;
                this.y = args[1].y - args[0].y;            
            } else if (math.isAllNumber(args)) {
                this.x = args[0];
                this.y = args[1];
            }
        }
    }

    genetic.inherits(Vector, Base, {

        /** @member {number} */
        x: 0,

        /** @member {number} */
        y: 0,

        /**
         * Calculates the magnitude of the cross product 
         * of this Vector with another.
         * Represents the amount by 
         * which two Vectors are directionally different.
         * Parallel Bectors return a valu of 0.
         * @param {Vector} v
         * @return {number}
         */
        assimilarity: function (v) {
            return Math.abs(this.x * v.y - this.y * v.x);
        },

        /**
         * Calculates the dot product of this Vector with another.
         * @param  {Vector} v
         * @return {number}
         */
        dotProduct: function (v) {
            return this.x * v.x + this.y * v.y;
        },

        /**
         * Calculates the similarity of this Vector with another.
         * Similarity is defined as the absolute value of the dotProduct().
         * @param  {Vector} v
         * @return {number}
         */
        similarity: function (v) {
            return Math.abs(this.dotProduct(v));
        },

        /**
         * Creates a new Vector which is the sum 
         * of this Vector with another.
         * @param  {Vector} v
         * @return {Vector}
         */
        added: function (v) {
            return new Vector(this.x + v.x, this.y + v.y);
        },

        /**
         * Creates a new Vector which represents the average 
         * of this Vector with another.
         * @param  {Vector} v
         * @return {Vector}
         */
        averaged: function (v) {
            return new Vector((this.x + v.x) / 2, (this.y + v.y) / 2);
        },

        /**
         * Creates a new Vector which represents this Vector scaled 
         * by the amount provided.
         * @param  {number} scale
         * @return {Vector}
         */
        scaled: function (scale) {
            return new Vector(this.x * scale, this.y * scale);
        },

        /**
         * Returns true if this Vector has a non-zero horizontal component.
         * @return {boolean}
         */
        isHorizontal: function () {
            return this.x != 0;
        },

        /**
         * Returns the length of this Vector.
         * @return {number}
         */
        length: function () {
            return Math.sqrt(this.dotProduct(this));
        },

        /**
         * For convenience, this tells 2-dimensional direction 
         * of this Vector.
         * @return {string}
         */
        toString: function () {
            return '[' + this.x + ',' + this.y + ']';
        }
    });

    return Vector;
});
