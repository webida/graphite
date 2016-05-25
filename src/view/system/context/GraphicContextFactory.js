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
    'graphite/base/Base',
    './GraphicContext'
], function (
    genetic,
    Base,
    GraphicContext
) {
    'use strict';

    /**
     * A GraphicContextFactory constructs a structure for GraphicContext.
     * Basically and internally, DefaultGraphicContextFactory will be used.
     * If you need custom layer structure for GraphicContext, you can make
     * your own GraphicContextFactory by inheriting GraphicContextFactory.
     * @example
     * var shell = new GraphiteShell('container', YourGraphicContextFactory);
     * @param {GraphicContainer} container
     * @constructor
     */
    function GraphicContextFactory(container) {
        Base.apply(this, arguments);
        this._container = container;
        this._context = new GraphicContext();
    }

    genetic.inherits(GraphicContextFactory, Base, {

        /**
         * Creates GraphicContext and returns it.
         * @return {GraphicContext}
         * @abstract
         */
        createGraphicContext: function () {
            this.isInterface('createGraphicContext');
        },

        /**
         * @return {GraphicContainer}
         * @protected
         */
        _getContainer: function () {
            return this._container;
        },

        /**
         * @return {GraphicContext}
         * @protected
         */
        _getContext: function () {
            return this._context;
        }
    });

    return GraphicContextFactory;
});
