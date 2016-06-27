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
 * @file DirectEditRequest
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
     * A request to perform direct editing
     * on the receiver of the Request.
     * @constructor
     */
    function DirectEditRequest() {
        LocationRequest.apply(this, arguments);
        if (!arguments.length) {
            this.type('REQ_DIRECT_EDIT');
        }
        this._feature = null;
        this._celleditor = null;
    }

    genetic.inherits(DirectEditRequest, LocationRequest, {

        /**
         * @param {Object} feature
         *//**
         * @return {Object}
         */
        feature: function (feature) {
            if (arguments.length) {
                this._feature = feature;
            } else {
                return this._feature;
            }
        },

        /**
         * @param {Object} celleditor
         *//**
         * @return {Object}
         */
        celleditor: function (celleditor) {
            if (arguments.length) {
                this._celleditor = celleditor;
            } else {
                return this._celleditor;
            }
        }
    });

    return DirectEditRequest;
});
