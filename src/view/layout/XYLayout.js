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
    'external/map/Map',
    'graphite/view/layout/Layout'
], function (
    genetic,
    Map,
    Layout
) {
    'use strict';

    /**
     * A XYLayout.
     * @constructor
     */
    function XYLayout() {
        Layout.apply(this, arguments);
        this._constraints = new Map();
    }

    genetic.inherits(XYLayout, Layout, {

        /**
         * Lays out the given widget.
         * @see Layout#layout(Widget)
         */
        layout: function (widget) {
            this.desc('layout', widget);
            var bounds, preferredSize;
            var offset = this.getOrigin(widget);
            widget.getChildren().forEach(function(child) {
                bounds = this.getConstraint(child);
                if (bounds) {
                    if (bounds.w === -1 || bounds.h === -1) {
                        preferredSize = child.getPreferredSize(bounds.w, bounds.h);
                        bounds = bounds.getCopy();
                        if (bounds.w === -1) {
                            bounds.w = preferredSize.w;
                        }
                        if (bounds.h === -1) {
                            bounds.h = preferredSize.h;
                        }
                    }
                    bounds = bounds.getTranslated(offset);
                    child.bounds(bounds);
                }
            }, this);
        },

        /**
         * Returns the origin for the given Widget.
         * @param {Widget} widget
         * @return {Point}
         */
        getOrigin: function (widget) {
            var origin = widget.getClientArea().getLocation();
            this.desc('getOrigin', widget, origin + '');
            return origin;
        },

        /**
         * Sets the constraint for the given Widget.
         * @param {Widget} widget
         * @param {Rectangle} constraint
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
         * @return {Rectangle}
         */
        getConstraint: function (widget) {
            var constraint = this._constraints.get(widget);
            this.desc('getConstraint', widget, constraint + '');
            return constraint;
        }
    });

    return XYLayout;
});
