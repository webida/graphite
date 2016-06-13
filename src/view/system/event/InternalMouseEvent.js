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
    './InternalInputEvent'
], function (
    genetic,
    InternalInputEvent
) {
    'use strict';

    /**
     * A InternalMouseEvent.
     * @constructor
     * @param {Widget} widget
     * @param {MouseEvent} e
     */
    function InternalMouseEvent(widget, e) {
        InternalInputEvent.apply(this, arguments);
    }

    genetic.inherits(InternalMouseEvent, InternalInputEvent, {

        /**
         * Explain
         * @param {}
         * @return {Array}
         */
        aaaa: function () {
            return this.bbb;
        }
    });

    InternalMouseEvent.LEFT = 1;
    InternalMouseEvent.RIGHT = 1 << 1;
    InternalMouseEvent.WHEEL = 1 << 2;

    /** 
     * MouseEvent.button
     * https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
     */
    InternalMouseEvent.BUTTON = {
        'LEFT': 0,
        'WHEEL': 1,
        'RIGHT': 2
    };

    return InternalMouseEvent;
});
