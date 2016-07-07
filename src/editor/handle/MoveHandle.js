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
 * @file MoveHandle
 * @since 1.0.0
 * @author hw.shim@samsung.com
 */

define([
    'external/genetic/genetic',
    'graphite/view/geometry/Rectangle',
    './Handle',
    './MoveHandleLocator'
], function (
    genetic,
    Rectangle,
    Handle,
    MoveHandleLocator
) {
    'use strict';

    /**
     * Creates a MoveHandle.
     * @param {Controller} owner
     * @param {Locator} locator
     * @param {string} cursor
     * @constructor
     */
    function MoveHandle(owner, locator, cursor) {
        if (!locator) locator = new MoveHandleLocator(owner.view());
        Handle.call(this, owner, locator, cursor);
        this._init();
    }

    genetic.inherits(MoveHandle, Handle, {

        /**
         * Initializes the handle.
         */
        _init: function () {
            this.setFillable(false);
            this.border(1, 'black');
            this.cursor('move');
        },

        /**
         * Creates a new DragTracker to be returned by dragTracker().
         * @return {DragTracker}
         * @see Handle#_createDragTracker()
         * @protected
         * @implemented
         */
        _createDragTracker: function () {
            var tracker = new MoveTracker(this.owner());
            tracker.defaultCursor(this.cursor());
            return tracker;
        },

        /**
         * Returns a point along the right edge of the handle.
         * @return {Point}
         * @override
         */
        accessibleLocation: function () {
            var p = this.bounds().topRight().translate(
                -1, this.bounds().h / 4);
            this.translateToAbsolute(p);
            return p;
        }
    });

    return MoveHandle;
});
