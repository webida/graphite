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
 * This adds resizing ability to a Widget by overriding
 * _createSelectionHandles(). This class extends Movable,
 * so it can move widget also. The eight square handles will resize
 * the current selection in the eight primary directions.
 * @since 1.0.0
 * @author hw.shim@samsung.com
 */

define([
    'external/genetic/genetic',
    'graphite/view/geometry/Position',
    '../handle/HandleKit',
    '../request/ChangeBoundsRequest',
    '../tool/ResizeTracker',
    './Movable'
], function (
    genetic,
    Position,
    HandleKit,
    ChangeBoundsRequest,
    ResizeTracker,
    Movable
) {
    'use strict';

    /**
     * Constructs a new Resizable.
     * @constructor
     */
    function Resizable() {
        Movable.apply(this, arguments);
        this._resizeDirections = Position.NSEW;
    }

    genetic.inherits(Resizable, Movable, {

        /**
         * @return {Command}
         * @see Ability#getCommand(Request)
         */
        getCommand: function (request) {
            if (request.type() === 'REQ_RESIZE') {
                return this._getResizeCommand(request);
            }
            return Movable.prototype.getCommand.call(this, request);
        },

        /**
         * Returns the command contribution for the given resize request.
         * By default, the request is re-dispatched to the host's parent
         * as a 'REQ_RESIZE_CHILDREN' type. The parent's Abilities determine
         * how to perform the resize based on the layout manager in use.
         * 
         * @param {ChangeBoundsRequest} request
         * @return {Command} the command contribution obtained from the parent
         * @protected
         */
        _getResizeCommand: function (request) {
            var req = new ChangeBoundsRequest('REQ_RESIZE_CHILDREN');
            req.controllers(this.host());
            req.isCenteredResize(request.isCenteredResize());
            req.isConstrainedMove(request.isConstrainedMove());
            req.isConstrainedResize(request.isConstrainedResize());
            req.isSnapToEnabled(request.isSnapToEnabled());
            req.moveDelta(request.moveDelta());
            req.resizeDelta(request.resizeDelta());
            req.location(request.location());
            req.data(request.data());
            req.resizeDirection(request.resizeDirection());
            return this.host().parent().getCommand(req);
        },

        /**
         * @see Ability#understands(Request)
         */
        understands: function (request) {
            if (request.type() === 'REQ_RESIZE') {
                // check all resize directions of the request are supported
                var dir = request.resizeDirection();
                return (dir & this.resizeDirections()) === dir;
            }
            return Movable.prototype.understands.call(this, request);
        },

        /**
         * Sets the directions in which handles should allow resizing.
         * Valid values are bit-wise combinations of:
         * Position.NORTH
         * Position.SOUTH
         * Position.EAST
         * Position.WEST
         * @param {number} dirs
         *//**
         * Returns the directions in which handles should allow resizing.
         * Valid values are bit-wise combinations of:
         * Position.NORTH
         * Position.SOUTH
         * Position.EAST
         * Position.WEST
         * @param {number} dirs
         */
        resizeDirections: function (dirs) {
            if (arguments.length) {
                this._resizeDirections = dirs;
            } else {
                return this._resizeDirections;
            }
        },

        /**
         * @return {Array}
         * @see HandleSelectable#_createSelectionHandles()
         * @protected
         * @override
         * @TODO rename method
         */
        _createSelectionHandles: function () {
            if (this._resizeDirections === Position.NONE) {
                return Movable.prototype._createSelectionHandles.call(this);
            }
            var handles = [];
            this._createMoveHandle(handles);
            this._createResizeHandle(handles, Position.EAST);
            this._createResizeHandle(handles, Position.WEST);
            this._createResizeHandle(handles, Position.SOUTH);
            this._createResizeHandle(handles, Position.NORTH);
            this._createResizeHandle(handles, Position.NORTH_EAST);
            this._createResizeHandle(handles, Position.NORTH_WEST);
            this._createResizeHandle(handles, Position.SOUTH_EAST);
            this._createResizeHandle(handles, Position.SOUTH_WEST);
            return handles;
        },

        _hasResizeDirection: function (direction) {
            return (this._resizeDirections & direction) === direction;
        },

        /**
         * Creates a 'resize' handle, which uses a {@link ResizeTracker}
         * in case resizing is allowed in the respective direction,
         * otherwise returns a drag handle by delegating to
         * {@link Movable#_createDragHandle(handles, direction)}.
         * 
         * @param {Array} handles
         *  - The array of handles to add the resize handle to
         * @param {number} direction
         *  - A position constant indicating the direction to create the
         *    handle for
         * @protected
         */
        _createResizeHandle: function (handles, direction) {
            if (this._hasResizeDirection(direction)) {
                handles.push(HandleKit.createHandle(
                    this.host(),
                    direction,
                    this._getResizeTracker(direction)));
            } else {
                // display 'resize' handle to allow dragging
                // or indicate selection only
                this._createDragHandle(handles, direction);
            }
        },

        /**
         * Returns a resize tracker for the given direction
         * to be used by a resize handle.
         * @param {number} direction
         * @return {ResizeTracker}
         * @protected
         */
        _getResizeTracker: function (direction) {
            return new ResizeTracker(this.host(), direction);
        },

        /**
         * Dispatches erase requests to more specific methods.
         * @param {Request} request
         * @see Ability#eraseSourceFeedback(Request)
         */
        eraseSourceFeedback: function (request) {
            if (request.type() === 'REQ_RESIZE')
                this._eraseChangeBoundsFeedback(request);
            else
                Movable.prototype._eraseChangeBoundsFeedback.call(
                        this, request);
        },
    
        /**
         * @param {Request} request
         * @see Ability#showSourceFeedback(Request)
         */
        showSourceFeedback: function (request) {
            if (request.type() === 'REQ_RESIZE') {
                this._showChangeBoundsFeedback(request);
            } else {
                Movable.prototype._showChangeBoundsFeedback.call(
                        this, request);
            }
        }
    });

    return Resizable;
});
