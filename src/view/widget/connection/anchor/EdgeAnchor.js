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
 * @author youngd.hwang@samsung.com
 */

define([
    'external/genetic/genetic',
    'graphite/view/geometry/Point',
    './ConnectionAnchor'
], function (
    genetic,
    Point,
    ConnectionAnchor
) {
    'use strict';

    /**
     * A EdgeAnchor.
     * @constructor
     * @param {Object} option
     * @param {string} option.pos - The direction of a
     *        connected anchor point.
     *        (One of N,E,S,W)
     */
    function EdgeAnchor(owner, option) {
        ConnectionAnchor.apply(this, arguments);
        if (typeof option === 'object') {
            this.option(option);
        }
    }

    genetic.inherits(EdgeAnchor, ConnectionAnchor, {

         /**
         * Sets the options of this anchor.
         * @param {Object} option
         * @param {string} option.pos - The direction of a
         *        connected anchor point.
         *        (One of N,E,S,W)
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
         * Returns the anchor's reference point.
         * @param {Point} reference
         * @return {Point}
         * @protected
         */
        _getReferencePoint: function() {
            var r = this.owner().bounds();
            var x = 0, y = 0;
            switch (this._option.pos) {
                case 'N':
                    x = r.x + r.w / 2;
                    y = r.y;
                    break;
                case 'E':
                    x = r.x + r.w;
                    y = r.y + r.h / 2;
                    break;
                case 'S':
                    x = r.x + r.w / 2;
                    y = r.y + r.h;
                    break;
                case 'W':
                    x = r.x;
                    y = r.y + r.h / 2;
                    break;
                default:
                    ;
            }
            return new Point(x, y);
        },

        /**
         * Returns the location where the Connection should be
         * anchored in absolute coordinates. The anchor may use
         * the given reference Point to calculate this location.
         * @param {Point} reference
         * @return {Point}
         * @override
         */
        getLocation: function (reference) {
            return this._getReferencePoint();
        },


        /**
         * Returns the anchor's reference point
         * by position of option base on cardinal points.
         * @return {Point}
         * @override
         */
        referencePoint: function () {
            if (this.owner() === null) {
                return null;
            }
            var ref = this._getReferencePoint();
            this.owner().translateToAbsolute(ref);
            return ref;
        }
    });

    return EdgeAnchor;
});
