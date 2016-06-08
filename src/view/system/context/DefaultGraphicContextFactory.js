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
    'graphite/view/widget/html/HtmlWidget',
    'graphite/view/widget/structural/ConnectionLayer',
    'graphite/view/widget/structural/DivLayer',
    'graphite/view/widget/structural/DivLayeredPane',
    'graphite/view/widget/structural/GridLayer',
    'graphite/view/widget/structural/GuideLayer',
    'graphite/view/widget/structural/IFrameLayer',
    'graphite/view/widget/structural/SvgLayer',
    'graphite/view/widget/structural/Viewport',
    'graphite/view/widget/svg/Svg',
    './GraphicContextFactory'
], function (
    dom,
    genetic,
    HtmlWidget,
    ConnectionLayer,
    DivLayer,
    DivLayeredPane,
    GridLayer,
    GuideLayer,
    IFrameLayer,
    SvgLayer,
    Viewport,
    Svg,
    GraphicContextFactory
) {
    'use strict';

    /**
     * A DefaultGraphicContextFactory.
     * @param {GraphicContainer} container
     * @constructor
     */
    function DefaultGraphicContextFactory(container) {
        GraphicContextFactory.apply(this, arguments);
    }

    var $;

    genetic.inherits(DefaultGraphicContextFactory, GraphicContextFactory, {

        /**
         * Creates GraphicContext and returns it.
         * @return {GraphicContext}
         */
        createGraphicContext: function () {
            var context = this._getContext();
            this._createDom(this._getContainer().getElement());
            context.root(this._createContextRoot());
            this._createContentsMapRule();
            return context;
        },

        /**
         * Creates DOM for Layers.
         */
        _createDom: function (element) {
            this.desc('_createDom', element);
            var markup = "" +
                "<style>" +
                    ".graphite .layer," +
                    ".graphite .layerpane {" +
                        "position: absolute;" +
                        "overflow: hidden;" +
                        "width: 100%;" +
                        "height: 100%;" +
                    "}" +
                    ".graphite .viewport {" +
                        "position: relative;" +
                        "min-width: 100px;" +
                        "min-height: 100px;" +
                    "}" +
                    ".graphite .select-none {" +
                        "outline: none;" +
                        "-moz-user-select: -moz-none;" +
                        "-khtml-user-select: none;" +
                        "-webkit-user-select: none;" +
                        "-o-user-select: none;" +
                        "user-select: none;" +
                    "}" +
                "</style>" +
                "<div class='viewport layer'>" +
                    "<div class='extensible layerpane'>" +
                        "<div class='scalable layerpane'>" +
                            "<svg class='grid layer'></svg>" +
                            "<div class='printable layerpane'>" +
                                "<div class='context layerpane'>" +
                                    "<iframe class='layer' style='border:0'></iframe>" +
                                    "<svg class='layer' shape-rendering='crispEdges'></svg>" +
                                "</div>" +
                                "<svg class='connection layer'></svg>" +
                            "</div>" +
                            "<svg class='feedback layer'></svg>" +
                        "</div>" +
                        "<svg class='handle layer'></svg>" +
                        "<svg class='guide layer'></svg>" +
                        "<div class='tooltip layer'></div>" +
                        "<div class='mask layer select-none' tabindex='1000'></div>" +
                    "</div>";
                "</div>";
            element.innerHTML = markup;
            $ = element.querySelector.bind(element);
        },

        /**
         * Creates ContextRoot with in GraphicContainer's DOM element.
         * The Viewport is default ContextRoot.
         * @return {Widget} - viewport
         */
        _createContextRoot: function () {
            this.desc('_createContextRoot');
            var size = this._getContainerSize();
            var viewport = new Viewport($('.viewport'));
            viewport.size(size.width, size.height);
            viewport.contents(this._createExtensibleLayers());
            return viewport;
        },

        _getContainerSize: function () {
            var container = this._getContainer();
            var element = container.getElement();
            return dom.getRect(element);
        },

        _addToPane: function (pane, layer, KEY) {
            var context = this._getContext();
            pane.append(layer, KEY);
            layer.setLabel(KEY);
            context.setLayer(KEY, layer);
        },

        /**
         * To scroll or pan the screen, viewport.contents(),
         * ie. extensible layer.
         * @example
         *  pane.size(w, h);
         *  pane.location(x, y);
         * then show or hide scroll bars.
         * @protected
         */
        _createExtensibleLayers: function () {
            this.desc('_createExtensibleLayers');
            var mask = $('.mask');
            var pane = new DivLayeredPane($('.extensible'));
            var size = this._getContainerSize();
            pane.size(size.width, size.height);
            this._addToPane(pane, this._createScalableLayers(), 'SCALABLE_LAYERS');
            this._addToPane(pane, new SvgLayer($('.handle')), 'HANDLE_LAYER');
            this._addToPane(pane, new GuideLayer($('.guide')), 'GUIDE_LAYER');
            this._addToPane(pane, new DivLayer($('.tooltip')), 'TOOLTIP_LAYER');
            this._addToPane(pane, new DivLayer(mask), 'MASK_LAYER');
            this._getContext().setEventReceiver(mask);
            return pane;
        },

        _createScalableLayers: function () {
            this.desc('_createScalableLayers');
            var pane = new DivLayeredPane($('.scalable'));
            this._addToPane(pane, new GridLayer($('.grid')), 'GRID_LAYER');
            this._addToPane(pane, this._createPrintableLayers(), 'PRINTABLE_LAYERS');
            this._addToPane(pane, new SvgLayer($('.feedback')), 'FEEDBACK_LAYER');
            return pane;
        },

        _createPrintableLayers: function () {
            this.desc('_createPrintableLayers');
            var pane = new DivLayeredPane($('.printable'));
            this._addToPane(pane, this._createContextLayers(), 'CONTEXT_LAYERS');
            this._addToPane(pane, new ConnectionLayer($('.connection')), 'CONNECTION_LAYER');
            return pane;
        },

        _createContextLayers: function () {
            this.desc('_createContextLayers');
            var pane = new DivLayeredPane($('.context'));
            var iframe = $('.context > iframe');
            var svg = $('.context > svg');
            var document = iframe.contentDocument
                    || iframe.contentWindow.document;
            if (!document.body) {
                document.write("<body></body>");
            }
            dom.setStyles(document.body, {'margin':0, 'padding':0});
            this._addToPane(pane, new IFrameLayer(iframe), 'IFRAME_LAYER');
            this._addToPane(pane, new SvgLayer(svg), 'SVG_LAYER');
            return pane;
        },

        _createContentsMapRule: function () {
            this.desc('_createContentsMapRule');
            var context = this._getContext();
            var rule = new Map();
            rule.set(HtmlWidget, 'IFRAME_LAYER');
            rule.set(Svg, 'SVG_LAYER');
            context.setContentsMapRule(rule);
        }
    });

    return DefaultGraphicContextFactory;
});
