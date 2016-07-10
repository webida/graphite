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
 * A Tracker for dragging a resize handle.
 * The ResizeTracker will resize all of the selected Widgets in the viewer
 * which understand a RESIZE request. A {@link ChangeBoundsRequest} is
 * sent to each member of the operation set.
 * The tracker allows for the resize direction to be specified
 * in the constructor.
 * @since 1.0.0
 * @author hw.shim@samsung.com
 */

define([
    'external/genetic/genetic',
    'graphite/view/geometry/Dimension',
    'graphite/view/geometry/Point',
    'graphite/view/geometry/Position',
    'graphite/view/geometry/Rectangle',
    'graphite/view/resource/Cursor',
    'graphite/view/system/event/InternalKeyEvent',
    'graphite/view/widget/Widget',
    '../command/CompoundCommand',
    '../request/ChangeBoundsRequest',
    './NonTargetTracker',
    './Tool',
    './ToolUtil'
], function (
    genetic,
    Dimension,
    Point,
    Position,
    Rectangle,
    Cursor,
    InternalKeyEvent,
    Widget,
    CompoundCommand,
    ChangeBoundsRequest,
    NonTargetTracker,
    Tool,
    ToolUtil
) {
    'use strict';

    var FLAG_TARGET_FEEDBACK = NonTargetTracker.MAX_FLAG << 1;

    /**
     * A ResizeTracker.
     * Constructs a resize tracker that resizes in the specified direction.
     * The direction is specified using {@link Position#NORTH},
     * {@link Position#NORTH_EAST}, etc ...
     * 
     * @param {Controller} owner
     *  - The owner of the resize handle which returns this tracker
     * @param {number} direction
     *  - The direction
     * @constructor
     */
    function ResizeTracker(owner, direction) {
        NonTargetTracker.apply(this, arguments);
        this._owner = owner;
        this._direction = direction;
        this._sourceRect = null;
        this._snapToHelper = null;
        this.disabledCursor('not-allowed');
    }

    genetic.inherits(ResizeTracker, NonTargetTracker, {

        /**
         * @inheritdoc
         * @see Tool#activate()
         */
        activate: function () {
            NonTargetTracker.prototype.activate.call(this);
            if (this._owner) {
                var target = this._target();
                if (target)
                    this._snapToHelper = target.getAdapter('SnapToHelper');
                var widget = this._owner.view();
                if (typeof widget.handleBounds === 'function')
                    this._sourceRect = new Rectangle(widget.handleBounds());
                else
                    this._sourceRect = new Rectangle(widget.bounds());
                widget.translateToAbsolute(this._sourceRect);
            }
        },

        /**
         * @see Tool#deactivate()
         */
        deactivate: function () {
            // For the case where ESC key was hit while resizing
            this._eraseTargetFeedback();
            this._sourceRect = null;
            this._snapToHelper = null;
            NonTargetTracker.prototype.deactivate.call(this);
        },

        /**
         * @see Tool#commitDrag()
         */
        commitDrag: function () {
            this._eraseTargetFeedback();
            NonTargetTracker.prototype.commitDrag.call(this);
        },

        /**
         * This method is invoked when the resize operation is complete.
         * It notifies the target to erase target feedback.
         * @protected
         */
        _eraseTargetFeedback: function () {
            if (!this.getFlag(FLAG_TARGET_FEEDBACK))
                return;
            var target = this._target();
            if (target)
                target.eraseTargetFeedback(this._getSourceRequest());
            this.setFlag(FLAG_TARGET_FEEDBACK, false);
        },

        /**
         * The Target Controller is the parent of
         * the Controller being resized.
         * @return {Controller}
         * @protected
         */
        _target: function () {
            if (this._owner)
                return this._owner.parent();
            return null;
        },

        /**
         * @inheritdoc
         * @see Tool#getCommand()
         */
        getCommand: function () {
            var command = new CompoundCommand();
            this._operationSet().forEach(function (controller) {
                command.add(controller.getCommand(this._getSourceRequest()));
            }, this);
            return command.unwrap();
        },

        /**
         * Returns all selected controllers which understand resizing.
         * @see Tool#_createOperationSet()
         * @return {Array} a list of Controllers being operated on
         * @protected
         */
        _createOperationSet: function () {
            var list = NonTargetTracker.prototype._createOperationSet.call(this);
            ToolUtil.filterWithRequest(list, this._getSourceRequest());
            return list;
        },

        /**
         * @inheritdoc
         * @see NonTargetTracker#_createSourceRequest()
         */
        _createSourceRequest: function () {
            var request;
            request = new ChangeBoundsRequest('REQ_RESIZE');
            request.resizeDirection(this._resizeDirection());
            return request;
        },

        /**
         * @inheritdoc
         * @see Tool#_getCommandName()
         */
        _getCommandName: function () {
            return 'REQ_RESIZE';
        },

        /**
         * @inheritdoc
         * @see Tool#defaultCursor()
         */
        defaultCursor: function () {
            if (arguments.length) {
                this._defaultCursor = cursor;
            } else {
                return Cursor[this._direction];
            }
        },

        /**
         * If dragging is in progress,
         * cleans up feedback and calls _drag().
         * @see NonTargetTracker#_onMouseUp(number)
         */
        _onMouseUp: function (button) {
            if (this._stateTransition(
                Tool.STATE_DRAG_IN_PROGRESS, Tool.STATE_TERMINAL)) {
                this._eraseSourceFeedback();
                this._eraseTargetFeedback();
                this._dragEnd();
            }
            return true;
        },

        /**
         * Updates the command and the source request,
         * and shows feedback.
         * @return {boolean}
         * @see SimpleTracker#_onDragInProgress()
         * @protected
         */
        _onDragInProgress: function () {
            if (this.isInDragInProgress()) {
                this._updateSourceRequest();
                this._showSourceFeedback();
                this._showTargetFeedback();
                this._currentCommand(this.getCommand());
            }
            return true;
        },

        /**
         * @see SimpleTracker#_updateSourceRequest()
         * @protected
         */
        _updateSourceRequest: function () {

            //ChangeBoundsRequest
            var request = this._getSourceRequest();
            var d = this.getDragMoveDelta();

            var location = this.location().copy();
            var moveDelta = new Point(0, 0);
            var resizeDelta = new Dimension(0, 0);

            request.isConstrainedResize(
                this.input.isModKey(ResizeTracker.MODIFIER_CONSTRAINED_RESIZE));
            request.isCenteredResize(
                this.input.isModKey(ResizeTracker.MODIFIER_CENTERED_RESIZE));
            request.isSnapToEnabled(
                !this.input.isModKey(Tool.MODIFIER_NO_SNAPPING));

            if (request.isConstrainedResize() && this._owner) {
                this._calculateConstrainedDragDelta(d);
            }

            if (request.isCenteredResize()) {
                this._calculateCenteredDelta(d, moveDelta, resizeDelta);
            }

            this._calculateDelta(d, moveDelta, resizeDelta);

            request.moveDelta(moveDelta);
            request.resizeDelta(resizeDelta);
            request.location(location);
            request.controllers(this._operationSet());
            request.data({});
            request.resizeDirection(this._resizeDirection());

            if (request.isSnapToEnabled() && this._snapToHelper) {
                this._calculateSnapRequest(request, moveDelta, resizeDelta);
            }
    
            this._enforceConstraintsForResize(request);
        },

        _calculateConstrainedDragDelta: function (d) {
            var bounds = this._owner.view().bounds();
            var ratio = 1;

            if (bounds.hasSpace())
                ratio = parseFloat(bounds.h) / parseFloat(bounds.w);

            if (this._directionIs('SOUTH_EAST')) {
                if (d.h > (d.w * ratio))
                    d.w = parseInt(d.h / ratio);
                else
                    d.h = parseInt(d.w * ratio);
            } else if (this._directionIs('NORTH_WEST')) {
                if (d.h < (d.w * ratio))
                    d.w = parseInt(d.h / ratio);
                else
                    d.h = parseInt(d.w * ratio);
            } else if (this._directionIs('NORTH_EAST')) {
                if (-(d.h) > (d.w * ratio))
                    d.w = -parseInt(d.h / ratio);
                else
                    d.h = -parseInt(d.w * ratio);
            } else if (this._directionIs('SOUTH_WEST')) {
                if (-(d.h) < (d.w * ratio))
                    d.w = -parseInt(d.h / ratio);
                else
                    d.h = -parseInt(d.w * ratio);
            }
        },

        _calculateCenteredDelta: function (d, moveDelta, resizeDelta) {
            if (this._directionHas('NORTH')) {
                resizeDelta.h -= d.h;
            }
            if (this._directionHas('SOUTH')) {
                moveDelta.y -= d.h;
                resizeDelta.h += d.h;
            }
            if (this._directionHas('WEST')) {
                resizeDelta.w -= d.w;
            }
            if (this._directionHas('EAST')) {
                moveDelta.x -= d.w;
                resizeDelta.w += d.w;
            }
        },

        _calculateDelta: function (d, moveDelta, resizeDelta) {
            if (this._directionHas('NORTH')) {
                moveDelta.y += d.h;
                resizeDelta.h -= d.h;
            }
            if (this._directionHas('SOUTH')) {
                resizeDelta.h += d.h;
            }
            if (this._directionHas('WEST')) {
                moveDelta.x += d.w;
                resizeDelta.w -= d.w;
            }
            if (this._directionHas('EAST')) {
                resizeDelta.w += d.w;
            }
        },

        _calculateSnapRequest: function (request, moveDelta, resizeDelta) {
            var rect = this._sourceRect.copy();
            rect.translate(moveDelta);
            rect.resize(resizeDelta);
            var result = new Rectangle();

            this._snapToHelper.snapRectangle(
                    request, request.resizeDirection(), rect, result);
            if (request.isCenteredResize()) {
                if (result.x != 0)
                    result.w = result.w - result.x;
                else if (result.w != 0) {
                    result.x(-result.w);
                    result.w(result.w* 2.0);
                }

                if (result.y != 0.0)
                    result.h = result.h - result.y;
                else if (result.h != 0) {
                    result.y = -result.h;
                    result.h = result.h * 2;
                }
            }

            var moved = new Point(
                    result.x + moveDelta.x, result.y + moveDelta.y);

            var resized = new Dimension(
                    result.w + resizeDelta.w, result.h + resizeDelta.h);

            request.moveDelta(moved);
            request.resizeDelta(resized);
        },

        /**
         * Enforces resize constraints.
         * By default minimum and maximum are enforeced by the given request.
         * May be overwritten by clients to enforce additional constraints.
         * 
         * @param {ChangeBoundsRequest request}
         */
        _enforceConstraintsForResize: function (request) {
            if (this._owner) {
                var widget = this._owner.view();
                var originalConstraint = widget.bounds().copy();
                widget.translateToAbsolute(originalConstraint);
                var manipulatedConstraint = request.
                        getTransformedRectangle(originalConstraint).copy();
                widget.translateToRelative(manipulatedConstraint);
                // validate constraint (maximum and minimum size are regarded
                // to be 'normalized', i.e. relative to this widget's
                // bounds coordinates).
                manipulatedConstraint.size(Dimension.max(
                        manipulatedConstraint.size(),
                        this._minSizeFor(request)));
                manipulatedConstraint.size(Dimension.min(
                        manipulatedConstraint.size(),
                        this._maxSizeFor(request)));
                // translate back to absolute
                widget.translateToAbsolute(manipulatedConstraint);
                var newSizeDelta = manipulatedConstraint.size()
                        .getShrinked(originalConstraint.size());
                request.resizeDelta(newSizeDelta);
            }
        },

        /**
         * Determines the <em>maximum</em> size that the host can be resized to for
         * a given request. By default, a default value is returned. The value is
         * interpreted to be a dimension in the host figure's coordinate system
         * (i.e. relative to its bounds), so it is not affected by zooming affects.
         * 
         * @param {ChangeBoundsRequest} request
         * @return the minimum size
         * @Dimension 
         */
        _maxSizeFor: function (request) {
            return Widget.MAX_DIMENSION;
        },
    
        /**
         * Determines the <em>minimum</em> size that the specified child can be
         * resized to.By default, a default value is returned. The value is
         * interpreted to be a dimension in the host figure's coordinate system
         * (i.e. relative to its bounds), so it is not affected by zooming effects.
         * 
         * @param {ChangeBoundsRequest} request
         * @return {Dimension} the minimum size
         * @protected
         */
        _minSizeFor: function (request) {
            return Widget.MIN_DIMENSION;
        },

        /**
         * Returns the direction of the resize.
         * (Position.NORTH, Position.EAST, Position.NORTH_EAST ...).
         * @return {number}
         */
        _resizeDirection: function () {
            return this._direction;
        },

        /**
         * Returns true if the resize direction is equal to
         * the given direction string.
         * @param {string} direction - 'EAST', 'NORTH_EAST' ...
         * @return {boolean}
         */
        _directionIs: function (direction) {
            return this._direction === Position[direction];
        },

        /**
         * Returns true if the resize direction has bitwise value of
         * the given direction string.
         * @param {string} direction - 'EAST', 'NORTH_EAST' ...
         * @return {boolean}
         */
        _directionHas: function (direction) {
            return (this._direction & Position[direction]) !== 0;
        },

        /**
         * This method is invoked as the drag is occuring.
         * It notifies the target to show target feedback.
         * @protected
         */
        _showTargetFeedback: function () {
            this.setFlag(FLAG_TARGET_FEEDBACK, true);
            var target = this._target();
            if (target)
                target.showTargetFeedback(this._getSourceRequest());
        }
    });

    /**
     * Key modifier for centered resizing.
     */
    ResizeTracker.MODIFIER_CENTERED_RESIZE = InternalKeyEvent.CTRL;

    /**
     * Key modifier for constrained resizing.
     */
    ResizeTracker.MODIFIER_CONSTRAINED_RESIZE = InternalKeyEvent.SHIFT;

    ResizeTracker.MAX_FLAG = FLAG_TARGET_FEEDBACK;

    return ResizeTracker;
});
