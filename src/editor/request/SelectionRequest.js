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
    './LocationRequest'
], function (
    genetic,
    LocationRequest
) {
    'use strict';

    /**
     * A SelectionRequest.
     * @constructor
     */
    function SelectionRequest() {
        LocationRequest.apply(this, arguments);
        this._modKeyMask = 0;
        this._lastButton = null;
    }

    genetic.inherits(SelectionRequest, LocationRequest, {

        /**
         * @param {number} button
         *//**
         * Returns the last button that was pressed.
         * This is useful if there is more than one mouse button pressed
         * and the most recent button pressed needs to be identified.
         * @return {number}
         */
        lastButton: function (button) {
            if (arguments.length) {
                this._lastButton = button;
            } else {
                return this._lastButton;
            }
        },

        /**
         * Sets the modifier key mask for this request.
         * @param {number} mask
         *//**
         * Returns modifier key mask for this request.
         * @return {number}
         */
        modifiers: function(mask) {
            if (arguments.length) {
                this._modKeyMask = mask;
            } else {
                return this._modKeyMask;
            }
        }
    });

    return SelectionRequest;
});
