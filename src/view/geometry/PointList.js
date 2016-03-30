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
    './Geometry',
    './Point',
    './Rectangle',
    './Translatable'
], function (
    genetic,
    math,
    Geometry,
    Point,
    Rectangle,
    Translatable
) {
    'use strict';

    /**
     * A PointList.
     * @constructor
     */
    function PointList() {
        Translatable.apply(this, arguments);
        this._points = [];
        this._size = 0;
        this._bounds = null;
        this.points.apply(this, arguments);
    }

    genetic.inherits(PointList, Translatable, {

        /**
         * Sets points with given array of two consecutive
         * numbers form the coordinates of a point.
         * @param {Array} points
         *//**
         * Returns array of points.
         * @return {Array} points
         */
        points: function (points) {
            if (Array.isArray(points)) {
                if (points.length % 2) {
                    throw new Error(
                        'PointList needs two consecutive integer points.');
                }
                this._points = points;
                this._size = points.length / 2;
            } else {
                return this._points;
            }
        },

        /**
         * Appends all of the given points to this PointList.
         * @param {PointList} pointlist
         *//**
         * Appends the given Point to this PointList.
         * @param {Point} point
         *//**
         * Appends the given point of x, y int values
         * to this PointList.
         * @param {PointList} pointlist
         */
        add: function () {
            if (arguments[0] instanceof PointList) {
                var pointList = arguments[0];
                this.points(this.points().concat(pointList.points()));
            } else if (arguments[0] instanceof Point) {
                var p = arguments[0];
                this._points.push(p.x);
                this._points.push(p.y);
                this._size++;
            } else if (math.isAllNumber(arguments)) {
                this._points.push(arguments[0]);
                this._points.push(arguments[1]);
                this._size++;
            }
        },

        /**
         * Returns the smallest Rectangle that contains all Points.
         * @return {Rectangle}
         */
        bounds: function () {
            if (this._bounds) {
                return this._bounds;
            }
            var size = this.size();
            this._bounds = new Rectangle();
            if (size > 0) {
                this._bounds.location(this.get(0));
                for (var i = 0; i < size; i++) {
                    this._bounds.union(this.get(i));
                }
            }
            return this._bounds;
        },

        /**
         * Returns the size of PointList.
         * @return {Number}
         */
        size: function () {
            return this._size;
        },

        /**
         * Returns copy of this PointList.
         * @return {PointList}
         */
        copy: function () {
            return new PointList([].concat(this.points()));
        },

        /**
         * Returns the first Point.
         * @return {Point}
         */
        first: function () {
            return this.get(0);
        },

        /**
         * Returns the last Point.
         * @return {Point}
         */
        last: function () {
            return this.get(this.size() - 1);
        },

        /**
         * Returns the midpoint.
         * @return {Point}
         */
        mid: function () {
            var size = this.size();
            var half = size / 2;
            //odd
            if (size % 2) {
                return this.get(parseInt(half));
            //even
            //guess the midpoint between 2 medians.
            } else {
                var p1 = this.get(half - 1); //Point
                var p2 = this.get(half); //Point
                var diff = p1.diff(p2); //Dimension
                return p1.translated(diff.scale(0.5));
            }
        },

        /**
         * Returns the Point at the given index.
         * @param {number} i
         * @return {Point}
         *//**
         * Returns the given reference Point
         * with value of this Point's index.
         * @param {number} i
         * @param {Point} p
         * @return {Point}
         */
        get: function (i) {
            var args = arguments;
            var points = this._points;
            i *= 2;
            if (args.length === 1) {
                return new Point(points[i], points[i + 1]);
            } else if (args.length === 2
                    && args[1] instanceof Point) {
                var point = args[1];
                point.x = points[i];
                point.y = points[i + 1];
                return point;
            }
        },

        /**
         * Overwrites a point at a given index in the list
         * with the specified Point.
         * @param {Point} point
         * @param {number} i
         */
        set: function (point, i) {
            var points = this.points();
            var bounds = this.bounds();
            if (i >= this.size() || i < 0) {
                throw new Error(
                    'Index should be positive int in bound of '
                        + this.size());
            }
            if (bounds !== null && !bounds.contains(point)) {
                bounds = null;
            }
            points[i * 2] = point.x;
            points[i * 2 + 1] = point.y;
        },

        /**
         * Inserts a given point at a specified index.
         * @param {Point} point
         * @param {number} i
         */
        insert: function (point, i) {
            if (this._bounds && !this._bounds.contains(point)) {
                this._bounds = null;
            }
            if (i > this.size() || i < 0) {
                throw new Error(
                    'Index should be positive int in bound of '
                        + this.size());
            }
            i *= 2;
            this._points.splice(i, 0, point.x);
            this._points.splice(i + 1, 0, point.y);
            this._size = this._points.length / 2;
        },

        /**
         * Removes a point with the given index, and returns the point.
         * @param {number} i
         * @return {Point}
         */
        remove: function (i) {
            var points = this.points();
            if (i >= this.size() || i < 0) {
                throw new Error(
                    'Index should be positive int in bound of '
                        + this.size());
            }
            i *= 2;
            var pt = new Point(points[i], points[i + 1]);
            this._points.splice(i, 2);
            this._size = this._points.length / 2;
            return pt;
        },

        /**
         * Removes all the points stored by this list.
         */
        clear: function () {
            this._points = [];
            this._size = 0;
            this._bounds = null;
        },

        /**
         * Reverses the order of the points in the list.
         */
        reverse: function () {
            var temp;
            var size = this.size();
            var points = this.points();
            var newPts = [];
            for (var i = size - 1; i >= 0; i--) {
                newPts.push(points[i * 2]);
                newPts.push(points[i * 2 + 1]);
            }
            this._points = newPts;
        },

        /**
         * Determines whether any of the line segments represented
         * by this PointList intersect the given Rectangle.
         * @param {Rectangle} r
         * @return {boolean}
         */
        intersects: function (r) {
            if (r.isEmpty()) return false;
            var points = this.points();
            var len = this._points.length;
            var size = this.size();
            for (var i = 0; i < len; i += 2) {
                if (r.contains(points[i], points[i + 1])) {
                    return true;
                }
            }
            var diagonal1x1 = r.x;
            var diagonal1y1 = r.y;
            var diagonal1x2 = r.x + r.w - 1;
            var diagonal1y2 = r.y + r.h - 1;
            var diagonal2x1 = r.x + r.w - 1;
            var diagonal2y1 = r.y;
            var diagonal2x2 = r.x;
            var diagonal2y2 = r.y + r.h - 1;
            for (var i = 0; i < (size - 1) * 2; i += 2) {
                if (Geometry.isSegmentIntersect([
                        diagonal1x1, diagonal1y1,
                        diagonal1x2, diagonal1y2,
                        points[i], points[i + 1],
                        points[i + 2], points[i + 3]])
                    || Geometry.isSegmentIntersect([
                        diagonal2x1, diagonal2y1,
                        diagonal2x2, diagonal2y2,
                        points[i], points[i + 1],
                        points[i + 2], points[i + 3]])
                    ) {
                        return true;
                }
            }
            return false;
        },

        /**
         * Scales this object by the scale factor.
         * @param {number} factor
         */
        scale: function (factor) {
            var points = this.points();
            var length = points.length;
            for (var i = 0; i < length; i++) {
                points[i] = Math.floor(points[i] * factor);
            }
            this._bounds = null;
        },

        /**
         * Translates this object horizontally by dx
         * and vertically by dy.
         * @param {number} dx
         * @param {number} dy
         */
        translate: function () {
            var args = arguments;
            var dx, dy;
            var len = this.size() * 2;
            var points = this.points();
            if (args.length === 1 && args[0] instanceof Point) {
                dx = args[0].x;
                dy = args[0].y;
            } else if (args.length === 2 && math.isAllNumber(args)) {
                dx = args[0];
                dy = args[1];
            }
            for (var i = 0; i < len * 2; i += 2) {
                points[i] += dx;
                points[i + 1] += dy;
            }
            if (this._bounds !== null) {
                this._bounds.translate(dx, dy);
            }
        },

        /**
         * Transposes all x and y values.
         */
        transpose: function () {
            var point;
            var bounds = this.bounds();
            var points = this.points();
            var size = this.size();
            if (bounds != null)
                bounds.transpose();
            for (var i = 0; i < size; i++) {
                point = this.get(i);
                points[i * 2] = point.y;
                points[i * 2 + 1] = point.x;
            }
        },

        /**
         * Returns true if specified point belongs to the polygon
         * drawn using this PointList.
         * @param {Point} point
         * @return {boolean}
         */
        polygonContainsPoint: function (point) {
            return Geometry.polygonContainsPoint(this, point);
        },

        /**
         * Return true if the least distance between specified point
         * and polyline drawn using this PointList is less then
         * specified tolerance.
         * @param {Point} point
         * @param {number} tolerance
         * @return {boolean}
         */
        polylineContainsPoint: function (point, tolerance) {
            return Geometry.polylineContainsPoint(this, point, tolerance);
        }
    });

    return PointList;
});
