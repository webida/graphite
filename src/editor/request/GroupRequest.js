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
 * @file GroupRequest
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
     * A GroupRequest is a Request from multiple Controllers.
     * @constructor
     */
    function GroupRequest() {
        Request.apply(this, arguments);
        this._controllers = [];
    }

    genetic.inherits(GroupRequest, Request, {

        /**
         * Sets the Controllers making this Request to the given Array.
         * @param {Array} controllers
         *//**
         * Returns a Array containing the Controllers making this Request.
         * @return {Array}
         */
        controllers: function (controllers) {
            if (arguments.length) {
                if (!(controllers instanceof Array)) {
                    controllers = [controllers];
                }
                this._controllers = controllers;
            } else {
                return this._controllers;
            }
        }
    });

    return GroupRequest;
});
