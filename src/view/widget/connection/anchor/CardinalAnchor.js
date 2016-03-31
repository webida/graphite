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
 * @file CardinalAnchor
 * @since 1.0.0
 * @author hw.shim@samsung.com
 */

define([
    'external/genetic/genetic',
    './ConnectionAnchor'
], function (
    genetic,
    ConnectionAnchor
) {
    'use strict';

    /**
     * A CardinalAnchor.
     * @constructor
     */
    function CardinalAnchor(owner, option) {
        ConnectionAnchor.apply(this, arguments);
        if (typeof option === 'object') {
            this.option(option);
        }
    }

    genetic.inherits(CardinalAnchor, ConnectionAnchor, {

        /**
         * Sets the options of this anchor.
         * @param {Object} option
         * @param {string} option.pos - The direction of a
         *        connected anchor point.
         *        (One of N,NE,E,SE,S,SW,W,NW,O)
         * @return {Anchor}
         *//**
         * Returns the options of this anchor.
         * @return {Object} option
         */
        option: function (option) {
            if (arguments.length) {
                this._option = arguments[0];
                return this;
            } else {
                return this._option;
            }
        },

        /**
         * Returns the location where the Connection should be
         * anchored in absolute coordinates. The anchor may use
         * the given reference Point to calculate this location.
         * @param {Point} reference
         * @return {Point}
         */
        getLocation: function (reference) {
            
        }
    });

    return CardinalAnchor;
});
