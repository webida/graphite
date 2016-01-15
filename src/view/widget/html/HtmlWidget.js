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
    'graphite/view/layout/XYLayout',
    'graphite/view/widget/dom/DomWidget'
], function (
    dom,
    genetic,
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
        useLocalCoordinates: function () {
            this.desc('useLocalCoordinates', [], true);
            return true;
        },

        /**
         * @param {LayoutManager} manager
         * @override
         */
        setLayoutManager: function (manager) {
            this.desc('setLayoutManager', arguments);
            DomWidget.prototype.setLayoutManager.call(this, manager);
            if (manager instanceof XYLayout) {
                this.setPosition('absolute');
            }
        },

        /**
         * Sets this widget's background color.
         * @see Widget#setBgColor
         * @param {number} r - 0 ~ 255
         * @param {number} g - 0 ~ 255
         * @param {number} b - 0 ~ 255
         * @param {number} a - 0 ~ 1.0
         *//**
         * @param {string} colorName - 'skyblue', 'transparent'
         *//**
         * @param {string} hexCode - '#ff0', '#ffff00', 'ff0', 'ffff00'
         *//**
         * @param {Color} color
         */
        setBgColor: function (color) {
            DomWidget.prototype.setBgColor.call(this, color);
            dom.setStyles(this.getElement(), {
                'background-color': color
            });
        },
    });

    return HtmlWidget;
});
