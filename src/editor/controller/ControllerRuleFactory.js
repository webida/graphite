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
 * @file Default Controller creation Factory.
 * @since 1.0.0
 * @author hw.shim@samsung.com
 */

define([
    'external/genetic/genetic',
    './ControllerFactory'
], function (
    genetic,
    ControllerFactory
) {
    'use strict';

    /**
     * A ControllerRuleFactory.
     * @constructor
     */
    function ControllerRuleFactory(rule) {
        ControllerFactory.apply(this, arguments);
        this._rules = rule;
    }

    genetic.inherits(ControllerRuleFactory, ControllerFactory, {

        /**
         * Creates new Controller with the given model
         * @param {Object} context
         * @param {Object} model
         * @return {Controller}
         */
        create: function (context, model) {
            this.desc('create', arguments);
            var len, rule, controller;
            var rules = this._rules;
            if (rules instanceof Array) {
                len = rules.length;
                for (var i = 0; i < len; i++) {
                    rule = rules[i];
                    if (model instanceof rule[0]) {
                        controller = new (rule[1]);
                        controller.model(model);
                        return controller;
                    }
                }
            }
        }
    });

    return ControllerRuleFactory;
});
