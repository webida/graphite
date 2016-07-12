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
 * @file Movable
 * @since 1.0.0
 * @author hw.shim@samsung.com
 */

define([
    'external/genetic/genetic',
    'graphite/view/geometry/Position',
    'graphite/view/widget/svg/Rect',
    '../handle/HandleKit',
    '../request/ChangeBoundsRequest',
    '../tool/MoveTracker',
    '../tool/SelectTracker',
    './HandleSelectable'
], function (
    genetic,
    Position,
    Rect,
    HandleKit,
    ChangeBoundsRequest,
    MoveTracker,
    SelectTracker,
    HandleSelectable
) {
    'use strict';

    /**
     * Provide support for selecting and positioning a non-resizable
     * Controller. Selection is indicated via four square handles
     * at each corner of the Controller's Widget, and a rectangular handle
     * that outlines the Widget with a 1-pixel black line.
     * All of these handles return MoveTracker, which allows the current
     * selection to be dragged.
     * 
     * During feedback, a simple rectangle is drawn.
     * Subclasses can customize this feedback.
     * @constructor
     */
    function Movable() {
        HandleSelectable.apply(this, arguments);
        this._isDragAllowed = true;
        this._feedback = null;
    }

    genetic.inherits(Movable, HandleSelectable, {

        /**
         * @return {Array}
         * @see HandleSelectable#_createSelectionHandles()
         * @protected
         * @implemented
         * @TODO rename method
         */
        _createSelectionHandles: function () {
            var handles = [];
            this._createMoveHandle(handles);
            this._createDragHandle(handles, Position.NORTH_EAST);
            this._createDragHandle(handles, Position.NORTH_WEST);
            this._createDragHandle(handles, Position.SOUTH_EAST);
            this._createDragHandle(handles, Position.SOUTH_WEST);
            return handles;
        },

        /**
         * Creates a 'move' handle,
         * which uses a {@link MoveTracker} in case
         * {@link #isDragAllowed()} returns true,
         * and a {@link SelectTracker} otherwise.
         * @param {Array} handles
         *  - The Array of handles to add the move handle to.
         * @protected
         */
        _createMoveHandle: function (handles) {
            var host = this.host();
            if (this.isDragAllowed()) {
                // display 'move' handle to allow dragging
                handles.push(HandleKit.createMoveHandle(
                        host, this._getMoveTracker(), 'move'));
            } else {
                // display 'move' handle only to indicate selection
                handles.push(HandleKit.createMoveHandle(
                        host, this._getSelectTracker(), 'default'));
            }
        },

        /**
         * Creates a 'resize'/'drag' handle,
         * which uses a {@link MoveTracker} in case
         * {@link #isDragAllowed()} returns true,
         * and a {@link SelectTracker} otherwise.
         * 
         * @param {Array} handles
         * - The Array of handles to add the resize handle to
         * @param {number} direction
         * - A constant indicating the direction to create the handle for
         * @protected
         */
        _createDragHandle: function (handles, direction) {
            var host = this.host();
            if (this.isDragAllowed()) {
                // display 'resize' handles to allow dragging.
                // (drag tracker)
                handles.push(HandleKit.createHandle(
                        host, direction, this._getMoveTracker(), 'move'));
            } else {
                // display 'resize' handles to indicate selection only.
                // (selection tracker)
                handles.push(HandleKit.createHandle(
                        host, direction, this._getSelectTracker(), 'default'));
            }
        },

        /**
         * Returns true if this Ability allows its host to be dragged.
         * @return {boolean} true if the host can be dragged.
         */
        isDragAllowed: function () {
            return this._isDragAllowed;
        },

        /**
         * Returns a selection tracker to use by a selection handle.
         * @return {SelectTracker} - a new ResizeTracker
         * @protected
         */
        _getSelectTracker: function () {
            return new SelectTracker(this.host());
        },
    
        /**
         * Returns a drag tracker to use by a resize handle.
         * @return {MoveTracker} a new ResizeTracker
         * @protected
         */
        _getMoveTracker: function () {
            return new MoveTracker(this.host());
        },

        /**
         * Returns true for move, align, add, and orphan request types.
         * This method is never called for some of these types,
         * but they are included for possible future use.
         * 
         * @param {Request} request
         * @return {boolean} - true if the Ability understands the request
         * @see Ability#understands(Request)
         */
        understands: function (request) {
            var type = request.type();
            if (type === 'REQ_MOVE')
                return this.isDragAllowed();
            else if (type === 'REQ_CLONE'
                    || type === 'REQ_ADD'
                    || type === 'REQ_ORPHAN'
                    || type === 'REQ_ALIGN')
                return true;
            return HandleSelectable.prototype.understands.call(this, request);
        },

        /**
         * Calls other methods as appropriate.
         * @param {Request} request
         * @see Ability#showSourceFeedback(Request)
         */
        showSourceFeedback: function (request) {
            var type = request.type();
            if ((type === 'REQ_MOVE' && this.isDragAllowed())
                    || type === 'REQ_ADD'
                    || type === 'REQ_CLONE')
                this._showChangeBoundsFeedback(request);
        },

        /**
         * Shows or updates feedback for a change bounds request.
         * @param {ChangeBoundsRequest} request
         * @protected
         */
        _showChangeBoundsFeedback: function (request) {
            this.desc('_showChangeBoundsFeedback', request);
            var feedback = this._getDragSourceFeedback();
            var rect = this._feedbackBounds().copy();
            this.host().view().translateToAbsolute(rect);
            rect.translate(request.moveDelta());
            rect.resize(request.resizeDelta());
            feedback.translateToRelative(rect);
            feedback.bounds(rect);
        },

        /**
         * Lazily creates and returns the feedback used during drags.
         * @return the feedback figure
         * @protected
         */
        _getDragSourceFeedback: function () {
            if (!this._feedback)
                this._feedback = this._createDragSourceFeedback();
            return this._feedback;
        },

        /**
         * Creates the feedback Widget.
         * @return {Widget}
         * @protected
         */
         _createDragSourceFeedback: function () {
            // Use a ghost rectangle for feedback
            var r = new Rect();
            r.bgColor('lightgray');
            r.css({'opacity': 0.5});
            r.bounds(this._feedbackBounds());
            r.validate();
            this._addFeedback(r);
            return r;
        },

        /**
         * Returns the bounds of the host's Widget by reference
         * to be used to calculate the initial location of the feedback.
         * The returned Rectangle should not be modified.
         * Uses handle bounds if available.
         * @return {Rectangle}
         */
        _feedbackBounds: function () {
            var view = this.host().view();
            if (typeof view.handleBounds === 'function')
                return view.handleBounds();
            return view.bounds();
        },

        /**
         * @param {Request} request
         * @see Ability#eraseSourceFeedback(Request)
         */
        eraseSourceFeedback: function (request) {
            var type = request.type();
            if ((type === 'REQ_MOVE' && this.isDragAllowed())
                    || type === 'REQ_ADD'
                    || type === 'REQ_CLONE')
                this._eraseChangeBoundsFeedback(request);
        },

        /**
         * Erases drag feedback. This method called whenever
         * an erase feedback request is received of the appropriate type.
         * @param {ChangeBoundsRequest} request
         * @protected
         */
        _eraseChangeBoundsFeedback: function (request) {
            if (this._feedback) {
                this._removeFeedback(this._feedback);
            }
            this._feedback = null;
        },

        /**
         * @param {Request} request
         * @return {Command}
         * @see Ability#getCommand(Request)
         */
        getCommand: function (request) {
            var type = request.type();
            if (type === 'REQ_MOVE' && this.isDragAllowed())
                return this._getMoveCommand(request);
            if (type === 'REQ_ORPHAN')
                return this._getOrphanCommand(request);
            if (type === 'REQ_ALIGN')
                return getAlignCommand(request);
    
            return null;
        },

        /**
         * Returns the command contribution to a change bounds request.
         * The implementation actually redispatches the request
         * to the host's parent 'REQ_MOVE_CHILDREN' type request.
         * The parent's contribution is returned.
         * 
         * @param {ChangeBoundsRequest} request
         * @return {Command}
         * @protected
         */
        _getMoveCommand: function (request) {
            var req = new ChangeBoundsRequest('REQ_MOVE_CHILDREN');
            req.controllers([this.host()]);
            req.moveDelta(request.moveDelta());
            req.resizeDelta(request.resizeDelta());
            req.location(request.location());
            req.data(request.data());
            return this.host().parent().getCommand(req);
        },

        /**
         * Subclasses may override to contribute to the orphan request.
         * By default, null is returned to indicate no participation.
         * Orphan requests are not forwarded to the host's parent here.
         * That is done in {@link Nestable}.
         * So, if the host has a Nestable ability,
         * then the parent will already have a chance to contribute.
         * 
         * @param {Request} req - the orphan request
         * @return {Command}
         * @protected
         */
        _getOrphanCommand: function (req) {
            return null;
        }
    });

    return Movable;
});
