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
 * @file GraphicContainer
 * @since 1.0.0
 * @author hw.shim@samsung.com
 */

define([
    'external/dom/dom',
    'external/genetic/genetic',
    'graphite/base/BaseEmitter',
    'graphite/env/Environment',
    'graphite/view/geometry/Rectangle',
    './context/DefaultGraphicContextFactory'
], function (
    dom,
    genetic,
    BaseEmitter,
    Environment,
    Rectangle,
    DefaultGraphicContextFactory
) {
    'use strict';

    /**
     * A GraphicContainer wraps and manages a given HTMLElement
     * which will contain graphical contents.
     * @param {HTMLElement} element
     * @param {Function} GraphicContextFactory
     * @constructor
     */
    function GraphicContainer(element, GraphicContextFactory) {
        BaseEmitter.apply(this, arguments);
        this._contents = null;
        this._gcFactory = null;
        this._graphicContext = null;
        this.setElement(element);
        this.setGraphicContextFactory(GraphicContextFactory);
    }

    genetic.inherits(GraphicContainer, BaseEmitter, {

        /**
         * @param {HTMLElement} element
         */
        setElement: function (element) {
            this.desc('setElement', element);
            this._element = element;
            element.className = element.className
                    + ' graphite graphite-select-none';
        },

        /**
         * @return {HTMLElement}
         */
        getElement: function () {
            return this._element;
        },

        /**
         * Sets user's content root. This delegates
         * how to append the root to the GraphicContext.
         * @param {Widget} contents
         */
        setContents: function (contents) {
            this.desc('setContents', contents);
            this.getGraphicContext().setContents(contents);
            this._contents = contents;
        },

        /**
         * Retuens user's content root.
         * @return {Widget}
         */
        getContents: function () {
            return this._contents;
        },

        /**
         * Sets GraphicContextFactory constructor
         * which will create GraphicContext.
         * @param {Function} Factory
         */
        setGraphicContextFactory: function (Factory) {
            if (typeof Factory !== 'function') {
                Factory = DefaultGraphicContextFactory;
            }
            this._gcFactory = new Factory(this);
        },

        /**
         * Returns GraphicContextFactory.
         * @return {GraphicContextFactory}
         */
        getGraphicContextFactory: function () {
            return this._gcFactory;
        },

        /**
         * Returns GraphicContext.
         * @return {GraphicContext}
         */
        getGraphicContext: function () {
            var factory;
            var container = this;
            if (!this._graphicContext) {
                factory = this.getGraphicContextFactory();
                this._graphicContext = factory.createGraphicContext();
                setTimeout(function (container) {
                    /**
                     * ready event.
                     * @event GraphicContainer#ready
                     * @type {GraphicContainer}
                     */
                    container.emit('ready', container);
                }, 0, container);
            }
            return this._graphicContext;
        },

        /**
         * @return {Rectangle}
         */
        getClientArea: function () {
            var e = this.getElement();
            var css = window.getComputedStyle(e);
            var rect = dom.getRect(e, true);
            var r = new Rectangle(0, 0, rect.width,rect.height);
            this.desc('getClientArea', [], r + '');
            return r;
        },

        /***
         * Clears resources for GC.
         */
        clear: function () {
            this.desc('clear');
            this._contents = null;
            this._gcFactory = null;
            this._graphicContext = null;
            /**
             * event notes clearing finished.
             * @event GraphicContainer#cleared
             * @type {GraphicContainer}
             */
            this.emit('cleared', this);
        }
    });

    return GraphicContainer;
});
