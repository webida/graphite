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
    '../svg/Polyline'
], function (
    genetic,
    Polyline
) {
    'use strict';

    /**
     * A Connection.
     * @constructor
     */
    function Connection() {
        Polyline.apply(this, arguments);
    }

    genetic.inherits(Connection, Polyline, {

        /**
         * Explain
         * @param {}
         * @return {Array}
         */
        sourceAnchor: function (anchor) {
            this.desc('sourceAnchor', arguments);
            this.warn('to be implemented');
        },

        /**
         * Explain
         * @param {}
         * @return {Array}
         */
        targetAnchor: function (anchor) {
            this.desc('targetAnchor', arguments);
            this.warn('to be implemented');
        }
    });

    return Connection;
});
