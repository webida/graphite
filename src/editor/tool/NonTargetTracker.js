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
 * @file A NonTargetTracker does not use any target Controller.
 * @since 1.0.0
 * @author hw.shim@samsung.com
 */

define([
    'external/genetic/genetic',
    'graphite/view/system/event/InternalKeyEvent',
    'graphite/view/system/event/InternalMouseEvent',
    '../request/Request',
    './Tool'
], function (
    genetic,
    InternalKeyEvent,
    InternalMouseEvent,
    Request,
    Tool
) {
    'use strict';

    var FLAG_SOURCE_FEEDBACK = Tool.MAX_FLAG << 1;

    /**
     * A NonTargetTracker.
     * @constructor
     */
    function NonTargetTracker() {
        Tool.apply(this, arguments);
        this._sourceRequest = null;
    }

    genetic.inherits(NonTargetTracker, Tool, {

        /**
         * @see Tool#commitDrag()
         */
        commitDrag: function () {
            this._eraseSourceFeedback();
            this._dragEnd();
            this._state(Tool.STATE_TERMINAL);
        },

        /**
         * Called once the drag has been interpreted.
         * This is where the real work of the drag is carried out.
         * By default, the current command is executed.
         * @protected
         */
        _dragEnd: function () {
            this._executeCurrentCommand();
        },

        /**
         * @see Tool#deactivate()
         */
        deactivate: function () {
            this._eraseSourceFeedback();
            this._sourceRequest = null;
            Tool.prototype.deactivate.call(this);
        },

        /**
         * Show the source drag feedback for the drag occurring within the viewer.
         * @protected
         */
        _eraseSourceFeedback: function () {
            if (!this._isShowingFeedback())
                return;
            this.setFlag(FLAG_SOURCE_FEEDBACK, false);
            this._operationSet().forEach(function (controller) {
                controller.eraseSourceFeedback(this._getSourceRequest());
            }, this);
        },

        /**
         * Returns <code>true</code> if feedback is being shown.
         * @return {boolean}
         * @protected
         */
        _isShowingFeedback: function () {
            return this.getFlag(FLAG_SOURCE_FEEDBACK);
        },

        /**
         * Returns the appropriate cursor for the tools current state.
         * If the tool is in its terminal state, null is returned.
         * Otherwise, either the default or disabled cursor is returned,
         * based on the existence of a current command,
         * and whether that current command is executable.
         * 
         * @see #defaultCursor()
         * @see #disabledCursor()
         * @see #_currentCommand()
         * @return {string}
         * @protected
         * @override
         */
        _calculateCursor: function () {
            if (this._isInState(
                    Tool.STATE_INITIAL | 
                    Tool.STATE_DRAG | 
                    Tool.STATE_ACCESSIBLE_DRAG))
                return this.defaultCursor();
            return Tool.prototype._calculateCursor.call(this);
        },

        /**
         * @inheritdoc
         * @see Tool#_onDragInProgress()
         * @return {boolean}
         * @protected
         */
        _onDragInProgress: function () {
            if (this.isInDragInProgress()) {
                this._updateSourceRequest();
                this._showSourceFeedback();
                this._currentCommand(this.getCommand());
            }
            return true;
        },

        /**
         * Updates the source request.
         * @protected
         */
        _updateSourceRequest: function () {
            this._getSourceRequest().type(this._getCommandName());
        },

        /**
         * Returns the request for the source of the drag,
         * creating it if necessary.
         * @return {Request} the source request
         * @protected
         * @TODO rename
         */
        _getSourceRequest: function () {
            if (!this._sourceRequest)
                this._sourceRequest = this._createSourceRequest();
            return this._sourceRequest;
        },

        /**
         * Creates and returns a new Request
         * that is used during the drag.
         * @return {Request} a new source request
         * @protected
         */
        _createSourceRequest: function () {
            return new Request();
        },

        /**
         * Show the source drag feedback for the drag
         * occurring within the viewer.
         * @protected
         */
        _showSourceFeedback: function () {
            this._operationSet().forEach(function (controller) {
                controller.showSourceFeedback(this._getSourceRequest());
            }, this);
            this.setFlag(FLAG_SOURCE_FEEDBACK, true);
        },

        /**
         * Looks for button 1, and goes into the drag state.
         * Any other button is invalid input.
         * @see Tool#_onMouseDown(button)
         */
        _onMouseDown: function (button) {
            if (button !== InternalMouseEvent.BUTTON.LEFT) {
                this._state(Tool.STATE_INVALID);
                this._onInvalidInput();
            } else
                this._stateTransition(Tool.STATE_INITIAL, Tool.STATE_DRAG);
            return true;
        },

        /**
         * Called when the mouse and/or keyboard input is invalid.
         * @return {boolean}
         */
        _onInvalidInput: function () {
            this._eraseSourceFeedback();
            this._currentCommand(UnexecutableCommand.SINGLETON);
            return true;
        },

        /**
         * If dragging is in progress,
         * cleans up feedback and calls _drag().
         * @see Tool#_onMouseUp(int)
         */
        _onMouseUp: function (button) {
            if (this._stateTransition(
                    Tool.STATE_DRAG_IN_PROGRESS, Tool.STATE_TERMINAL)) {
                this._eraseSourceFeedback();
                this._dragEnd();
            }
            return true;
        },

        /**
         * Transitions Drag to Drag in progress state.
         * @see Tool#_onDragStarted()
         */
        _onDragStarted: function () {
            return this._stateTransition(
                    Tool.STATE_DRAG, Tool.STATE_DRAG_IN_PROGRESS);
        },

        /**
         * Looks for keys which are used during accessible drags.
         * @see Tool#_onKeyDown(KeyboardEvent)
         */
        _onKeyDown: function (e) {
            if (this._acceptArrowKey(e)) {
                this._accStepIncrement();
                if (this._stateTransition(Tool.STATE_INITIAL,
                        Tool.STATE_ACCESSIBLE_DRAG_IN_PROGRESS))
                    this._startLocation(this.location());
                var location = this.location();
                switch (InternalKeyEvent.getKey(e)) {
                case 'ArrowDown':
                    this._placeMouse(location.getTranslated(0, this._accGetStep()));
                    break;
                case 'ArrowUp':
                    this._placeMouse(location
                            .getTranslated(0, -this._accGetStep()));
                    break;
                case 'ArrowRight':
                    var stepping = this._accGetStep();
                    this._placeMouse(location.getTranslated(stepping, 0));
                    break;
                case 'ArrowLeft':
                    var step = -this._accGetStep();
                    this._placeMouse(location.getTranslated(step, 0));
                    break;
                }
                return true;
            }
            return false;
        },

        /**
         * @see Tool#_onKeyUp(KeyboardEvent)
         */
        _onKeyUp: function (e) {
            if (this._acceptArrowKey(e)) {
                this._accStepReset();
                return true;
            }
            return false;
        }
    });

    /**
     * The maximum bit-mask used as a flag constant.
     * Subclasses should start using the next highest bitmask.
     */
    NonTargetTracker.MAX_FLAG = FLAG_SOURCE_FEEDBACK;

    return NonTargetTracker;
});
