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
    'graphite/view/widget/Widget',
    './Structural',
    './SvgWidget'
], function (
    dom,
    genetic,
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
            SvgWidget.prototype.setParent.call(this, parent);
            if (parent instanceof Structural) {
                parent.getElement().appendChild(this.getElement());
            } else {
                throw new Error('Only Structural can be a parent for Shape');
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
            Widget.prototype.setBgColor.call(this, color);
            dom.setAttributes(this.getElement(), {
                'fill': this.getBgColor()
            });
        },

        /**
         * Sets this widget's border color.
         * @see Widget#setBorderColor
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
        setBorderColor: function (color) {
            Widget.prototype.setBorderColor.call(this, color);
            dom.setAttributes(this.getElement(), {
                'stroke': this.getBorderColor()
            });
        },

        /**
         * Sets this widget's border width.
         * @see Widget#setBorderWidth
         * @param {number} width
         */
        setBorderWidth: function (width) {
            Widget.prototype.setBorderWidth.call(this, width);
            dom.setAttributes(this.getElement(), {
                'stroke-width': this.getBorderWidth()
            });
        }
    });

    return Shape;
});
