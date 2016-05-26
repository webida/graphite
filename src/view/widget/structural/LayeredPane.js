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
    'graphite/view/layout/StackLayout',
    './Layer'
], function (
    genetic,
    StackLayout,
    Layer
) {
    'use strict';

    /**
     * A LayeredPane.
     * @constructor
     */
    function LayeredPane() {
        Layer.apply(this, arguments);
        this.layerKeys = [];
        this.setLayout(new StackLayout());
    }

    genetic.inherits(LayeredPane, Layer, {

        /**
         * Adds the given layer, identifiable with the given key, at the
         * specified index. While adding the layer, it informs the surrounding
         * layers of the addition.
         * @param {Widget} child - The Widget to add
         * @param {number} index - Where the new Widget should be added
         * @param {Object|string} layerKey - The added Widget's constraint
         */
        append: function (child, index, layerKey) {
            this.desc('append', arguments);
            if (arguments.length === 3) {
                if (index === -1) {
                    index = this.layerKeys.length;
                }
                Layer.prototype.append.call(this, child, index, null);
                this.layerKeys.splice(index, 0, layerKey);
            } else {
                Layer.prototype.append.apply(this, arguments);
            }
        },

        /**
         * Returns the layer identified by the key given in the input.
         * @param {string|number} key
         *      - the key or index to identify the desired layer
         * @return {Layer}
         */
        getLayer: function (key) {
            var index;
            if (typeof key === 'string') {
                index = this.layerKeys.indexOf(key);
            } else if (typeof key === 'number') {
                index = key;
            }
            if (index === -1) {
                return null;
            } else {
                return this.getChildren()[index];
            }
        },

        remove: function (widget) {
            this.desc('remove', widget);
            var index = this.getChildren().indexOf(widget);
            if (index !== -1) {
                this.layerKeys.splice(index, 1);
            }
            Layer.prototype.remove.call(this, widget);
        }
    });

    return LayeredPane;
});
