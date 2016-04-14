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
        this.init(container);
    }

    genetic.inherits(GraphicContext, Base, {

        /**
         * Explain
         * @param {GraphicContainer} container
         */
        init: function(container) {
            this.desc('init', container);
            var iframe;
            if (container && container instanceof GraphicContainer) {
                this.container = container;
                this.svg = this.container.svg;
                iframe = this.container.iframe;
                this.document = iframe.contentDocument || iframe.contentWindow.document;
            }
        },

        getSVG: function () {
            return this.svg;
        },
        
        getDocument: function () {
            return this.document;
        }
    });

    return GraphicContext;
});
