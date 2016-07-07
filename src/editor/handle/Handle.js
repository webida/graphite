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
 * An interface used by the SelectionTool to obtain a DragTracker.
 * A GraphicViewer will return a Handle at a given location.
 * The SelectionTool looks for Handles first
 * whenever the User presses the mouse button.
 * If a Handle is found, it usually offers a DragTracker,
 * although null can also be returned.
 * 
 * This is base implementation for handles.
 * This class keeps track of the typical data needed by a handle,
 * such as a drag tracker, a locator to place the handle, a cursor,
 * and the Controller to which the handle belongs. Handle implements
 * onAncestorMoved, this will automatically revalidate this handle
 * whenever the owner moves.
 * @since 1.0.0
 * @author hw.shim@samsung.com
 */

define([
    'external/genetic/genetic',
    'graphite/view/widget/svg/Rect'
], function (
    genetic,
    Rect
) {
    'use strict';

    /**
     * Creates a handle for the given Controller using the
     * given Locator and Cursor.
     * @param {Controller} owner
     * @param {Locator} locator - The locator to position the handle
     * @param {string} cursor
     *  - The cursor to display when the mouse is over the handle
     * @constructor
     */
    function Handle(owner, locator, cursor) {
        Rect.call(this);
        this._ancestorListener = null;
        this._dragTracker = null;
        this.owner(owner);
        if (locator) this.locator(locator);
        if (cursor) this.cursor(cursor);
    }

    genetic.inherits(Handle, Rect, {

        /**
         * Sets the owner for this handle.
         * @param {Controller} owner
         *//**
         * Returns the owner for this handle.
         * @return {Controller}
         */
        owner: function (owner) {
            if (arguments.length) {
                this._owner = owner;
            } else {
                return this._owner;
            }
        },

        /**
         * Sets the Locator which position this handle.
         * @param {Locator} locator
         *//**
         * Returns the Locator which position this handle.
         * @return {Locator}
         */
        locator: function (locator) {
            if (arguments.length) {
                this._locator = locator;
            } else {
                return this._locator;
            }
        },

        /**
         * Called after this Widget is added to its parent.
         * This add listener to the owner's widget.
         * @see Widget#onAdded()
         */
        onAdded: function () {
            Rect.prototype.onAdded.call(this);
            var handle = this;
            var view = this.owner().view();
            // Listen to the owner widget
            // so the handle moves when it moves.
            this._ancestorListener = function (delta) {
                handle.revalidate();
            };
            view.on('moved', this._ancestorListener);
            view.on('ancestorMoved', this._ancestorListener);
        },

        /**
         * Called before this Widget is removed from its parent.
         * @see Widget#onRemoved()
         */
        onRemoved: function () {
            var view = this.owner().view();
            view.off('moved', this._ancestorListener);
            view.off('ancestorMoved', this._ancestorListener);
            this._ancestorListener = null;
            Rect.prototype.onRemoved.call(this);
        },

        /**
         * Extends validate() to place the handle using its locator.
         * @see Widget#validate()
         */
        validate: function () {
            if (this.isValid())
                return;
            this.locator().relocate(this);
            Rect.prototype.validate.call(this);
        },

        /**
         * Sets the drag tracker for this handle.
         * @param {DragTracker} dragTracker
         *//**
         * Returns the DragTracker to use when the user clicks on this handle.
         * If the DragTracker has not been set, it will be lazily created
         * by calling _createDragTracker().
         * @return {DragTracker}
         */
        dragTracker: function (dragTracker) {
            if (arguments.length) {
                this._dragTracker = dragTracker;
            } else {
                if (!this._dragTracker) {
                    this._dragTracker = this._createDragTracker();
                }
                return this._dragTracker;
            }
        },

        /**
         * Creates a new DragTracker to be returned by dragTracker().
         * @return {DragTracker}
         * @protected
         * @abstract
         */
        _createDragTracker: function () {
            this.isInterface('_createDragTracker');
        },

        /**
         * By default, the center of the handle is returned.
         * @return {Point}
         */
        accessibleLocation: function () {
            var p = this.bounds().center();
            this.translateToAbsolute(p);
            return p;
        }
    });

    return Handle;
});
