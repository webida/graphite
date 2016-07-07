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
    '../ability/ShapeDeletable'
], function (
    graphite,
    ShapeDeletable
) {
    'use strict';

    var Controller = graphite.editor.controller.Controller;
    var genetic = graphite.util.genetic;
    var Rect = graphite.view.widget.svg.Rect;

    /**
     * A ShapeController.
     * @constructor
     */
    function ShapeController() {
        Controller.apply(this, arguments);
    }

    genetic.inherits(ShapeController, Controller, {

        /**
         * On activation,
         * adds a property change listener to the model.
         */
        activate: function () {
            if (!this.isActive()) {
                var shapeController = this;
                Controller.prototype.activate.call(this);
                this._changeListener = function (data) {
                    if (data.type === 'size' || data.type === 'location') {
                        shapeController._refreshViews();
                    }
                };
                this.model().on('change', this._changeListener);
            }
        },

        /**
         * On deactivation,
         * removes the property change listener from the model.
         */
        deactivate: function () {
            if (this.isActive()) {
                Controller.prototype.deactivate.call(this);
                this.model().off('change', this._changeListener);
            }
        },

        /**
         * @see Controller#createView()
         * @return {Widget}
         */
        _createView: function () {
            return new Rect();
        },

        _refreshViews: function () {
            this.desc('refreshViews', arguments);
            var view = this.view();
            var s = this.model().styles;
            view.bgColor(s.color).bounds(s.x, s.y, s.w, s.h);
        },

        /**
         * @see Controller#_createAbilities()
         */
        _createAbilities: function () {
            this.installAbility('COMPONENT_ROLE', new ShapeDeletable());
        }
    });

    return ShapeController;
});
