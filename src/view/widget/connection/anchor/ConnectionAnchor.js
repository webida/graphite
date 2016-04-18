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
 * @author youngd.hwang@samsung.com
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
     * A ConnectionAnchor.
     * @constructor
     */
    function ConnectionAnchor(owner) {
        BaseEmitter.apply(this, arguments);
        this.owner(owner);
    }

    genetic.inherits(ConnectionAnchor, BaseEmitter, {

        /**
         * Returns the location where the Connection should be
         * anchored in absolute coordinates. The anchor may use
         * the given reference Point to calculate this location.
         * @param {Point} reference
         * @return {Point}
         * @abstract
         */
        getLocation: function (reference) {
            this.isInterface('getLocation', reference);
        },

        /**
         * Sets the owner of this anchor.
         * @param {Widget} owner
         * @return {Widget}
         *//**
         * Returns the owner of this anchor.
         * @return {Widget} owner
         */
        owner: function () {
            this.desc('owner', arguments);
            if (arguments.length) {
                this._owner = arguments[0];
                return this;
            } else {
                return this._owner;
            }
        },

        /**
         * Returns the anchor's reference point,
         * Default  point is the center of the anchor's owner.
         * @return {Point}
         */
        referencePoint: function () {
            if (this.owner() === null) {
                return null;
            }
            var ref = this.owner().bounds().center();
            this.owner().translateToAbsolute(ref);
            return ref;
        }
    });

    return ConnectionAnchor;
});
