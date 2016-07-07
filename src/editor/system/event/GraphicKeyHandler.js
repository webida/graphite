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
    'graphite/editor/controller/ConnectableController',
    'graphite/view/system/event/InternalKeyEvent',
    './KeyHandler'
], function (
    genetic,
    ConnectableController,
    InternalKeyEvent,
    KeyHandler
) {
    'use strict';

    /**
     * An extended KeyHandler which processes default keystrokes for common
     * navigation in a GraphicViewer. This can be used as a KeyHandler too.
     * Unrecognized keystrokes are sent to the super's implementation.
     * This class will process key events containing the following:
     * 
     * 1) Arrow Keys (UP, DOWN, LEFT, RIGHT) with optional SHIFT and CTRL
     * modifiers to navigate between siblings.
     * 
     * 2) Arrow Keys (UP, DOWN) same as above, but with ALT modifier
     * to navigate into or out of a container.
     * 
     * 3) '\'Backslash and '/' Slash keys with optional SHIFT and CTRL
     * modifiers to traverse connections.
     * 
     * All processed key events will do nothing other than change the selection
     * and/or focus Controller for the viewer.
     * @constructor
     */
    function GraphicKeyHandler(viewer) {
        KeyHandler.apply(this, arguments);
        this._viewer_ = viewer;
    }

    genetic.inherits(GraphicKeyHandler, KeyHandler, {

        /**
         * Returns the viewer on which this key handler was created.
         * @return {GraphicViewer}
         */
        _viewer: function () {
            return this._viewer_;
        },

        /**
         * @return the Controller that has focus
         * @protected
         */
        _focused: function () {
            return this._viewer().focused();
        },

        /**
         * Extended to process key events described above.
         * whenever a key is pressed, and the Tool is in the proper state.
         * Returns true if KeyboardEvent was handled in some way.
         * @param {KeyboardEvent} e
         * @return {boolean}
         * @override
         * @see KeyHandler#onKeyDown(KeyboardEvent)
         */
        onKeyDown: function (e) {
            var key = InternalKeyEvent.getKey(e);
            if (key === ' ') {
                this._processSelect(e);
                return true;
            } else if (this.acceptIntoContainer(e)) {
                this.navigateIntoContainer(e);
                return true;
            } else if (this.acceptOutOf(e)) {
                this.navigateOut(e);
                return true;
            } else if (this.acceptConnection(e)) {
                this.navigateConnections(e);
                return true;
            } else if (this.acceptScroll(e)) {
                this.scrollViewer(e);
                return true;
            } else if (this.acceptLeaveConnection(e)) {
                this.navigateOutOfConnection(e);
                return true;
            } else if (this.acceptLeaveContents(e)) {
                this.navigateIntoContainer(e);
                return true;
            }

            switch (key) {
            case 'ArrowLeft':
                if (this.navigateNextSibling(e, 'WEST')) return true;
                break;
            case 'ArrowRight':
                if (this.navigateNextSibling(e, 'EAST')) return true;
                break;
            case 'ArrowUp':
                if (this.navigateNextSibling(e, 'NORTH')) return true;
                break;
            case 'ArrowDown':
                if (this.navigateNextSibling(e, 'SOUTH')) return true;
                break;
            case 'Home':
                if (this.navigateJumpSibling(e, 'WEST')) return true;
                break;
            case 'End':
                if (this.navigateJumpSibling(e, 'EAST')) return true;
                break;
            case 'PageDown':
                if (this.navigateJumpSibling(e, 'SOUTH')) return true;
                break;
            case 'PageUp':
                if (this.navigateJumpSibling(e, 'NORTH')) return true;
            }
            return KeyHandler.prototype.onKeyDown.call(this, e);
        },

        /**
         * Returns true if key pressed indicates a connection
         *         traversal/selection
         * @param {KeyboardEvent} e
         * @return {boolean}
         */
        acceptConnection: function (e) {
            var key = InternalKeyEvent.getKey(e);
            return key === '/' || key === '?'
                    || key === '\\' || key === '|';
        },

        /**
         * Returns true if the keys pressed indicate to traverse inside
         *         a container
         * @param {KeyboardEvent} e
         * @return {boolean}
         */
        acceptIntoContainer: function (e) {
            return (InternalKeyEvent.hasModKey(e, 'ALT'))
                    && (InternalKeyEvent.getKey(e) === 'ArrowDown');
        },

        /**
         * Returns true if the keys pressed indicate to stop
         *         traversing/selecting connection
         * @param {KeyboardEvent} e
         * @return {boolean}
         */
        acceptLeaveConnection: function (e) {
            var key = InternalKeyEvent.getKey(e);
            if (this._focused() instanceof ConnectableController)
                if ((key === 'ArrowUp') || (key === 'ArrowRight')
                        || (key === 'ArrowDown') || (key === 'ArrowLeft'))
                    return true;
            return false;
        },

        /**
         * @param {KeyboardEvent} e
         * Returns true if the viewer's contents has focus and one of
         *         the arrow keys is pressed
         * @param {KeyboardEvent} e
         * @return {boolean}
         */
        acceptLeaveContents: function (e) {
            var key = InternalKeyEvent.getKey(e);
            return this._focused() === this._viewer().contents()
                    && ((key === 'ArrowUp') || (key === 'ArrowRight')
                            || (key === 'ArrowDown') || (key === 'ArrowLeft'));
        },

        /**
         * Returns true if the keys pressed indicate to traverse to the
         *         parent of the currently focused Controller
         * @param {KeyboardEvent} e
         * @return {boolean}
         */
        acceptOutOf: function (e) {
            return (InternalKeyEvent.hasModKey(e, 'ALT'))
                    && (InternalKeyEvent.getKey(e) === 'ArrowUp');
        },

        /**
         * Returns true if the keys pressed indicate to traverse to the
         *         parent of the currently focused Controller
         * @param {KeyboardEvent} e
         * @return {boolean}
         */
        acceptScroll: function (e) {
            var key = InternalKeyEvent.getKey(e);
            var mask = InternalKeyEvent.getMask(e);
            return (mask === (InternalKeyEvent.CTRL | InternalKeyEvent.SHIFT)
                    && (key == 'ArrowDown'
                    || key == 'ArrowLeft'
                    || key == 'ArrowRight'
                    || key == 'ArrowUp'));
        },

        /**
         * Traverses to the next sibling in the given direction.
         * 
         * @param {KeyboardEvent} e
         *            the KeyboardEvent for the keys that were pressed to trigger this
         *            traversal
         * @param {number} direction
         *            PositionConstants.* indicating the direction in which to
         *            traverse
         * @return {boolean}
         */
        navigateNextSibling: function (e, direction) {
            console.log('navigateNextSibling', e, direction);
        }
    });

    return GraphicKeyHandler;
});
