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
    './HtmlWidget'
], function (
    genetic,
    XYLayout,
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
         * Sets this Widget's parent.
         * @param {Widget} parent
         * @override 
         */
        setParent: function (parent) {
            this.desc('setParent', parent);
            HtmlWidget.prototype.setParent.call(this, parent);
            if (parent instanceof Container) {
                parent.element().appendChild(this.element());
                if (parent.getLayout() instanceof XYLayout) {
                    this.css({'position': 'absolute'});
                }
            } else {
                var err = new Error('Only Container can be a parent for Container');
                err.name = 'InvalidParent';
                throw err;
            }
        },
    });

    return Container;
});
