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
    'graphite/graphite'
], function (
    graphite
) {
    'use strict';

    var Command = graphite.editor.command.Command;
    var genetic = graphite.util.genetic;

    /**
     * A ShapeDeleteCommand.
     * @constructor
     */
    function ShapeDeleteCommand(parent, child) {
        Command.apply(this, arguments);
        this._parent = parent;
        this._child = child;
        this._childRemoved = false;
    }

    genetic.inherits(ShapeDeleteCommand, Command, {

        /**
         * @inheritdoc
         */
        execute: function () {
            this.redo();
        },

        /*
         * @inheritdoc
         */
        redo: function () {
            this._childRemoved = this._parent.remove(this._child);
        },

        /*
         * @inheritdoc
         */
        undo: function () {
            this._parent.append(this._child);
        },

        /**
         * @inheritdoc
         */
        canUndo: function () {
            return this._childRemoved;
        },
    });

    return ShapeDeleteCommand;
});
