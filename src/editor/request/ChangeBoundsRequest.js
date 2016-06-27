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
 * @file ChangeBoundsRequest
 * @since 1.0.0
 * @author hw.shim@samsung.com
 */

define([
    'external/genetic/genetic',
    'graphite/view/geometry/Dimension',
    'graphite/view/geometry/Point',
    './GroupRequest'
], function (
    genetic,
    Dimension,
    Point,
    GroupRequest
) {
    'use strict';

    /**
     * A ChangeBoundsRequest is a Request
     * to change the bounds of the Controller(s).
     * @constructor
     */
    function ChangeBoundsRequest() {
        GroupRequest.apply(this, arguments);
        this._location = new Point();
        this._moveDelta = new Point();
        this._resizeDelta = new Dimension();
        this._resizeDirection = '';
        this._isSnapToEnabled = false;
        this._isCenteredResize = false;
        this._isConstrainedMove = false;
        this._isConstrainedResize = false;
    }

    genetic.inherits(ChangeBoundsRequest, GroupRequest, {

        /**
         * @param {Point} location
         *//**
         * @return {Point}
         */
        location: function (location) {
            if (arguments.length) {
                this._location = location;
            } else {
                return this._location;
            }
        },

        /**
         * @param {Point} moveDelta
         *//**
         * Returns a Point representing
         * the distance the Controller has moved.
         * @return {Point}
         */
        moveDelta: function (moveDelta) {
            if (arguments.length) {
                this._moveDelta = moveDelta;
            } else {
                return this._moveDelta;
            }
        },

        /**
         * @param {Point} moveDelta
         *//**
         * Returns a Dimension representing
         * how much the Controller has been resized.
         * @return {Point}
         */
        resizeDelta: function (resizeDelta) {
            if (arguments.length) {
                this._resizeDelta = resizeDelta;
            } else {
                return this._resizeDelta;
            }
        },

        /**
         * @param {Point} moveDelta
         *//**
         * Returns the direction the widget is being resized.
         * Possible values are bitwise numbers.
         * Position.EAST
         * Position.WEST
         * Position.NORTH
         * Position.SOUTH
         * Position.NORTH_EAST
         * Position.NORTH_WEST
         * Position.SOUTH_EAST
         * Position.SOUTH_WEST
         * @return {number}
         */
        resizeDirection: function (resizeDirection) {
            if (arguments.length) {
                this._resizeDirection = resizeDirection;
            } else {
                return this._resizeDirection;
            }
        },

        /**
         * Transforms a copy of the passed in rectangle to account for
         * the move and/or resize deltas and returns this copy.
         * @param {Rectangle} rect
         * @return {Rectangle}
         */
        getTransformedRectangle: function (rect) {
            return rect.copy().translate(this._moveDelta)
                    .resize(this._resizeDelta);
        },

        /**
         * @param {boolean} value
         *//**
         * @return {boolean}
         */
        isSnapToEnabled: function (value) {
            if (arguments.length) {
                this._isSnapToEnabled = !!value;
            } else {
                return this._isSnapToEnabled;
            }
        },

        /**
         * @param {boolean} value
         *//**
         * @return {boolean}
         */
        isCenteredResize: function (value) {
            if (arguments.length) {
                this._isCenteredResize = !!value;
            } else {
                return this._isCenteredResize;
            }
        },

        /**
         * @param {boolean} value
         *//**
         * @return {boolean}
         */
        isConstrainedMove: function (value) {
            if (arguments.length) {
                this._isConstrainedMove = !!value;
            } else {
                return this._isConstrainedMove;
            }
        },

        /**
         * @param {boolean} value
         *//**
         * @return {boolean}
         */
        isConstrainedResize: function (value) {
            if (arguments.length) {
                this._isConstrainedResize = !!value;
            } else {
                return this._isConstrainedResize;
            }
        }

    });

    return ChangeBoundsRequest;
});
