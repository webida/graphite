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
 * @file Repositions a Widget attached to a {@link Connection}
 * when the Connection is moved
 * @since 1.0.0
 * @author youngd.hwang@samsung.com
 */

define([
    'external/genetic/genetic',
    'graphite/view/geometry/Point',
    'graphite/view/geometry/Rectangle',
    './Locator'
], function (
    genetic,
    Point,
    Rectangle,
    Locator
) {
    'use strict';

    /**
     * @constant {number} Alignment Constants.
     */
    var SOURCE = 2;
    var TARGET = 3;
    var MIDDLE = 4;

    /**
     * @constant {Object}  Constants representing 
     * cardinal directions and relative positions.
     */
    var PositionContants = {
        NONE: 0,
        LEFT: 1,
        CENTER: 2,
        RIGHT: 4,

        LEFT_CENTER_RIGHT: function() {
            return LEFT | CENTER | RIGHT;
        },

        ALWAYS_LEFT: 64,
        ALWAYS_RIGHT: 128,

        TOP: 8,
        MIDDLE: 16,
        BOTTOM: 32,
        TOP_MIDDLE_BOTTOM: function() {
            return TOP | MIDDLE | BOTTOM;
        },

        NORTH: 1,
        SOUTH: 4,
        WEST: 8,
        EAST: 16,

        NORTH_EAST: function() {
            return NORTH | EAST;
        },
        NORTH_WEST: function() {
            return NORTH | WEST;
        },
        SOUTH_EAST: function() {
            return SOUTH | EAST;
        },
        SOUTH_WEST: function() {
            return SOUTH | WEST;
        },
        NORTH_SOUTH: function() {
            return NORTH | SOUTH;
        },
        EAST_WEST: function() {
            return EAST | WEST;
        },
        NSEW: function() {
            return NORTH_SOUTH | EAST_WEST;
        },

        HORIZONTAL: 64,
        VERTICAL: 128
    };

    /**
     * A ConnectionLocator.
     * @constructor
     */
    function ConnectionLocator() {
        Locator.apply(this, arguments);
        var args = arguments;
        if (args.length) {
            this.connection(args[0]);
            if (args.length > 1) {
                this.align(args[1]);
            } else {
                this.align(MIDDLE);
            }
        }
        this._gap = 0;
        this._pos = PositionContants.CENTER;
    }

    genetic.inherits(ConnectionLocator, Locator, {

        /**
         * Recalculates the position of the widget
         * and returns the updated bounds.
         * @param {Widget}
         * @override
         */
        relocate: function (widget) {
            this.desc('relocate', arguments);
            var preferredSize = widget.getPreferredSize();
            var center = this.referencePoint();
            widget.translateToRelative(center);
            widget.bounds(this._getNewBounds(preferredSize, center));
        },

        /**
         * Recalculates the position of the widget
         * according to its desired poistion 
         * relative to the center point.
         * @param {Dimension} size
         * @param {Point} center
         */
        _getNewBounds: function(size, center) {
            var bounds = new Rectangle(center, size);
            bounds.x -= bounds.w / 2;
            bounds.y = bounds.h / 2;
            var xFactor = 0, yFactor = 0;
            var pos = this._pos;
            if ((pos & PositionContants.NORTH) !== 0) {
                yFactor = -1;
            } else if ((pos & PositionContants.SOUTH) !== 0) {
                yFactor = 1;
            }
            if ((pos & PositionContants.WEST) !== 0) {
                xFactor = -1;
            } else if ((pos & PositionContants.EAST) !== 0) {
                xFactor = 1;
            }
            bounds.x += xFactor * (bounds.w / 2 + this._gap);
            bounds.y += yFactor * (bounds.h / 2 + this._gap)
        },

        /**
         * Returns ConnectionLocator's reference point
         * in absolute coordinates.
         * @return {Point}
         */
        referencePoint: function () {
            var p = this.location(this.connection().points());
            this.connection().translateToAbsolute(p);
            return p;
        },

        /**
         * Returns a point from the passed PointList
         * by ConnectionLocator's alignment.
         * @param {PointList} pointList
         * @return {Point}
         */
        location: function (pointList) {
            this.desc('location', arguments);
            switch (this.align()) {
                case SOURCE:
                    return pointList.get(0, Point.SINGLETON);
                case TARGET:
                    return pointList.get(pointList.size() - 1, Point.SINGLETON);
                case MIDDLE:
                    if (pointList.size() % 2 === 0) {
                        var i = pointList.size() / 2;
                        var j = i - 1;
                        var p1 = pointList.get(j);
                        var p2 = pointList.get(i);
                        var d = p2.difference(p1);
                        return Point.SINGLETON.location(p1.x + d.w / 2, p1.y + d.h / 2);
                    }
                    var i = (pointList.size() - 1) / 2;
                    return pointList.get(Point.SINGLETON, i);
                default:
                    return Point.SINGLETON;
            }
        },

        /**
         * Sets the connection of this locator.
         * @param {Widget} connection
         * @return {Widget}
         *//**
         * Returns the connection of this locator.
         * @return {Widget} connection
         */
        connection: function () {
            this.desc('connection', arguments);
            if (arguments.length) {
                this._connection = arguments[0];
                return this;
            } else {
                return this._connection;
            }
        },

        /**
         * Sets the align of this locator.
         * @param {Widget} align
         * @return {Widget}
         *//**
         * Returns the align of this locator.
         * @return {Widget} align
         */
        align: function () {
            this.desc('align', arguments);
            if (arguments.length) {
                this._align = arguments[0];
                return this;
            } else {
                return this._align;
            }
        }
    });

    ConnectionLocator.SOURCE = SOURCE;
    ConnectionLocator.TARGET = TARGET;
    ConnectionLocator.MIDDLE = MIDDLE;

    return ConnectionLocator;
});
