/*
 * Copyright (c) 2012-2016 S-Core Co., Ltd.
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
 * @file AutoexposeHelper
 * @since 1.0.0
 * @author hw.shim@samsung.com
 */

define([
    'external/genetic/genetic',
    'graphite/base/Base',
    'graphite/view/geometry/Rectangle',
    'graphite/view/geometry/Spaces',
    'graphite/view/widget/structural/Viewport'
], function (
    genetic,
    Base,
    Rectangle,
    Spaces,
    Viewport
) {
    'use strict';

    /**
     * AutoexposeHelper performs autoscrolling of a Viewport.
     * This helper is for use with Controllers that contain a viewport.
     * This helper will search the Controller and find the viewport.
     * Autoscroll will occur when the detect location is inside
     * the viewport's bounds, but near its edge.
     * It will continue for as long as the location continues to meet
     * these criteria. The autoscroll direction is approximated
     * to the nearest orthogonal or diagonal direction
     * (north, northeast, east, etc.).
     * @constructor
     */
    function AutoexposeHelper(owner, threshold) {
        Base.apply(this, arguments);
        this.owner = owner;
        /** the last time an auto-scroll was performed */
        this._lastStepTime = 0;
        /** defines the range where autoscroll
         * is active inside a viewer */
        if (typeof arguments[1] === 'undefined') {
            this._threshold = new Spaces(18);
        } else {
            this._threshold = threshold;
        }
    }

    genetic.inherits(AutoexposeHelper, Base, {

        /**
         * Returns true if the given point is inside the viewport,
         * but near its edge.
         * @param {Point} point
         * @return {boolean}
         */
        detect: function (point) {
            this._lastStepTime = 0;
            var port = this._findViewport(this.owner);
            var rect = Rectangle.SINGLETON;
            port.clientArea(rect);
            port.translateToParent(rect);
            port.translateToAbsolute(rect);
            return rect.contains(point)
                    && !rect.crop(this._threshold).contains(point);
        },

        /**
         * Returns true if the given point is inside the viewport,
         * but near its edge.
         * @param {Controller} controller
         * @return {Viewport}
         * @protected
         */
        _findViewport: function (controller) {
            var widget = null;
            var port = null;
            do {
                if (!widget)
                    widget = controller.contentPane();
                else
                    widget = widget.getParent();
                if (widget instanceof Viewport) {
                    port = widget;
                    break;
                }
            } while (widget !== controller.view() && widget);
            return port;
        },

        /**
         * Returns <code>true</code> if the given point is outside the viewport or
         * near its edge. Scrolls the viewport by a calculated (time based) amount
         * in the current direction.
         * 
         * todo: investigate if we should allow auto expose when the pointer is
         * outside the viewport
         * 
         * @param {Point} where
         * @return {boolean}
         */
        step: function (where) {
            var port = this._findViewport(this.owner);
            var rect = Rectangle.SINGLETON;
            port.clientArea(rect);
            port.translateToParent(rect);
            port.translateToAbsolute(rect);
            if (!rect.contains(where)
                    || rect.crop(this._threshold).contains(where))
                return false;

            // set scroll offset (speed factor)
            var scrollOffset = 0;

            // calculate time based scroll offset
            if (this._lastStepTime === 0)
                this._lastStepTime = +new Date();

            var difference = +new Date() - this._lastStepTime;

            if (difference > 0) {
                scrollOffset = parseInt(difference) / 3;
                this._lastStepTime = +new Date();
            }

            if (scrollOffset === 0)
                return true;

            rect.crop(this._threshold);

            var region = rect.getPosition(where);
            var loc = port.getViewLocation();

            if ((region & Position.SOUTH) !== 0)
                loc.y += scrollOffset;
            else if ((region & Position.NORTH) !== 0)
                loc.y -= scrollOffset;
    
            if ((region & Position.EAST) !== 0)
                loc.x += scrollOffset;
            else if ((region & Position.WEST) !== 0)
                loc.x -= scrollOffset;

            port.setViewLocation(loc);
            return true;
        }
    });

    /**
     * A AutoexposeHelper.
     * @constructor
     */
    function Search(point) {
        Base.apply(this, arguments);
        this._where = point;
        this._result = null; //AutoexposeHelper
    }

    genetic.inherits(Search, Base, {

        /**
         * @param {Controller} controller
         * @return {boolean}
         */
        evaluate: function (controller) {
            this._result = controller
                    .getAdapter('AutoexposeHelper');
            if (this._result && this._result.detect(this._where))
                return true;
            this._result = null;
            return false;
        }
    });

    AutoexposeHelper.Search = Search;

    return AutoexposeHelper;
});
