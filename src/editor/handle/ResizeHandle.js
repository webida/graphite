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
 * ResizeHandle is used to resize Widget.
 * @since 1.0.0
 * @author hw.shim@samsung.com
 */

define([
    'external/genetic/genetic',
    'graphite/view/geometry/Position',
    'graphite/view/resource/Cursor',
    './RelativeHandleLocator',
    './SquareHandle'
], function (
    genetic,
    Position,
    Cursor,
    RelativeHandleLocator,
    SquareHandle
) {
    'use strict';

    /**
     * Creates a new ResizeHandle for the given Controller.
     * direction is the relative direction from the center of the
     * owner. For example, SOUTH_EAST would place the handle
     * in the lower-right corner of its owner Widget.
     * @see {@link Position}
     * @param {Controller} owner
     * @param {number} direction
     *  - relative direction from the center of the owner.
     * @constructor
     */
    function ResizeHandle(owner, direction) {
        var locator = new RelativeHandleLocator(owner.view(), direction);
        SquareHandle.call(this, owner, locator, Cursor[direction]);
        this.direction = direction;
    }

    genetic.inherits(ResizeHandle, SquareHandle, {

        /**
         * Creates a new ResizeTracker to be returned by dragTracker().
         * @return {DragTracker}
         * @see Handle#_createDragTracker()
         * @protected
         * @implemented
         */
        _createDragTracker: function () {
            return new ResizeTracker(this.owner(), this.direction);
        },
    });

    return ResizeHandle;
});
