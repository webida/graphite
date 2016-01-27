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
    'graphite/view/widget/Widget'
], function (
    dom,
    genetic,
    Widget
) {
    'use strict';

    /**
     * A Widget which has a DOM element as it's presentation.
     * @constructor
     */
    function DomWidget() {
        Widget.apply(this, arguments);
        this.element(this._createElement());
    }

    genetic.inherits(DomWidget, Widget, {

        /**
         * Returns nodeName for this Widget's element.
         * @return {string}
         * @abstract
         */
        nodeName: function () {
            throw new Error('nodeName() should be '
                    + 'implemented by ' + this.constructor.name);
        },

        /**
         * Creates then returns HTMLElement for this Widget.
         * @return {HTMLElement}
         * @abstract
         * @protected
         */
        _createElement: function () {
            throw new Error('_createElement() should be '
                    + 'implemented by ' + this.constructor.name);
        },

        /**
         * Sets html element for this HtmlWidget.
         * @param {HTMLElement} element
         *//**
         * Returns html element for this HtmlWidget.
         * @return {HTMLElement}
         */
        element: function () {
            if (arguments.length) {
                this._element = arguments[0];
                return this;
            } else {
                return this._element;
            }
        },

        /**
         * Sets attributes for this HtmlWidget's element.
         * @param {Object} propSet - pairs of key and value
         * @return {DomWidget}
         *//**
         * Returns attribute of this HtmlWidget's element
         * for the given property name.
         * @param {string} property - property name
         * @return {*}
         */
        attr: function () {
            var args = arguments;
            var element = this.element();
            if (element) {
                if (typeof args[0] === 'object') {
                    dom.setAttributes(element, args[0]);
                } else if (typeof args[0] === 'string') {
                    return element.getAttribute(args[0]);
                }
            }
            return this;
        },

        /**
         * Sets property for this HtmlWidget's element.
         * @param {Object} propSet - pairs of key and value
         * @return {DomWidget}
         *//**
         * Returns css property of this HtmlWidget's element
         * for the given css property.
         * @param {string} property - css property name
         * @return {Object}
         *//**
         * Returns css property set for this HtmlWidget's element.
         * @return {Object}
         */
        css: function (propSet) {
            var args = arguments;
            var element = this.element();
            if (args.length) {
                if (element) {
                    if (typeof args[0] === 'string') {
                        return dom.getStyle(element, args[0]);
                    } else if (typeof args[0] === 'object') {
                        dom.setStyles(element, propSet);
                    }
                }
                return this;
            } else {
                if (element) {
                    return dom.computedCss(element);
                } else {
                    return {};
                } 
            }
        },

        /**
         * @see Widget#_drawWidget
         * @param {GraphicContext} context
         * @override
         */
        _drawWidget: function (context) {
            this.desc('_drawWidget', context, undefined, 'green');
            this._locateElement(context);
        },

        /**
         * Locates DOMElement with the Widget's bounds.
         * @param {GraphicContext} context
         * @abstract
         * @protected
         */
        _locateElement: function (context) {
            this.isInterface('_locateElement', context);
        },
    });

    return DomWidget;
});
