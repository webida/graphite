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
    '../structural/DivLayer',
], function (
    genetic,
    DivLayer
) {
    'use strict';

    /**
     * A Viewport.
     * @constructor
     */
    function Viewport() {
        DivLayer.apply(this, arguments);
        this._view = null;
    }

    genetic.inherits(Viewport, DivLayer, {

        /**
         * Sets the given Widget as a view for this Viewport.
         * @param {Widget} widget
         *//**
         * Returns the view for this Viewport.
         * @return {Widget} view
         */
        contents: function (widget) {
            this.desc('contents', arguments);
            if (arguments.length) {
                if (this._view === widget) return;
                if (this._view) {
                    this.remove(this._view);
                }
                this._view = widget;
                if (widget) {
                    this.append(widget);
                }
            } else {
                return this._view;
            }
        },

        /**
         * Viewport does not synchronize location-bounds with
         * rendered HtmlElement's real location.
         * @protected
         * @override
         */
        _syncLocation: function () {
            this.desc('_syncLocation');
            //does nothing
        }
    });

    return Viewport;
});
