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
    'graphite/view/geometry/Geometry',
    'graphite/view/geometry/Point',
    'graphite/view/geometry/Rectangle',
    './AbstractPolyShape'
], function (
    genetic,
    Geometry,
    Point,
    Rectangle,
    AbstractPolyShape
) {
    'use strict';

    /**
     * A Polygon.
     * @constructor
     */
    function Polygon() {
        AbstractPolyShape.apply(this, arguments);
    }

    genetic.inherits(Polygon, AbstractPolyShape, {

        /**
         * Returns tagName for this Widget's element.
         * @return {string}
         */
        nodeName: function () {
            return 'polygon';
        },

        /**
         * Locates the svg polygon with it's points.
         * @param {GraphicContext} context
         * @see DomWidget#_locateElement
         * @protected
         */
        _locateElement: function (context) {
            this.desc('_locateElement', context);
            this.attrCache.put({
                'points': this.pointList().points().join(',')
            });
        },

        /**
         * Returns true if the point (x, y) is contained
         * within this widget.
         * @param {number} x
         * @param {number} y
         * @return {boolean}
         * @protected
         */
        _shapeContainsPoint: function (x, y) {
            return Geometry.polygonContainsPoint(
                    this.pointList(), new Point(x, y));
        },

        /**
         * Returns true if the given point is contained
         * within this Widget's bounds.
         * @param {number} x
         * @param {number} y
         * @return {boolean}
         * @override
         */
        containsPoint: function (x, y) {
            if (!this.bounds().contains(x, y)) {
                return false;
            }
            return this._shapeContainsPoint(x, y)
                    || this._childrenContainsPoint(x, y);
        },
    });

    return Polygon;
});
