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
 * @file SelectionAction
 * @since 1.0.0
 * @author hw.shim@samsung.com
 */

define([
    'external/genetic/genetic',
    '../system/selection/Selection',
    './Action'
], function (
    genetic,
    Selection,
    Action
) {
    'use strict';

    /**
     * A SelectionAction.
     * @constructor
     */
    function SelectionAction() {
        Action.apply(this, arguments);
        this._selection_ = null;
        this._provider = null;
    }

    genetic.inherits(SelectionAction, Action, {

        /**
         * Explain
         * @param {}
         * @return {Array}
         */
        aaaa: function () {
            return this.bbb;
        },

        /**
         * Sets the current selection and emits selectionChanged event.
         * @param {Selection} selection
         *//**
         * Gets the current selection.
         * @return {Selection}
         * @protected
         */
        _selection: function (selection) {
            if (arguments.length) {
                this._selection_ = selection;
                this._onSelectionChanged();
            } else {
                return this._selection_;
            }
        },

        /**
         * Called when the selection is changed.
         * @protected
         */
        _onSelectionChanged: function () {
            this._refresh();
        },

        /**
         * Called to update the receiver.
         */
        update: function () {
            if (this._provider)
                this._selection(this._provider.selection());
            else
                this._selection(this.editor().viewer().selection());
        },

        /**
         * Returns an Array containing the currently selected objects.
         * @return {Array}
         */
        _selected: function () {
            if (!(this._selection() instanceof Selection))
                return [];
            return this._selection().toArray();
        }
    });

    return SelectionAction;
});
