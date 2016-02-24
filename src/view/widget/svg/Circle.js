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
    'external/dom/dom',
    'external/genetic/genetic',
    './Shape'
], function (
    dom,
    genetic,
    Shape
) {
    'use strict';

    /**
     * A Circle.
     * @constructor
     */
    function Circle() {
        Shape.apply(this, arguments);
        this.attr({
            'shape-rendering': 'auto'
        });
    }

    genetic.inherits(Circle, Shape, {

        /**
         * Returns tagName for this Widget's element.
         * @return {string}
         */
        nodeName: function () {
            return 'circle';
        },

        /**
         * Locates the svg circle with it's bounds.
         * @param {GraphicContext} context
         * @see DomWidget#_locateElement
         * @protected
         */
        _locateElement: function (context) {
            this.desc('_locateElement', context);
            var r = this._getRevisedBounds();
            var radius = Math.min(r.w, r.h) / 2.0;
            var cx = r.x + radius;
            var cy = r.y + radius;
            this.cssCache.put({
                'cx': cx,
                'cy': cy,
                'r': radius
            });
        },
    });

    return Circle;
});
