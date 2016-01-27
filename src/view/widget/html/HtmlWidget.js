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
    'graphite/view/geometry/BoxModel',
    'graphite/view/layout/XYLayout',
    'graphite/view/widget/dom/DomWidget'
], function (
    dom,
    genetic,
    BoxModel,
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
        this.boxModel = new BoxModel();
        //TODO support for originally hidden case
        this.css({'visibility': 'hidden'});
    }

    genetic.inherits(HtmlWidget, DomWidget, {

        /**
         * Creates then returns HTMLElement for this Widget.
         * @see DomWidget#_createElement
         * @return {HTMLElement}
         */
        _createElement: function () {
            return dom.makeElement(this.nodeName());
        },

        /**
         * @see Widget#_drawWidget
         * @param {GraphicContext} context
         * @override
         */
        _drawWidget: function (context) {
            DomWidget.prototype._drawWidget.call(this, context);
            this.css({'visibility': 'visible'});
        },

        /**
         * Locates HTMLElement with this Widget's bounds.
         * @param {GraphicContext} context
         * @see DomWidget#_locateElement
         * @protected
         */
        _locateElement: function (context) {
            this.desc('_locateElement', context);
            var box = this.boxModel;
            dom.setStyles(this.element(), {
                'left': box.left + 'px',
                'top': box.top + 'px',
                'width': box.width + 'px',
                'height': box.height + 'px'
            });
        },

        /**
         * Lays out this Widget using its Layout.
         * Additionally, HtmlWidget calculates box model properties
         * such as, left, top, width, height with given bounds.
         * @override
         */
        layout: function () {
            this.boxModel.inBounds(this.element(), this.bounds());
            DomWidget.prototype.layout.apply(this, arguments);
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
                this.css({'position': 'absolute'});
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
                dom.setStyles(this.element(), {
                    'background-color': this.bgColor()
                });
                return this;
            } else {
                return this._bgColor;
            }
        }
    });

    return HtmlWidget;
});
