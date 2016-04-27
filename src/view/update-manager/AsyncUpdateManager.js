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
    'external/map/Map',
    'graphite/view/geometry/Rectangle',
    './UpdateManager'
], function (
    genetic,
    Map,
    Rectangle,
    UpdateManager
) {
    'use strict';

    function AsyncUpdateManager() {
        UpdateManager.apply(this, arguments);
        this._invalidWidgets = [];
        this._updateQueued = false;
    }

    genetic.inherits(AsyncUpdateManager, UpdateManager, {

        /**
         * Adds the given widget to the update queue.
         * Invalid widgets will be validated before
         * the drawing of invalid widgets again.
         * @param {Widget} widget - Invalid widget
         */
        addInvalidWidget: function (widget) {
            var invalidWiz, invalidWidgets = this._invalidWidgets;
            var index = invalidWidgets.indexOf(widget);
            this.desc('addInvalidWidget', arguments, undefined, 'salmon');
            if (index > -1) {
                this.info('invalidWidgets has the given widget');
                return;
            }
            if (invalidWidgets[0] === this.getRoot()) {
                this.info('invalidWidgets has RootWidget');
                return;
            }
            for (var i in invalidWidgets) {
                invalidWiz = invalidWidgets[i];
                if (invalidWiz.hasDescendant(widget)) {
                    this.info('invalidWidgets\'s descendant has the given widget');
                    return;
                }
                if (widget.hasDescendant(invalidWiz)) {
                    this.info('The given widget\'s descendant has some invalidWiz');
                    invalidWidgets.splice(i, 1);
                }
            }
            this._queueJob();
            invalidWidgets.push(widget);
        },

        /**
         * Queues new update job.
         * If job has already been queued,
         * a new queuing is not needed.
         * @protected
         */
        _queueJob: function () {
            var status;
            if (!this._updateQueued) {
                status = 'run _asyncUpdate()';
            } else {
                status = 'does nothing';
            }
            this.desc('_queueJob', [], status);
            if (!this._updateQueued) {
                this._asyncUpdate();
                this._updateQueued = true;
            }
        },

        /**
         * Asynchronously update
         * @protected
         */
        _asyncUpdate: function () {
            this.desc('_asyncUpdate');
            setTimeout(function (updateManager) {
                updateManager.info('----- async -----');
                updateManager.update();
            }, 0, this);
        },

        /**
         * Performs the update.
         * 1. Validates the invalid widgets.
         * 2. Redraws the invalid widgets.
         */
        update: function () {
            this.desc('update');
            if (this._updating) {
                return;
            }
            this._updating = true;
            try {
                this.validate();
                this._updateQueued = false;
                this._drawInvalidWidgets();
                if (this._afterUpdate) {
                    var chain = this._afterUpdate;
                    this._afterUpdate = null;
                    chain.run();
                    if (this._afterUpdate) {
                        this._queueJob();
                    }
                }
            } finally {
                this._updating = false;
            }
        },

        /**
         * Performs a partial update if supported (validation only). Fires
         * validating event to listeners that validation has been started.
         * @see UpdateManager#validate
         * @override
         */
        validate: function () {
            this.desc('validate');
            var invalids = this._invalidWidgets;
            this.info('invalids = ', invalids);
            if (invalids.length === 0 || this._validating)
                return;
            try {
                this._validating = true;
                /**
                 * validating event.
                 * @event AsyncUpdateManager#validating
                 * @type {object}
                 * @property {UpdateManager} updateManager
                 */
                this.emit('validating', {
                    updateManager: this
                });
                invalids.forEach(function (wiz, i) {
                    wiz.validate();
                });
            } finally {
                this._validating = false;
            }
        },

        /**
         * Repaints the invalid widgets on the update queue.
         * @protected
         */
        _drawInvalidWidgets: function () {
            this.desc('_drawInvalidWidgets', [], undefined, 'tomato');
            var context = this.getGraphicContext();
            this._invalidWidgets.forEach(function (widget) {
                widget.draw(context);
            });
            this._invalidWidgets = [];
        }
    });

    return AsyncUpdateManager;
});
