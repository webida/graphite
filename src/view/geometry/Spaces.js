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
     * A four side spaces.
     * @constructor
     */
    function Spaces() {
        Base.apply(this, arguments);
        var args = arguments;
        if (args.length === 4) {
            this.top = args[0];
            this.left = args[1];
            this.bottom = args[2];
            this.right = args[3];
        } else if (args.length === 1) {
            if (args[0] instanceof Spaces) {
                var insets = args[0];
                this.top = insets.top;
                this.left = insets.left;
                this.bottom = insets.bottom;
                this.right = insets.right;
            } else if ( typeof args[0] === 'number') {
                this.top = args[0];
                this.left = args[0];
                this.bottom = args[0];
                this.right = args[0];
            }
        }
    }

    genetic.inherits(Spaces, Base, {

        /** distance from left */
        left : 0,
        
        /** distance from top */
        top : 0,
        
        /** distance from bottom */
        bottom : 0,
        
        /** distance from right */
        right : 0,

        /**
         * Returns the width for this Insets, equal to <code>left</code> +
         * <code>right</code>.
         * @return The sum of left + right
         */
        getWidth: function () {
            return this.left + this.right;
        },

        /**
         * Returns the height for this Insets, equal to <code>top</code> +
         * <code>bottom</code>.
         * @return The sum of top + bottom
         */
        getHeight: function () {
            return this.top + this.bottom;
        },

    });

    return Spaces;
});
