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
 * @file Selectable
 * @since 1.0.0
 * @author hw.shim@samsung.com
 */

define([
    'external/genetic/genetic',
    './Ability'
], function (
    genetic,
    Ability
) {
    'use strict';

    /**
     * A host selectable ability. The selection of the host includes
     * whether or not it has focus. Subclasses will typically decorate
     * the Controller with things like selection handles and/or focus feedback.
     * This adds itself as a 'selectionChanged' event so that it can
     * observe selection. When selection or focus changes, this will
     * update itself and call the appropriate methods.
     * @constructor
     */
    function Selectable() {
        Ability.apply(this, arguments);
        this._state = null;
        this._focus = false;
        this._selectionListener = null;
    }

    genetic.inherits(Selectable, Ability, {

        /**
         * Extends activate to hook the appropriate listener
         * and to initialize the visual changes
         * for representing selection/focus.
         * @see Ability#activate()
         */
        activate: function () {
            Ability.prototype.activate.call(this);
            var host = this.host();
            this._addSelectionListener();
            this._selectedState(host.selectedState());
            this._setFocus(host.isFocus());
        },

        /**
         * @see Ability#getTarget(Request)
         */
        getTarget: function (request) {
            if ('REQ_SELECTION' === request.type())
                return this.host();
            return null;
        },

        /**
         * Adds a Listener to the host to observe selection/focus.
         * @protected
         */
        _addSelectionListener: function () {
            var that = this;
            this._selectionListener = function (controller) {
                that._selectedState(controller.selectedState());
                that._setFocus(controller.isFocus());
            };
            this.host().on('selectionChanged', this._selectionListener);
        },

        /**
         * Removes the Listener used to observe selection.
         * @protected
         */
        _removeSelectionListener: function () {
            this.host().off('selectionChanged', this._selectionListener);
        },

        /**
         * Sets the internal selection value.
         * This method is called automatically by the listener.
         * If the selection value is changed, the appropriate method
         * is called to show the specified selection type.
         * @param {string} state - the type of selection
         * @protected
         */
        _selectedState: function (state) {
            if (this._state === state)
                return;
            this._state = state;
            if (state === 'SELECTED_PRIMARY')
                this._showPrimarySelection();
            else if (state === 'SELECTED')
                this._showSelection();
            else
                this._hideSelection();
        },

        /**
         * Calls {@link #_showSelection()} by default.
         * Override to distinguish between primary and normal selection.
         * @protected
         */
        _showPrimarySelection: function () {
            this._showSelection();
        },

        /**
         * Override to show selection.
         * @protected
         */
        _showSelection: function () {
            this.desc('_showSelection');
        },

        /**
         * Override to hide selection.
         * @protected
         */
        _hideSelection: function () {
            this.desc('_hideSelection');
        },

        /**
         * Sets the internal focus value.
         * This method is called automatically by the listener.
         * If the focus value is changed, either {@link #showFocus()} or
         * {@link #hideFocus()} will be called.
         * @param {boolean} value - true if the Ability should show focus
         * @protected
         */
        _setFocus: function (value) {
            if (this._focus === value)
                return;
            this._focus = value;
            if (value)
                this._showFocus();
            else
                this._hideFocus();
        },

        /**
         * Override to show focus.
         * @protected
         */
        _showFocus: function () {
        },

        /**
         * Override to hide focus
         * @protected
         */
        _hideFocus: function () {
        },

        /**
         * Extends deactivate to unhook the seleciton listener and to remove the
         * visual changes for representing selection/focus.
         * 
         * @see Ability#deactivate()
         */
        deactivate: function () {
            removeSelectionListener();
            this._selectedState('SELECTED_NONE');
            this._setFocus(false);
            Ability.prototype.deactivate.call(this);
        }
    });

    return Selectable;
});
