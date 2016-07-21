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
 * @file RedoAction
 * @since 1.0.0
 * @author hw.shim@samsung.com
 */

define([
    'external/genetic/genetic',
    './Action'
], function (
    genetic,
    Action
) {
    'use strict';

    /**
     * A RedoAction.
     * @constructor
     */
    function RedoAction() {
        Action.apply(this, arguments);
        this.id = 'REDO';
    }

    genetic.inherits(RedoAction, Action, {

        /**
         * Redoes the last command.
         */
        run: function () {
            this._commandStack().redo();
        },

        /**
         * @return {boolean}
         * @protected
         */
        _calculateEnabled: function () {
            return this._commandStack().canRedo();
        },

        /**
         * Refreshes this action's text
         * to use the last executed command's label.
         * @protected
         */
        _refresh: function () {
            var redoCmd = this._commandStack().getRedoCommand();
            if (redoCmd) {
                var label = redoCmd.label();
                this.label(label);
                this.toolTip(label);
            }
            Action.prototype._refresh.call(this);
        }
    });

    return RedoAction;
});
