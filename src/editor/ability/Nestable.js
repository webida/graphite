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
 * @file Nestable
 * @since 1.0.0
 * @author hw.shim@samsung.com
 */

define([
    'external/genetic/genetic',
    './Ability'
], function (
    genetic,
    Ability
) {
    'use strict';

    /**
     * A model-based Ability for components within a container. A
     * model-based Ability only knows about the host's model and the basic
     * operations it supports. A component is anything that is inside a
     * container. By default, Nestable understands being DELETEd from its
     * container, and being ORPHANed from its container. Subclasses can add
     * support to handle additional behavior specific to the model.
     * 
     * ORPHAN is forwarded to the parent Controller for it to handle.
     * 
     * DELETE is also forwarded to the parent Controller, but subclasses may
     * also contribute to the delete by overriding
     * _createDeleteCommand(GroupRequest).
     * 
     * This Ability is not a GraphicAbility, and should not be used to show
     * feedback or interact with the host's visuals in any way.
     * 
     * This Ability should not be used with ConnectionController.
     * Connections do not really have a parent, use Connectable Ability.
     * @constructor
     */
    function Nestable() {
        Ability.apply(this, arguments);
    }

    genetic.inherits(Nestable, Ability, {

        /**
         * Override to contribute to the component's being deleted.
         * @param {GroupRequest} deleteRequest
         * @return {Command}
         * @protected
         */
        _createDeleteCommand: function (deleteRequest) {
            return null;
        },

        /**
         * Factors the incoming Request into ORPHANs and DELETEs.
         */
        getCommand: function (request) {
            if (request.type === 'REQ_ORPHAN') {
                return this._getOrphanCommand();
            }
            if (request.type === 'REQ_DELETE') {
                return this._getDeleteCommand(request);
            }
            return null;
        },

        /**
         * Returns the command contribution for orphaning this component
         * from its container. By default, ORPHAN is redispatched
         * to the host's parent as an ORPHAN_CHILDREN Request.
         * The parents contribution is then returned.
         * 
         * @return the contribution obtained from the host's parent.
         * @protected
         */
        _getOrphanCommand: function () {
            var host = this.host();
            var req = new GroupRequest('REQ_ORPHAN_CHILDREN');
            req.setControllers(host);
            return host.getParent().getCommand(req);
        },

        /**
         * Calls and returns _createDeleteCommand(GroupRequest).
         * This method is here for historical reasons and used
         * to perform additional function.
         * @param {GroupRequest} request
         * @return {Command}
         * @protected
         */
        _getDeleteCommand: function (request) {
            return this._createDeleteCommand(request);
        }
    });

    return Nestable;
});
