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
    './formater'
], function (
    genetic,
    formater
) {
    'use strict';

    /**
     * A Logger.
     * @constructor
     */
    function Logger() {
    }

    var LEVEL = Logger.LEVEL = {
        off: 0,
        log: 1,
        info: 2,
        warn: 4,
        error: 8,
        trace: 16,
        all: 31
    };

    genetic.inherits(Logger, Object, {

        logLevel: LEVEL.off,

        log: function () {
            this.invoke('log', arguments);
        },

        info: function () {
            this.invoke('info', arguments);
        },

        warn: function () {
            this.invoke('warn', arguments);
        },

        error: function () {
            this.invoke('error', arguments);
        },

        invoke: function (action, args, options) {
            if (!this.allowLog(action)) {
                return;
            }
            args = formater(args, action, this, options);
            console[action].apply(console, args);
        },

        explain: function(arrayLike, isFunc) {
            var arr = [];
            for (var i in arrayLike) {
                if (typeof arrayLike[i] == 'function') {
                    if (isFunc) {
                        arr.push(arrayLike[i]);
                    }
                } else {
                    if (arrayLike[i] === null) {
                        arr.push('null');
                    } else {
                        arr.push(arrayLike[i]);
                    }
                }
            }
            return arr.join(', ');
        },

        allowLog: function (action) {
            if (this.logLevel && LEVEL[action]) {
                return true;
            }
            return false;
        },
    });

    /**
     * Global Log Level
     * @param {number} logLevel
     */
    Logger.logLevel = function (logLevel) {
        Logger.prototype.logLevel = logLevel;
    };

    return Logger;
});
