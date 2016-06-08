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

    /**
     * A ToolTipHelper.
     * @constructor
     */
    function ToolTipHelper(layer) {
        Base.apply(this, arguments);
        this._target = null;
        this._isShow = false;
        this._layer = layer;
    }

    genetic.inherits(ToolTipHelper, Base, {

        /**
         * @param {Widget} widget
         */
        update: function (widget) {
            if (widget && widget.toolTip()) {
                this._current = widget.toolTip();
                this._target = widget;
                this.show();
            } else if (this._isShow) {
                this.hide();
                this._current = null;
                this._target = null;
            }
        },

        /**
         * Shows toolTip.
         */
        show: function () {
            var layer = this._layer;
            var current = this._current;
            var target = this._target;
            if (target) {
                var bounds = target.bounds();
                dom.setStyles(current, {
                    'left': bounds.x + 'px',
                    'top': (bounds.y - 30) + 'px'
                });
                if (!layer.hasChildNodes()) {
                    layer.appendChild(current);
                }
                this._isShow = true;
            }
        },

        /**
         * Hides toolTip.
         */
        hide: function () {
            if (this._current) {
                this._layer.removeChild(this._current);
            }
            this._isShow = false;
        }
    });

    return ToolTipHelper;
});
