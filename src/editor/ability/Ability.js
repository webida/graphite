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
 * @file Ability
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
     * A pluggable contribution implementing a portion of an Controller's behavior.
     * Abilities contribute to the overall editing behavior of an Controller.
     * Editing behavior is defined as one or more of the following:
     * 
     * 1. Command Creation - Returning a Command in response to getCommand(Request)
     * 
     * 2. Feedback Management - Showing/erasing source and/or target
     *                          feedback in response to Requests.
     * 
     * 3. Delegation/Forwarding - Collecting contributions from other
     * Controllers (and therefore their Abilities). In response to a given
     * Request, an Ability may create a derived Request and forward
     * it to other Controllers. For example, during the deletion of a composite
     * Controller, that composite may consult its children for contributions to the
     * delete command. Then, if the children have any additional work to do, they
     * will return additional comands to be executed.
     * 
     * Abilities should determine an Controller's editing capabilities. It is
     * possible to implement an Controller such that it handles all editing
     * responsibility. However, it is much more flexible and object-oriented to use
     * Abilities. Using Abilities, you can pick and choose the editing behavior
     * for an Controller without being bound to its class hierarchy. Code reuse is
     * increased, and code management is easier.
     * 
     * @constructor
     */
    function Ability() {
        Base.apply(this, arguments);
        this._host = null;
    }

    genetic.inherits(Ability, Base, {

        /**
         * Returns the Command contribution for the given Request, or null.
         * null is treated as a no-op by the caller, or an empty contribution.
         * The Ability must return an UnexecutableCommand if it wishes to
         * disallow the Request.
         * 
         * This method is declared on Controller#getCommand(Request),
         * and is redeclared here so that Controller can delegate its implementation
         * to each of its Abilities. The Controller will combine each Ability's
         * contribution into a CompoundCommand.
         * 
         * Returns null by default. null is used to indicate that
         * the Ability does not contribute to the specified Request.
         * 
         * @param {Request} request
         * @return {Command}
         */
        getCommand: function (request) {
            return null;
        },

        /**
         * Sets the host Controller on which this policy is installed.
         * @param {Controller} host
         * @return {Ability}
         *//**
         * Returns the host Controller on which this policy is installed.
         * @return {Controller}
         */
        host: function (host) {
            if (arguments.length) {
                this._host = host;
                return this;
            } else {
                return this._host;
            }
        },

        /**
         * Activates this Ability. The Ability might need to hook
         * listeners. These listeners should be unhooked in deactivate().
         * The Ability might also contribute feedback/visuals immediately,
         * such as selection handles if the Controller was selected
         * at the time of activation. Activate is called after the host
         * has been set, and that host has been activated.
         * 
         * @see Controller#activate()
         * @see #deactivate()
         * @see Controller#installAbility(Object, Ability)
         */
        activate: function () {
            this.desc('activate', '', 'does nothing');
        },

        /**
         * Deactivates the Ability, the inverse of {@link #activate()}.
         * Deactivate is called when the host is deactivated, or when the
         * Ability is uninstalled from an active host. Deactivate unhooks
         * any listeners, and removes all feedback.
         * 
         * @see Controller#deactivate()
         * @see #activate()
         * @see Controller#removeAbility(Object)
         */
        deactivate: function () {
            this.desc('deactivate', '', 'does nothing');
        },

        /**
         * Returns true if this Ability understand the specified request.
         * 
         * This method is declared on Controller#understandsRequest(Request),
         * and is redeclared here so that Controller can delegate its
         * implementation to each of its Abilities. Controller returns
         * true if any of its Abilities returns true.
         * In other words, it performs a logical OR.
         * 
         * @param {Request} request
         * @return {boolean} - true if the Ability understands the request
         * @see Controller#understandsRequest(Request)
         */
        understandsRequest: function (request) {
            return false;
        },

        /**
         * Returns null or the appropriate Controller for
         * the specified Request. In general, this Ability will
         * return its host Controller if it understands the Request. Otherwise,
         * it will return null.
         * 
         * This method is declared on Controller#getTargetController(Request),
         * and is redeclared here so that Controller can delegate its
         * implementation to each of its Abilities. The first non-
         * null result returned by an Ability is returned by the
         * Controller.
         * 
         * @param {Request} request
         * @return {Controller}
         */
        getTargetController: function (request) {
            return null;
        },

        /**
         * Shows or updates source feedback for the specified
         * Request. This method may be called repeatedly for the
         * purpose of updating feedback based on changes to the Request.
         * 
         * Does nothing if the Ability does not recognize the given Request.
         * 
         * This method is declared on Controller#showSourceFeedback(Request),
         * and is redeclared here so that Controller can delegate its
         * implementation to each of its Abilities.
         * 
         * @param {Request} request
         */
        showSourceFeedback: function (request) {
            this.desc('showSourceFeedback', '', 'does nothing');
        },

        /**
         * Shows or updates target feedback for the specified
         * Request. This method may be called repeatedly for the
         * purpose of updating feedback based on changes to the Request.
         * 
         * Does nothing if the Ability does not recognize the given request.
         * 
         * This method is declared on Controller#showTargetFeedback(Request),
         * and is redeclared here so that Controller can delegate its
         * implementation to each of its Abilities.
         * 
         * @param {Request} request
         */
        showTargetFeedback: function (request) {
            this.desc('showTargetFeedback', '', 'does nothing');
        },

        /**
         * Erases source feedback based on the given Request. Does
         * nothing if the Ability does not apply to the given Request.
         * 
         * This method is declared on Controller#eraseSourceFeedback(Request), 
         * and is redeclared here so that Controller can delegate its
         * implementation to each of its Abilities.
         * 
         * @param {Request} request
         */
        eraseSourceFeedback: function (request) {
            this.desc('eraseSourceFeedback', '', 'does nothing');
        },

        /**
         * Erases target feedback based on the given Request. Does
         * nothing if the Ability does not apply to the given Request.
         * 
         * This method is declared on Controller#eraseTargetFeedback(Request), 
         * and is redeclared here so that Controller can delegate its
         * implementation to each of its Abilities.
         * 
         * @param {Request} request
         */
        eraseTargetFeedback: function (request) {
            this.desc('eraseTargetFeedback', '', 'does nothing');
        },

        toString: function () {
            return Base.prototype.toString.call(this)
                    + '/' + this._host;
        }
    });

    return Ability;
});
