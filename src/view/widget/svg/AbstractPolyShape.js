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
    'graphite/view/geometry/PointList',
    './PointListShape'
], function (
    genetic,
    PointList,
    PointListShape
) {
    'use strict';

    /**
     * A AbstractPolyShape.
     * @constructor
     */
    function AbstractPolyShape() {
        PointListShape.apply(this, arguments);
    }

    genetic.inherits(AbstractPolyShape, PointListShape, {

        /**
         * Does nothing.
         * @param {number} dx - The amount to translate horizontally
         * @param {number} dy - The amount to translate vertically
         * @protected
         * @override
         */
        _primTranslate: function (dx, dy) {
            //does nothing
        },

        /** @inheritdoc */
        pointList: function () {
            var old = this._pointList.copy();
            var result = PointListShape.prototype
                    .pointList.apply(this, arguments);
            if (arguments.length && arguments[0] instanceof PointList) {
                this.emit('pointsChanged', old, arguments[0]);
            }
            return result;
        },

        /** @inheritdoc */
        clearPointList: function () {
            PointListShape.prototype.clearPointList.call(this);
            this._bounds = null;
        },

        /** @inheritdoc */
        redraw: function () {
            this._bounds = null;
            PointListShape.prototype.redraw.call(this);
        },

        /** @inheritdoc */
        bounds: function () {
            if (arguments.length) {
                return PointListShape.prototype.bounds.apply(
                        this, arguments);
            } else {
                if (this._bounds === null) {
                    var bordeWidth = this.borderWidth().uniSize();
                    var expand = parseInt(bordeWidth / 2);
                    this._bounds = this.pointList().bounds()
                            .copy().expand(expand, expand);
                }
                return this._bounds;
            }
        }
    });

    return AbstractPolyShape;
});
