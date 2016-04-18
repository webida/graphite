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
 * @file Locator used to place a {@link PolylineDecoration} 
 * or a {@link PolygonDecoration} on a {@link Connection|.
 * @since 1.0.0
 * @author youngd.hwang@samsung.com
 */

define([
    'external/genetic/genetic',
    './ConnectionLocator'
], function (
    genetic,
    ConnectionLocator
) {
    'use strict';

    /**
     * A ArrowLocator.
     * @constructor
     */
    function ArrowLocator() {
        ConnectionLocator.apply(this, arguments);
    }

    genetic.inherits(ArrowLocator, ConnectionLocator, {

        /**
         * Relocates the passed in widget at either the source
         * or target of the connection
         * @param {PolylineDecoration} or {PolygonDecoration}
         */
        relocate: function (decoration) {
            var pointList = this.connection().pointList();
            var p = this.location(pointList);
            decoration.location(p.x, p.y);

            if (this.align() === ConnectionLocator.SOURCE) {
                decoration.referencePoint(pointList.get(1));
            } else if (this.align() === ConnectionLocator.TARGET) {
                decoration.referencePoint(pointList.get(pointList.size() - 2));
            }
        }
    });

    return ArrowLocator;
});
