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
 * @file Action
 * @since 1.0.0
 * @author hw.shim@samsung.com
 */

define([
    'external/genetic/genetic',
    'graphite/base/BaseEmitter'
], function (
    genetic,
    BaseEmitter
) {
    'use strict';

    /**
     * A Action.
     * @constructor
     */
    function Action(cfg) {
        BaseEmitter.apply(this, arguments);
        this._editor = cfg.editor ? cfg.editor : null;
        this.id = cfg.id ? cfg.id : null;
        this._lazyEnabled = true;
        this._enabled = true;
    }

    genetic.inherits(Action, BaseEmitter, {

        /**
         * Returns editor object for this Action.
         * @return {Object}
         */
        editor: function () {
            return this._editor;
        },

        /**
         * Sets whether this action is enabled.
         * @param {boolean}
         *//**
         * Returns whether this action is enabled.
         * @return {boolean}
         */
        isEnabled: function (value) {
            if (arguments.length) {
                this._enabled = value;
            } else {
                if (this._lazyEnabled)
                    this.isEnabled(this._calculateEnabled());
                return this._enabled;
            }
        },

        /**
         * Sets lazy calculation of the isEnabled property.
         * If this value is set to
         * true, then the action will always use _calculateEnabled()
         * whenever {@link #isEnabled()} is called.
         * 
         * Sometimes a value of false can be used to improve performance
         * and reduce the number of times {@link #_calculateEnabled()} is
         * called. However, the client must then call the {@link #update()}
         * at the proper times to force the update of enablement.
         * 
         * Sometimes a value of true can be used to improve
         * performance. If an Action only appears in a dynamic context menu,
         * then there is no reason to agressively update its enablement status
         * because the user cannot see the Action. Instead, its enablement only
         * needs to be determined when asked for, or lazily.
         * 
         * The default value for this setting is true.
         * @param {boolean}
         *//**
         * Returns lazy calculation of the isEnabled property.
         * @return {boolean}
         */
        isLazyEnabled: function (value) {
            if (arguments.length) {
                this._lazyEnabled = value;
            } else {
                return this._lazyEnabled;
            }
        },

        _calculateEnabled: function () {
            this.isInterface('_calculateEnabled');
        },

        /**
         * Called to update the receiver.
         */
        update: function () {
            this._refresh();
        },

        /**
         * Refreshes the properties of this action.
         * @protected
         */
        _refresh: function () {
            this.isEnabled(this._calculateEnabled());
        },

        /**
         * Executes the given Command using the command stack.
         * The stack is obtained by calling {@link #getCommandStack()},
         * which uses getAdapter() to retrieve the stack from the editor.
         * @param {Command} command
         * @protected
         */
        _execute: function (command) {
            if (!command || !command.canExecute())
                return;
            this._commandStack().execute(command);
        },

        /**
         * Returns the editor's command stack. This is done by asking the workbench
         * part for its CommandStack via
         * {@link org.eclipse.core.runtime.IAdaptable#getAdapter(java.lang.Class)}.
         * 
         * @return {CommandStack}
         * @protected
         */
        _commandStack: function () {
            return this.editor().commandStack();
        }
    });

    return Action;
});
