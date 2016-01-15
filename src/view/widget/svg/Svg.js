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
    'graphite/view/system/GraphiteShell',
    'graphite/view/widget/html/Container',
    './Rectangular',
    './Structural',
    './SvgWidget'
], function (
    genetic,
    GraphiteShell,
    Container,
    Rectangular,
    Structural,
    SvgWidget
) {
    'use strict';

    /**
     * A Svg.
     * @constructor
     */
    function Svg() {
        Structural.apply(this, arguments);
        this.setProperty({
            'shape-rendering': 'crispEdges'
        });
    }

    var proto = genetic.mixin(Rectangular.prototype, {

        /**
         * Returns tagName for this Widget's element.
         * @return {string}
         */
        getTagName: function () {
            return 'svg';
        },

        /**
         * Sets this Widget's parent.
         * @param {Widget} parent
         * @override 
         */
        setParent: function (parent) {
            this.desc('setParent', parent);
            SvgWidget.prototype.setParent.call(this, parent);
            if (parent instanceof Structural || parent instanceof Container) {
                parent.getElement().appendChild(this.getElement());
            } else if (parent instanceof GraphiteShell.RootWidget) {
                var upman = this.getUpdateManager();
                var context = upman.getGraphicContext();
                var root = context.getSVG();;
                root.appendChild(this.getElement());
            }
        },

        /**
         * For convenience, this tells position for
         * x,y,w,h of this Rectangle.
         * @return {string}
         */
        toString: function () {
            var bounds = this.getBounds();
            return Structural.prototype.toString.call(this) + 
                    '(' + bounds.x + ',' + bounds.y + ',' +
                            bounds.w + ',' + bounds.h + ')';
        }
    });

    genetic.inherits(Svg, Structural, proto);

    return Svg;
});
