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
 * @file ActionRegistry
 * @since 1.0.0
 * @author hw.shim@samsung.com
 */

define([
    'external/genetic/genetic',
    'external/map/Map',
    'graphite/base/Base'
], function (
    genetic,
    Map,
    Base
) {
    'use strict';

    /**
     * An ActionRegistry is a container for editor actions.
     * You must register the actions before they
     * will be available to the editor.
     * @constructor
     */
    function ActionRegistry() {
        Base.apply(this, arguments);
        this._actions = {};
        this._actionsByCat = {};
    }

    genetic.inherits(ActionRegistry, Base, {

        /**
         * Registers new Action with the given category name.
         * @param {Action} action
         * @param {string} category
         */
        register: function (action, category) {
            if (!this._actionsByCat[category]) {
                this._actionsByCat[category] = [];
            }
            this._actionsByCat[category].push(action);
            this._actions[action.id] = action;
        },

        /**
         * Unregisters Action.
         * @param {Action} action
         * @return {boolean}
         */
        unregister: function (action) {
            delete this._actions[action];
            var cats = Object.getOwnPropertyNames(this._actionsByCat);
            return cats.some(function (cat) {
                var actions = this._actions[cat];
                var index = actions.indexOf(action);
                var result = index > -1;
                if (result) actions.splice(index, 1);
                return result;
            });
        },

        /**
         * Returns Action By it's id.
         * @param {string} id
         * @return {Action}
         */
        getActionById: function (id) {
            return this._actions[id];
        },

        /**
         * Returns Array of Actions by the given category name.
         * @param {string} category
         * @return {Array}
         */
        getActionsByCategory: function (category) {
            return this._actionsByCat[category] || [];
        },

        /**
         * Returns all Actions.
         * @return {Array}
         */
        getActions: function () {
            var result = [];
            var actions = this._actions;
            var ids = Object.getOwnPropertyNames(actions);
            ids.forEach(function (id) {
                result.push(actions[id]);
            });
            return result;
        }
    });

    return ActionRegistry;
});
