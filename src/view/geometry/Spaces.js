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
     * A four side spaces.
     * @constructor
     */
    function Spaces() {
        Base.apply(this, arguments);
        var args = arguments;
        if (args.length === 4) {
            this.top = args[0];
            this.right = args[1];
            this.bottom = args[2];
            this.left = args[3];
        } else if (args.length === 1) {
            if (args[0] instanceof Spaces) {
                var spaces = args[0];
                this.top = spaces.top;
                this.right = spaces.right;
                this.bottom = spaces.bottom;
                this.left = spaces.left;
                this._uniSize = spaces._uniSize;
            } else if (typeof args[0] === 'number') {
                this.top = args[0];
                this.right = args[0];
                this.bottom = args[0];
                this.left = args[0];
            }
        }
    }

    genetic.inherits(Spaces, Base, {

        /** distance from top */
        top : 0,

        /** distance from right */
        right : 0,

        /** distance from bottom */
        bottom : 0,

        /** distance from left */
        left : 0,

        _uniSize: 0,

        /**
         * Returns the width for this Insets, equal to <code>left</code> +
         * <code>right</code>.
         * @return The sum of left + right
         */
        width: function () {
            return this.left + this.right;
        },

        /**
         * Returns the height for this Insets, equal to <code>top</code> +
         * <code>bottom</code>.
         * @return The sum of top + bottom
         */
        height: function () {
            return this.top + this.bottom;
        },

        /**
         * Returns whether this space is empty or not.
         * @return {boolean}
         */
        isEmpty: function () {
            if (math.isZeroAll(this.top, this.right, this.bottom, this.left)) {
                return true;
            } else {
                return false;
            }
        },

        uniSize: function (uniSize) {
            this.desc('uniSize', uniSize);
            if (arguments.length) {
                this._uniSize = uniSize;
            } else {
                return this._uniSize;
            }
        },

        copy: function () {
            return new Spaces(this);
        },

        inverse: function () {
            this.top = -1*this.top;
            this.right = -1*this.right;
            this.bottom = -1*this.bottom;
            this.left = -1*this.left;
            this._uniSize = -1*this._uniSize;
            return this;
        },

        /**
         * For convenience, this tells position for
         * x,y of this Rectangle.
         * @return {string}
         */
        toString: function () {
            return Base.prototype.toString.call(this) + 
                    '[' + this.top + ',' + this.right
                        + ',' + this.bottom + ',' + this.left + ']';
        }
    });

    return Spaces;
});
