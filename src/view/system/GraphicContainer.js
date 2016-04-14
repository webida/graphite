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
    'graphite/base/BaseEmitter',
    'graphite/view/geometry/Rectangle',
    './Environment'
], function (
    dom,
    genetic,
    BaseEmitter,
    Rectangle,
    Environment
) {
    'use strict';

    /**
     * A GraphicContainer.
     * @constructor
     */
    function GraphicContainer(element) {
        BaseEmitter.apply(this, arguments);
        this.setElement(element);
        this.createLayers(element);
    }

    genetic.inherits(GraphicContainer, BaseEmitter, {

        /**
         * @param {HTMLElement} element
         */
        setElement: function (element) {
            this.desc('setElement', element);
            this._element = element;
            element.classList.add('graphite');
            element.classList.add('graphite-select-none');
            this.mask = dom.bySelector('#mask', element)[0];
        },

        /***
         * @return {HTMLElement}
         */
        getElement: function () {
            this.desc('getElement');
            return this._element;
        },

        /**
         * Creates Layers with in GraphicContainer's DOM element.
         * @param {HTMLElement} container
         */
        createLayers: function (container) {
            var body, size;
            var $ = container.querySelector.bind(container);
            var markup = "" +
                "<style>" +
                    ".graphite .layer {" +
                        "position: absolute;" +
                        "overflow: hidden;" +
                        "width: 100%;" +
                        "height: 100%;" +
                    "}" +
                    ".graphite .master {" +
                        "min-width: 100px;" +
                        "min-height: 100px;" +
                    "}" +
                    ".graphite-select-none {" +
                        "outline: none;" +
                        "-moz-user-select: -moz-none;" +
                        "-khtml-user-select: none;" +
                        "-webkit-user-select: none;" +
                        "-o-user-select: none;" +
                        "user-select: none;" +
                    "}" +
                "</style>" +
                "<div class='master scrollable layer'>" +
                    "<div class='scalable layer'>" +
                        "<div class='printable layer'>" +
                            "<div class='primary layer'>" +
                                "<iframe class='layer' style='border:0'></iframe>" +
                                "<svg class='layer' shape-rendering='crispEdges'></svg>" +
                            "</div>" +
                        "</div>" +
                        "<svg class='feedback layer'></svg>" +
                    "</div>" +
                    "<svg class='handle layer'></svg>" +
                    "<div class='mask layer graphite-select-none' tabindex='1000'></div>" +
                "</div>";
            container.innerHTML = markup;
            this.master = $('.master');
            this.scalable = $('.scalable');
            this.printable = $('.printable');
            this.primary = $('.primary');
            this.iframe = $('.primary > iframe');
            this.svg = $('.primary > svg');
            this.feedback = $('.feedback');
            this.handle = $('.handle');
            this.mask = $('.mask');
            this.document = this.iframe.contentDocument
                    || this.iframe.contentWindow.document;
            body = this.document.body;
            size = dom.getRect(container);
            dom.setStyles(body, {'margin':0, 'padding':0});
            dom.setStyles(this.master, {
                'width': size.width + 'px', 'height': size.height + 'px'});
            setTimeout(function (c) {
                /**
                 * ready event.
                 * @event GraphicContainer#ready
                 * @type {GraphicContainer}
                 */
                c.emit('ready', c);
            }, 0, this);
        },

        /***
         * @return {HTMLElement}
         */
        getEventMask: function () {
            return this.mask;
        },

        /**
         * @return {Rectangle}
         */
        getClientArea: function () {
            var e = this.getElement();
            var css = window.getComputedStyle(e);
            //console.log('getClientArea', JSON.stringify(css));
            var rect = dom.getRect(e, true);
            var r = new Rectangle(0, 0, rect.width,rect.height);
            this.desc('getClientArea', [], r + '');
            return r;
        },
    });

    return GraphicContainer;
});
