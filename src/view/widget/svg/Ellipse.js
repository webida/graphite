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
     * A Ellipse.
     * @constructor
     */
    function Ellipse() {
        Shape.apply(this, arguments);
        this.setProperty({
            'shape-rendering': 'auto'
        });
    }

    genetic.inherits(Ellipse, Shape, {

        /**
         * Returns tagName for this Widget's element.
         * @return {string}
         */
        getTagName: function () {
            return 'ellipse';
        },

        /**
         * Draws the svg ellipse with it's bounds.
         * @param {GraphicContext} context
         * @protected
         */
        _drawShape: function (context) {
            this.desc('_drawShape', context);
            var r = this._getRevisedBounds();
            var rx = r.w / 2;
            var ry = r.h / 2;
            var cx = r.x + rx;
            var cy = r.y + ry;
            dom.setAttributes(this.getElement(), {
                'cx': cx,
                'cy': cy,
                'rx': rx,
                'ry': ry
            });
        }
    });

    return Ellipse;
});
