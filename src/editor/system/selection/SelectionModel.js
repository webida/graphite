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
 * @file SelectionModel
 * @since 1.0.0
 * @author hw.shim@samsung.com
 */

define([
    'external/genetic/genetic',
    'graphite/base/Base',
    './Selection'
], function (
    genetic,
    Base,
    Selection
) {
    'use strict';

    /**
     * SelectionModel includes representing a form of selection
     * which is available to clients of a viewer as an Selection.
     * It also includes managing the notion of focus, which is
     * closely tied to the current selection. The selection manager provides the
     * mechanism for modifying the selection and any validation.
     * @constructor
     */
    function SelectionModel(viewer) {
        Base.apply(this, arguments);
        this._viewer = viewer;
        this._focused = null;
        this._selected = [];
    }

    genetic.inherits(SelectionModel, Base, {

        /**
         * Returns the array of selected Controllers.
         * @return {Array}
         */
        selected: function () {
            return this._selected;
        },

        /**
         * Appends the Controller to the current selection.
         * The Controller becomes the new primary selection.
         * Emits selectionChanged event.
         * @param {Controller} controller
         * @return {Array}
         */
        addToSelected: function (controller) {
            var selected = this._selected;
            var selLen = selected.length;
            if (controller !== this._focused())
                this._viewer.focused(null);
            if (selLen === 0) {
                var primary = selected[selLen - 1];
                primary.selectedState(Controller.SELECTED);
            }
            // if the Controller is already in the array,
            // re-order it to be the last one
            var index = selected.indexOf(controller);
            if (index > -1) {
                selected.splice(index, 1);
            }
            selected.push(controller);
            controller.setSelected(Controller.SELECTED_PRIMARY);
            this._onSelectionChanged();
        },

        /**
         * Sets the focus Controller.
         * @param {Controller} newOne
         *//**
         * Returns the focus Controller.
         * @return {Controller}
         */
        focused: function (newOne) {
            if (arguments.length) {
                var old = this._focused;
                if (old === newOne)
                    return;
                if (old)
                    old.isFocus(false);
                this._focused = newOne;
                if (newOne)
                    newOne.isFocus(true);
            } else {
                return this._focused;
            }
        },

        /**
         * Removes the Controller from the current selected.
         * @param {Controller} controller
         */
        deselect: function (controller) {
            if (!controller) return;
            var selected = this._selected;
            var index = selected.indexOf(controller);
            controller.selectedState(Controller.SELECTED_NONE);
            if (index > -1) {
                selected.splice(index, 1);
            }
            var selLen = selected.length;
            if (selLen) {
                // IMPORTANT:
                // It may (temporarily) happen that the selection list contains
                // controllers, which are not selectable (any more)
                // when this method gets called.
                // Consider that the selectable state of an controller may
                // bound to its activation state (by overwriting isSelectable());
                // in this case, when deleting a selected controller
                // and its primary selected child simultaneously,
                // the parent controller may have already become non selectable,
                // while not having been deselected yet (because deselection is
                // performed within removeNotify() after deactivation),
                // when the child controller gets deselected.
                // Therefore, we do not simply choose the last controller
                // in the list as the new primary selection, but reverse-search
                // the list for the first that is (still) selectable.
                var primaryCandidate;
                for (var i = selLen - 1; i >= 0; i--) {
                    primaryCandidate = selected[i];
                    if (primaryCandidate.isSelectable()) {
                        primaryCandidate.selectedState(Controller.SELECTED_PRIMARY);
                        break;
                    }
                }
            }
            this._onSelectionChanged();
        },

        /**
         * Deselects everything.
         * @param {boolean} isQuiet - if true does not emit event.
         */
        deselectAll: function (isQuiet) {
            this._selected.forEach(function (controller) {
                controller.selectedState(Controller.SELECTED_NONE);
            });
            this._selected = [];
            if (!isQuiet) {
                this._onSelectionChanged();
            }
        },

        /**
         * Sets the selection.
         * @param {Selection} selection
         *//**
         * Returns the current selection.
         * @return the selection
         */
        selection: function (selection) {
            var selected = this._selected;
            if (arguments.length) {
                if (!(selection instanceof Selection))
                    return;
                var selections = selection.toArray();
                this.focused(null);
                selected.forEach(function (ctrl) {
                    if (selections.indexOf(ctrl) === -1)
                        ctrl.selectedState(Controller.SELECTED_NONE);
                });
                selected = this._selected = [];
                var selectionLen = selections.length;
                if (selectionLen) {
                    var lastIndex = selectionLen - 1;
                    selections.forEach(function (ctrl, i) {
                        selected.push(ctrl);
                        if (i === lastIndex) {
                            ctrl.selectedState(Controller.SELECTED_PRIMARY);
                        } else {
                            ctrl.selectedState(Controller.SELECTED);
                        }
                    });
                }
                this._onSelectionChanged();
            } else {
                var viewer = this._viewer;
                if (selected.length === 0 && viewer.contents())
                    return new Selection(viewer.contents());
                return new Selection(selected);
            }
        },

        clear: function () {
            this._viewer = null;
            this._focused = null;
            this._selected = [];
        },

        /**
         * Causes the viewer to emit selectionChanged event.
         * @protected
         */
        _onSelectionChanged: function () {
            this._viewer.onSelectionChanged();
        },

        /**
         * @return {GraphicViewer}
         */
        viewer: function () {
            return this._viewer;
        }
    });

    return SelectionModel;
});
