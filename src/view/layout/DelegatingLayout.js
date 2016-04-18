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
 * @file Widgets using a DelegatingLayout 
 * as their layout manager give location responsibilities 
 * to their children. The children of a Widget 
 * using a DelegatingLayout should have a {@link Locator} 
 * as a constraint whose {@link Locator#relocate} method 
 * is responsible for placing the child.
 * @since 1.0.0
 * @author hw.shim@samsung.com
 * @author youngd.hwang@samsung.com
 */

define([
    'external/genetic/genetic',
    'external/map/Map',
    'graphite/view/layout/Layout',
    'graphite/view/locator/Locator'
], function (
    genetic,
    Map,
    Layout,
    Locator
) {
    'use strict';

    /**
     * A DelegatingLayout.
     * @constructor
     */
    function DelegatingLayout() {
        Layout.apply(this, arguments);
        this._constraints = new Map();
    }

    genetic.inherits(DelegatingLayout, Layout, {

        /**
         * Lays out the given widget's children 
         * based on their {@link Locator} constraint.
         * @param  {Widget} widget
         */
        layout: function (widget) {
            this.desc('layout', widget);
            var locator;
            widget.getChildren().forEach(function(child) {
                locator = this.getConstraint(child);
                if (locator && locator instanceof Locator) {
                    locator.relocate(child);
                }
            }, this);
        },

        /**
         * Sets the constraint for the given Widget.
         * @param {Widget} widget
         * @param {Object} constraint
         */
        setConstraint: function (widget, constraint) {
            this.desc('setConstraint', arguments);
            Layout.prototype.setConstraint.apply(this, arguments);
            if (typeof constraint !== 'undefined'
                    && constraint !== null) {
                this._constraints.set(widget, constraint);
            }
        },

        /**
         * Returns the constraint for the given Widget.
         * @param {Widget} widget
         * @return {Object}
         */
        getConstraint: function (widget) {
            var constraint = this._constraints.get(widget);
            this.desc('getConstraint', widget, constraint + '');
            return constraint;
        }
    });

    return DelegatingLayout;
});
