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
    './Controller'
], function (
    genetic,
    Controller
) {
    'use strict';

    /**
     * A ConnectableController.
     * @constructor
     */
    function ConnectableController() {
        Controller.apply(this, arguments);
        this._sourceConns = [];
        this._targetConns = [];
    }

    genetic.inherits(ConnectableController, Controller, {

        /**
         * Activate all source ConnectionControllers.
         * @return {Array}
         */
        activate: function () {
            Controller.prototype.activate.call(this);
            var conns = this.sourceConnections();
            conns.forEach(function (connection) {
                connection.activate();
            });
        },

        /**
         * This method should only be called by the Controller
         * itself, and its helpers such as Abilities.
         * @return {Array}
         */
        sourceConnections: function () {
            return this._sourceConns;
        },

        /**
         * This method should only be called by the Controller
         * itself, and its helpers such as Abilities.
         * @return {Array}
         */
        targetConnections: function () {
            return this._targetConns;
        },

        /**
         * Called after the Controller has been added to its parent.
         * This is used to indicate to the Controller that
         * it should refresh itself for the first time.
         * @override
         */
        addNotify: function () {
            this.desc('addNotify');
            Controller.prototype.addNotify.call(this);
            this.sourceConnections().forEach(function (conn) {
                conn.setSource(this);
            }, this);
            this.targetConnections().forEach(function (conn) {
                conn.setTarget(this);
            }, this);
        },
    });

    return ConnectableController;
});
