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
    'graphite/base/Base'
], function (
    dom,
    genetic,
    Base
) {
    'use strict';

    function applyStyles(shell) {
        var container = shell.getContainer();
        dom.setStyles(container.mask, {'background-color': 'salmon', 'opacity': 0.1});
        dom.setStyles(container.document.body, {'background-color': '#a2e2f1'});
    }

    function loadMonitor(shell) {
        var container = shell.getContainer();
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
        container.mask.addEventListener('mousemove', function (ev) {
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
        container.mask.addEventListener('mousedown', function (ev) {
            isDrag = true;
            start = dom.getEventPos(ev);
            dragStart.textContent = start.x+', '+start.y;
            dragStop.textContent = 'n/a';
        });
        container.mask.addEventListener('mouseup', function (ev) {
            isDrag = false;
            var pos = dom.getEventPos(ev);
            dragStop.textContent = pos.x+', '+pos.y;
        });
    }

    /**
     * A Debugger.
     * @module
     */
    var Debugger = {

        /**
         * @param {GraphiteShell} shell
         */
        load: function (shell) {
            applyStyles(shell);
            loadMonitor(shell);
        }
    };

    return Debugger;
});
