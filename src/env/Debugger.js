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
    'graphite/base/logger/Logger',
    './Environment'
], function (
    dom,
    genetic,
    Base,
    Logger,
    Environment
) {
    'use strict';

    function applyStyles(shell) {
        var container = shell.container();
        var context = container.graphicContext();
        var mask = context.getEventReceiver();
        var iframeLayer = context.getLayer('IFRAME_LAYER');
        dom.setStyles(mask, {'background-color': 'salmon', 'opacity': 0.1});
        if (iframeLayer) {
            dom.setStyles(iframeLayer.body(), {'background-color': '#a2e2f1'});
        }
    }

    function loadMonitor(shell) {
        var container = shell.container();
        var mask = container.graphicContext().getEventReceiver();
        var markup = "" +
        "<style>" +
            ".graphite-monitor {" +
                "position: absolute;" +
                "font-size: 8pt;" +
                "font-family: consolas;" +
                "bottom: 120px;" +
                "width: 80%;" +
            "}" +
            ".graphite-monitor .console {" +
                "position: absolute;" +
                "background-color: #eee;" +
                "width: 100%;" +
            "}" +
            ".console ul {" +
                "line-height: 11pt;" +
                "padding-left: 30px;" +
            "}" +
            ".console span {" +
                "background-color: #fff;" +
                "padding: 0px 3px;" +
            "}" +
        "</style>" +
        "<div class='console'>" +
            "<ul>" +
                "<li>layerX,Y <span class='layer-xy'>n/a</span></li>" +
                "<li>dragStart <span class='drag-start'>n/a</span></li>" +
                "<li>dragDelta <span class='drag-delta'>n/a</span></li>" +
                "<li>dragStop <span class='drag-stop'>n/a</span></li>" +
            "</ul>" +
        "</div>";
        var body = document.body;
        var monitor = dom.makeElement('div', {
            'class': 'graphite-monitor'
        });
        var layerXY, dragStart, dragDelta, dragStop, isDrag = false, start;
        monitor.innerHTML = markup;
        body.appendChild(monitor);
        layerXY = monitor.querySelector('.layer-xy');
        dragStart = monitor.querySelector('.drag-start');
        dragDelta = monitor.querySelector('.drag-delta');
        dragStop = monitor.querySelector('.drag-stop');
        mask.addEventListener('mousemove', function (ev) {
            var delta, pos = dom.getEventPos(ev);
            if (isDrag) {
                delta = {
                    'x': pos.x - start.x,
                    'y': pos.y - start.y
                };
                dragDelta.textContent = delta.x+', '+delta.y;
            }
            layerXY.textContent = pos.x+', '+pos.y;
        });
        mask.addEventListener('mousedown', function (ev) {
            isDrag = true;
            start = dom.getEventPos(ev);
            dragStart.textContent = start.x+', '+start.y;
            dragStop.textContent = 'n/a';
        });
        mask.addEventListener('mouseup', function (ev) {
            isDrag = false;
            var pos = dom.getEventPos(ev);
            dragStop.textContent = pos.x+', '+pos.y;
        });
    }

    function updateLogLevel(obj, level) {
        var proto, props;
        if (typeof obj === 'function') {
            proto = obj.prototype;
            if (typeof proto.invoke === 'function') {
                proto.logLevel = level;
            }
        } else {
            props = Object.getOwnPropertyNames(obj);
            var len = props.length;
            for (var i = 0; i < len; i++) {
                updateLogLevel(obj[props[i]], level);
            }
        }
    }

    /**
     * A Debugger.
     * @module
     */
    var Debugger = {

        LOG_LEVEL: {
            'OFF': Logger.LEVEL.off,
            'LOG': Logger.LEVEL.log,
            'INFO': Logger.LEVEL.info,
            'WARN': Logger.LEVEL.warn,
            'ERROR': Logger.LEVEL.error,
            'TRACE': Logger.LEVEL.trace,
            'ALL': Logger.LEVEL.all
        },

        /**
         * @param {GraphiteShell} shell
         */
        load: function (shell) {
            applyStyles(shell);
            loadMonitor(shell);
        },

        log: function (config, level) {
            if (!Array.isArray(config)) {
                return;
            }
            var len = config.length;
            for (var i = 0; i < len; i++) {
                updateLogLevel(config[i], level);
            }
        }
    };

    if (typeof Environment.global.get('loglevel') !== 'undefined') {
        Logger.prototype.logLevel = Environment.global.get('loglevel');
    }

    return Debugger;
});
