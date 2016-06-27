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
 * @file ToolUtil
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
     * A ToolUtil.
     */
    var ToolUtil = {

        /**
         * Returns an Array containing the top level selected Controllers
         * based on the viewer's selection.
         * @param {GraphicViewer} viewer
         * @return {Array}
         */
        getTopLevelSelected: function (viewer) {
            var selected = viewer.selected();
            var result = [];
            selected.forEach(function (ctrl) {
                if (!this.hasAncestorIn(selected, ctrl))
                    result.push(ctrl);
            }, this);
            return result;
        },

        /**
         * Checks if selected Array contains any ancestor of Controller.
         * @param {Array} selected
         * @param {Controller} ctrl
         * @return {boolean}
         */
        hasAncestorIn: function (selected, ctrl) {
            ctrl = ctrl.parent();
            while (ctrl) {
                if (selected.indexOf(ctrl) > -1)
                    return true;
                ctrl = ctrl.parent();
            }
            return false;
        },

        /**
         * Filters the given Array of Controllers so that the Array
         * only contains the Controllers that understand the given request.
         * @param {Array} selected
         * @param {Request} request
         * @return {Array}
         */
        filterWithRequest: function (selected, request) {
            var result = [];
            selected.forEach(function (ctrl) {
                if (ctrl.understands(request))
                    result.push(ctrl);
            });
            return result;
        }
    };

    return ToolUtil;
});
