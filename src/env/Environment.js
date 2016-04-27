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
    'external/dom/dom',
    'external/genetic/genetic',
    'external/map/Map',
    'graphite/base/Base'
], function (
    dom,
    genetic,
    Map,
    Base
) {
    'use strict';

    /**
     * A Environment.
     * @constructor
     */
    function Environment() {
        Base.apply(this, arguments);
        this.env = new Map();
    }

    genetic.inherits(Environment, Base, {

        /**
         * @param {object} key
         * @param {object} value
         */
        set: function (key, value) {
            this.env.set(key, value);
            return this;
        },

        /**
         * @param {object} key
         */
        get: function (key) {
            return this.env.get(key);
        }
    });

    Environment.loadDebugMode = function (shell) {
        require(['graphite/env/Debugger'], function (Debugger) {
            Debugger.load(shell);
        });
    };

    (function () {
        var p, g = Environment.global = new Environment();
        var hash = window.location.hash.slice(1);
        var tokens = hash.split('&');
        tokens.forEach(function (token) {
            p = token.split('=');
            g.set(p[0], p[1]);
        });
    })();

    return Environment;
});
