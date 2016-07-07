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
 * @file ShapeConstraintCommand
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
    var Rectangle = graphite.view.geometry.Rectangle;

    /**
     * Creates a command that can resize and/or move a shape.
     * @param {Shape} model
     * @param {ChangeBoundsRequest} request
     * @param {Rectangle} constraint
     * @constructor
     */
    function ShapeConstraintCommand(model, request, constraint) {
        if (!model || !request || !constraint) {
            throw new Error('Illegal Argument');
        }
        this._model = model;
        this._request = request;
        this._newBounds = constraint.copy();
        this._oldBounds = null;
        Command.call(this, 'shape-move/resize');
    }

    genetic.inherits(ShapeConstraintCommand, Command, {

        /**
         * @return {boolean}
         */
        canExecute: function () {
            var type = this._request.type();
            return (type === 'REQ_MOVE'
                    || type === 'REQ_MOVE_CHILDREN'
                    || type === 'REQ_RESIZE'
                    || type === 'REQ_RESIZE_CHILDREN');
        },

        /*
         * @see Command#execute()
         */
        execute: function () {
            var s = this._model.styles;
            this._oldBounds = new Rectangle(s.x, s.y, s.w, s.h);
            this.redo();
        },

        /*
         * @see Command#redo()
         */
        redo: function () {
            var newBounds = this._newBounds;
            this._model.setSize(newBounds.size());
            this._model.setLocation(newBounds.location());
        },

        /*
         * @see Command#undo()
         */
        undo: function () {
            var oldBounds = this._oldBounds;
            this._model.setSize(oldBounds.size());
            this._model.setLocation(oldBounds.location());
        }
    });

    return ShapeConstraintCommand;
});
