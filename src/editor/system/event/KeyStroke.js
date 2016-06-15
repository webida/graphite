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
 * @file KeyStroke
 * @since 1.0.0
 * @author hw.shim@samsung.com
 */

define([
    'external/genetic/genetic',
    'graphite/base/Base',
    'graphite/view/system/event/InternalKeyEvent'
], function (
    genetic,
    Base,
    InternalKeyEvent
) {
    'use strict';

    function setProperties(opt) {
        if (opt instanceof KeyboardEvent) {
            this.key = InternalKeyEvent.getKey(opt);
            this.mask = InternalKeyEvent.getMask(opt);
            this.type = opt.type;
        } else {
            if (opt.key) this.key = opt.key;
            this.mask = InternalKeyEvent.getMask(opt);
            if (opt.type) this.type = opt.type;
        }
    }

    /**
     * A KeyStroke.
     * @param {KeyboardEvent|Object} opt
     * @constructor
     * @see InternalKeyEvent
     * @example
     * new KeyStroke(KeyboardEvent)
     * new KeyStroke({
     *      key: 'Home',
     *      altKey: true,
     *      ctrlKey: false,
     *      shiftKey: true,
     *      type: 'keydown'
     * })
     * new KeyStroke({
     *      key: 'J',
     *      ctrlKey: true
     * })
     * If it is already exist returns it.
     */
    function KeyStroke(opt) {
        setProperties.call(this, opt);
        var serial = this.serialize();
        if (singleton[serial]) {
            return singleton[serial];
        } else {
            Base.apply(this, arguments);
            singleton[serial] = this;
        }
    }

    KeyStroke.singleton = function (opt) {
        return new KeyStroke(opt);
    };

    var singleton = {};

    genetic.inherits(KeyStroke, Base, {

        key : '',

        mask : 0,

        type : 'keydown',

        /**
         * Returns serialized properties.
         * Usually this value may be used as a key for an Object or Map.
         * @return {string}
         */
        serialize: function () {
            return '' + this.key + '-' + this.mask + '-' + this.type;
        }
    });

    return KeyStroke;
});
