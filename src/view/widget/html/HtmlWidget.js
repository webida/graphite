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
    }

    function parseBoxModelProperty(prop) {
        var props = prop.split(' ');
        var r = {
            left: '',
            top: '',
            right: '',
            bottom: ''
        };
        if (props.length === 1) {
            r.left = r.top = r.right = r.bottom = props[0];
        } else if (props.length === 2) {
            r.top = r.bottom = props[0];
            r.left = r.right = props[1];
        } else if (props.length === 3) {
            r.top = props[0];
            r.left = r.right = props[1];
            r.bottom = props[2];
        } else if (props.length === 4) {
            r.top = props[0];
            r.right = props[1];
            r.bottom = props[2];
            r.left = props[3];
        }
        return r;
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
            var result = DomWidget.prototype.borderColor.apply(this, arguments);
            if (arguments.length) {
                this.cssCache.put({
                    'border-color': arguments[0]
                });
            }
            return result;
        },

        /**
         * Sets property for this HtmlWidget's element.
         * For HtmlWidget, css method considers Box-Model properties.
         * @param {Object} propSet - pairs of key and value
         * @return {DomWidget}
         * @override
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
            var margin, borders, border, padding;
            if ('margin' in propSet) {
                margin = parseBoxModelProperty(propSet['margin']);
                this.css({
                    'margin-left': margin.left,
                    'margin-top': margin.top,
                    'margin-right': margin.right,
                    'margin-bottom': margin.bottom
                });
                delete propSet['margin'];
            }
            if ('border' in propSet) {
                borders = propSet['border'].split(' ');
                if (typeof borders[1] !== undefined) {
                    this.cssCache.put({
                        'border-style': borders[1]
                    });
                }
                if (typeof borders[2] !== undefined) {
                    this.borderColor(borders[2]);
                }
                border = parseBoxModelProperty(borders[0]);
                this.css({
                    'border-left-width': border.left,
                    'border-top-width': border.top,
                    'border-right-width': border.right,
                    'border-bottom-width': border.bottom
                });
                delete propSet['border'];
            }
            if ('border-width' in propSet) {
                border = parseBoxModelProperty(propSet['border-width']);
                this.css({
                    'border-left-width': border.left,
                    'border-top-width': border.top,
                    'border-right-width': border.right,
                    'border-bottom-width': border.bottom
                });
                delete propSet['border-width'];
            }
            if ('padding' in propSet) {
                padding = parseBoxModelProperty(propSet['padding']);
                this.css({
                    'padding-left': padding.left,
                    'padding-top': padding.top,
                    'padding-right': padding.right,
                    'padding-bottom': padding.bottom
                });
                delete propSet['padding'];
            }
            return DomWidget.prototype.css.apply(this, arguments);
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
            var cssCache = this.cssCache;
            var positioned = ['absolute', 'relative'];
            cssCache.put({
                'width': box.width + 'px',
                'height': box.height + 'px'
            });
            if (cssCache.has('position')
                    && positioned.indexOf(cssCache.get('position')) > 0) {
                cssCache.put({
                    'left': box.left + 'px',
                    'top': box.top + 'px'
                });
            }
            cssCache.flush();
        },

        /**
         * Lays out this Widget using its Layout.
         * Additionally, HtmlWidget calculates box model properties
         * such as, left, top, width, height with given bounds.
         * @override
         */
        layout: function () {
            this.boxModel.inBounds(this, this.bounds());
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
