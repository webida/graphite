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
    'graphite/view/geometry/Point',
    'graphite/view/geometry/PointList',
    './Shape'
], function (
    genetic,
    math,
    Point,
    PointList,
    Shape
) {
    'use strict';

    /**
     * A PointListShape.
     * @constructor
     */
    function PointListShape() {
        Shape.apply(this, arguments);
        this._pointList = new PointList();
    }

    genetic.inherits(PointListShape, Shape, {

        /**
         * Returns true if the given point is contained
         * within this Widget's bounds.
         * @param {number} x
         * @param {number} y
         * @return {boolean}
         * @override
         */
        containsPoint: function (x, y) {
            if (!Shape.prototype.containsPoint.call(this, x, y)) {
                return false;
            }
            return this._shapeContainsPoint(x, y)
                || this._childrenContainsPoint(x, y);
        },

        /**
         * Returns true if the point (x, y) is contained
         * within one of the child widgets.
         * @param {number} x
         * @param {number} y
         * @return {boolean}
         * @protected
         */
        _childrenContainsPoint: function (x, y) {
            var children = this.getChildren();
            var len = children.length;
            for (var i = 0; i < len; i++) {
                if (children[i].containsPoint(x, y)) {
                    return true;
                }
            }
            return false;
        },

        /**
         * Returns true if the point (x, y) is contained
         * within this widget.
         * @param {number} x
         * @param {number} y
         * @return {boolean}
         * @abstract
         * @protected
         */
        _shapeContainsPoint: function (x, y) {
            this.isInterface('_shapeContainsPoint', arguments);
        },

        /**
         * Adds the given point.
         * @param {Point} point
         */
        addPoint: function (point) {
            this._pointList.add(point);
            this.redraw();
        },

        /**
         * Removes a point with the given index from this widget.
         * @param {number} index
         */
        removePoint: function (index) {
            this.erase();
            this._pointList.remove(index);
            this.redraw();
        },

        /**
         * Sets the point at index to the Point. If you're going to
         * set multiple Points, use {@link #setPoints(PointList)}.
         * @param {Point} point
         * @param {number} index
         */
        setPoint: function (point, index) {
            this.erase();
            this._pointList.set(point, index);
            this.redraw();
        },

        /**
         * Sets the start point of this widget.
         * @param {Point} point
         *//**
         * Returns the first point in this widget.
         * @return {Point}
         */
        startPoint: function () {
            var args = arguments;
            if (args.length && args[0] instanceof Point) {
                if (this._pointList.size() == 0) {
                    this.addPoint(args[0]);
                } else {
                    this.setPoint(args[0], 0);
                }
            } else {
                return points.first();
            }
        },

        /**
         * Sets the end point of this widget.
         * @param {Point} point
         *//**
         * Returns the last point in this widget.
         * @return {Point}
         */
        endPoint: function (Point) {
            var args = arguments;
            if (args.length && args[0] instanceof Point) {
                if (this._pointList.size() < 2) {
                    this.addPoint(args[0]);
                } else {
                    this.setPoint(args[0], this._pointList.size() - 1);
                }
            } else {
                return points.last();
            }
        },

        /**
         * Sets the list of points to be used by this widget.
         * Removes any previously existing points.
         * This widget will hold onto the given list by reference.
         * @param {PointList} pointList
         * @return {PointListShape}
         *//**
         * Returns the points in this widget by reference.
         * If the returned list is modified, this widget must be informed
         * by calling {@link #points(PointList)}.
         * Failure to do so will result in layout and paint problems.
         * @return {PointList}
         */
        pointList: function () {
            var args = arguments;
            if (args.length && args[0] instanceof PointList) {
                this.erase();
                this._pointList = args[0];
                this.redraw();
                return this;
            } else {
                return this._pointList;
            }
        },

        /**
         * Convenient method for setting points with given array
         * of two consecutive numbers form the coordinates of a point.
         * @param {Array} points
         * @return {PointListShape}
         *//**
         * Returns array of points.
         * @return {Array} points
         */
        points: function () {
            var args = arguments;
            var arr;
            if (args.length) {
                if (Array.isArray(args[0])) {
                    arr = args[0];
                } else if (math.isAllNumber(args)
                        && args.length % 2 === 0) {
                    arr = ([]).slice.call(args);
                }
                this.pointList(new PointList(arr));
                return this;
            } else {
                return this._pointList.points();
            }
        },

        /**
         * Inserts a given point at a specified index.
         * @param {Point} point
         * @param {number} index
         */
        insertPoint: function (point, index) {
            this._pointList.insert(point, index);
            this.redraw();
        },

        /**
         * Erases this widget and removes all of its Point Points.
         */
        clearPointList: function () {
            this.erase();
            this._pointList.clear();
        },

        /**
         * Sets the points at both extremes of this widget.
         * @param {Point} start
         * @param {Point} end
         */
        bothEnds: function (start, end) {
            this.startPoint(start);
            this.endPoint(end);
        }
    });

    return PointListShape;
});
