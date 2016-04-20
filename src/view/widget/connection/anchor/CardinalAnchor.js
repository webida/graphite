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
 * @file CardinalAnchor
 * @since 1.0.0
 * @author hw.shim@samsung.com
 * @author youngd.hwang@samsung.com
 */

define([
    'external/genetic/genetic',
    'graphite/view/geometry/Point',
    './EdgeAnchor'
], function (
    genetic,
    Point,
    EdgeAnchor
) {
    'use strict';

    /**
     * A CardinalAnchor.
     * @constructor
     * @param {Object} option
     * @param {string} option.pos - The direction of a
     *        connected anchor point.
     *        (One of N,NE,E,SE,S,SW,W,NW)
     */
    function CardinalAnchor(owner, option) {
        EdgeAnchor.apply(this, arguments);
    }

    genetic.inherits(CardinalAnchor, EdgeAnchor, {

        /**
         * Returns the anchor's reference point.
         * @param {Point} reference
         * @return {Point}
         * @override
         */
        _getReferencePoint: function () {
            var r = this.owner().bounds().copy();
            var x = 0, y = 0;
            switch (this._option.pos) {
                case 'N':
                    x = r.x + r.w / 2;
                    y = r.y;
                    break;
                case 'NE':
                    x = r.x + r.w;
                    y = r.y;
                    break;
                case 'E':
                    x = r.x + r.w;
                    y = r.y + r.h / 2;
                    break;
                case 'SE':
                    x = r.x + r.w;
                    y = r.y + r.h;
                    break;
                case 'S':
                    x = r.x + r.w / 2;
                    y = r.y + r.h;
                    break;
                case 'SW':
                    x = r.x;
                    y = r.y + r.h;
                    break;
                case 'W':
                    x = r.x;
                    y = r.y + r.h / 2;
                    break;
                case 'NW':
                    x = r.x;
                    y = r.y;
                    break;
                default:
                    ;
            }
            return new Point(x, y);
        }
    });

    return CardinalAnchor;
});
