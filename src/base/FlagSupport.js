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

define(function () {
    'use strict';

    /**
     * An object for storing multiple flags compactly.
     * @constructor
     */
    function FlagSupport() {}

    FlagSupport.prototype = {

        _flags : null,

        /**
         * Returns true the flag (or one of the flags) indicated by
         * the given bitmask is set to true.
         * 
         * @param {number} flag - the bitmask of a flag or flags
         * @return {boolean}
         */
        getFlag : function(flag){
            return (this._flags & flag) !== 0;
        },

        /**
         * Sets the flag (or all of the flags) indicated by
         * the given bitmask to the given value.
         * 
         * @param {number} flag - the bitmask of the flag or flags
         * @param {boolean} value - the new value
         */
        setFlag : function(flag, value){
            if(typeof flag === 'undefined'){
                throw new Error('Invalid flag name');
            }
            if (value) {
                this._flags |= flag;
            } else {
                this._flags &= ~flag;
            }
        }
    }

    return FlagSupport;
});
