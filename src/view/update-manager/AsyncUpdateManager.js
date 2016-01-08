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
    'graphite/view/update-manager/UpdateManager'
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
        this._dirtyRegions = new Map();
    }

    genetic.inherits(AsyncUpdateManager, UpdateManager, {

        /**
         * Adds the given widget to the update queue.
         * Invalid widgets will be validated before
         * the damaged regions are repainted.
         * @param {Widget} widget - Invalid widget
         */
        addInvalidWidget: function (widget) {
            this.desc('addInvalidWidget', widget);
            if (this._invalidWidgets.indexOf(widget) > -1) {
                return;
            }
            this._queueJob();
            this._invalidWidgets.push(widget);
        },

        /**
         * Queues new update job.
         * If job has already been queued,
         * a new queuing is not needed.
         * @protected
         */
        _queueJob: function () {
            this.desc('_queueJob');
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
                console.log('----- async -----');
                updateManager.update();
            }, 0, this);
        },

        /**
         * Performs the update.
         * 1. Validates the invalid widgets.
         * 2. Repaints the dirty regions.
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
                this._repairDamage();
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
                invalids = [];
                this._validating = false;
            }
        },

        /**
         * Repaints the dirty regions on the update queue and calls
         * UpdateManager#firePainting(Rectangle, Map)
         */
        _repairDamage: function () {
            this.warn('_repairDamage()');
            //TODO
            if (1) {
                var context = this.getGraphicContext();
                this.getRoot().render(context);
            }
        },

        /**
         * Adds a dirty region to the update queue.
         * If this isn't visible or either the width or height
         * are 0, the method returns without queueing the dirty region.
         * 
         * @param {Widget} widget - the widget that contains the dirty region
         * @param {number} x - the x coordinate of the dirty region
         * @param {number} y - the y coordinate of the dirty region
         * @param {number} w - the width of the dirty region
         * @param {number} h - the height of the dirty region
         */
        addDirtyRegion: function (widget, x, y, w, h) {
            this.desc('addDirtyRegion', arguments);
            if (w === 0 || h === 0 || !widget.isShowing()) {
                return;
            }
            var rect = this._dirtyRegions.get(widget);
            if (rect === undefined) {
                rect = new Rectangle(x, y, w, h);
                this._dirtyRegions.set(widget, rect);
            } else {
                this.info('%cbefore: ' + rect, 'color:blue');
                rect.union(x, y, w, h);
                this.info('%cafter: ' + rect, 'color:blue');
            }
            this._queueJob();
        }
    });

    return AsyncUpdateManager;
});
