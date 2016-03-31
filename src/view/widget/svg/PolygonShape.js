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
    './PointListShape'
], function (
    genetic,
    Geometry,
    Point,
    PointListShape
) {
    'use strict';

    /**
     * A PolygonShape.
     * @constructor
     */
    function PolygonShape() {
        PointListShape.apply(this, arguments);
    }

    genetic.inherits(PolygonShape, PointListShape, {

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
            var plist = this.pointList().copy();
            var loc = this.location();
            plist.translate(loc.x, loc.y);
            this.attrCache.put({
                'points': plist.points().join(',')
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
            var loc = this.location();
            return Geometry.polygonContainsPoint(
                    this.pointList(), new Point(x - loc.x, y - loc.y));
        },
    });

    return PolygonShape;
});
