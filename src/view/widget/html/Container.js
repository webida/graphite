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
    'graphite/view/layout/XYLayout',
    '../dom/DomWidget',
    './HtmlWidget'
], function (
    genetic,
    XYLayout,
    DomWidget,
    HtmlWidget
) {
    'use strict';

    /**
     * A Container.
     * @constructor
     */
    function Container() {
        HtmlWidget.apply(this, arguments);
    }

    genetic.inherits(Container, HtmlWidget, {

        /**
         * @inheritdoc
         * @override
         */
        append: function () {
            var child = arguments[0];
            if (child instanceof DomWidget) {
                if (this.getLayout() instanceof XYLayout) {
                    child.css({'position': 'absolute'});
                }
                HtmlWidget.prototype.append.apply(this, arguments);
            }
        }
    });

    return Container;
});
