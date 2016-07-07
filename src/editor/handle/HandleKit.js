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
 * @file HandleKit
 * @since 1.0.0
 * @author hw.shim@samsung.com
 */

define([
    'external/genetic/genetic',
    'graphite/base/Base',
    './MoveHandle',
    './ResizeHandle'
], function (
    genetic,
    Base,
    MoveHandle,
    ResizeHandle
) {
    'use strict';

    /**
     * A HandleKit.
     * @constructor
     */
    function HandleKit() {
        Base.apply(this, arguments);
    }

    genetic.inherits(HandleKit, Base, {

        /**
         * Returns a new {@link MoveHandle}
         * @param {Controller} owner
         * @param {DragTracker} tracker
         * @param {string} cursor
         * @return {MoveHandle}
         */
        createMoveHandle: function (owner, tracker, cursor) {
            var handle = new MoveHandle(owner);
            if (tracker) handle.dragTracker(tracker);
            if (cursor) handle.cursor(cursor);
            return handle;
        },

        /**
         * Returns a new {@link ResizeHandle}
         * @param {Controller} owner
         * @param {number} direction - Position constants
         * @param {DragTracker} tracker
         * @param {string} cursor
         * @return {ResizeHandle}
         */
        createHandle: function (owner, direction, tracker, cursor) {
            var handle = new ResizeHandle(owner, direction);
            if (tracker) handle.dragTracker(tracker);
            if (cursor) handle.cursor(cursor);
            return handle;
        }
    });

    return new HandleKit();
});
