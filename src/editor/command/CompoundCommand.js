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
    './Command',
    './UnexecutableCommand'
], function (
    genetic,
    Command,
    UnexecutableCommand
) {
    'use strict';

    /**
     * A CompoundCommand is an aggregation of multiple Commands.
     * A CompoundCommand is executable if all of its contained Commands
     * are executable, and it has at least one contained Command.
     * The same is true for undo. When undo is called, the contained
     * Commands are undone in the reverse order in which they were executed.
     * An empty CompoundCommand is not executable.
     * 
     * A CompoundCommand can be {@link #unwrap() unwrapped}.
     * Unwrapping returns the simplest equivalent form of the CompoundCommand.
     * So, if a CompoundCommand contains just one Command,
     * that Command is returned.
     * @constructor
     */
    function CompoundCommand() {
        Command.apply(this, arguments);
        this._commands = [];
    }

    genetic.inherits(CompoundCommand, Command, {

        /**
         * Adds the specified command if it is not null.
         * @param {Command} command
         */
        add: function (command) {
            if (command) {
                this._commands.push(command);
            }
        },

        /**
         * Returns a Command that represents the chaining of
         * a specified Command to this Command.
         * The Command being chained will execute() after
         * this command has executed, and it will undo() before
         * this Command is undone.
         * @param {Command} command
         * @return {Command}
         */
        chain: function (command) {
            if (!command) {
                return this;
            }
            this.add(command);
            return this;
        },

        /**
         * @return {boolean}
         */
        canExecute: function() {
            var cmd;
            var commands = this._commands;
            var commandsLen = commands.length;
            if (commandsLen === 0)
                return false;
            for (var i = 0; i < commandsLen; i++) {
                cmd = commands[i];
                if (cmd === null)
                    return false;
                if (!cmd.canExecute())
                    return false;
            }
            return true;
        },

        /**
         * @return {boolean}
         */
        canUndo: function() {
            var cmd;
            var commands = this._commands;
            var commandsLen = commands.length;
            if (commandsLen === 0)
                return false;
            for (var i = 0; i < commandsLen; i++) {
                cmd = commands[i];
                if (cmd === null)
                    return false;
                if (!cmd.canUndo())
                    return false;
            }
            return true;
        },

        /**
         * Disposes all contained Commands.
         */
        dispose: function() {
            this._commands.forEach(function (cmd) {
                cmd.dispose();
            });
        },

        /**
         * Executes all of the commands it contains.
         */
        execute: function() {
            this._commands.forEach(function (cmd) {
                cmd.execute();
            });
        },

        /**
         * Returns array of compound commands
         * @return {Array}
         */
        getCommands: function () {
            return this._commands;
        },

        /**
         * Returns true if the CompoundCommand is empty
         * @return {boolean}
         */
        isEmpty: function() {
            return !this._commands.length;
        },

        /**
         * Returns the number of contained Commands.
         * @return {number}
         */
        size: function () {
            return this._commands.length;
        },

        /** @inheritdoc */
        undo: function () {
            var commands = this._commands;
            var i = commands.length;
            while (i--) {
                commands[i].undo();
            }
        },

        /** @inheritdoc */
        redo: function () {
            this._commands.forEach(function (cmd) {
                cmd.redo();
            });
        },

        /**
         * Returns the simplest form of this Command
         * that is equivalent. This is useful for
         * removing unnecessary nesting of Commands.
         * @return {Command}
         */
        unwrap: function () {
            switch (this.size()) {
            case 0:
                return UnexecutableCommand.SINGLETON;
            case 1:
                return this._commands[0];
            default:
                return this;
            }
        }
    });

    return CompoundCommand;
});
