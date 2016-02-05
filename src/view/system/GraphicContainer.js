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
    'graphite/view/geometry/Rectangle'
], function (
    dom,
    genetic,
    Base,
    Rectangle
) {
    'use strict';

    /**
     * A GraphicContainer.
     * @constructor
     */
    function GraphicContainer(element) {
        Base.apply(this, arguments);
        this.setElement(element);
    }

    genetic.inherits(GraphicContainer, Base, {

        /**
         * @param {HTMLElement} element
         */
        setElement: function (element) {
            this.desc('setElement', element);
            this._element = element;
            this._mask = dom.bySelector('#mask', element)[0];
            //TODO make #mask div
        },

        /***
         * @return {HTMLElement}
         */
        getElement: function () {
            this.desc('getElement');
            return this._element;
        },

        /***
         * @return {HTMLElement}
         */
        getEventMask: function () {
            return this._mask;
        },

        /**
         * @return {Rectangle}
         */
        getClientArea: function () {
            var e = this.getElement();
            var rect = dom.getRect(e);
            var r = new Rectangle(0, 0, rect.width,rect.height);
            this.desc('getClientArea', [], r + '');
            return r;
        },
    });

    return GraphicContainer;
});
