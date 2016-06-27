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
    'graphite/base/Base'
], function (
    genetic,
    Base
) {
    'use strict';

    /**
     * A Request is a high-level object made from an event. 
     * An Object used to communicate with Controllers.
     * Request encapsulates the information Controllers need to perform
     * various functions. Requests are used for obtaining commands,
     * showing feedback, and performing generic operations.
     * @constructor
     */
    function Request(type) {
        Base.apply(this, arguments);
        this._type = null;
        if (arguments.length) this.type(type);
    }

    genetic.inherits(Request, Base, {

        /**
         * Constructs a Request with the specified type
         * @param {Object} type
         *//**
         * Returns the type of the request.
         * The type is often used as a quick way to filter recognized Requests.
         * Once the type is identified, the Request is usually cast to a more
         * specific subclass containing additional data.
         * @return {Object}
         */
        type: function (type) {
            if (arguments.length) {
                this._type = type;
            } else {
                return this._type;
            }
        },

        /**
         * Sets user defined data.
         * @param {Object} data
         *//**
         * Returns user defined data.
         * @return {Object}
         */
        data: function (data) {
            if (arguments.length) {
                this._data = data;
            } else {
                return this._data;
            }
        }
    });

    return Request;
});
