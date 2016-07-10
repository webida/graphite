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
 * @file MoveTracker
 * @since 1.0.0
 * @author hw.shim@samsung.com
 */

define([
    'external/genetic/genetic',
    'graphite/view/geometry/Point',
    'graphite/view/geometry/Rectangle',
    'graphite/view/system/event/InternalKeyEvent',
    '../command/CompoundCommand',
    '../command/UnexecutableCommand',
    '../request/ChangeBoundsRequest',
    './SelectTracker',
    './Tool',
    './ToolUtil'
], function (
    genetic,
    Point,
    Rectangle,
    InternalKeyEvent,
    CompoundCommand,
    UnexecutableCommand,
    ChangeBoundsRequest,
    SelectTracker,
    Tool,
    ToolUtil
) {
    'use strict';

    var FLAG_SOURCE_FEEDBACK = SelectTracker.MAX_FLAG << 1;

    var privates = {
        /**
         * Returns true if the CTRL key was the key in the key event
         * and the tool is in an acceptable state for this event.
         * @param {KeyboardEvent} e
         * @return {boolean}
         */
        acceptClone: function (e) {
            if (!(this._isInState(
                    Tool.STATE_DRAG_IN_PROGRESS | 
                    Tool.STATE_ACCESSIBLE_DRAG |
                    Tool.STATE_ACCESSIBLE_DRAG_IN_PROGRESS)))
                return false;
            return InternalKeyEvent.getKey(e)
                    === MoveTracker.MODIFIER_CLONE_STRING;
        },
        /**
         * @param {KeyboardEvent} e
         * @return {boolean}
         */
        acceptSHIFT: function(e) {
            return this._isInState(
                    Tool.STATE_DRAG_IN_PROGRESS |
                    Tool.STATE_ACCESSIBLE_DRAG |
                    Tool.STATE_ACCESSIBLE_DRAG_IN_PROGRESS)
                    && InternalKeyEvent.getKey(e) === 'Shift';
        }
    };

    /**
     * A MoveTracker is a DragTracker that moves Controllers.
     * @constructor
     */
    function MoveTracker() {
        SelectTracker.apply(this, arguments);
        this._cloneActive = false;
        this._srcRect = null;
        this._unionSrcRect = null;
        this._exclusionSet = null;
        this._snapToHelper = null;
        this._sourceRelativeStartPoint = null;
        this.disabledCursor('not-allowed');
    }

    /**
     * Captures the bounds of the source being dragged, and the unioned bounds
     * of all widgets being dragged. These bounds are used for snapping by the
     * snap strategies in <code>updateTargetRequest()</code>.
     */
    function captureSourceDimensions() {
        this._operationSet().forEach(function (child) {
            var widget = child.view();
            var bounds = null;
            if (typeof widget.handleBounds === 'function')
                bounds = new Rectangle(widget.handleBounds());
            else
                bounds = new Rectangle(widget.bounds());
            widget.translateToAbsolute(bounds);

            if (!this._unionSrcRect)
                this._unionSrcRect = new Rectangle(bounds);
            else
                this._unionSrcRect = this._unionSrcRect.union(bounds);
            if (child === this._source())
                this._srcRect = bounds;            
        }, this);

        if (this._srcRect == null) {
            var widget = this._source().view();
            if (typeof widget.handleBounds === 'function')
                this._srcRect = new Rectangle(widget.handleBounds());
            else
                this._srcRect = new Rectangle(widget.bounds());
            widget.translateToAbsolute(this._srcRect);
        }
    }

    genetic.inherits(MoveTracker, SelectTracker, {

        /**
         * Erases source feedback and sets the autoexpose helper to null.
         * @see Tool#deactivate()
         */
        deactivate: function () {
            this._eraseSourceFeedback();
            SelectTracker.prototype.deactivate.call(this);
            this._srcRect = null;
            this._unionSrcRect = null;
            this._exclusionSet = null;
            this._snapToHelper = null;
            this._sourceRelativeStartPoint = null;
        },

        /**
         * Extended to activate cloning and to update the captured
         * source dimensions when applicable.
         * @see Tool#_state(number)
         * @protected
         */
        _state: function (state) {
            if (arguments.length) {
                var check = this._isInState(Tool.STATE_INITIAL);
                SelectTracker.prototype._state.call(this, state);
                if (this._isInState(Tool.STATE_ACCESSIBLE_DRAG
                        | Tool.STATE_DRAG_IN_PROGRESS
                        | Tool.STATE_ACCESSIBLE_DRAG_IN_PROGRESS)) {
                    if (this.input.isModKey(MoveTracker.MODIFIER_CLONE)) {
                        this._setCloneActive(true);
                        this._onDragInProgress();
                    }
                }
                if (check && this._isInState(
                            Tool.STATE_DRAG
                            | Tool.STATE_ACCESSIBLE_DRAG
                            | Tool.STATE_ACCESSIBLE_DRAG_IN_PROGRESS))
                    captureSourceDimensions.call(this);
            } else {
                return this._state_;
            }
        },

        /**
         * Enables cloning if the value is true.
         * @param {boolean} cloneActive
         * @protected
         */
        _setCloneActive: function (cloneActive) {
            if (this._cloneActive === cloneActive)
                return;
            this._eraseSourceFeedback();
            this._eraseTargetFeedback();
            this._cloneActive = cloneActive;
        },

        /**
         * Returns true if the current drag is a clone operation.
         * @return {boolean}
         * @protected
         */
        _isCloneActive: function () {
            return this._cloneActive;
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
                if (this._isCloneActive())
                    return 'copy';
                return this._defaultCursor;
            }
        },

        /**
         * @see Tool#_getCommandName()
         * @protected
         */
        _getCommandName: function () {
            if (this._isCloneActive())
                return 'REQ_CLONE';
            else if (this._isMove())
                return 'REQ_MOVE';
            else
                return 'REQ_ADD';
        },

        /**
         * Erases feedback and calls {@link #_drag()}.
         * Sets the state to terminal.
         * @see Tool#commitDrag()
         */
        commitDrag: function () {
            this._eraseSourceFeedback();
            this._eraseTargetFeedback();
            this._dragEnd();
            this._state(Tool.STATE_TERMINAL);
        },

        /**
         * Returns an Array of top-level Controllers excluding dependants
         * that understand the current target request.
         * @return {Array}
         * @see Tool#_createOperationSet()
         * @protected
         */
        _createOperationSet: function () {
            this.desc('_createOperationSet');
            var viewer = this.viewer();
            if (viewer) {
                var selected = ToolUtil.getTopLevelSelected(viewer);
                selected = ToolUtil.filterWithRequest(
                    selected, this._targetRequest());
                return selected;
            }
            return [];
        },

        /**
         * Returns true if the source Controller is being moved within
         * its parent. If the source is being moved to another parent,
         * this returns false.
         * @return {boolean}
         * @protected
         */
        _isMove: function () {
            var source = this._source();
            while (source && source !== this._target()) {
                if (source.parent() === this._target()
                        && source.selectedState() !== 'SELECTED_NONE')
                    return true;
                source = source.parent();
            }
            return false;
        },

        /**
         * Extended to update the current snap-to strategy.
         * @param {Controller} target
         * @protected
         * @override
         *//**
         * Returns the current target Controller.
         * @return {Controller}
         * @protected
         */
        _target: function (target) {
            if (arguments.length) {
                this.desc('_target', target);
                if (target !== this._target_) {
                    SelectTracker.prototype._target.call(this, target);
                    this._snapToHelper = null;
                    var target = this._target();
                    if (target && this._operationSet().length > 0)
                        this._snapToHelper = target.getAdapter('SnapToHelper');
                }
            } else {
                return this._target_;
            }
        },

        /**
         * Returns a Array of all the Controllers in the
         * {@link Tool#_operationSet()}, and ConnectionLayer.
         * @see TargetingTool#_getExclusionSet()
         * @protected
         */
        _getExclusionSet: function () {
            if (!this._exclusionSet) {
                var exclusionSet = [];
                var context = this._getGraphicContext();
                var layer = context.getLayer('CONNECTION_LAYER');
                this._operationSet().forEach(function (ctrl) {
                    exclusionSet.push(ctrl.view());
                });
                if (layer) exclusionSet.push(layer);
                this._exclusionSet = exclusionSet;
            }
            this.desc('_getExclusionSet', [], this._exclusionSet);
            return this._exclusionSet;
        },

        /**
         * Creates a ChangeBoundsRequest.
         * By default, the type is 'REQ_MOVE'.
         * Later on when the Controllers are asked to contribute to
         * the overall command, the request type will be either 'REQ_MOVE' or
         * 'REQ_ORPHAN', depending on the result of {@link #_isMove()}.
         * @return {ChangeBoundsRequest}
         * @see TargetingTool#createTargetRequest()
         * @protected
         * @override
         */
        _createTargetRequest: function () {
            if (this._isCloneActive())
                return new ChangeBoundsRequest('REQ_CLONE');
            else
                return new ChangeBoundsRequest('REQ_MOVE');
        },

        /**
         * Calls {@link #repairStartLocation()} in case auto scroll is being
         * performed. Updates the request with the current
         * {@link Tool#_operationSet()}, move delta, location and type.
         * @see TargetingTool#_updateTargetRequest()
         * @protected
         * @override
         */
        _updateTargetRequest: function () {
            this._repairStartLocation();
            var request = this._targetRequest();
            request.controllers(this._operationSet());
            var delta = this._dragDelta();

            request.isConstrainedMove(this.input.isModKey(
                    MoveTracker.MODIFIER_CONSTRAINED_MOVE));
            request.isSnapToEnabled(!this.input.isModKey(
                    Tool.MODIFIER_NO_SNAPPING));

            // constrains the move to dx=0, dy=0,
            // or dx=dy if shift is depressed
            if (request.isConstrainedMove()) {
                var ratio = 0;

                if (delta.w !== 0)
                    ratio = parseFloat(delta.h) / parseFloat(delta.w);
    
                ratio = Math.abs(ratio);
                if (ratio > 0.5 && ratio < 1.5) {
                    if (Math.abs(delta.h) > Math.abs(delta.w)) {
                        if (delta.h > 0)
                            delta.h = Math.abs(delta.w);
                        else
                            delta.h = -Math.abs(delta.w);
                    } else {
                        if (delta.w > 0)
                            delta.w = Math.abs(delta.h);
                        else
                            delta.w = -Math.abs(delta.h);
                    }
                } else {
                    if (Math.abs(delta.w) > Math.abs(delta.h))
                        delta.h = 0;
                    else
                        delta.w = 0;
                }
            }
    
            var moveDelta = new Point(delta.w, delta.h);
            request.data({});
            request.moveDelta(moveDelta);
            this._snapPoint(request);
            request.location(this.location());
            request.type(this._getCommandName());
        },

        /**
         * If auto scroll (aka. auto expose) is being performed,
         * the start location moves during the scroll.
         * This method updates that location.
         * @protected
         */
        _repairStartLocation: function () {
            if (!this._sourceRelativeStartPoint)
                return;
            var sourceWiz = this._source().view();
            var newStart = this._sourceRelativeStartPoint.copy();
            sourceWiz.translateToAbsolute(newStart);
            var startLoc = this._startLocation();
            var delta = new Point(
                    newStart.x - startLoc.x, newStart.y - startLoc.y);
            this._startLocation(newStart);
            // sourceRectangle and unionSrcRect need to be updated
            // as well when auto-scrolling
            if (this._srcRect != null)
                this._srcRect.translate(delta);
            if (this._unionSrcRect != null)
                this._unionSrcRect.translate(delta);
        },

        /**
         * This method can be overridden by clients to customize
         * the snapping behavior.
         * @param {ChangeBoundsRequest} request
         *  - the ChangeBoundsRequest from which the move delta
         *    can be extracted and updated
         * @protected
         */
        _snapPoint: function (request) {
            var moveDelta = request.moveDelta();
            if (this._snapToHelper && request.isSnapToEnabled()) {
                var baseRect = this._srcRect.copy();
                var jointRect = this._unionSrcRect.copy();
                baseRect.translate(moveDelta);
                jointRect.translate(moveDelta);
                this._snapToHelper.snapPoint(request,
                    Position.HORIZONTAL | Position.VERTICAL,
                    [baseRect, jointRect], moveDelta);
                request.moveDelta(moveDelta);
            }
        },

        /**
         * Asks the Controllers in the {@link Tool#_operationSet()
         * operation set} to show source feedback.
         * @protected
         */
        _showSourceFeedback: function () {
            this._operationSet().forEach(function (controller) {
                controller.showSourceFeedback(this._targetRequest());
            }, this);
            this.setFlag(FLAG_SOURCE_FEEDBACK, true);
        },

        /**
         * Asks the Controllers in the {@link Tool#_operationSet()
         * operation set} to erase their source feedback.
         * @protected
         */
        _eraseSourceFeedback: function () {
            if (!this.getFlag(FLAG_SOURCE_FEEDBACK))
                return;
            this.setFlag(FLAG_SOURCE_FEEDBACK, false);
            this._operationSet().forEach(function (controller) {
                controller.eraseSourceFeedback(this._targetRequest());
            }, this);
        },

        /**
         * Processes arrow keys used to move Controllers.
         * @param {KeyboardEvent} e
         * @return {boolean}
         * @see Tool#_onKeyDown(KeyboardEvent)
         * @protected
         */
        _onKeyDown: function (e) {
            this.desc('_onKeyDown', e);
            this._setAutoexposeHelper(null);
            if (this._acceptArrowKey(e)) {
                this._accStepIncrement();
                if (this._stateTransition(Tool.STATE_INITIAL,
                        Tool.STATE_ACCESSIBLE_DRAG_IN_PROGRESS))
                    this._startLocation(this.location());
                switch (InternalKeyEvent.getKey(e)) {
                case 'ArrowDown':
                    this._placeMouse(
                        this.location().translated(0, this._accGetStep()));
                    break;
                case 'ArrowUp':
                    this._placeMouse(
                        this.location().translated(0, -this._accGetStep()));
                    break;
                case 'ArrowRight':
                    var stepping = this._accGetStep();
                    this._placeMouse(
                        this.location().translated(stepping, 0));
                    break;
                case 'ArrowLeft':
                    var step = -this._accGetStep();
                    this._placeMouse(
                        this.location().translated(step, 0));
                    break;
                }
                return true;
            } else if (privates.acceptClone.call(this, e)) {
                this._setCloneActive(true);
                this._onDragInProgress();
                return true;
            } else if (privates.acceptSHIFT.call(this, e)) {
                this._onDragInProgress();
                return true;
            }
    
            return false;
        },

        /**
         * @see TargetingTool#_setAutoexposeHelper(AutoexposeHelper)
         */
        _setAutoexposeHelper: function (helper) {
            SelectTracker.prototype._setAutoexposeHelper.call(this, helper);
            if (helper && !this._sourceRelativeStartPoint
                    && this.isInDragInProgress()) {
                var widget = this._source().view();
                this._sourceRelativeStartPoint = new Point(this._startLocation());
                widget.translateToRelative(this._sourceRelativeStartPoint);
            }
        },

        /**
         * Interprets and processes clone deactivation, constrained move
         * deactivation, and accessibility navigation reset.
         * @param {KeyboardEvent} e
         * @return {boolean}
         * @protected
         * @see Tool#_onKeyUp(KeyboardEvent)
         * @see Tool#_acceptArrowKey(KeyboardEvent)
         */
        _onKeyUp: function (e) {
            if (this._acceptArrowKey(e)) {
                this._accStepReset();
                return true;
            } else if (privates.acceptClone.call(this, e)) {
                this._setCloneActive(false);
                this._onDragInProgress();
                return true;
            } else if (privates.acceptSHIFT.call(this, e)) {
                this._onDragInProgress();
                return true;
            }
            return false;
        },

        /**
         * Erases source feedback.
         * @return {boolean}
         * @protected
         */
        _onInvalidInput: function () {
            SelectTracker.prototype._onInvalidInput.call(this);
            this._eraseSourceFeedback();
            return true;
        },

        /**
         * Erases feedback and calls {@link #_dragEnd()}.
         * @return {boolean}
         * @see Tool#_onMouseUp(number)
         * @protected
         * @override
         */
        _onMouseUp: function (button) {
            if (this._stateTransition(Tool.STATE_DRAG_IN_PROGRESS,
                    Tool.STATE_TERMINAL)) {
                this._eraseSourceFeedback();
                this._eraseTargetFeedback();
                this._dragEnd();
                return true;
            }
            return SelectTracker.prototype._onMouseUp.call(this, button);
        },

        /**
         * Calls {@link Tool#_executeCurrentCommand()}.
         * @protected
         */
        _dragEnd: function () {
            this._executeCurrentCommand();
        },

        /**
         * Updates the target request and mouse target,
         * asks to show feedback,
         * and sets the current command.
         * @see Tool#_onDragInProgress()
         * @protected
         */
        _onDragInProgress: function () {
            if (this.isInDragInProgress()) {
                this._updateTargetRequest();
                if (this._updateTargetUnderMouse())
                    this._updateTargetRequest();
                this._showTargetFeedback();
                this._showSourceFeedback();
                this._currentCommand(this._getCommand());
            }
            return true;
        },

        /**
         * Asks each Controller in the {@link Tool#_operationSet()
         * operation set} to contribute to a {@link CompoundCommand}
         * after first setting the request type to either 'REQ_MOVE' or
         * 'REQ_ORPHAN', depending on the result of {@link #_isMove()}.
         * @return {Command} 
         * @see Tool#_getCommand()
         */
        _getCommand: function () {
            var command = new CompoundCommand();
            var request = this._targetRequest();

            if (this._isCloneActive())
                request.type('REQ_CLONE');
            else if (this._isMove())
                request.type('REQ_MOVE');
            else
                request.type('REQ_ORPHAN');

            if (!this._isCloneActive()) {
                this._operationSet().forEach(function (child) {
                    command.add(child.getCommand(request));
                });
            }
            if (!this._isMove() || this._isCloneActive()) {
                var target = this._target();
                if (!this._isCloneActive())
                    request.type('REQ_ADD');
                if (!target)
                    command.add(UnexecutableCommand.SINGLETON);
                else
                    command.add(target.getCommand(request));
            }
            return command.unwrap();
        },

        /**
         * Calls {@link TargetingTool#_updateAutoexposeHelper()}
         * if a drag is in progress.
         * @return {boolean}
         * @protected
         * @see TargetingTool#_onMouseHover()
         */
        _onMouseHover: function () {
            if (this.isInDragInProgress())
                this._updateAutoexposeHelper();
            return true;
        },

        /**
         * This method is called whenever an autoexpose occurs.
         * When an autoexpose occurs, it is possible that everything
         * in the viewer has moved a little.
         * Therefore, by default, {@link Tool#_onMove()} is
         * called to simulate the mouse moving even though it didn't.
         * @protected
         * @see TargetingTool#_onAutoexpose()
         */
        _onAutoexpose: function () {
            this._updateTargetRequest();
            this._updateTargetUnderMouse();
            this._showTargetFeedback();
            this._showSourceFeedback();
            this._currentCommand(this._getCommand());
        },

        toString: function () {
            return SelectTracker.prototype.toString.call(this)
                    + '(' + this._getCommandName() + ')';
        }
    });

    MoveTracker.MODIFIER_CLONE = InternalKeyEvent.CTRL;
    MoveTracker.MODIFIER_CLONE_STRING = InternalKeyEvent.modToString(
            MoveTracker.MODIFIER_CLONE);

    /**
     * Key modifier for constrained move. It's SHIFT on all platforms.
     */
    MoveTracker.MODIFIER_CONSTRAINED_MOVE = InternalKeyEvent.SHIFT;

    /** Max flag */
    MoveTracker.MAX_FLAG = FLAG_SOURCE_FEEDBACK;

    return MoveTracker;
});
