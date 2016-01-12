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
    'graphite/base/BaseEmitter'
], function (
    genetic,
    BaseEmitter
) {
    'use strict';

    function UpdateManager() {
        BaseEmitter.apply(this, arguments);
    }

    genetic.inherits(UpdateManager, BaseEmitter, {

        /**
         * ...
         * @param {Widget} widget
         */
        setRoot: function (widget) {
            this._root = widget;
        },

        /**
         * ...
         * @return {Widget}
         */
        getRoot: function () {
            return this._root;
        },

        /**
         * Performs a partial update if supported (validation only). Fires
         * validating event to listeners that validation has been started.
         * this method calls {@link #update()}. Subclasses should override
         * this method to support validation without redrawing.
         */
        validate: function () {
            this.log('validate()');
            this.update();
        },

        /**
         * Forces an update to occur. Update managers will perform updates
         * automatically, but may do so asynchronously. Calling this method
         * forces a synchronous update.
         * @abstract
         */
        update: function () {
            throw new Error('update() should be implemented by '
                    + this.constructor.name);
        },

        /**
         * ...
         * @param {GraphicContext} context
         */
        setGraphicContext: function (context) {
            this._context = context;
        },

        /**
         * ...
         * @return {GraphicContext}
         */
        getGraphicContext: function () {
            return this._context;
        }
    });

    return UpdateManager;
});
