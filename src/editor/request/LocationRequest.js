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
 * @file LocationRequest
 * @since 1.0.0
 * @author hw.shim@samsung.com
 */

define([
    'external/genetic/genetic',
    './Request'
], function (
    genetic,
    Request
) {
    'use strict';

    /**
     * A LocationRequest.
     * @constructor
     */
    function LocationRequest() {
        Request.apply(this, arguments);
        this._location = null;
    }

    genetic.inherits(LocationRequest, Request, {

        /**
         * Sets the current location.
         * @param {Point} location
         *//**
         * Returns the current location.
         * @return {Point}
         */
        location: function (location) {
            if (arguments.length) {
                this._location = location;
            } else {
                return this._location;
            }
        }
    });

    return LocationRequest;
});
