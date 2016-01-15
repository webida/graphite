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
    'graphite/view/system/GraphiteShell',
    './Container',
    './HtmlWidget'
], function (
    dom,
    genetic,
    GraphiteShell,
    Container,
    HtmlWidget
) {
    'use strict';

    /**
     * A Div.
     * @constructor
     */
    function Div() {
        Container.apply(this, arguments);
    }

    genetic.inherits(Div, Container, {

        /**
         * Returns tagName for this Widget.
         * @return {string}
         */
        getTagName: function () {
            return 'div';
        },

        /**
         * @see Widget#_drawWidget
         * @param {GraphicContext} context
         */
        _drawWidget: function (context) {
            this.desc('_drawWidget', context, undefined, 'green');
            var bounds = this.getBounds();
            var div = this.getElement();
            dom.setStyles(div, {
                'left': bounds.x + 'px',
                'top': bounds.y + 'px',
                'width': bounds.w + 'px',
                'height': bounds.h + 'px'
            });
        },

        /**
         * Sets this Widget's parent.
         * @param {Widget} parent
         * @override 
         */
        setParent: function (parent) {
            this.desc('setParent', parent);
            try {
                Container.prototype.setParent.call(this, parent);
            } catch (e) {
                if (e.name === 'InvalidParent') {
                    if (parent instanceof GraphiteShell.RootWidget) {
                        var upman = this.getUpdateManager();
                        var context = upman.getGraphicContext();
                        var document = context.getDocument();;
                        document.body.appendChild(this.getElement());
                    }
                } else {
                    throw e;
                }
            }
        },
    });

    return Div;
});