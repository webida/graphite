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
 * @file RelativeLocator
 * Places a handle relative to a widget's bounds.
 * The placement is determined by indicating the widget to which
 * the placement is relative, and two floating-point value indicating
 * the horizontal and vertical offset from that widget's top-left corner.
 * The values (0.0, 0.0) would indicate the widget's top-left corner,
 * while the values (1.0, 1.0) would indicate the widget's
 * bottom-right corner.
 * Constants such as {@link Position#NORTH NORTH} and
 * {@link Position#SOUTH SOUTH} can be used to set the placement.
 * @since 1.0.0
 * @author hw.shim@samsung.com
 */

define([
    'external/genetic/genetic',
    'graphite/view/geometry/Position',
    'graphite/view/geometry/Rectangle',
    './Locator'
], function (
    genetic,
    Position,
    Rectangle,
    Locator
) {
    'use strict';

    /**
     * The reference must be set before use.
     * The relative locations will default to (0.0, 0.0).
     * @param {Controller} reference
     * @param {number} direction
     *  - relative direction from the center of the reference.
     * @constructor
     */
    function RelativeLocator(reference, direction) {
        Locator.apply(this, arguments);
        this._relativeX = 0.0;
        this._relativeY = 0.0;
        this.reference(reference);
        this._relativeLocation(direction);
    }

    genetic.inherits(RelativeLocator, Locator, {

        /**
         * Returns the Reference Box in the Reference Widget's
         * coordinate system. The returned Rectangle may be by
         * reference, and should not be modified.
         * @param {number} direction
         */
        _relativeLocation: function (direction) {
            switch (direction & Position.NORTH_SOUTH) {
            case Position.NORTH:
                this._relativeY = 0;
                break;
            case Position.SOUTH:
                this._relativeY = 1.0;
                break;
            default:
                this._relativeY = 0.5;
            }
    
            switch (direction & Position.EAST_WEST) {
            case Position.WEST:
                this._relativeX = 0;
                break;
            case Position.EAST:
                this._relativeX = 1.0;
                break;
            default:
                this._relativeX = 0.5;
            }
        },

        /**
         * Returns the Reference Box in the Reference Widget's
         * coordinate system. The returned Rectangle may be by
         * reference, and should not be modified.
         * @return {Rectangle}
         */
        referenceBox: function () {
            return this.reference().bounds();
        },

        /**
         * Relocates the handle using the relative offset locations.
         * @see Locator#relocate(Widget)
         */
        relocate: function (handle) {
            var reference = this.reference();
            var ownerBounds = this.referenceBox().copy();
            var handleSize = handle.defaultSize();
            reference.translateToAbsolute(ownerBounds);
            handle.translateToRelative(ownerBounds);
            ownerBounds.resize(1, 1);
            ownerBounds.x += parseInt(
                ownerBounds.w * this._relativeX - ((handleSize.w + 1) / 2));
            ownerBounds.y += parseInt(
                ownerBounds.h * this._relativeY - ((handleSize.h + 1) / 2));
            ownerBounds.size(handleSize);
            handle.bounds(ownerBounds);
        }
    });

    return RelativeLocator;
});
