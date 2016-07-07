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
 * @file
 * A Locator used to place {@link MoveHandle}.
 * By default, a MoveHandle's bounds are equal to its owner's bounds,
 * expanded by the handle's border's width.
 * @since 1.0.0
 * @author hw.shim@samsung.com
 */

define([
    'external/genetic/genetic',
    'graphite/view/geometry/Rectangle',
    'graphite/view/locator/Locator'
], function (
    genetic,
    Rectangle,
    Locator
) {
    'use strict';

    /**
     * Creates a new MoveHandleLocator and sets its reference Widget.
     * The reference should be the handle's owner Widget.
     * @param {Widget} reference
     * @constructor
     */
    function MoveHandleLocator(reference) {
        Locator.apply(this, arguments);
        this.reference(reference);
    }

    genetic.inherits(MoveHandleLocator, Locator, {

        /**
         * Sets the handle's bounds to that of its owner's bounds,
         * expanded by the handle's border's width.
         * @param {Handle} handle
         */
        relocate: function (handle) {
            var borderSpaces = handle.borderWidth();
            var owner = this.reference();
            var bounds;
            
            if (typeof owner.handleBounds === 'function') {
                bounds = owner.handleBounds();
            } else {
                bounds = owner.bounds();
            }
            bounds = bounds.getResized(-1, -1);
            owner.translateToAbsolute(bounds);
            handle.translateToRelative(bounds);
            bounds.translate(-borderSpaces.left, -borderSpaces.top);
            bounds.resize(borderSpaces.width() + 1, borderSpaces.height() + 1);
            handle.bounds(bounds);
        }
    });

    return MoveHandleLocator;
});
