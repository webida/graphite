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
    'graphite/graphite',
    '../ability/CustomXYLayoutable'
], function (
    graphite,
    CustomXYLayoutable
) {
    'use strict';

    var Controller = graphite.editor.controller.Controller;
    var genetic = graphite.util.genetic;
    var Svg = graphite.view.widget.svg.Svg;
    var Undetachable = graphite.editor.ability.Undetachable;

    /**
     * A DiagramController.
     * @constructor
     */
    function DiagramController() {
        var that = this;
        Controller.apply(this, arguments);
        this._listener = function (data) {
            if (data.type === 'child-append'
                    || data.type === 'child-remove') {
                that._refreshChildren();
            }
        };
    }

    genetic.inherits(DiagramController, Controller, {

        /**
         * Listens to model's change.
         * @override
         */
        activate: function () {
            if (!this.isActive()) {
                Controller.prototype.activate.call(this);
                this.model().on('change', this._listener);
            }
        },

        /**
         * Removes listener.
         * @override
         */
        deactivate: function () {
            if (this.isActive()) {
                Controller.prototype.deactivate.call(this);
                this.model().off('change', this._listener);
            }
        },

        /**
         * @see Controller#createView()
         * @return {Widget}
         */
        _createView: function () {
            return new Svg();
        },

        _refreshViews: function () {
            this.desc('refreshViews', arguments);
        },

        /**
         * @see Controller#_createAbilities()
         */
        _createAbilities: function () {
            this.installAbility('COMPONENT_ROLE', new Undetachable());
            this.installAbility('LAYOUT_ROLE', new CustomXYLayoutable());
        },

        /**
         * @protected
         * @override
         * @return {Array}
         */
        _getModelChildren: function () {
            return this.model().children;
        }
    });

    return DiagramController;
});
