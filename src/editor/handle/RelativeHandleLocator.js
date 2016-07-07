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
 * @file RelativeHandleLocator
 * Similar to RelativeLocator, but adds support for handleBounds() method.
 * If the reference has handleBounds() method, then that function will be
 * used as the reference box. If not, the behavior is the same as that of
 * the superclass.
 * @since 1.0.0
 * @author hw.shim@samsung.com
 */

define([
    'external/genetic/genetic',
    'graphite/view/locator/RelativeLocator'
], function (
    genetic,
    RelativeLocator
) {
    'use strict';

    /**
     * A RelativeHandleLocator.
     * @param {Controller} reference
     * @param {number} direction
     *  - relative direction from the center of the reference.
     * @constructor
     */
    function RelativeHandleLocator(reference, direction) {
        RelativeLocator.apply(this, arguments);
    }

    genetic.inherits(RelativeHandleLocator, RelativeLocator, {

        /**
         * Overridden to check for reference has handleBounds method.
         * @see RelativeLocator#referenceBox()
         */
        referenceBox: function () {
            var ref = this.reference();
            if (typeof ref.handleBounds === 'function')
                return ref.handleBounds();
            return RelativeLocator.prototype.referenceBox.call(this);
        }
    });

    return RelativeHandleLocator;
});
