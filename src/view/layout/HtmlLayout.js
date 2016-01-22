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
    './Layout',
    './XYLayout'
], function (
    dom,
    genetic,
    Layout,
    XYLayout
) {
    'use strict';

    /**
     * A HtmlLayout.
     * @constructor
     */
    function HtmlLayout() {
        XYLayout.apply(this, arguments);
    }

    var proto = genetic.mixin(XYLayout.prototype, {

        /**
         * Lays out the given HtmlWidget. This method uses
         * Dom's box model to calculate desired position and
         * occupation for the Widget's HTMLElement.
         * @see Layout#layout(Widget)
         * @param {HtmlWidget} widget
         * @override
         */
        layout: function (widget) {
            this.desc('layout', widget);
            var elem, box;
            if (widget.fillParent() && widget.getParent()) {
                widget.bounds(widget.getParent().getClientArea());
                widget.calcBoxModel();
            }
            widget.getChildren().forEach(function(child) {
                if (child.fillParent()) {
                    child.bounds(widget.getClientArea());
                }
                child.calcBoxModel();
            }, this);
            this.desc('layout', widget, 'end');
        }
    });

    genetic.inherits(HtmlLayout, Layout, proto);

    return HtmlLayout;
});
