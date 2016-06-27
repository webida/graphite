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
 * @file SelectTracker
 * @since 1.0.0
 * @author hw.shim@samsung.com
 */

define([
    'external/genetic/genetic',
    'graphite/view/system/event/InternalKeyEvent',
    'graphite/view/system/event/InternalMouseEvent',
    '../request/DirectEditRequest',
    '../request/SelectionRequest',
    './TargetingTool',
    './Tool'
], function (
    genetic,
    InternalKeyEvent,
    InternalMouseEvent,
    DirectEditRequest,
    SelectionRequest,
    TargetingTool,
    Tool
) {
    'use strict';

    var Controller = {
        SELECTED_NONE: 0,
        SELECTED: 1,
        SELECTED_PRIMARY: 2
    };
    var BUTTON = InternalMouseEvent.BUTTON;
    var FLAG_ENABLE_DIRECT_EDIT = TargetingTool.MAX_FLAG << 2;

    /**
     * A SelectTracker is a DragTracker used to
     * select, edit, and open Controllers.
     * @param {Controller} owner
     * @constructor
     */
    function SelectTracker(owner) {
        TargetingTool.apply(this, arguments);
        this._source(owner);
    }

    genetic.inherits(SelectTracker, TargetingTool, {

        /**
         * @inheritdoc
         * @override
         */
        _calculateCursor: function () {
            if (this._isInState(Tool.STATE_INITIAL
                    | Tool.STATE_DRAG | Tool.STATE_ACCESSIBLE_DRAG))
                return this.defaultCursor();
            return TargetingTool.prototype._calculateCursor.call(this);
        },

        /**
         * Calls {@link #_open()} if the double click was with mouse LEFT
         * @param {number} button
         * @return {boolean}
         * @protected
         */
        _onDblClick: function (button) {
            this.setFlag(FLAG_ENABLE_DIRECT_EDIT, false);
            if (button === BUTTON.LEFT) {
                // Prevent selection from happening later on mouse up
                this.setFlag(SelectTracker.FLAG_SELECTION_PERFORMED, true);
                this._open();
            }
            return true;
        },

        /**
         * Creates a SelectionRequest and sends it to the source Controller
         * via Controller#request(Request). Possible uses are to open
         * the selected item in another editor or replace the current editor's
         * contents based on the selected item.
         */
        _open: function () {
            var request = new SelectionRequest();
            request.location(this.location());
            request.modifiers(this.input.modifiers);
            request.type('REQ_OPEN');
            this._source().request(request);
        },

        /**
         * Performs a conditional selection if needed
         * (if right or left mouse button have been pressed) and
         * goes into the drag state. If any other button has
         * been pressed, the tool goes into the invalid state.
         * @inheritdoc
         * @override
         */
        _onMouseDown: function (button) {
            console.log("this._isInState(Tool.STATE_TERMINAL)", this._isInState(Tool.STATE_TERMINAL));
            console.log("this._state()", this._state());
            if ((button === BUTTON.LEFT || button === BUTTON.RIGHT)
                    && this._isInState(Tool.STATE_INITIAL))
                this._conditionalSelection();
            if (button !== BUTTON.LEFT) {
                this._state(Tool.STATE_INVALID);
                if (button === BUTTON.RIGHT)
                    this._state(Tool.STATE_TERMINAL);
                this._onInvalidInput();
            } else {
                this._stateTransition(Tool.STATE_INITIAL, Tool.STATE_DRAG);
            }
            return true;
        },

        /**
         * If in the drag state, the tool selects the source Controller.
         * If the Controller was already selected, {@link #_directEdit()}
         * is called. If the Controller is newly selected and not completely
         * visible, {@link GraphicViewer#reveal(Controller)} is called
         * to show the selected Controller.
         * @inheritdoc
         * @override
         */
        _onMouseUp: function (button) {
            this.desc('_onMouseUp');
            if (this._isInState(Tool.STATE_DRAG)) {
                var source = this._source();
                this._select();
                if (this.getFlag(FLAG_ENABLE_DIRECT_EDIT))
                    this._directEdit();
                if (button === BUTTON.LEFT
                        && source.selectedState() !== Controller.SELECTED_NONE)
                    this.viewer().reveal(source);
                this._state(Tool.STATE_TERMINAL);
                return true;
            }
            return false;
        },

        /**
         * Creates a {@link DirectEditRequest} and sends it to a
         * DelayedDirectEditHelper to allow the user to directly edit.
         * @protected
         */
        _directEdit: function () {
            var source = this._source();
            var req = new DirectEditRequest();
            req.location(this.input.mouseLocation);
            new DelayedDirectEditHelper(source.viewer(), req, source);
        },

        /**
         * @inheritdoc
         * @override
         */
        _onDragStarted: function () {
            return this._stateTransition(
                    Tool.STATE_DRAG, Tool.STATE_DRAG_IN_PROGRESS);
        },

        /**
         * Performs the appropriate selection action based on the selection state of
         * the source and the modifiers (CTRL and SHIFT). If no modifier key is
         * pressed, the source will be set as the only selection. If the CTRL key is
         * pressed and the edit part is already selected, it will be deselected. If
         * the CTRL key is pressed and the edit part is not selected, it will be
         * appended to the selection set. If the SHIFT key is pressed, the source
         * will be appended to the selection.
         * @protected
         */
        _select: function () {
            if (this._isSelectionOccurred()) return;
            this.setFlag(SelectTracker.FLAG_SELECTION_PERFORMED, true);
            var viewer = this.viewer();
            var source = this._source();
            var selected = viewer.selected();

            if (this.input.isModKey(InternalKeyEvent.CTRL)) {
                if (selected.indexOf(source) > -1)
                    viewer.deselect(source);
                else
                    viewer.addToSelected(source);
            } else if (this.input.isModKey(InternalKeyEvent.SHIFT))
                viewer.addToSelected(source);
            else
                viewer.select(source);
        },

        /**
         * Returns true if selection has already occured.
         * @return {boolean}
         * @protected
         */
        _isSelectionOccurred: function () {
            return this.getFlag(SelectTracker.FLAG_SELECTION_PERFORMED);
        },

        /**
         * Calls {@link #performSelection()} if the source is not selected. If the
         * source is selected and there are no modifier keys pressed (i.e. the user
         * isn't selecting multiple edit parts or deselecting edit parts), sets the
         * direct edit flag so that when the mouse is released, a direct edit will
         * be performed.
         * @protected
         */
        _conditionalSelection: function () {
            this.desc('_conditionalSelection');
            if (this._source().selectedState() === Controller.SELECTED_NONE)
                this._select();
            else if (this.input.modifiers === 0)
                this.setFlag(FLAG_ENABLE_DIRECT_EDIT, true);
        },

        /**
         * @inheritdoc
         * @override
         */
        _getCommandName: function () {
            return 'Select Tracker';
        },

        /**
         * Sets the source Controller.
         * @param {Controller}
         *//**
         * Returns the source Controller.
         * @return {Controller}
         */
        _source: function (source) {
            if (arguments.length) {
                this._source_ = source;
            } else {
                return this._source_;
            }
        },

        /**
         * Extended to reset the target lock flag.
         * @protected
         * @override
         */
        _resetFlags: function () {
            TargetingTool.prototype._resetFlags.call(this);
            this.setFlag(SelectTracker.FLAG_SELECTION_PERFORMED, false);
            this.setFlag(FLAG_ENABLE_DIRECT_EDIT, false);
        },
    });

    /** Flag to indicate selection has been performed. */
    SelectTracker.FLAG_SELECTION_PERFORMED = TargetingTool.MAX_FLAG << 1;

    /** Max flag */
    SelectTracker.MAX_FLAG = FLAG_ENABLE_DIRECT_EDIT;

    return SelectTracker;
});
