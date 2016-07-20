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
 * @file DeleteAction
 * @since 1.0.0
 * @author hw.shim@samsung.com
 */

define([
    'external/genetic/genetic',
    '../command/Command',
    '../controller/Controller',
    '../request/GroupRequest',
    './SelectionAction'
], function (
    genetic,
    Command,
    Controller,
    GroupRequest,
    SelectionAction
) {
    'use strict';

    /**
     * A DeleteAction.
     * @constructor
     */
    function DeleteAction(cfg) {
        SelectionAction.apply(this, arguments);
        this.id = 'DELETE';
        this.isLazyEnabled(false);
    }

    genetic.inherits(DeleteAction, SelectionAction, {

        /**
         * Performs the delete action on the selected objects.
         */
        run: function () {
            this._execute(this.createDeleteCommand(this._selected()));
        },

        /**
         * Returns true if the selected objects can be deleted.
         * Returns false if there are no objects selected or
         * the selected objects are not Controllers.
         * @return {boolean}
         * @protected
         */
        _calculateEnabled: function () {
            var cmd = this.createDeleteCommand(this._selected());
            if (!cmd)
                return false;
            return cmd.canExecute();
        },

        /**
         * Create a command to remove the selected objects.
         * @param {Array} objects
         * @return {Command}
         */
        createDeleteCommand: function (objects) {
            if (objects.length === 0)
                return null;
            if (!(objects[0] instanceof Controller))
                return null;

            var deleteReq = new GroupRequest('REQ_DELETE');
            deleteReq.controllers(objects);

            var compoundCmd = new Command.CompoundCommand('Delete Widget');
            objects.forEach(function (controller) {
                var cmd = controller.getCommand(deleteReq);
                if (cmd)
                    compoundCmd.add(cmd);
            });
            return compoundCmd;
        }
    });

    return DeleteAction;
});
