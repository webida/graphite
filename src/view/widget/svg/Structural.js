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
    './SvgWidget'
], function (
    genetic,
    SvgWidget
) {
    'use strict';

    /**
     * A Structural SvgElement.
     * <defs>, <g>, <svg>, <symbol>
     * but not <use>.
     * This can contain Structural(s), Shape(s).
     * @constructor
     */
    function Structural() {
        SvgWidget.apply(this, arguments);
    }

    genetic.inherits(Structural, SvgWidget, {

        /**
         * Sets this Widget's parent.
         * @param {Widget} parent
         * @override 
         */
        setParent: function (parent) {
            this.desc('setParent', parent);
            SvgWidget.prototype.setParent.call(this, parent);
            if (parent instanceof Structural) {
                parent.element().appendChild(this.element());
            } else {
                throw new Error('Only Structural can be a parent for Structural');
            }
        },
    });

    return Structural;
});
