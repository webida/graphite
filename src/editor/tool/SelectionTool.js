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
    'graphite/view/system/event/InternalKeyEvent',
    '../request/LocationRequest',
    '../request/SelectionRequest',
    './TargetingTool',
    './Tool'
], function (
    genetic,
    InternalKeyEvent,
    LocationRequest,
    SelectionRequest,
    TargetingTool,
    Tool
) {
    'use strict';

    var FLAG_HOVER_FEEDBACK = TargetingTool.MAX_FLAG << 1;

    var privates = {
        onTraverseHandle: function (e) {
            var viewer = this.viewer();
            var focus = viewer.focused();
            if (focus.selectedState() === 'SELECTED_NONE')
                return false;
            viewer.reveal(focus);
            var provider = focus.getAdapter('AccessibleHandleProvider');
            if (!provider
                    || provider.getAccessibleHandleLocations().isEmpty())
                return false;

            /*
             * At this point, a handle provider with 1 or more handles has been
             * obtained
             */
            this._state(Tool.STATE_TRAVERSE_HANDLE);
            var locations = provider.getAccessibleHandleLocations();

            // Goto next index, wrapping if necessary
            var key = InternalKeyEvent.getKey(e);
            if (key === '.')
                this._handleIndex = (++this._handleIndex) % locations.size();
            else
                this._handleIndex = (--this._handleIndex + locations.size())
                        % locations.length;
            if (this._lastHandleProvider() !== focus) {
                this._handleIndex = 0;
                this._lastHandleProvider(focus);
            }

            this._placeMouse(locations.get(this._handleIndex));
            return true;
        },
    };

    /**
     * A SelectionTool.
     * Tool to select and manipulate widgets. A selection tool is in one of three
     * states, e.g., background selection, widget selection, handle manipulation.
     * The different states are handled by different child tools.
     * @constructor
     */
    function SelectionTool() {
        TargetingTool.apply(this, arguments);
        this._dragTracker_ = null;
        this._hoverRequest = null;
        this._handleProvider = null;
        this._handleIndex = 0;
    }

    genetic.inherits(SelectionTool, TargetingTool, {

        /**
         * Deactivates the tool. This method is called whenever
         * the user switches to another tool. Use this method to do
         * some clean-up when the tool is switched.
         * Sets the drag tracker to null.
         */
        deactivate: function () {
            this._dragTracker(null);
            TargetingTool.prototype.deactivate.call(this);
        },

        /**
         * Returns the identifier of the command that is being sought.
         * @return {string}
         * @protected
         */
        _getCommandName: function () {
            return 'REQ_SELECTION';
        },

        /**
         * @inheritdoc
         */
        _onStackChange: function () {
            if (!this._dragTracker()) {
                return TargetingTool.prototype._onStackChange.call(this);
            }
            return false;
        },

        /**
         * Sets the modifiers, type and location of the target request
         * (which is a {@link SelectionRequest}) and then
         * calls {@link #_updateHoverRequest()}.
         * @see TargetingTool#_updateTargetRequest()
         * @protected
         * @override
         */
        _updateTargetRequest: function () {
            var request = this._targetRequest();
            request.modifiers(this.input.modifiers);
            request.type(this._getCommandName());
            request.location(this.location());
            this._updateHoverRequest();
        },

        /**
         * Creates a {@link SelectionRequest} for the target request.
         * @return {Request} the new target request
         * @see TargetingTool#_createTargetRequest()
         * @protected
         * @override
         */
        _createTargetRequest: function () {
            return new SelectionRequest(this._getCommandName());
        },

        /**
         * Updates the location of the hover request.
         * @protected
         */
        _updateHoverRequest: function () {
            var request = this._getTargetHoverRequest();
            request.location(this.location());
        },

        /**
         * Returns the target hover request. If null, it will be
         * created via {@link #createHoverRequest()}.
         * @return {Request} the hover request
         * @protected
         */
        _getTargetHoverRequest: function () {
            if (!this._hoverRequest)
                this._createHoverRequest();
            return this._hoverRequest;
        },

        /**
         * Creates the hover request (a {@link LocationRequest})
         * and sets its type to 'REQ_SELECTION_HOVER'.
         * @protected
         */
        _createHoverRequest: function () {
            this._hoverRequest = new LocationRequest();
            this._hoverRequest.type('REQ_SELECTION_HOVER');
        },

        /**
         * Returns a new condition that evaluates to true
         * if the queried controller's {@link Controller#isSelectable()}
         * returns true.
         * @return {Object}
         * @protected
         * @override
         */
        _getTargetingConditional: function() {
            var req = this._targetRequest();
            return {
                evaluate: function (controller) {
                    var target = controller.getTarget(req);
                    return target && target.isSelectable();
                }
            };
        },

        /**
         * Sets the drag tracker to null and goes into
         * the initial state when blur.
         * @return {boolean}
         * @protected
         */
        _onBlur: function (e) {
            if (this._isInState(
                    Tool.STATE_ACCESSIBLE_DRAG |
                    Tool.STATE_ACCESSIBLE_DRAG_IN_PROGRESS |
                    Tool.STATE_DRAG |
                    Tool.STATE_DRAG_IN_PROGRESS)) {
                if (this._dragTracker())
                    this._dragTracker(null);
                this._state(Tool.STATE_INITIAL);
                return true;
            }
            return false;
        },

        /**
         * Forwards the key down event to the drag tracker, if one exists.
         * @param {KeyboardEvent} e
         * @param {GraphicViewer} viewer
         * @override
         */
        keyDown: function (e, viewer) {
            var dragTracker = this._dragTracker();
            if (dragTracker)
                dragTracker.keyDown(e, viewer);
            TargetingTool.prototype.keyDown.call(this, e, viewer);
        },

        /**
         * Processes key down events. Specifically, arrow keys for moving widgets,
         * the ESC key for aborting a drag, the period '.' key for traversing
         * handles, and the ENTER key for committing a drag. If none of these keys
         * were pressed and the current viewer has a {@link KeyHandler}, it calls
         * @param {KeyboardEvent} e
         * @return {boolean}
         * @protected
         * @override
         */
        _onKeyDown: function (e) {
            this._resetHover();

            if (this._acceptArrowKey(e))
                if (this._stateTransition(
                        Tool.STATE_ACCESSIBLE_DRAG,
                        Tool.STATE_ACCESSIBLE_DRAG_IN_PROGRESS))
                    return true;
    
            if (this._acceptAbort(e)) {
                if (this._dragTracker())
                    this._dragTracker(null);
                if (this._isInState(
                        Tool.STATE_TRAVERSE_HANDLE |
                        Tool.STATE_ACCESSIBLE_DRAG |
                        Tool.STATE_ACCESSIBLE_DRAG_IN_PROGRESS))
                    this._placeMouse(this.location().translated(6, 6));
                this._state(Tool.STATE_INITIAL);
                this._lastHandleProvider(null);
                return true;
            }

            if (this._acceptTraverseHandle(e)) {
                if (this._isInState(Tool.STATE_ACCESSIBLE_DRAG_IN_PROGRESS))
                    if (this._dragTracker())
                        this._dragTracker().commitDrag();
                if (this._isInState(
                        Tool.STATE_ACCESSIBLE_DRAG |
                        Tool.STATE_ACCESSIBLE_DRAG_IN_PROGRESS)) {
                    this._dragTracker(null);
                    this.viewer().flush();
                }
                if (!privates.onTraverseHandle.call(this, e))
                    this._state(Tool.STATE_INITIAL);
                return true;
            }

            if (this._acceptDragCommit(e)) {
                if (this._dragTracker())
                    this._dragTracker().commitDrag();
                this._dragTracker(null);
                this._state(Tool.STATE_INITIAL);
                this._handleIndex--;
                this._placeMouse(this.location().translated(6, 6));
                return true;
            }

            if (this._isInState(Tool.STATE_INITIAL)) {
                if (this.viewer().getKeyHandler())
                    return this.viewer().getKeyHandler().onKeyDown(e);
            }

            return false;
        },

        _lastHandleProvider: function (ctrl) {
            if (arguments.length) {
                this._handleProvider = ctrl;
            } else {
                return this._handleProvider;
            }
        },

        /**
         * @param {KeyboardEvent} e
         * @return {boolean}
         * @protected
         */
        _acceptTraverseHandle: function (e) {
            var key = InternalKeyEvent.getKey(e);
            return (key === '.' || key === '>')
                    && this._isInState(
                            Tool.STATE_INITIAL |
                            Tool.STATE_ACCESSIBLE_DRAG |
                            Tool.STATE_ACCESSIBLE_DRAG_IN_PROGRESS)
                    && (!InternalKeyEvent.hasModKey(e,
                            InternalKeyEvent.ALT | InternalKeyEvent.CTRL));
        },

        /**
         * Forwards the key up event to the drag tracker, if one exists.
         * @param {KeyboardEvent} e
         * @param {GraphicViewer} viewer
         * @override
         */
        keyUp: function (e, viewer) {
            var dragTracker = this._dragTracker();
            if (dragTracker)
                dragTracker.keyUp(e, viewer);
            TargetingTool.prototype.keyUp.call(this, e, viewer);
        },

        /**

         * 
         * @see AbstractTool#handleKeyUp(KeyEvent)
         */
        /**
         * If in the initial state and the viewer has a KeyHandler,
         * calls keyReleased sending it the given key event.
         * @param {KeyboardEvent} e
         * @return {boolean}
         * @protected
         */
        _onKeyUp: function (e) {
            var viewer = this.viewer();
            var keyHandler = viewer.getKeyHandler();
            if (this._isInState(Tool.STATE_INITIAL)
                    && keyHandler
                    && keyHandler.onKeyUp(e))
                return true;
            return false;
        },

        /**
         * Delegates the scrolling to the DragTracker (if there is one).
         * If not, invokes the super method.
         * @param {MouseEvent} e
         * @param {GraphicViewer} viewer
         * @override
         */
        wheel: function (e, viewer) {
            var dragTracker = this._dragTracker();
            if (dragTracker) {
                dragTracker.wheel(e, viewer);
                e.doit = false;
            } else
                TargetingTool.prototype.wheel.call(this, e, viewer);
        },

        /**
         * Forwards the mouse double clicked event to the drag tracker,
         * if one exists.
         * @param {MouseEvent} e
         * @param {GraphicViewer} viewer
         * @override
         */
        dblClick: function (e, viewer) {
            var dragTracker = this._dragTracker();
            TargetingTool.prototype.dblClick.call(this, e, viewer);
            if (dragTracker)
                dragTracker.dblClick(e, viewer);
        },

        /**
         * Forwards the mouse down event to the drag tracker, if one exists.
         * @param {MouseEvent} e
         * @param {GraphicViewer} viewer
         * @override
         */
        mouseDown: function (e, viewer) {
            TargetingTool.prototype.mouseDown.call(this, e, viewer);
            var dragTracker = this._dragTracker();
            if (dragTracker)
                dragTracker.mouseDown(e, viewer);
        },

        /**
         * If there is a {@link Handle} under the mouse,
         * this method sets the drag tracker returned from the handle.
         * If there's an {@link Controller} under the mouse,
         * this method sets the drag tracker returned from the Controller.
         * @param {number} button
         * @return {boolean}
         * @protected
         * @override
         */
        _onMouseDown: function (button) {
            if (!this._stateTransition(Tool.STATE_INITIAL, Tool.STATE_DRAG)) {
                this._resetHover();
                return true;
            }
            this._resetHover();
            var viewer = this.viewer();
            var p = this.location();
            var dragTracker = this._dragTracker();
            if (dragTracker) dragTracker.deactivate();
            var handle = viewer.findHandleAt(p);
            if (handle) {
                this._dragTracker(handle.dragTracker());
                return true;
            }
            this._updateTargetRequest();
            var targetRequest = this._targetRequest();
            targetRequest.lastButton(button);
            this._updateTargetUnderMouse();
            var target = this._target();
            if (target) {
                this._dragTracker(target.getDragTracker(targetRequest));
                this._lockTarget(target);
                return true;
            }
            return false;
        },

        /**
         * Forwards the mouse up event to the drag tracker, if one exists.
         * @param {MouseEvent} e
         * @param {GraphicViewer} viewer
         * @override
         */
        mouseUp: function (e, viewer) {
            var dragTracker = this._dragTracker();
            if (dragTracker)
                dragTracker.mouseUp(e, viewer);
            TargetingTool.prototype.mouseUp.call(this, e, viewer);
        },

        /**
         * Resets this tool when the last button is released.
         * @param {number} button
         * @return {boolean}
         * @protected
         * @override
         * @see Tool#_onMouseUp(number)
         */
        _onMouseUp: function (button) {
            if (this.input.isAnyMouseButton())
                return false;
            this._targetRequest().lastButton(0);
            this._dragTracker(null);
            this._state(Tool.STATE_INITIAL);
            this._unlockTarget();
            return true;
        },

        /**
         * Forwards the mouse drag event to the drag tracker, if one exists.
         * @param {MouseEvent} e
         * @param {GraphicViewer} viewer
         * @override
         */
        mouseDrag: function (e, viewer) {
            var dragTracker = this._dragTracker();
            if (dragTracker)
                dragTracker.mouseDrag(e, viewer);
            TargetingTool.prototype.mouseDrag.call(this, e, viewer);
        },

        /**
         * Forwards the mouse move event to the drag tracker, if one exists.
         * @param {MouseEvent} e
         * @param {GraphicViewer} viewer
         * @override
         */
        mouseMove: function (e, viewer) {
            var dragTracker = this._dragTracker();
            if (dragTracker)
                dragTracker.mouseMove(e, viewer);
            TargetingTool.prototype.mouseMove.call(this, e, viewer);
        },

        /**
         * If in the initial state, updates the request and the mouse target
         * and asks to show target feedback. If in the traverse handle state,
         * finds the next handle, moves the mouse cursor to that handle,
         * and gets a drag tracker from the handle.
         * @return {boolean}
         * @protected
         */
        _onMouseMove: function () {
            if (this._stateTransition(
                    Tool.STATE_ACCESSIBLE_DRAG, Tool.STATE_INITIAL))
                this._dragTracker(null);
            if (this._isInState(Tool.STATE_INITIAL)) {
                this._updateTargetRequest();
                this._updateTargetUnderMouse();
                this._showTargetFeedback();
                return true;
            } else if (this._isInState(SelectionTool.STATE_TRAVERSE_HANDLE)) {
                var viewer = this.viewer();
                if (viewer instanceof GraphicViewer) {
                    var handle = viewer.findHandleAt(getLocation());
                    if (handle) {
                        this._state(Tool.STATE_ACCESSIBLE_DRAG);
                        this._startLocation(this.location());
                        this._dragTracker(handle.getDragTracker());
                        return true;
                    } else {
                        this._state(Tool.STATE_INITIAL);
                    }
                }
            }
            return false;
        },

        /**
         * Forwards the mouse hover event to the drag tracker, if one exists.
         * @param {MouseEvent} e
         * @param {GraphicViewer} viewer
         * @override
         */
        mouseHover: function (e, viewer) {
            var dragTracker = this._dragTracker();
            if (dragTracker)
                dragTracker.mouseHover(e, viewer);
            TargetingTool.prototype.mouseHover.call(this, e, viewer);
        },

        /**
         * Called when the mouse hovers. Calls {@link #showHoverFeedback()}.
         * @return {boolean}
         * @protected
         */
        _onMouseHover: function () {
            this._setHoverActive(true);
            this._showHoverFeedback();
            return true;
        },

        /**
         * Asks the target (if there is one) to show hover feedback
         * via {@link Controller#showTargetFeedback(Request)}
         * with a hover request.
         * @protected
         */
        _showHoverFeedback: function () {
            if (!this._target())
                return;
            if (!this._getTargetHoverRequest())
                return;
            this._target().showTargetFeedback(this._getTargetHoverRequest());
        },

        /**
         * Erases the hover feedback by calling
         * {@link Controller#eraseTargetFeedback(Request)}.
         * @protected
         */
        _eraseHoverFeedback: function () {
            if (!this._target())
                return;
            if (!this._getTargetHoverRequest())
                return;
            this._target().eraseTargetFeedback(this._getTargetHoverRequest());
        },

        /**
         * Called when the mouse hover stops
         * (i.e. the mouse moves or a button is clicked).
         * Calls {@link #eraseHoverFeedback()}.
         * @see TargetingTool#_onHoverStop()
         */
        _onHoverStop: function () {
            this._eraseHoverFeedback();
            return true;
        },

        /**
         * Sets the drag tracker for this SelectionTool.
         * If the current drag tracker is not null, this method deactivates it.
         * If the new drag tracker is not null, this method will activate it
         * and set the Domain and Viewer.
         * @param {DragTracker} newTracker
         * @protected
         *//**
         * Returns the current drag tracker.
         * @return {DragTracker}
         * @protected
         */
        _dragTracker: function (newTracker) {
            var old = this._dragTracker_;
            if (arguments.length) {
                if (newTracker === old) return;
                if (old) old.deactivate();
                this._dragTracker_ = newTracker;
                if (newTracker) {
                    newTracker.domain(this.domain());
                    newTracker.activate();
                    newTracker.viewer(this.viewer());
                }
                this._refreshCursor();
            } else {
                return old;
            }
        },

        /**
         * If there is a drag tracker, this method does nothing
         * so that the drag tracker can take care of the cursor.
         */
        _refreshCursor: function () {
            if (!this._dragTracker())
                TargetingTool.prototype._refreshCursor.call(this);
        },

        /**
         * If there's a drag tracker, sets it to null and then sets
         * this tool's state to the initial state.
         * @return {boolean}
         * @protected
         */
        _onMouseLeave: function () {
            if (this._isInState(
                    Tool.STATE_ACCESSIBLE_DRAG |
                    Tool.STATE_ACCESSIBLE_DRAG_IN_PROGRESS |
                    Tool.STATE_TRAVERSE_HANDLE |
                    Tool.STATE_DRAG |
                    Tool.STATE_DRAG_IN_PROGRESS)) {
                if (this._dragTracker())
                    this._dragTracker(null);
                this._state(Tool.STATE_INITIAL);
            }
            return TargetingTool.prototype._onMouseLeave.call(this);
        },

        /**
         * If there's a drag tracker, calls nativeDragStarted()
         * on the drag tracker.
         * @param {MouseEvent} e
         * @return {boolean}
         * @protected
         */
        _onNativeDragStart: function (e) {
            if (this._dragTracker())
                this._dragTracker().nativeDragStart(e, this.viewer());
            this._state(Tool.STATE_INITIAL);
            return true;
        },

        /**
         * If there's a drag tracker, calls nativeDragEnd() on the drag
         * tracker and then sets the drag tracker to null.
         * @param {MouseEvent} e
         * @return {boolean}
         * @protected
         */
        _onNativeDragEnd: function (e) {
            if (this._dragTracker())
                this._dragTracker().nativeDragEnd(e, this.viewer());
            this._dragTracker(null);
            this._unlockTarget();
            return true;
        }
    });

    /** Traverse handle state */
    SelectionTool.STATE_TRAVERSE_HANDLE = Tool.MAX_STATE << 1;

    /** Max flag */
    SelectionTool.MAX_FLAG = FLAG_HOVER_FEEDBACK;

    /** Max state */
    SelectionTool.MAX_STATE = SelectionTool.STATE_TRAVERSE_HANDLE;

    return SelectionTool;
});
