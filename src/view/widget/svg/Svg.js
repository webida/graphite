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
    'graphite/view/geometry/Rectangle',
    'graphite/view/system/GraphiteShell',
    'graphite/view/widget/html/Container',
    './Structural',
    './SvgWidget',
    '../Widget'
], function (
    dom,
    genetic,
    Rectangle,
    GraphiteShell,
    Container,
    Structural,
    SvgWidget,
    Widget
) {
    'use strict';

    /** @constant {number} */
    var FLAG_BOUNDS_SET = Widget.FLAG_MAX << 1;

    /**
     * A Svg.
     * @constructor
     */
    function Svg() {
        Structural.apply(this, arguments);
        this.attr({
            'shape-rendering': 'crispEdges'
        });
        this.setFlag(FLAG_BOUNDS_SET, false);
    }

    genetic.inherits(Svg, Structural, {

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
                parent.element().appendChild(this.element());
                if (this.bounds().isEmpty()) {
                    this.fillParent(true);
                }
            } else if (parent instanceof GraphiteShell.RootWidget) {
                var upman = this.getUpdateManager();
                var context = upman.getGraphicContext();
                var root = context.getSVG();;
                root.appendChild(this.element());
            }
        },

        /**
         * Returns true if this Widget uses local coordinates.
         * This means its children are placed relative to
         * this Widget's top-left corner.
         * @return {boolean}
         */
        isLocalCoordinates: function () {
            this.desc('isLocalCoordinates', [], true);
            return true;
        },

        /** @inheritdoc */
        bounds: function () {
            if (arguments.length) {
                this.setFlag(FLAG_BOUNDS_SET, true);
            }
            return Structural.prototype.bounds.apply(this, arguments);
        },

        /**
         * @see Widget#_drawWidget
         * @param {GraphicContext} context
         */
        _drawWidget: function (context) {
            this.desc('_drawWidget', context, undefined, 'green');
            if (this.getFlag(FLAG_BOUNDS_SET)) {
                var bounds = this.bounds();
                dom.setAttributes(this.element(), {
                    'x': bounds.x,
                    'y': bounds.y,
                    'width': bounds.w,
                    'height': bounds.h
                });
            }
        },

        /**
         * For convenience, this tells position for
         * x,y,w,h of this Rectangle.
         * @return {string}
         */
        toString: function () {
            var bounds = this.bounds();
            return Structural.prototype.toString.call(this) + 
                    '(' + bounds.x + ',' + bounds.y + ',' +
                            bounds.w + ',' + bounds.h + ')';
        }
    });

    return Svg;
});
