/*
 * Copyright (c) 2012-2015 S-Core Co., Ltd.
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
 * @file Introduction
 * @since 1.0.0
 * @author hw.shim@samsung.com
 */

define([
    'external/genetic/genetic',
    'graphite/base/Base'
], function (
    genetic,
    Base
) {
    'use strict';

    /**
     * A Command.
     * @constructor
     */
    function Command(label) {
        Base.apply(this, arguments);
        if (typeof label !== 'undefined') {
            this.label(label);
        }
    }

    genetic.inherits(Command, Base, {

        /**
         * Returns true if this command can be executed.
         * @return {boolean}
         */
        canExecute: function () {
            return true;
        },

        /**
         * Returns true if the command can be undone.
         * This method should only be called after execute()
         * or redo() has been called.
         * @return {boolean}
         */
        canUndo: function () {
            return true;
        },

        /**
         * This is called to indicate that the Command will not be used again.
         * The Command may be in any state (executed, undone or redone) when
         * dispose is called. The Command should not be referenced
         * in any way after it has been disposed.
         */
        dispose: function () {
            this.desc('dispose', '', 'does nothing');
        },
    
        /**
         * Executes the Command.
         * This method should not be called if the Command is not executable.
         */
        execute: function () {
            this.desc('execute', '', 'does nothing');
        },

        /**
         * Undoes the changes performed during execute(). This method
         * should only be called after execute has been called, and
         * only when canUndo() returns true.
         * @see #canUndo()
         */
        undo: function () {
            this.desc('undo', '', 'does nothing');
        },

        /**
         * Re-executes the Command.
         * This method should only be called after undo() has been called.
         */
        redo: function () {
            this.execute();
        },

        /**
         * Sets label.
         * @param {string} label
         *//**
         * Returns label.
         * @return {string}
         */
        label: function () {
            if (arguments.length) {
                this._label = arguments[0];
            } else {
                return this._label;
            }
        }
    });

    return Command;
});
