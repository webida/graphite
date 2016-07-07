/*
 * Copyright (c) 2012-2016 S-Core Co., Ltd.
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
 * @file HandleSelectable
 * @since 1.0.0
 * @author hw.shim@samsung.com
 */

define([
    'external/genetic/genetic',
    './Selectable'
], function (
    genetic,
    Selectable
) {
    'use strict';

    /**
     * A HandleSelectable manages a List of handles provided by the
     * subclass. Handles are Widgets which are added to the HANDLE layer,
     * and generally return a DragTracker for dragging them.
     * Handles are accessible for keyboard use if they return
     * an accessible location.
     * If any of the managed Handles provide accesible locations,
     * then an AccessibleHandleProvider is automatically created.
     * @constructor
     */
    function HandleSelectable() {
        Selectable.apply(this, arguments);
        this._handles = null;
    }

    genetic.inherits(HandleSelectable, Selectable, {

        /**
         * Overrided to show selection.
         * This adds the selection handles.
         * @protected
         * @override
         */
        _showSelection: function () {
            this._addSelectionHandles();
        },

        /**
         * Override to hide selection.
         * This removes the handles.
         * @protected
         * @override
         */
        _hideSelection: function () {
            this._removeSelectionHandles();
        },

        /**
         * Adds the handles to the handle layer.
         * @protected
         */
        _addSelectionHandles: function () {
            this._removeSelectionHandles();
            var layer = this._getLayer('HANDLE_LAYER');
            this._handles = this._createSelectionHandles();
            this._handles.forEach(function (handle) {
                layer.append(handle);
            });
        },

        /**
         * removes the selection handles from the selection layer.
         * @protected
         */
        _removeSelectionHandles: function () {
            if (this._handles === null)
                return;
            var layer = this._getLayer('HANDLE_LAYER');
            this._handles.forEach(function (handle) {
                layer.remove(handle);
            });
            this._handles = null;
        },

        /**
         * Subclasses must implement to provide the list of handles.
         * @return {Array} - Array of handles; cannot be null
         * @protected
         */
         _createSelectionHandles: function () {
             this.isInterface('_createSelectionHandles');
         },

        getAdapter: function (key) {
            var that = this;
            if (key === 'AccessibleHandleProvider')
                return new AccessibleHandleProvider({
                    getAccessibleHandleLocations: function () {
                        var result = [];
                        if (that._handles) {
                            that._handles.forEach(function (handle) {
                                var p = handle.accessibleLocation();
                                if (p) result.add(p);
                            });
                        }
                        return result;
                    }
                });
            return null;
        }
    });

    return HandleSelectable;
});
