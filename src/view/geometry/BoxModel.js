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
     * A BoxModel.
     * @constructor
     */
    function BoxModel(widget) {
        Base.apply(this, arguments);
        this.widget = widget;
    }

    genetic.inherits(BoxModel, Base, {

        left: 0,
        top: 0,
        width: 0,
        height: 0,

        /**
         * Calculates location and occupation with
         * the given widget's bounds.
         */
        castInBounds: function () {
            //TODO calculates for % and auto
            var widget = this.widget
            var bounds = widget.bounds();
            var s = dom.computedCss(widget.element());
            var cssCache = widget.cssCache;
            var positioned = function (dir) {
                var result;
                var margin = 'margin-' + dir;
                if (cssCache.has(margin)) {
                    result = parseInt(cssCache.get(margin));
                } else {
                    result = parseInt(s[margin]);
                }
                return result;
            }
            var occupied = function (dir) {
                var borderResult, paddingResult;
                var border = 'border-' + dir + '-width';
                var padding = 'padding-' + dir;
                if (cssCache.has(border)) {
                    borderResult = parseInt(cssCache.get(border));
                } else {
                    borderResult = parseInt(s[border]);
                }
                if (cssCache.has(padding)) {
                    paddingResult = parseInt(cssCache.get(padding));
                } else {
                    paddingResult = parseInt(s[padding]);
                }
                return borderResult + paddingResult;
            }
            this.left = bounds.x - positioned('left');
            this.top = bounds.y - positioned('top');
            this.width = bounds.w - (occupied('left') + occupied('right'));
            this.height = bounds.h - (occupied('top') + occupied('bottom'));
        },

        /**
         * Returns position and occupation for this BoxModel.
         * @return {string}
         */
        toString: function () {
            return Base.prototype.toString.call(this) + 
                    '[' + this.left + ',' + this.top + ',' +
                            this.width + ',' + this.height + ']';
        },
    });

    return BoxModel;
});
