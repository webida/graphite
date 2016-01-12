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
    'graphite/view/widget/Widget'
], function (
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
        this.setElement(this._createElement());
    }

    genetic.inherits(DomWidget, Widget, {

        /**
         * Returns tagName for this Widget's element.
         * @return {string}
         * @abstract
         */
        getTagName: function () {
            throw new Error('getTagName() should be'
                    + 'implemented by ' + this.constructor.name);
        },

        /**
         * Creates then returns HTMLElement for this Widget.
         * @return {HTMLElement}
         * @abstract
         * @protected
         */
        _createElement: function () {
            throw new Error('_createElement() should be'
                    + 'implemented by ' + this.constructor.name);
        },

        /**
         * Sets html element for this HtmlWidget.
         * @param {HTMLElement} element
         */
        setElement: function (element) {
            this._element = element;
        },

        /**
         * Returns html element for this HtmlWidget.
         * @return {HTMLElement}
         */
        getElement: function () {
            return this._element;
        },

    });

    return DomWidget;
});
