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
 * @file CommandStack
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
     * An implementation of a command stack.
     * A stack manages the executing, undoing, and redoing of Commands.
     * Executed commands are pushed onto a stack for undoing later.
     * Commands which are undone are pushed onto a redo stack.
     * Whenever a new command is executed, the Redo stack is flushed.
     *
     * A CommandStack contains a dirty property. This property can be used to
     * determine when persisting changes is required. The stack is dirty
     * whenever the last executed or redone command is different than
     * the command that was at the top of the undo stack when
     * {@link #markSaveLocation()} was last called.
     * 
     * Initially, the undo stack is empty, and not dirty.
     * @constructor
     */
    function CommandStack() {
        BaseEmitter.apply(this, arguments);
        this._undoLimit = 0;
        this._saveLocation = 0;
        this._undoable = []; //used as a Stack
        this._redoable = []; //used as a Stack
    }

    function CommandStackEvent(state, command) {
        this.state = state;
        this.command = command;
    }

    var privates = {
        flushRedo: function () {
            while (this._redoable.length)
                this._redoable.pop().dispose();
        },
        flushUndo: function () {
            while (this._undoable.length)
                this._undoable.pop().dispose();
        }
    };

    genetic.inherits(CommandStack, BaseEmitter, {

        /**
         * Executes the specified Command if possible. Prior to executing the
         * command, a CommandStackEvent for {@link #PRE_EXECUTE} will be emited.
         * Similarly, after attempting to execute the command, an event for
         * {@link #POST_EXECUTE} will be emited.
         * @param {Command} command
         * @return {Array}
         */
        execute: function (command) {
            if (!command || !command.canExecute())
                return;
            privates.flushRedo.call(this);
            this._emit('preStackChange', 'PRE_EXECUTE', command);
            try {
                command.execute();
                var undoLimit = this.undoLimit();
                var undoable = this._undoable;
                if (undoLimit > 0) {
                    while (undoable.length >= undoLimit) {
                        undoable.shift().dispose();
                        if (this._saveLocation > -1)
                            this._saveLocation--;
                    }
                }
                if (this._saveLocation > undoable.length)
                    this._saveLocation = -1;
                undoable.push(command);
            } finally {
                this._emit('postStackChange', 'POST_EXECUTE', command);
            }
        },

        /**
         * @param {string} eventName
         * @param {string} state
         * @param {Command} command
         * @protected
         */
        _emit: function (eventName, state, command) {
            state = CommandStack[state] || null;
            this.emit(eventName,
                    new CommandStackEvent(state, command));
        },

        /**
         * Sets the undo limit.
         * The undo limit is the maximum number of operations
         * that the User can undo. -1 means no-limit.
         * @param {number} undoLimit
         *//**
         * Returns the undo limit.
         * @return {number}
         */
        undoLimit: function (undoLimit) {
            if (arguments.length) {
                this._undoLimit = undoLimit;
            } else {
                return this._undoLimit;
            }
        },

        /**
         * Undoes the most recently executed (or redone) Command. The Command is
         * popped from the undo stack to and pushed onto the redo stack. This method
         * should only be called when {@link #canUndo()} returns true.
         */
        undo: function () {
            this.desc('undo');
            var command = this._undoable.pop();
            this._emit('preStackChange', 'PRE_UNDO', command);
            try {
                command.undo();
                this._redoable.push(command);
            } finally {
                this._emit('postStackChange', 'POST_UNDO', command);
            }
        },

        /**
         * Calls redo on the Command at the top of the redo stack, and pushes
         * that Command onto the undo stack. This method should only be
         * called when {@link #canUndo()} returns true.
         */
        redo: function () {
            this.desc('redo');
            if (!this.canRedo())
                return;
            var command = this._redoable.pop();
            this._emit('preStackChange', 'PRE_REDO', command);
            try {
                command.redo();
                this._undoable.push(command);
            } finally {
                this._emit('postStackChange', 'POST_REDO', command);
            }
        },
    
        /**
         * @return {boolean}
         */
        canUndo: function () {
            var undoable = this._undoable;
            var len = undoable.length;
            if (len === 0)
                return false;
            return undoable[len - 1].canUndo();
        },

        /**
         * @return {boolean}
         */
        canRedo: function () {
            return !!this._redoable.length;
        },

        /**
         * This will dispose all the commands in both the undo and
         * redo stack. Both stacks will be empty afterwards.
         */
        dispose: function () {
            privates.flushUndo.call(this);
            privates.flushRedo.call(this);
        },

        /**
         * Flushes the entire stack and resets the save location to zero.
         * This method might be called when performing "revert to saved".
         */
        flush: function () {
            privates.flushRedo.call(this);
            privates.flushUndo.call(this);
            this._saveLocation = 0;
            this._emit('postStackChange');
        },

        /**
         * Marks the last executed or redone Command as the point at which
         * the changes were saved. Calculation of {@link #isDirty()} will be
         * based on this checkpoint.
         */
        markSaveLocation: function () {
            this._saveLocation = this._undoable.length;
            this._emit('postStackChange');
        },

        /**
         * Returns true if the stack is dirty. The stack is dirty whenever
         * the last executed or redone command is different than the command
         * that was at the top of the undo stack
         * when {@link #markSaveLocation()} was last called.
         * @return {boolean}
         */
        isDirty: function () {
            return this._undoable.length !== this._saveLocation;
        },

        /**
         * Peeks at the top of the undo stack. This is useful for describing
         * to the User what will be undone. The returned Command has a
         * label describing it.
         * @return {Command} - the top of the undo stack
         */
        getUndoCommand: function () {
            var undoable = this._undoable;
            var len = undoable.length;
            return len ? undoable[len - 1] : null;
        },

        /**
         * Peeks at the top of the redo stack. This is useful for describing
         * to the User what will be redone. The returned Command has a
         * label describing it.
         * @return {Command} - the top of the redo stack
         */
        getRedoCommand: function () {
            var redoable = this._redoable;
            var len = redoable.length;
            return len ? redoable[len - 1] : null;
        },

        /**
         * Returns an array containing all commands
         * in the order they were executed.
         * @return {Array}
         */
        getCommands: function () {
            return this._undoable.concat(this._redoable.reverse());
        }
    });

    CommandStack.PRE_EXECUTE = 1;
    CommandStack.PRE_REDO = 2;
    CommandStack.PRE_UNDO = 4;
    CommandStack.PRE = 1 | 2 | 4;
    CommandStack.POST_EXECUTE = 8;
    CommandStack.POST_REDO = 16;
    CommandStack.POST_UNDO = 32;
    CommandStack.POST = 8 | 16 | 32;

    return CommandStack;
});
