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
 * @file Module for checking browser information.
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
     * A browser info.
     */
    var browser = {
        name: '',
        version: 0
    };

    (function () {
        var v, ua = window.navigator.userAgent;
        if (ua.indexOf('Trident') > -1) {
            browser.name = 'ie';
            //for ie 7~10
            if (navigator.appName == 'Microsoft Internet Explorer') {
                v = /MSIE ([0-9]{1,}[\.0-9]{0,})/.exec(ua);
                browser.version = parseFloat(v[1]);
            }
        }
    })();

    return browser;
});
