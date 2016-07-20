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
    'graphite/graphite'
], function (
    graphite
) {
    'use strict';

    var BaseModel = graphite.editor.model.BaseModel;
    var genetic = graphite.util.genetic;

    /**
     * A Model.
     * @constructor
     */
    function Model() {
        BaseModel.apply(this, arguments);
        this.children = [];
        this.styles = {};
    }

    genetic.inherits(Model, BaseModel, {

        /**
         * @param {Model} child
         */
        append: function (child) {
            this.children.push(child);
            this.emit('change', {
                type: 'child-append'
            });
        },

        /**
         * Removes the given child from this then return true,
         * if the child has been deleted otherwise false.
         * @param {Model} child
         * @return {boolean}
         */
        remove: function (child) {
            var index = this.children.indexOf(child);
            if (index > -1) {
                this.children.splice(index, 1);
                this.emit('change', {
                    type: 'child-remove'
                });
                return true;
            } else {
                return false;
            }
        },

        /**
         * @param {Object} styles
         */
        style: function (styles) {
            var props = Object.getOwnPropertyNames(styles);
            props.forEach(function (prop) {
                this.styles[prop] = styles[prop];
            }, this);
        }
    });

    return Model;
});
