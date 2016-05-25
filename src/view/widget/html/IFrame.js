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
    '../dom/DomWidget',
    '../Widget',
    './Container'
], function (
    genetic,
    DomWidget,
    Widget,
    Container
) {
    'use strict';

    /**
     * A IFrame.
     * @constructor
     */
    function IFrame(iframe) {
        Container.apply(this, arguments);
    }

    genetic.inherits(IFrame, Container, {

        /**
         * Returns tagName for this Widget.
         * @return {string}
         */
        nodeName: function () {
            return 'iframe';
        },

        /**
         * @inheritdoc
         * @override
         */
        append: function () {
            var child = arguments[0];
            if (child instanceof DomWidget) {
                this.body().appendChild(child.element());
                Widget.prototype.append.apply(this, arguments);
            }
        },

        document: function () {
            var iframe = this.element();
            return iframe.contentDocument
                    || iframe.contentWindow.document;
        },

        body: function () {
            return this.document().body;
        }
    });

    return IFrame;
});
