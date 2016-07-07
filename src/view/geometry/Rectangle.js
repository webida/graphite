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
    'graphite/base/Base',
    './Dimension',
    './Point',
    './Spaces'
], function (
    genetic,
    math,
    Base,
    Dimension,
    Point,
    Spaces
) {
    'use strict';

    /**
     * A Rectangle.
     * @constructor
     */
    function Rectangle() {
        Base.apply(this, arguments);
        if (arguments.length) {
            this.setBounds.apply(this, arguments);
        }
    }

    genetic.inherits(Rectangle, Base, {

        x: 0,
        y: 0,
        w: 0,
        h: 0,

        /**
         * @see Rectangle.like
         * @param {Rectangle|Object} rect - Rectangle or Rectangle like object
         * @return {Rectangle}
         *//**
         * @param {number} x
         * @param {number} y
         * @param {number} w
         * @param {number} h
         * @return {Rectangle}
         *//**
         * @param {Point} point
         * @param {Dimension} dimension
         * @return {Rectangle}
         *//**
         * @param {Point} point1
         * @param {Point} Point2
         * @return {Rectangle}
         */
        setBounds: function (x, y, w, h) {
            this.desc('setBounds', arguments);
            var args = arguments;
            var argLen = args.length;
            if (argLen === 1
                    && Rectangle.like(args[0])) {
                var r = args[0];
                return this.setBounds(r.x, r.y, r.w, r.h);
            } else if (argLen === 2) {
                if (args[0] instanceof Point
                        && args[1] instanceof Dimension) {
                    this.x = args[0].x;
                    this.y = args[0].y;
                    this.w = args[1].w;
                    this.h = args[1].h;
                    return this;
                } else if (args[0] instanceof Point
                        && args[1] instanceof Point) {
                    var p1 = args[0];
                    var p2 = args[1];
                    this.x = Math.min(p1.x, p2.x);
                    this.y = Math.min(p1.y, p2.y);
                    this.w = Math.abs(p2.x - p1.x) + 1;
                    this.h = Math.abs(p2.y - p1.y) + 1;
                    return this;
                }
            } else if (argLen === 4) {
                this.x = x;
                this.y = y;
                this.w = w;
                this.h = h;
                return this;
            }
        },

        /**
         * Shrinks the sides of this Rectangle by the horizontal
         * and vertical values provided as input, and returns
         * this Rectangle for convenience. The center of
         * this Rectangle is kept constant.
         * @param {number} h - Horizontal reduction amount
         * @param {number} v - Vertical reduction amount
         * @return {Rectangle}
         *//**
         * Shrinks this rectangle by the amount specified in Spaces.
         * @param {Spaces} spaces
         * @return {Rectangle}
         */
        shrink: function () {
            this.desc('shrink', arguments);
            var args = arguments;
            if (args[0] instanceof Spaces) {
                var spaces = args[0];
                this.x += spaces.left;
                this.y += spaces.top;
                this.w -= (spaces.width());
                this.h -= (spaces.height());
            } else if (args.length === 2) {
                var h = args[0], v = args[1];
                this.x += h;
                this.w -= (h + h);
                this.y += v;
                this.h -= (v + v);
            }
            return this;
        },

        /**
         * Expands the horizontal and vertical sides of this Rectangle
         * with the values provided as input, and returns this for
         * convenience. The location of its center is kept constant.
         * @param {number} h - Horizontal reduction amount
         * @param {number} v - Vertical reduction amount
         * @return {Rectangle}
         *//**
         * Expands the horizontal and vertical sides of this Rectangle
         * by the width and height of the given Insets, and returns
         * this for convenience.
         * @param {Spaces} spaces
         * @return {Rectangle}
         */
        expand: function () {
            var args = arguments;
            if (args[0] instanceof Spaces) {
                var spaces = args[0];
                return this.shrink(spaces.copy().inverse());
            } else if (args.length === 2 && math.isAllNumber(args)) {
                var h = parseInt(args[0]), v = parseInt(args[1]);
                return this.shrink(-h, -v);
            }
        },

        /**
         * Sets the width and height of this Rectangle to
         * the width and height of the given Dimension
         * and returns this for convenience.
         * @param {Dimension} dimension
         * @return {Rectangle}
         *//**
         * Sets the width of this Rectangle to w and the height
         * of this Rectangle to h and returns this for convenience.
         * @param {number} w
         * @param {number} h 
         * @return {Rectangle}
         *//**
         * Retuns the dimensions of this Rectangle.
         * @return {Dimension}
         */
        size: function () {
            var args = arguments;
            var argLen = args.length;
            if (argLen) {
                if (args[0] instanceof Dimension) {
                    this.w = args[0].w;
                    this.h = args[0].h;
                } else if (argLen === 2 && math.isAllNumber(args)) {
                    this.w = args[0];
                    this.h = args[1];
                }
                return this;
            } else {
                return new Dimension(this.w, this.h);
            }
        },

        /**
         * Sets the location of this Rectangle to
         * the coordinates given as input and
         * returns this for convenience.
         * @param {number} x - The new X coordinate
         * @param {number} y - The new Y coordinate
         * @return {Rectangle}
         *//**
         * Sets the location of this Rectangle to
         * the point given as input and
         * returns this for convenience.
         * @param {Point} p - The new point
         * @return {Rectangle}
         *//**
         * Returns the upper left corner of this rectangle.
         * @return {Point}
         */
        location: function () {
            var args = arguments;
            var argLen = args.length;
            if (argLen) {
                this.desc('location', arguments);
                if (argLen === 1 && args[0] instanceof Point) {
                    this.x = args[0].x;
                    this.y = args[0].y;
                } else if (argLen === 2 && math.isAllNumber(args)) {
                    this.x = args[0];
                    this.y = args[1];
                }
                return this;
            } else {
                return new Point(this.x, this.y);
            }
        },

        /**
         * Resizes this Rectangle by the Dimension provided as input
         * and returns this for convenience. This Rectange's width will
         * become this.width + sizeDelta.width. Likewise for height.
         * @param {Dimension} d
         * @return {Rectangle}
         *//**
         * Resizes this Rectangle by the values supplied as input
         * and returns this for convenience. This Rectangle's width will
         * become this.width + dw. This Rectangle's height will become
         * this.height + dh.
         * @param {number} w - Width to be resized
         * @param {number} h - Height to be resized
         * @return {Rectangle}
         */
        resize: function () {
            var w, h;
            var args = arguments;
            var argLen = args.length;
            if (argLen === 1 && args[0] instanceof Dimension) {
                this.w += args[0].w;
                this.h += args[0].h;
            } else if (argLen === 2) {
                this.w += args[0];
                this.h += args[1];
            }
            return this;
        },

        /**
         * Returns a new Rectangle which is equivalent to this Rectangle
         * with its dimensions modified by the passed Dimension.
         * @param {Dimension} d
         *  - Dimensions by which the rectangle's size should be modified
         * @return {Rectangle}
         */
        getResized: function () {
            var copy = this.copy();
            copy.resize.apply(copy, arguments);
            return copy;
        },

        /**
         * Returns a new Rectangle which is translated along each axis
         * by the passed values.
         * @param {number} dx - Displacement along X axis
         * @param {number} dy - Displacement along Y axis
         * @return {Rectangle}
         *//**
         * Returns a new Rectangle which is shifted along each axis
         * by the passed Point.
         * @param {Point} point - Point indicating the amount of
         * translating along each axis
         * @return {Rectangle}
         */
        translated: function () {
            var copy = this.copy();
            return copy.translate.apply(copy, arguments);
        },

        /**
         * Moves this Rectangle horizontally by the x value and
         * vertically by the y value.
         * @param {number} dx - Displacement along X axis
         * @param {number} dy - Displacement along Y axis
         * @return {Rectangle}
         *//**
         * Moves this Rectangle by the given Point's x, y values.
         * @param {Point} point - Point indicating the amount of
         * translating along each axis
         * @return {Rectangle}
         */
        translate: function () {
            this.desc('translate', arguments);
            var args = arguments;
            var argLen = args.length;
            if (argLen === 1 && args[0] instanceof Point) {
                this.x += args[0].x;
                this.y += args[0].y;
                return this;
            } else if (argLen === 2
                    && typeof args[0] === 'number'
                    && typeof args[1] === 'number') {
                this.x += args[0];
                this.y += args[1];
                return this;
            }
        },

        /**
         * Returns a copied copy for this Rectangle.
         * @return {Rectangle}
         */
        copy: function () {
            return new Rectangle(this);
        },

        /**
         * Unions this Rectangle's width and height with the specified
         * argument(s). Updates this Rectangle's bounds to the minimum
         * size which can hold both this Rectangle and the given Point.
         * @param {Point} point
         * @return {Rectangle}
         *//**
         * Updates this Rectangle's dimensions to the minimum size which
         * can hold both this Rectangle and the given Rectangle.
         * @param {Rectangle} rect
         * @return {Rectangle}
         *//**
         * Updates this Rectangle's bounds to the minimum size which can
         * hold both this Rectangle and the coordinate (x,y).
         * @param {number} x
         * @param {number} y
         * @return {Rectangle}
         *//**
         * Updates this Rectangle's dimensions to the minimum size which
         * can hold both this Rectangle and the given four points.
         * @param {number} x
         * @param {number} y
         * @param {number} w
         * @param {number} h
         * @return {Rectangle}
         */
        union: function () {
            this.desc('union', arguments);
            var len = arguments.length;
            if (len === 1) {
                if (arguments[0] instanceof Point) {
                    var p = arguments[0];
                    return this.union(p.x, p.y);
                } else if (arguments[0] instanceof Rectangle) {
                    var rect = arguments[0];
                    if (rect == null || rect.isEmpty())
                        return this;
                    return this.union(rect.x, rect.y, rect.w, rect.h);
                } else if (arguments[0] instanceof Dimension) {
                    var d = arguments[0];
                    this.w = Math.max(this.w, d.w);
                    this.h = Math.max(this.h, d.h);
                    return this;
                }
            } else if (len === 2) {
                var x1 = arguments[0];
                var y1 = arguments[1];
                if (x1 < this.x) {
                    this.w += (this.x - x1);
                    this.x = x1;
                } else {
                    var right = this.x + this.w;
                    if (x1 >= right) {
                        right = x1 + 1;
                        this.w = right - this.x;
                    }
                }
                if (y1 < this.y) {
                    this.h += (this.y - y1);
                    this.y = y1;
                } else {
                    var bottom = this.y + this.h;
                    if (y1 >= bottom) {
                        bottom = y1 + 1;
                        this.h = bottom - this.y;
                    }
                }
                return this;
            } else if (len === 4) {
                var x = arguments[0];
                var y = arguments[1];
                var w = arguments[2];
                var h = arguments[3];
                var right = Math.max(this.x + this.w, x + w);
                var bottom = Math.max(this.y + this.h, y + h);
                this.x = Math.min(this.x, x);
                this.y = Math.min(this.y, y);
                this.w = right - this.x;
                this.h = bottom - this.y;
                return this;
            }
        },

        /**
         * Returns true if the w or h property
         * is less than or equal to 0.
         * @return {boolean}
         */
        isEmpty: function () {
            return this.w <= 0 || this.h <= 0;
        },

        /**
         * Returns the x-coordinate of the right side
         * of this Rectangle.
         * @return {number}
         */
        right: function () {
            return this.x + this.w;
        },

        /**
         * Returns the y-coordinate of the bottom
         * of this Rectangle.
         * @return {number}
         */
        bottom: function () {
            return this.y + this.h;
        },

        /**
         * Returns a new Point representing the middle point of
         * the left hand side of this Rectangle.
         * @return {Point}
         */
        left: function () {
            return new Point(this.x, this.y + this.h / 2);
        },

        /**
         * Returns a new Point representing the middle point of
         * the top side of this Rectangle.
         * @return {Point}
         */
        top: function () {
            return new Point(this.x + this.w / 2, this.y);
        },

        /**
         * Returns a new Point representing the top left point
         * of this Rectangle.
         * @return {Point}
         */
        topLeft: function () {
            return new Point(this.x, this.y);
        },

        /**
         * Returns a new Point representing the top right point
         * of this Rectangle.
         * @return {Point}
         */
        topRight: function () {
            return new Point(this.x + this.w, this.y);
        },

        /**
         * Returns a new Point representing the bottom left point
         * of this Rectangle.
         * @return {Point}
         */
        bottomLeft: function () {
            return new Point(this.x, this.y + this.h);
        },

        /**
         * Returns a new Point representing the bottom right point
         * of this Rectangle.
         * @return {Point}
         */
        bottomRight: function () {
            return new Point(this.x + this.w, this.y + this.h);
        },

        /**
         * Returns the center-coordinate of this Rectangle.
         * @return {Point}
         */
        center: function () {
            return new Point(this.x + this.w / 2, this.y + this.h / 2);
        },

        /**
         * Returns whether the given coordinates are within the boundaries
         * of this Rectangle. The boundaries are inclusive of the top and
         * left edges, but exclusive of the bottom and right edges.
         * @param {number} x
         * @param {number} y
         * @return {boolean}
         *//**
         * Returns true if the given rectangle is contained
         * within the boundaries of this Rectangle.
         * @param {Rectangle} rect
         * @return {boolean}
         *//**
         * Returns whether the given point is within the boundaries of
         * this Rectangle. The boundaries are inclusive of the top and
         * left edges, but exclusive of the bottom and right edges.
         * @param {Point} point
         * @return {boolean}
         */
        contains: function () {
            var args = arguments;
            var x, y, p, r, result;
            var argLen = args.length;
            if (argLen === 1) {
                if (args[0] instanceof Point) {
                    p = args[0];
                    return this.contains(p.x, p.y);
                } else if (args[0] instanceof Rectangle) {
                    r = args[0];
                    result = this.x <= r.x
                        && this.y <= r.y
                        && this.right() >= r.right()
                        && this.bottom() >= r.bottom();
                    this.desc('contains', arguments, result + '');
                    return result;
                }
            } else if (argLen === 2) {
                x = parseInt(args[0]);
                y = parseInt(args[1]);
                result = y >= this.y
                    && y < this.bottom()
                    && x >= this.x
                    && x < this.right();
                this.desc('contains', arguments, result + '');
                return result;
            }
        },

        /**
         * Switches the x and y and the width and height of this
         * Rectangle. Useful for orientation changes.
         * @return {Rectangle}
         */
        transpose: function () {
            var temp = this.x;
            this.x = this.y;
            this.y = temp;
            temp = this.w;
            this.w = this.h;
            this.h = temp;
            return this;
        },

        /**
         * Returns whether the input object is equivalent to this or not.
         * @param {Rectangle} rect
         * @return {boolean}
         */
        equals: function (rect) {
            if (rect === this) return true;
            if (rect instanceof Rectangle) {
                return this.x === rect.x
                        && this.y === rect.y
                        && this.w === rect.w
                        && this.h === rect.h
            }
            return false;
        },

        /**
         * For convenience, this tells position for
         * x,y,w,h of this Rectangle.
         * @return {string}
         */
        toString: function () {
            return Base.prototype.toString.call(this) + 
                    '[' + this.x + ',' + this.y + ',' +
                            this.w + ',' + this.h + ']';
        },
    });

    /**
     * Checks whether the given object has x,y,w,h property.
     * @static
     * @param {Object} p
     * @return {boolean}
     */
    Rectangle.like = function(p) {
        if ('x' in p && 'y' in p && 'w' in p && 'h' in p) {
            return true;
        } else {
            return false;
        }
    }; 

    Rectangle.SINGLETON = new Rectangle();

    return Rectangle;
});
