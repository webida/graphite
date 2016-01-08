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

    var count = 0;

    function formater(args, action, object, options) {

        var pathDepth = 1; //depth of path (In default it only shows filename);

        function getNow() {
            var result = [],
                now = new Date();
            result.push(now.getHours());
            result.push(now.getMinutes());
            result.push(now.getSeconds());
            var resultToString;
            for (var i = 0; i < result.length; i++) {
                resultToString = result[i].toString();
                if (resultToString.length === 1) {
                    result[i] = '0' + resultToString;
                }
            }
            result.push(now.getMilliseconds().toString());
            if (result[3].length === 1) {
                result[3] = '00' + result[3];
            } else if (result[3].length === 2) {
                result[3] = '0' + result[3];
            }
            return result.join(':');
        }

        var prefix = '[' + getNow() + '][' + (count++) + ']';
        //style
        if (args.length === 2 && typeof args[0] === 'string' && args[0].substr(0, 2) === '%c') {
            prefix = '%c' + prefix + ' ' + args[0].substr(2);
            ([]).shift.call(args);
        }

        var path = '';
        var stack = (new Error()).stack;
        if (stack) {
            var cls = object.constructor.name;
            var stacks = stack.split('\n');
            var lineOfNew, callLine, callMethod = '';
            if (options && options.type === 'constructor') {
                for (var i in stacks) {
                    if (stacks[i].indexOf('new '+ cls) > -1) {
                        lineOfNew = parseInt(i) + 1;
                        break;
                    }
                }
                if (lineOfNew) {
                    callLine = stacks[lineOfNew];
                    //console.log(callLine);
                    if (callLine.indexOf('[as constructor]') > -1) {
                        callMethod = 'constructor';
                    } else {
                        var callLineTokens = callLine.trim().split(' ');
                        var caller = callLineTokens[1];
                        if (callLineTokens.length > 2 && caller !== 'new') {
                            var callerTokens = caller.split('.');
                            callMethod = callerTokens[callerTokens.length - 1];
                        }
                    }
                    if (callMethod) {
                        callMethod = '/' + callMethod;
                    }
                }
            } else {
                callLine = stacks[4];
            }
            if (callLine) {
                var callPath = callLine.split('/');
                var lastIndex = callPath.length - 1;
                for (var j = callPath.length - pathDepth; j < lastIndex; j++) {
                    if (callPath[j]) {
                        path += callPath[j] + '/';
                    }
                }
                var fileToken = callPath[lastIndex].split(':');
                var basename = '<' + path + fileToken[0].split('?')[0] + ':' + fileToken[1] + callMethod + '>';
                ([]).push.call(args, basename);                
            }
        }
        ([]).unshift.call(args, prefix);

        return args;
    }

    return formater;
});
