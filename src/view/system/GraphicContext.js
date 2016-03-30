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
    'graphite/view/system/GraphicContainer'
], function (
    genetic,
    Base,
    GraphicContainer
) {
    'use strict';

    /**
     * A GraphicContext.
     * @constructor
     * @param {GraphicContainer} container
     */
    function GraphicContext(container) {
        Base.apply(this, arguments);
        this.initContext(container);
    }

    genetic.inherits(GraphicContext, Base, {

        /**
         * Explain
         * @param {GraphicContainer} container
         */
        initContext: function(container) {
            this.desc('initContext', container);
            var element, iframe, svg, connection;
            if (container && container instanceof GraphicContainer) {
                element = container.getElement();
                if (element) {
                    iframe = element.querySelector('.GraphicContainer .IframeLayer');
                    svg = element.querySelector('.GraphicContainer .SVGLayer');
                    connection = element.querySelector('.ConnectionLayer');
                    this.info(iframe, svg, connection);
                }
                if (!iframe) {
                    console.warn('TODO : make IframeLayer');
                }
                if (!svg) {
                    console.warn('TODO : make SVGLayer');
                }
                this.svg = svg;
                this.document = iframe.contentDocument || iframe.contentWindow.document;
            }
        },

        getSVG: function () {
            return this.svg;
        },
        
        getDocument: function () {
            return this.document;
        },

        getConnection: function () {
            return this.connection;
        }
    });

    return GraphicContext;
});
