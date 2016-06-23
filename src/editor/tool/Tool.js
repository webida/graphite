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
 * @file Abstarct Tool
 * @since 1.0.0
 * @author hw.shim@samsung.com
 */

define([
    'external/dom/dom',
    'external/genetic/genetic',
    'graphite/base/Base',
    'graphite/base/FlagSupport',
    'graphite/view/geometry/Point',
    'graphite/view/system/event/InternalKeyEvent',
    'graphite/view/system/event/InternalMouseEvent'
], function (
    dom,
    genetic,
    Base,
    FlagSupport,
    Point,
    InternalKeyEvent,
    InternalMouseEvent
) {
    'use strict';

    /** @constant {number} */
    var DRAG_THRESHOLD = 5;
    var FLAG_PAST_THRESHOLD = 1;
    var FLAG_HOVER = 2;
    var FLAG_UNLOAD = 4;
    var FLAG_ACTIVE = 8;

    var LEFT = InternalMouseEvent.LEFT;
    var RIGHT = InternalMouseEvent.RIGHT;
    var WHEEL = InternalMouseEvent.WHEEL;
    var BUTTON = InternalMouseEvent.BUTTON;

    /**
     * The first state that a tool is in. The tool will generally be in this
     * state immediately following activate().
     */
    Tool.STATE_INITIAL = 1;

    /**
     * The state indicating that an input event has invalidated the interaction.
     * For example, during a mouse drag, pressing additional mouse button might
     * invalidate the drag.
     */
    Tool.STATE_INVALID = 8;

    /**
     * The base implementation for Tools. The base implementation provides a
     * framework for a state machine which processes mouse and keyboard
     * input. The state machine consists of a series of states identified by
     * integer constants. Each mouse or keyboard event results in a transition,
     * sometimes to the same state in which the input was received.
     * The interesting transitions have corresponding actions assigned to them,
     * such ashandleDragStarted().
     * 
     * The base implementation performs no state transitions by default,
     * but does route events to different method handlers based on state.
     * It is up to subclasses to set the appropriate states.
     * 
     * There are two broad "categories" of methods on Tool. There are the
     * methods defined on the Tool interface which handle the job of
     * receiving raw user input. For example,
     * mouseDrag(InternalMouseEvent, GraphicViewer). Then, there are the methods
     * which correspond to higher-level interpretation of these events, such as
     * handleDragInProgress(), which is called from
     * mouseMove(...), but only when the drag threshold has
     * been passed. These methods are generally more subclass-friendly.
     * Subclasses should not override the methods which receive raw input.
     * 
     * @constructor
     */
    function Tool() {
        Base.apply(this, arguments);
        this.input = null;
        this._state_ = 0;
        this._domain = null;
        this._viewer = null;
        this._command = null;
        this._startLoc = new Point(0, 0);
        this._accessibleBegin = 0;
        this._stackListener = null;
        this._operationSet_ = null;
        this._accessibleBegin = null;
        this._accessibleStep = null;
        this.setFlag(FLAG_UNLOAD, true);
    }

    var proto = genetic.mixin(Base.prototype, FlagSupport.prototype, {

        /**
         * @param {Domain} domain
         *//**
         * Returns the Domain. A tool is told its Domain when it becomes
         * active. A tool may need to know its domain prior to receiving
         * any events from any of that domain's viewers.
         * @return {Domain}
         */
        domain: function (domain) {
            if (domain) {
                this.desc('domain', domain);
                this._domain = domain;
            } else {
                return this._domain;
            }
        },

        /**
         * Activates the tool. Any initialization should be performed here.
         * This method is called when a tool is selected.
         * @see #deactivate()
         */
        activate: function () {
            var tool = this;
            this.desc('activate');
            this.input = new Input();
            this._resetFlags();
            this._accessibleBegin = -1;
            this._state(Tool.STATE_INITIAL);
            this.setFlag(FLAG_ACTIVE, true);
            this._stackListener = function (e) {
                tool._onStackChange();
            };
            this.domain().commandStack().on(
                'preStackChange', this._stackListener);
        },

        /**
         * Deactivates the tool. This method is called whenever the user
         * switches to another tool. Use this method to do some clean-up
         * when the tool is switched. The abstract tool allows cursors for
         * viewers to be changed. When the tool is deactivated it must revert
         * to normal the cursor of the last tool it changed.
         * @see #activate()
         */
        deactivate: function () {
            this.desc('deactivate');
            this.setFlag(FLAG_ACTIVE, false);
            this.viewer(null);
            this._currentCommand(null);
            this._state(Tool.STATE_TERMINAL);
            this._operationSet_ = null;
            this.input = null;
            this.domain().commandStack().off(
                'preStackChange', this._stackListener);
        },

        /**
         * Calls deactivate and then activate.
         * @protected
         */
        _reactivate: function () {
            var viewer = this.viewer();
            this.deactivate();
            this.activate();
            if (viewer) {
                var context = this._getGraphicContext();
                if (context) {
                    var mask = context.getEventReceiver();
                    if (mask === document.activeElement)
                        this.viewer(viewer);
                }
            }
        },

        /**
         * Returns true if the tool is active.
         * @return {boolean}
         */
        isActive: function () {
            return this.getFlag(FLAG_ACTIVE);
        },

        /**
         * Executes the given command on the command stack.
         * @param Command command
         * @protected
         */
        _executeCommand: function (command) {
            this.desc('_executeCommand', command);
            var commandStack = this.domain().commandStack();
            commandStack.off('preStackChange', this._stackListener);
            try {
                commandStack.execute(command);
            } finally {
                commandStack.on('preStackChange', this._stackListener);
            }
        },
    
        /**
         * Execute the currently active command.
         * @protected
         */
        _executeCurrentCommand: function () {
            this.desc('_executeCurrentCommand');
            var cmd = this._currentCommand();
            if (cmd && cmd.canExecute())
                this._executeCommand(cmd);
            this._currentCommand(null);
        },

        /**
         * Used to cache a command obtained from {@link #getCommand()}.
         * @param {Command} c
         * @protected
         *//**
         * Returns the currently cached command.
         * @return {Command}
         * @protected
         */
        _currentCommand: function (c) {
            if (arguments.length) {
                this._command = c;
                this._refreshCursor();
            } else {
                return this._command;
            }
        },

        /**
         * Returns a new, updated command based on the tool's current
         * properties. The default implementation returns an unexecutable
         * command. Some tools do not work commands and the model,
         * but simply change the viewer's state in some way.
         * 
         * @return {Command} a newly obtained command
         * @protected
         */
        _getCommand: function () {
            return UnexecutableCommand.SINGLETON;
        },
    
        /**
         * Returns the identifier of the command that is being sought.
         * @return {string}
         * @protected
         */
        _getCommandName: function () {
            this.isInterface('_getCommandName');
        },

        /**
         * Added for compatibility. {@link DragTracker#commitDrag()} was added
         * for accessibility reasons. Since all tool implementations must
         * inherit from this base class, then implementing this method here
         * avoids breaking subclasses that implemented the {@link DragTracker}
         * interface.
         */
        commitDrag: function () {
        },

        /**
         * Sets the active GraphicViewer.
         * The active viewer is the viewer from
         * which the last event was received.
         * @param {GraphicViewer}
         *//**
         * Return the viewer that the tool is currently receiving input from,
         * or null. The last viewer to dispatch an event is defined as the
         * current viewer. Current viewer is automatically updated as
         * events are received, and is set to null on deactivate().
         * @return {GraphicViewer}
         */
        viewer: function (viewer) {
            if (arguments.length) {
                if (this._viewer === viewer) return;
                this._setCursor(null);
                this._viewer = viewer;
                this._updateContext(viewer);
                this._refreshCursor();
            } else {
                return this._viewer;
            }
        },

        _updateContext: function (viewer) {
            if (viewer) {
                this._context = viewer.shell().container().graphicContext();
            } else {
                this._context = null;
            }
        },

        _getGraphicContext: function () {
            return this._context;
        },

        /**
         * Sets the cursor being displayed to the appropriate cursor.
         * If the tool is active, the current cursor being displayed is
         * updated by calling {@link #_calculateCursor()}.
         * @protected
         */
        _refreshCursor: function () {
            if (this.isActive())
                this._setCursor(this._calculateCursor());
        },

        /**
         * Shows the given cursor on the current viewer.
         * @param {string} cursor
         * @protected
         */
        _setCursor: function (cursor) {
            var viewer = this.viewer();
            if (viewer)
                viewer.cursor(cursor);
        },

        /**
         * Returns the appropriate cursor for the tools current state. If the tool
         * is in its terminal state, <code>null</code> is returned. Otherwise,
         * either the default or disabled cursor is returned, based on the existence
         * of a current command, and whether that current command is executable.
         * 
         * Subclasses may override or extend this method to calculate the
         * appropriate cursor based on other conditions.
         * 
         * @see #defaultCursor()
         * @see #disabledCursor()
         * @see #_currentCommand()
         * @return {string}
         * @protected
         */
        _calculateCursor: function () {
            if (this._isInState(Tool.STATE_TERMINAL))
                return null;
            var command = this._currentCommand();
            if (!command || !command.canExecute())
                return this.disabledCursor();
            return this.defaultCursor();
        },

        /**
         * Sets the default cursor.
         * @param {string} cursor
         *//**
         * Returns the cursor used under normal conditions.
         * @return {string}
         */
        defaultCursor: function (cursor) {
            if (arguments.length) {
                this._defaultCursor = cursor;
            } else {
                return this._defaultCursor;
            }
        },

        /**
         * Sets the disabled cursor.
         * @param {string} cursor
         *//**
         * Returns the cursor used under abnormal conditions.
         * @return {string}
         */
        disabledCursor: function (cursor) {
            if (arguments.length) {
                if (this._disabledCursor == cursor)
                    return;
                this._disabledCursor = cursor;
                this._refreshCursor();
            } else {
                if (this._disabledCursor != null)
                    return this._disabledCursor;
                return this.defaultCursor();
            }
        },

        /**
         * Called just before the command stack has changed,
         * for instance, when a delete or undo command has been executed.
         * By default, state is set to STATE_INVALID and _onInvalidInput
         * is called. Subclasses may override this method to change
         * what happens when the command stack changes.
         * Returning true indicates that the change was handled in some way.
         * @return {boolean}
         * @protected
         */
        _onStackChange: function () {
            if (!this._isInState(Tool.STATE_INITIAL | Tool.STATE_INVALID)) {
                this._state(Tool.STATE_INVALID);
                this._onInvalidInput();
                return true;
            }
            return false;
        },

        /**
         * Sets the tools state.
         * @param {number} state - the new state
         * @protected
         *//**
         * Returns the tools state.
         * @param {number}
         * @protected
         */
        _state: function (state) {
            if (arguments.length) {
                this._state_ = state;
            } else {
                return this._state_;
            }
        },

        /**
         * Returns true if the tool is in the given state.
         * @param {number} state - the state being queried
         * @return {boolean}
         * @protected
         */
        _isInState: function (state) {
            return ((this._state() & state) !== 0);
        },

        /**
         * Returns true if the give state transition succeeds. This is
         * a "test and set" operation, where the tool is tested to be in the
         * specified start state, and if so, is set to the given end state.
         * The method returns the result of the first test.
         * 
         * @param {number} start - the start state being tested
         * @param {number} end - the end state
         * @return {boolean} true if the state transition is successful
         * @protected
         */
        _stateTransition: function (start, end) {
            if ((this._state() & start) !== 0) {
                this._state(end);
                return true;
            } else {
                return false;
            }
        },

        /**
         * Resets all stateful flags to their initial values.
         * Subclasses should extend this method
         * to reset their own custom flags.
         * @protected
         */
        _resetFlags: function () {
            this.desc('_resetFlags');
            this.setFlag(FLAG_PAST_THRESHOLD, false);
            this.setFlag(FLAG_HOVER, false);
        },

        /**
         * Lazily creates and returns the array of Controllers on which
         * the tool operates. The array is initially null, in which case
         * {@link #_createOperationSet()} is called, and its results
         * cached until the tool is deactivated.
         * @return {Array} the operation set.
         * @protected
         */
        _operationSet: function () {
            if (!this._operationSet_)
                this._operationSet_ = this._createOperationSet();
            return this._operationSet_;
        },
    
        /**
         * Returns an Array of Controllers that this tool is operating on.
         * This method is called once during {@link #_operationSet()},
         * and its result is cached.
         * 
         * By default, the operations set is the current viewer's entire
         * selection. Subclasses may override this method to filter or
         * alter the operation set as necessary.
         * 
         * @return {Array} a list of Controllers being operated on
         * @protected
         */
        _createOperationSet: function () {
            return this.viewer().selected().slice();
        },

        /**
         * Returns true if this tool is interested in events
         * occuring in the given viewer.
         * Default implementation always returns true.
         * Sub-classes may override.
         * @param {GraphicViewer} viewer
         * @return {boolean}
         * @protected
         */
        _isImportant: function (viewer) {
            return true;
        },

        /**
         * Sets the start mouse location,
         * typically for a drag operation.
         * @param {Point} p
         * @protected
         *//**
         * Returns the starting mouse location for the current tool operation.
         * This is typically the mouse location where the user first pressed
         * a mouse button. This is important for tools that
         * interpret mouse drags.
         * @return {Point} the start location
         * @protected
         */
        _startLocation: function (p) {
            if (arguments.length) {
                this._startLoc = p;
            } else {
                return this._startLoc;
            }
        },

        /**
         * Returns the current x, y position of the mouse cursor.
         * @return {Point} the mouse location
         */
        location: function () {
            return this.input.mouseLocation;
        },

        /**
         * Return the number of pixels that the mouse has been moved
         * since that drag was started. The drag start is determined by
         * where the mouse button was first pressed.
         * @see #_startLocation()
         * @return {Dimension}
         * @protected
         */
        _dragDelta: function () {
            return this.location().difference(this._startLocation());
        },

        /**
         * Called when invalid input is encountered. The state does not change,
         * so the caller must set the state to Tool.STATE_INVALID.
         * @return {boolean}
         * @protected
         */
        _onInvalidInput: function () {
            return false;
        },

        /**
         * Called when a viewer gets focus.
         * @param {MouseEvent} e
         * @param {GraphicViewer} viewer
         */
        focus: function (e, viewer) {
            this.viewer(viewer);
            this._onFocus(e);
        },

        /**
         * Handles high-level processing of a focus event.
         * By default, nothing happens and false is returned.
         * Subclasses may override this method to interpret the focus event.
         * Return true to indicate that the event was processed.
         * @return {boolean}
         * @protected
         */
        _onFocus: function (e) {
            return false;
        },

        /**
         * Called when a viewer loses focus.
         * @param {MouseEvent} e
         * @param {GraphicViewer} viewer
         */
        blur: function (e, viewer) {
            this.viewer(viewer);
            this._onBlur(e);
        },

        /**
         * Handles high-level processing of a blur event.
         * By default, nothing happens and false is returned.
         * Subclasses may override this method to interpret the blur event.
         * Return true to indicate that the event was processed.
         * @return {boolean}
         * @protected
         */
        _onBlur: function (e) {
            return false;
        },

        /**
         * Receives a KeyDown event for the given viewer.
         * Subclasses wanting to handle this event should
         * override {@link #_onKeyDown(KeyboardEvent)}.
         * @param {KeyboardEvent} e
         * @param {GraphicViewer} viewer
         */
        keyDown: function (e, viewer) {
            if (!this._isImportant(viewer))
                return;
            this.viewer(viewer);
            this.input.setEvent(e);
            this._onKeyDown(e);
        },

        /**
         * Handles high-level processing of a key down event.
         * By default, the KeyEvent is checked to see if it is the ESCAPE key.
         * If so, the domain's default tool is reloaded, and true is returned.
         * Subclasses may extend this method to interpret additional key down
         * events. Returns true if the given key down was handled.
         * @param {KeyboardEvent} e
         * @return {boolean}
         * @protected
         */
        _onKeyDown: function (e) {
            if (this._acceptAbort(e)) {
                this.domain().loadDefaultTool();
                return true;
            }
            return false;
        },

        _acceptAbort: function (e) {
            return InternalKeyEvent.getKey(e) === 'Escape';
        },

        /**
         * Receives a KeyUp event for the given viewer.
         * Subclasses wanting to handle this event should
         * override {@link #_onKeyUp(KeyboardEvent)}.
         * @param {KeyboardEvent} e
         * @param {GraphicViewer} viewer
         */
        keyUp: function (e, viewer) {
            if (!this._isImportant(viewer)) return;
            this.viewer(viewer);
            this.input.setEvent(e);
            this._onKeyUp(e);
        },

        /**
         * Handles high-level processing of a key up event.
         * By default, does nothing and returns false.
         * Subclasses may extend this method to process key up events.
         * Returns true if the key up was processed in some way.
         * @param {KeyboardEvent} e
         * @return {boolean}
         * @protected
         */
        _onKeyUp: function (e) {
            return false;
        },

        /**
         * Receives a traversal event for the given viewer. Subclasses wanting to
         * handle this event should override
         * {@link #handleKeyTraversed(TraverseEvent)}.
         * @param {KeyboardEvent} e
         * @param {GraphicViewer} viewer
         */
        keyTraverse: function (e, viewer) {
            if (!this._isImportant(viewer)) return;
            this.viewer(viewer);
            this.input.setEvent(e);
            this._onKeyTraverse(e);
        },

        /**
         * Override to process a traverse event.
         * If the event's {@link KeyEvent#doit} field is set to false,
         * the traversal will be prevented from occurring.
         * Otherwise, a traverse will occur.
         * @param {KeyboardEvent} e
         * @return {boolean}
         * @protected
         */
        _onKeyTraverse: function (e) {
            return false;
        },

        /**
         * Handles mouse-wheel scrolling for a viewer.
         * Sub-classes may override as needed.
         * @param {MouseEvent} e
         * @param {GraphicViewer} viewer
         */
        wheel: function (e, viewer) {
            if (this._isInState(Tool.STATE_INITIAL))
                this._onWheel(e, viewer);
        },

        /**
         * Override to process a wheel event.
         * @param {MouseEvent} e
         * @return {boolean}
         * @protected
         */
        _onWheel: function (e, viewer) {
            return false;
        },

        /**
         * Handles mouse double click events within a viewer.
         * Subclasses wanting to handle this event
         * should override {@link #handleDoubleClick(int)}.
         * @param {MouseEvent} e
         * @param {GraphicViewer} viewer
         */
        dblClick: function (e, viewer) {
            if (!this._isImportant(viewer)) return;
            this.viewer(viewer);
            this.input.setEvent(e);
            this._onDblClick(e.button);
        },

        /**
         * Called when a mouse double-click occurs.
         * By default, nothing happens and false is returned.
         * Subclasses may override this method to interpret double-clicks.
         * Returning true indicates that the event was handled in some way.
         * @param {number} button
         * @return {boolean}
         * @protected
         */
        _onDblClick: function (button) {
            return false;
        },

        /**
         * Handles mouse down events within a viewer.
         * Subclasses wanting to handle this event
         * should override {@link #_onMouseDown(int)}.
         * @param {MouseEvent} e
         * @param {GraphicViewer} viewer
         */
        mouseDown: function (e, viewer) {
            if (!this._isImportant(viewer)) return;
            this.viewer(viewer);
            var input = this.input;
            input.setEvent(e);
            this._startLocation(new Point(input.mouseLocation));
            this._onMouseDown(e.button);
        },

        /**
         * Called when the mouse button has been pressed.
         * By default, nothing happens and false is returned.
         * Subclasses may override this method to interpret
         * the meaning of a mouse down. Returning true indicates
         * that the button down was handled in some way.
         * @param {number} button
         * @return {boolean}
         * @protected
         */
        _onMouseDown: function (button) {
            return false;
        },

        /**
         * Handles mouse up within a viewer.
         * Subclasses wanting to handle this event
         * should override {@link #_onMouseUp(number)}.
         * @param {MouseEvent} e
         * @param {GraphicViewer} viewer
         */
        mouseUp: function (e, viewer) {
            if (!this._isImportant(viewer)) return;
            var input = this.input;
            this.viewer(viewer);
            input.setEvent(e);
            input.resetButtons();
            this._onMouseUp(e.button);
        },

        /**
         * Called when the mouse button has been released.
         * By default, nothing happens and false is returned.
         * Subclasses may override this method to interpret
         * the mouse up. Returning true indicates
         * that the mouse up was handled in some way.
         * @param {number} button
         * @return {boolean}
         * @protected
         */
        _onMouseUp: function (button) {
            return false;
        },

        /**
         * Handles mouse drag events within a viewer.
         * Subclasses wanting to handle this event
         * should override {@link #_onDrag()} and/or
         * {@link #_onDragInProgress()}.
         * @param {MouseEvent} e
         * @param {GraphicViewer} viewer
         */
        mouseDrag: function (e, viewer) {
            if (!this._isImportant(viewer))
                return;
            this.viewer(viewer);
            var wasDragging = this._movedPastThreshold();
            this.input.setEvent(e);
            this._onDrag();
            if (this._movedPastThreshold()) {
                if (!wasDragging)
                    this._onDragStarted();
                this._onDragInProgress();
            }
        },

        /**
         * Called whenever the mouse is being dragged. This method continues to be
         * called even once {@link #_onDragInProgress()} starts getting called.
         * By default, nothing happens, and false is returned.
         * Subclasses may override this method to interpret a drag. Returning
         * true indicates that the drag was handled in some way.
         * @return {boolean}
         * @protected
         */
        _onDrag: function () {
            return false;
        },

        /**
         * Called only one time during a drag when the drag threshold has been
         * exceeded. By default, nothing happens and false is returned.
         * Subclasses may override to interpret the drag starting. Returning
         * true indicates that the event was handled.
         * @return {boolean}
         * @protected
         */
        _onDragStarted: function () {
            return false;
        },

        /**
         * Called whenever a mouse is being dragged and the drag threshold
         * has been exceeded. Prior to the drag threshold being exceeded,
         * only {@link #_onDrag()} is called.
         * This method gets called repeatedly for every mouse move
         * during the drag. By default, nothing happens and false is returned.
         * Subclasses may override this method to interpret the drag.
         * Returning true indicates that the drag was handled.
         * @return {boolean}
         * @protected
         */
        _onDragInProgress: function () {
            return false;
        },

        /**
         * Returns true if the threshold has been exceeded
         * during a mouse drag.
         * @return {boolean}
         * @protected
         */
         _movedPastThreshold: function () {
            if (this.getFlag(FLAG_PAST_THRESHOLD))
                return true;
            var start = this._startLocation();
            var end = this.location();
            if (Math.abs(start.x - end.x) > DRAG_THRESHOLD
                    || Math.abs(start.y - end.y) > DRAG_THRESHOLD) {
                this.setFlag(FLAG_PAST_THRESHOLD, true);
                return true;
            }
            return false;
        },

        /**
         * Return the number of pixels that the mouse has been moved
         * since that drag was started. The drag start is determined by
         * where the mouse button was first pressed.
         * @return {Dimension} the drag delta
         */
        getDragMoveDelta: function () {
            return this.location().difference(this._startLocation());
        },

        /**
         * @return {boolean}
         */
        isInDragInProgress: function () {
            return this._isInState(Tool.STATE_DRAG_IN_PROGRESS
                    | Tool.STATE_ACCESSIBLE_DRAG_IN_PROGRESS);
        },

        /**
         * Handles mouse moves (if the mouse button is up) within a viewer.
         * Subclasses wanting to handle this event should override
         * {@link #_onMouseMove()}.
         * @param {MouseEvent} e
         * @param {GraphicViewer} viewer
         */
        mouseMove: function (e, viewer) {
            if (!this._isImportant(viewer))
                return;
            this.viewer(viewer);
            var input = this.input;
            if (!isInputSync(e, input)) {
                input.setEvent(e);
                if (input.isMouseButton(LEFT))
                    this._onMouseUp(BUTTON.LEFT);
                if (input.isMouseButton(RIGHT))
                    this._onMouseUp(BUTTON.RIGHT);
                if (input.isMouseButton(WHEEL))
                    this._onMouseUp(BUTTON.WHEEL);
                if (this.domain().activeTool() !== this)
                    return;
                /*
                 * processing one of the buttonUps may have caused the tool to
                 * reactivate itself, which causes the viewer to get nulled-out.
                 * If we are going to call another onXxx method below,
                 * we must set the viewer again to be paranoid.
                 */
                this.viewer(viewer);
            } else {
                input.setEvent(e);
            }
            if (this._isInState(Tool.STATE_ACCESSIBLE_DRAG_IN_PROGRESS)) {
                this._onDragInProgress();
            } else {
                this._onMouseMove();
            }
        },

        /**
         * Handles high-level processing of a mouse move.
         * By default, does nothing and returns false.
         * Subclasses may extend this method to process mouse moves.
         * Returns true if the mouse move was processed.
         * @return {boolean}
         * @protected
         */
        _onMouseMove: function () {
            return false;
        },

        /**
         * Handles mouse hover event within a viewer.
         * Subclasses wanting to handle this event
         * should override {@link #_onMouseHover()}.
         * @param {MouseEvent} e
         * @param {GraphicViewer} viewer
         */
        mouseHover: function (e, viewer) {
            if (!this._isImportant(viewer)) return;
            this.viewer(viewer);
            this.input.setEvent(e);
            this._onMouseHover();
        },

        /**
         * Handles high-level processing of a mouse hover event.
         * By default, nothing happens and false is returned.
         * Subclasses may override this method to interpret the hover.
         * Return true to indicate that the hover was handled.
         * @return {boolean}
         * @protected
         */
        _onMouseHover: function () {
            return false;
        },

        /**
         * Returns true if the tool is hovering.
         * @return {boolean} true if hovering
         * @protected
         */
        _isHoverActive: function () {
            return this.getFlag(FLAG_HOVER);
        },

        /**
         * Sets whether the hover flag is true or false. Subclasses which do
         * something on hover can use this flag to track whether they have received
         * a hover or not.
         * @param {boolean} value
         * @protected
         */
        _setHoverActive: function ( value) {
            this.setFlag(FLAG_HOVER, value);
        },

        /**
         * Receives the mouse enter event.
         * Subclasses wanting to handle this event
         * should override {@link #_onMouseEnter()}.
         * @param {MouseEvent} e
         * @param {GraphicViewer} viewer
         *            
         */
        mouseEnter: function (e, viewer) {
            this.desc('mouseEnter', arguments);
            if (!this._isImportant(viewer)) return;
            this.input.setEvent(e);
            var curViewer = this.viewer();
            if (curViewer && curViewer !== viewer) {
                this._onMouseLeave();
            }
            this.viewer(viewer);
            this._onMouseEnter();
        },

        /**
         * Called when the mouse enters an EditPartViewer. By default, does nothing
         * and returns <code>false</code>. Subclasses may extend this method to
         * process the viewer enter. Returns <code>true</code> to indicate if the
         * viewer entered was process in some way.
         * @return {boolean}
         * @protected
         */
        _onMouseEnter: function () {
            return false;
        },

        /**
         * Handles the mouse leave event.
         * Subclasses wanting to handle this event
         * should override {@link #_onMouseLeave()}.
         * @param {MouseEvent} e
         * @param {GraphicViewer} viewer
         */
        mouseLeave: function (e, viewer) {
            if (viewer === this.viewer()) {
                this.input.setEvent(e);
                this._onMouseLeave();
                this.viewer(null);
            }
        },

        /**
         * Called when the mouse exits an EditPartViewer.
         * By default, does nothing and returns false.
         * Subclasses may extend this method to process viewer exits.
         * Returns true to indicate if the viewer
         * exited was process in some way.
         * @return {boolean}
         * @protected
         */
        _onMouseLeave: function () {
            return false;
        },

        /**
         * Called when a native drag begins on a Viewer.
         * This event is important to Tools because
         * {@link #mouseUp(MouseEvent, GraphicViewer)}
         * will not occur once a native drag has started.
         * The Tool should correct its state to handle this lost Event.
         * @param {MouseEvent} e
         * @param {GraphicViewer} viewer
         */
        nativeDragStart: function (e, viewer) {
            if (!this._isImportant(viewer))
                return;
            this.viewer(viewer);
            this._onNativeDragStart(e);
        },

        /**
         * Handles when a native drag has started.
         * By default, does nothing and returns false.
         * Subclasses may extend this method to process native drag starts.
         * When a native drag starts, all subsequent mouse events will not be
         * received, including the mouseUp event. The only event that will be
         * received is the drag finished event.
         * @param {MouseEvent} e
         * @return {boolean}
         * @protected
         */
        _onNativeDragStart: function (e) {
            return false;
        },

        /**
         * Called when a native drag ends on a Viewer.
         * This event is important to Tools because
         * {@link #mouseUp(MouseEvent, GraphicViewer)}
         * will not occur once a native drag has started.
         * The Tool should correct its state to handle this lost Event.
         * @param {MouseEvent} e
         * @param {GraphicViewer} viewer
         */
        nativeDragEnd: function (e, viewer) {
            if (!this._isImportant(viewer)) return;
            this.viewer(viewer);
            this._onNativeDragEnd(e);
        },

        /**
         * Handles when a native drag has ended.
         * By default, does nothing and returns false.
         * Subclasses may extend this method to process native drags ending.
         * @param {MouseEvent} e
         * @return {boolean}
         * @protected
         */
        _onNativeDragEnd: function (e) {
            return false;
        },

        /**
         * Called when the current tool operation is to be completed. In other
         * words, the "state machine" and has accepted the sequence of input (i.e.
         * the mouse gesture). By default, the tool will either reactivate itself,
         * or ask the edit domain to load the default tool.
         * <P>
         * Subclasses should extend this method to first do whatever it is that the
         * tool does, and then call <code>super</code>.
         * 
         * @see #unloadWhenFinished()
         * @protected
         */
        _onFinished: function () {
            if (this.unloadWhenFinished()) {
                this.domain().loadDefaultTool();
            } else {
                this._reactivate();
            }
        },

        /**
         * Setting this to true will cause the tool to be unloaded
         * after one operation has completed. The default value is true.
         * When the tool is unloaded, the domain's default tool
         * will be activated.
         * @param {boolean} value
         *  - whether the tool should be unloaded on completion
         *//**
         * Returns true if the tool is set to unload when its current
         * operation is complete.
         * @return {boolean} true if the tool should be unloaded when finished
         */
        autoUnload: function (value) {
            if (arguments.length) {
                this.setFlag(FLAG_UNLOAD, value);
            } else {
                return getFlag(FLAG_UNLOAD);
            }
        },

        /**
         * Releases tool capture.
         */
        releaseToolCapture: function () {
            this.viewer().routeEventsToDomain(false);
        },

        /**
         * Sets tool capture. When a tool has capture, viewers will make
         * every effort to send events through the domain to the tool.
         * Therefore, the default handling of some events is bypassed.
         */
        setToolCapture: function () {
            this.viewer().routeEventsToDomain(true);
        },

        /**
         * Convenience method to add the given widget to the feedback layer.
         * @param {Widget} widget
         * @protected
         */
        _addFeedback: function (widget) {
            var context = this._getGraphicContext();
            var layer = context.getLayer('FEEDBACK_LAYER');
            if (layer) {
                layer.remove(widget);
            }
        },

        /**
         * Convenience method to removes a widget from the feedback layer.
         * @param {Widget} widget
         * @protected
         */
        _removeFeedback: function (widget) {
            var context = this._getGraphicContext();
            var layer = context.getLayer('FEEDBACK_LAYER');
            if (layer) {
                layer.remove(widget);
            }
        },

        /**
         * Returns true if the event corresponds to an arrow key with the
         * appropriate modifiers and if the system is in a state
         * where the arrow key should be accepted.
         * @param {KeyboardEvent} e
         * @return {boolean}
         *  - true if the arrow key should be accepted by this tool
         * @protected
         */
         _acceptArrowKey: function (e) {
            var key = InternalKeyEvent.getKey(e);
            if (!(this._isInState(Tool.STATE_INITIAL
                    | Tool.STATE_ACCESSIBLE_DRAG
                    | Tool.STATE_ACCESSIBLE_DRAG_IN_PROGRESS)))
                return false;
            return (key === 'ArrowUp') || (key === 'ArrowRight')
                    || (key === 'ArrowDown') || (key === 'ArrowLeft');
        },

        /**
         * @param {KeyboardEvent} e
         * @return {boolean}
         * @protected
         */
        _acceptDragCommit: function (e) {
            return this._isInState(Tool.STATE_ACCESSIBLE_DRAG_IN_PROGRESS)
                    && InternalKeyEvent.getKey(e) === 'Enter';
        },

        /**
         * @return {number}
         * @protected
         */
        _accGetStep: function () {
            return this._accessibleStep;
        },

        _accStepIncrement: function () {
            if (this._accessibleBegin == -1) {
                this._accessibleBegin = new Date().getTime();
                this._accessibleStep = 1;
            } else {
                this._accessibleStep = 4;
                var elapsed = (+new Date()) - this._accessibleBegin;
                if (elapsed > 1000)
                    this._accessibleStep = Math.min(16, (elapsed / 150));
            }
        },

        _accStepReset: function () {
            this._accessibleBegin = -1;
        },

        /**
         * Tool can set properties that are not explicitly specified.
         * @example
         * setProperties({
         *     autoUnload: true,
         *     setDefaultCursor: 'move',
         *     someMethod: [1,2,3]
         * });
         */
        setProperties: function (properties) {
            if (typeof properties !== 'object') {
                return;
            }
            var method, args;
            var keys = properties.getOwnPropertyNames();
            keys.forEach(function (key) {
                method = this[key];
                if (typeof this[key] === 'function') {
                    args = properties[key];
                    if (!(args instanceof Array)) {
                        args = [args];
                    }
                    method.apply(this, args);
                }
            }, this);
        }
    });

    genetic.inherits(Tool, Base, proto);

    function Input() {
        Base.apply(this, arguments);
        /** 
         * e.altKey
         * e.ctrlKey
         * e.shiftKey
         */
        this.modifiers = 0;
        /**
         * 1: Left button
         * 2: Right button
         * 4: Wheel button or middle button
         */
        this.buttons = 0;
        this.mouseLocation = new Point();
    }

    genetic.inherits(Input, Base, {
        
        /**
         * Sets the UIEvent.
         * @param {UIEvent} e
         */
        setEvent: function (e) {
            this._setModifier('ALT', e.altKey ? true : false);
            this._setModifier('CTRL', e.ctrlKey ? true : false);
            this._setModifier('SHIFT', e.shiftKey ? true : false);
            var p = dom.getEventPos(e);
            this.mouseLocation.location(p.x, p.y);
            this.buttons = e.buttons;
        },

        resetButtons: function () {
            this.buttons = 0;
        },

        _setModifier: function (key, value) {
            var flag = InternalKeyEvent[key];
            if (value) {
                this.modifiers |= flag;
            } else {
                this.modifiers &= ~flag;
            }
        },

        /**
         * Returns true if the specified button is down.
         * @param {number} flag - LEFT, RIGHT, WHEEL
         * 
         * https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons
         * 1 : Left button
         * 2 : Right button
         * 4 : Wheel button
         * @return {boolean}
         * @see InternalMouseEvent
         */
        isMouseButton: function (flag) {
            return (this.buttons & flag) !== 0;
        },

        /**
         * Returns true if the specified button is down.
         * 1 : Left | 2 : Right button | 4 : Wheel button
         * @return {boolean}
         * @see InternalMouseEvent
         */
        isAnyMouseButton: function () {
            return (this.buttons & 7) !== 0;
        },

        /**
         * Returns true if the specified button is down.
         * @param {number} flag - ALT, CTRL, SHIFT
         * @return {boolean}
         * @see InternalKeyEvent
         */
        isModKey: function (flag) {
            return (this.modifiers & flag) !== 0;
        },
    });

    /*
     * Returns true if the current {@link Input} is synchronized
     * with the current MouseEvent.
     * @param {MouseEvent} e
     * @param {Input} input
     * @return {boolean}
     * @private
     */
    function isInputSync(e, input) {
        function isNewMouseDown(flag) {
            return (e.buttons & flag) !== 0;
        }
        return input.isMouseButton(LEFT) === isNewMouseDown(LEFT)
                && input.isMouseButton(RIGHT) === isNewMouseDown(RIGHT)
                && input.isMouseButton(WHEEL) === isNewMouseDown(WHEEL);
    }

    Tool.Input = Input;

    /**
     * Key modifier for ignoring snap while dragging.
     */
    Tool.MODIFIER_NO_SNAPPING = InternalKeyEvent.ALT;

    /**
     * The state indicating that a keyboard drag is in progress.
     * The threshold for keyboard drags is non-existent,
     * so this state would be entered very quickly.
     */
    Tool.STATE_ACCESSIBLE_DRAG_IN_PROGRESS = 32;

    /**
     * The first state that a tool is in.
     * The tool will generally be in this
     * state immediately following activate().
     */
    Tool.STATE_INITIAL = 1;

    /**
     * The state indicating that one or more buttons are pressed, but the user
     * has not moved past the drag threshold. Many tools will do nothing during
     * this state but wait until {@link #STATE_DRAG_IN_PROGRESS} is entered.
     */
    Tool.STATE_DRAG = 2;

    /**
     * The state indicating that the drag detection theshold has been passed,
     * and a drag is in progress.
     */
    Tool.STATE_DRAG_IN_PROGRESS = 4;

    /**
     * The state indicating that an input event has invalidated the interaction.
     * For example, during a mouse drag, pressing additional mouse button might
     * invalidate the drag.
     */
    Tool.STATE_INVALID = 8;

    /**
     * The state indicating that the keyboard is being used to perform a drag
     * that is normally done using the mouse.
     */
    Tool.STATE_ACCESSIBLE_DRAG = 16;

    /**
     * The maximum state flag defined by this class
     */
    Tool.MAX_STATE = 32;

    /**
     * The final state for a tool to be in. Once a tool reaches this state,
     * it will not change states until it is activated() again.
     */
    Tool.STATE_TERMINAL = 1 << 30;

    /**
     * The highest-bit flag being used.
     */
    Tool.MAX_FLAG = 8;

    return Tool;
});
