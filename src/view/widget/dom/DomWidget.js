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
    'graphite/base/Base',
    'graphite/view/widget/Widget'
], function (
    dom,
    genetic,
    Base,
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
        this._createPropertyCache(this.element());
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
         * Creates then returns HTMLElement for this Widget.
         * @param {HTMLElement} element
         * @abstract
         * @protected
         */
        _createPropertyCache: function (element) {
            this.cssCache = new CssCache(element);
            this.attrCache = new AttributeCache(element);
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
         * Sets css property for this HtmlWidget's element.
         * The css property will not be applied immediately,
         * but will take effect later with UpdateManager.
         * That is, css property will be cached until then.
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
        css: function () {
            var args = arguments;
            var element = this.element();
            if (args.length) {
                if (element) {
                    if (typeof args[0] === 'string') {
                        return dom.getStyle(element, args[0]);
                    } else if (typeof args[0] === 'object') {
                        this.cssCache.put(args[0]);
                        this.revalidate();
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
            this._decorateElement(context);
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

        /**
         * Decorates DOMElement.
         * @param {GraphicContext} context
         * @protected
         */
        _decorateElement: function (context) {
            this.desc('_decorateElement', context, undefined, 'green');
            this.cssCache.flush();
            this.attrCache.flush();
        },
    });

    /**
     * Abstract class for caching values.
     * @constructor
     */
    function AbstractCache(element) {
        Base.apply(this, arguments);
        this._element = element;
        this._cache = {};
    }

    genetic.inherits(AbstractCache, Base, {
        /**
         * Puts css properties as a cache.
         * This cache will be used later by the UpdateManager.
         * @param {Object} propSet
         */
        put: function (propSet) {
            Object.keys(propSet).forEach(function (prop) {
                this._cache[prop] = propSet[prop];
            }, this);
        },
        /**
         * Returns the given property's value.
         * @param {string} prop
         * @return {*}
         */
        get: function (prop) {
            return this._cache[prop];
        },
        /**
         * Returns true if this has the given property.
         * @param {string} prop
         * @return {boolean}
         */
        has: function (prop) {
            return prop in this._cache;
        },
        /**
         * Applies cache to the Element of DomWidget,
         * then clears cache.
         */
        flush: function () {
            this.isInterface('flush');
        },
        /**
         * Clears css cache.
         */
        clear: function () {
            this._cache = {};
        }
    });

    /**
     * Class for caching css values.
     * @constructor
     */
    function CssCache(element) {
        AbstractCache.apply(this, arguments);
    }

    genetic.inherits(CssCache, AbstractCache, {
        /**
         * Applies css cache to the Element of DomWidget,
         * then clears css cache.
         */
        flush: function () {
            this.desc('flush');
            if (!this._element) {
                return;
            }
            dom.setStyles(this._element, this._cache);
            this.clear();
        }
    });

    /**
     * Class for caching attribute values.
     * @constructor
     */
    function AttributeCache(widget) {
        AbstractCache.apply(this, arguments);
    }
    genetic.inherits(AttributeCache, AbstractCache, {
        /**
         * Applies css cache to the Element of DomWidget,
         * then clears css cache.
         */
        flush: function () {
            this.desc('flush');
            if (!this._element) {
                return;
            }
            dom.setAttributes(this._element, this._cache);
            this.clear();
        }
    });

    return DomWidget;
});
