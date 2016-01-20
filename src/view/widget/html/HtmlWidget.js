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
 * @file Widget implementation for Html element.
 * @since 1.0.0
 * @author hw.shim@samsung.com
 */

define([
    'external/dom/dom',
    'external/genetic/genetic',
    'graphite/view/geometry/Spaces',
    'graphite/view/layout/XYLayout',
    'graphite/view/widget/dom/DomWidget'
], function (
    dom,
    genetic,
    Spaces,
    XYLayout,
    DomWidget
) {
    'use strict';

    /**
     * A HtmlWidget.
     * @constructor
     */
    function HtmlWidget() {
        DomWidget.apply(this, arguments);
        this._padding = new Spaces(0, 0, 0, 0);
    }

    genetic.inherits(HtmlWidget, DomWidget, {

        /**
         * Creates then returns HTMLElement for this Widget.
         * @see DomWidget#_createElement
         * @return {HTMLElement}
         */
        _createElement: function () {
            return dom.makeElement(this.getTagName());
        },

        /**
         * Sets position CSS property for this Widget's element.
         * @param {string} property - static, relative, absolute, fixed
         */
        setPosition: function (property) {
            dom.setStyles(this.getElement(), {
                'position': property
            });
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

        /**
         * @param {Layout} layout
         * @override
         */
        setLayout: function (layout) {
            this.desc('setLayout', arguments);
            DomWidget.prototype.setLayout.call(this, layout);
            if (layout instanceof XYLayout) {
                this.setPosition('absolute');
            }
        },

        /**
         * Sets this widget's background color.
         * @see Widget#bgColor
         * @param {number} r - 0 ~ 255
         * @param {number} g - 0 ~ 255
         * @param {number} b - 0 ~ 255
         * @param {number} a - 0 ~ 1.0
         * @return {Widget}
         *//**
         * @param {string} colorName - 'skyblue', 'transparent'
         * @return {Widget}
         *//**
         * @param {string} hexCode - '#ff0', '#ffff00', 'ff0', 'ffff00'
         * @return {Widget}
         *//**
         * @param {Color} color
         * @return {Widget}
         */
        /**
         * Returns this widget's background color.
         * @return {Color}
         */
        bgColor: function () {
            if (arguments.length) {
                DomWidget.prototype.bgColor.apply(this, arguments);
                dom.setStyles(this.getElement(), {
                    'background-color': this.bgColor()
                });
                return this;
            } else {
                return this._bgColor;
            }
        },

        /**
         * Sets this widget's padding value.
         * @param {number} top
         * @param {number} right
         * @param {number} bottom
         * @param {number} left
         *//**
         * @param {Spaces} spaces
         *//**
         * @param {number} number - If same values for each sides
         *//**
         * Returns this widget's padding value.
         * @return {Spaces}
         */
        padding: function () {
            this.desc('padding', arguments);
            if (arguments.length) {
                this._padding = genetic.getInstanceOf(Spaces, arguments);
                return this;
            } else {
                return this._padding;
            }
        },

        /**
         * Returns compensated bounds for border.
         * @return {Rectangle}
         * @protected
         */
        _getRevisedBounds: function () {
            var border = this.borderWidth();
            var r = new Rectangle(this.bounds());
            var hTop, hRight, hBottom, hLeft;
            if (!border.isEmpty()) {
                hTop = border.top/2,
                hRight = border.right/2;
                hBottom = border.bottom/2;
                hLeft = border.left/2;
                r.x += hLeft;
                r.y += hTop;
                r.w -= hLeft + hRight;
                r.h -= hTop + hBottom;
            }
            return r;
        },
    });

    return HtmlWidget;
});
