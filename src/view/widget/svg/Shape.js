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
 * @file Widget implementation for svg.
 * @since 1.0.0
 * @author hw.shim@samsung.com
 */

define([
    'external/dom/dom',
    'external/genetic/genetic',
    'graphite/env/Environment',
    'graphite/view/geometry/Rectangle',
    'graphite/view/widget/Widget',
    './Structural',
    './SvgWidget'
], function (
    dom,
    genetic,
    Environment,
    Rectangle,
    Widget,
    Structural,
    SvgWidget
) {
    'use strict';

    /**
     * A Shape.
     * @constructor
     */
    function Shape() {
        SvgWidget.apply(this, arguments);
    }

    genetic.inherits(Shape, SvgWidget, {

        /**
         * Creates then returns SVGElement for this Widget.
         * Shapes uses 'pointer-events' attribute to support IE10.
         * Without this attribute in IE10, svg captures event.
         * This leads to missing event for mask layer.
         * 
         * @see SvgWidget#_createElement
         * @override
         * @return {SVGElement}
         */
        _createElement: function () {
            var option = {};
            var browser = Environment.global.get('browser');
            if (browser.name === 'ie') {
                option = {
                    'pointer-events': 'none'
                };
            }
            return dom.makeSvgElement(this.nodeName(), option);
        },

        /**
         * Tells whether this can contain other SvgWidget.
         * Shape cannot contain other SvgWidget therefore return false.
         * @return {boolean}
         */
        isContainer: function () {
            return false;
        },

        /**
         * Sets this Widget's parent.
         * Only Structural can be a parent for Shape.
         * @param {Widget} parent
         * @override 
         */
        setParent: function (parent) {
            this.desc('setParent', parent);
            if (!(parent instanceof Structural)) {
                throw new Error('Only Structural can be a parent for Shape');
            }
            SvgWidget.prototype.setParent.call(this, parent);
        },

        /**
         * @see Widget#_drawWidget
         * @param {GraphicContext} context
         * @override
         */
        _drawWidget: function (context) {
            this.desc('_drawWidget', context, undefined, 'green');
            if (!this.isEnabled()) {
                //TODO
            }
            SvgWidget.prototype._drawWidget.call(this, context);
        },

        /**
         * Returns compensated bounds for border.
         * Svg shapes does not support muliple values
         * for different sides. So uniSize used.
         * @see #borderWidth
         * @return {Rectangle}
         * @protected
         */
        _getRevisedBounds: function () {
            var border = this.borderWidth();
            var sizeFix = border.uniSize()/2;
            var r = new Rectangle(this.bounds());
            if (!border.isEmpty()) {
                r.x += sizeFix;
                r.y += sizeFix;
                r.w -= sizeFix*2;
                r.h -= sizeFix*2;
            }
            return r;
        },

        /**
         * Sets this widget's background color.
         * Returns this widget for method chaining.
         * @override
         * @param {number} r - 0 ~ 255
         * @param {number} g - 0 ~ 255
         * @param {number} b - 0 ~ 255
         * @param {number} a - 0 ~ 1.0
         * @return {Widget}
         *//**
         * @override
         * @param {string} colorName - 'skyblue', 'transparent'
         * @return {Widget}
         *//**
         * @override
         * @param {string} hexCode - '#ff0', '#ffff00', 'ff0', 'ffff00'
         * @return {Widget}
         *//**
         * @override
         * @param {Color} color
         * @return {Widget}
         */
        /**
         * Returns this widget's background color.
         * @return {Color}
         */
        bgColor: function () {
            var result = SvgWidget.prototype.bgColor.apply(this, arguments);
            if (arguments.length) {
                this.cssCache.put({
                    'fill': this.bgColor()
                });
            }
            return result;
        },

        /**
         * Sets this widget's border color.
         * @override
         * @see Widget#borderColor
         * @param {number} r - 0 ~ 255
         * @param {number} g - 0 ~ 255
         * @param {number} b - 0 ~ 255
         * @param {number} a - 0 ~ 1.0
         * @return {Widget}
         *//**
         * @override
         * @param {string} colorName - 'skyblue', 'transparent'
         * @return {Widget}
         *//**
         * @override
         * @param {string} hexCode - '#ff0', '#ffff00', 'ff0', 'ffff00'
         * @return {Widget}
         *//**
         * @override
         * @param {Color} color
         * @return {Widget}
         */
        /**
         * Returns this widget's border color.
         * @override
         * @return {Color}
         */
        borderColor: function () {
            var result = Widget.prototype.borderColor.apply(this, arguments);
            if (arguments.length) {
                this.cssCache.put({
                    'stroke': this.borderColor()
                });
            }
            return result;
        },

        /**
         * Sets this widget's border width.
         * Svg shapes does not support muliple values
         * for different sides. So uniSize used.
         * @override
         * @see Widget#borderWidth
         * @param {number} width
         */
        /**
         * Returns this widget's border's spaces.
         * @override
         * @return {Spaces}
         */
        borderWidth: function (width) {
            var result = Widget.prototype.borderWidth.apply(this, arguments);
            if (arguments.length) {
                if (typeof width === 'number') {
                    this.borderWidth().uniSize(width);
                }
                this.css({
                    'stroke-width': this.borderWidth().uniSize()
                });
            }
            return result;
        }
    });

    return Shape;
});
