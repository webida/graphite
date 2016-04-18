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
    'graphite/view/geometry/PointList',
    'graphite/view/geometry/Transform',
    '../../svg/Polyline'
], function (
    genetic,
    Point,
    PointList,
    Transform,
    Polyline
) {
    'use strict';

    /**
     * A PolylineDecoration.
     * @constructor
     */
    function PolylineDecoration() {
        Polyline.apply(this, arguments);
        this._location = new Point();
        this.TRIANGLE = new PointList([-1, 1, 0, 0, -1, -1]);        
        this._template = this.TRIANGLE;
        this._transform = new Transform();
        this.scale(6, 4);
    }

    genetic.inherits(PolylineDecoration, Polyline, {

        /** @member {PointList} */
        TRIANGLE: null,

        /** @inheritdoc */
        location: function (x, y) {
            this.desc('location', arguments);
            if (arguments.length) {
                this._pointList = null;
                this._bounds = null;
                this._location = new Point(x, y);
                this._transform.translation(x, y);
            } else {
                return {
                    x: bounds.x,
                    y: bounds.y
                };
            }
        },

        /** @inheritdoc */
        pointList: function () {
            if (arguments.length) {
                return Polyline.prototype.points.call(this, arguments);
            }  else {
                if (this._pointList === null) {
                    this._pointList = new PointList();
                    for(var i = 0; i < this._template.size(); i++) {
                        this._pointList.add(this._transform.transformed(
                            this._template.get(i)));
                    }
                }
                return this._pointList;
            }
        },

        /**
         * Sets the PolylineDecoration's point template.
         * The default value is TRIANGLE_TIP.
         * @param {PointList} pointList
         * @return {PolylineDecoration}
         */
        template: function (pointList) {
            this.erase();
            this._template = pointList;
            this._pointList = null;
            this._bounds = null;
            this.redraw();
            return this;
        },

        /**
         * Sets the amount of scaling to be done
         * along X and Y axes on the PolylineDecoration's template.
         * @param {number} x
         * @param {number} y
         * @return {PolylineDecoration}
         */
        scale: function (x, y) {
            this._pointList = null;
            this._bounds = null;
            this._transform.scale(x, y);
            return this;
        },

        /**
         * Sets the reference point used
         * to determine the rotation angle.
         * @param {Point} point
         * @return {PolylineDecoration}
         */
        referencePoint: function (point) {
            var p = Point.SINGLETON;
            p.location(point.x, point.y);
            p.negate().translate(this._location);
            this.rotation(Math.atan2(p.y, p.x));
            return this;
        },

        /**
         * Sets the angle by which rotation is to be done.
         * @param {number} angle
         * @return {PolylineDecoration}
         */
        rotation: function (angle) {
            this._pointList = null;
            this._bounds = null;
            this._transform.rotation(angle);
            return this;
        }
    });

    return PolylineDecoration;
});
