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
 * @file Layer
 * @since 1.0.0
 * @author hw.shim@samsung.com
 */

define([
    'external/genetic/genetic',
    'graphite/view/geometry/Point',
    '../Widget'
], function (
    genetic,
    Point,
    Widget
) {
    'use strict';

    /**
     * A transparent widget intended to be added exclusively to
     * a LayeredPane, who has the responsibilty of managing its layers.
     * @constructor
     */
    function Layer() {
        Widget.apply(this, arguments);
        this._label = '';
    }

    var _super_ = Widget.prototype;

    genetic.inherits(Layer, Widget, {

        /**
         * Overridden to implement transparent behavior.
         * @param {number} x
         * @param {number} y
         * @return {boolean}
         * @override
         */
        containsPoint: function (x, y) {
            if (this.isFillable()) {
                return _super_.containsPoint.call(this, x, y);
            }
            var pt = Point.SINGLETON;
            pt.location(x, y);
            this.translateFromParent(pt);
            x = pt.x;
            y = pt.y;
            var result = this.getChildren().some(function (child) {
                return child.containsPoint(x, y);
            });
            this.desc('containsPoint', arguments, result + '');
            return result;
        },

        /**
         * Returns the Widget at the specified location.
         * @param {number} x
         * @param {number} y
         * @param {Object} filter
         * @return {Widget}
         * @override
         */
        findWidgetAt: function (x, y, filter) {
            this.desc('findWidgetAt', arguments);
            if (!this.isEnabled()) {
                return null;
            }
            if (this.isFillable()) {
                return _super_.findWidgetAt.call(this, x, y, filter);
            }
            var w = _super_.findWidgetAt.call(this, x, y, filter);
            if (w === this) return null;
            return w;
        },

        setLabel: function (label) {
            this._label = label;
        },

        /**
         * For convenience, returns position for
         * x,y,w,h and label of this Layer.
         * @return {string}
         */
        toString: function () {
            var bounds = this.bounds();
            return Widget.prototype.toString.call(this) + (this._label ? '/'+this._label : '');
        }
    });

    return Layer;
});
