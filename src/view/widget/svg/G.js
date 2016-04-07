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
    'graphite/view/geometry/Rectangle',
    './Structural'
], function (
    genetic,
    Rectangle,
    Structural
) {
    'use strict';

    /**
     * The g element is a container used to group other SVG elements.
     * Transformations applied to the g element are performed on all
     * of its child elements, and any of its attributes are inherited
     * by its child elements. It can also group multiple elements to
     * be referenced later with the <use> element.
     * @constructor
     */
    function G() {
        Structural.apply(this, arguments);
    }

    genetic.inherits(G, Structural, {

        /**
         * Returns tagName for this Widget's element.
         * @return {string}
         */
        nodeName: function () {
            return 'g';
        },

        /**
         * Locates the svg polygon with it's points.
         * @param {GraphicContext} context
         * @see DomWidget#_locateElement
         * @protected
         */
        _locateElement: function (context) {
            this.desc('_locateElement', context);
            var b = this.bounds();
            this.attrCache.put({
                'transform': 'translate(' + b.x + ',' + b.y + ')'
            });
        },

        /**
         * Lays out this Widget using its Layout.
         */
        layout: function () {
            var r = new Rectangle();
            this.getChildren().forEach(function (child) {
                r.union(child.bounds());
            });
            this._bounds.w = r.w;
            this._bounds.h = r.h;
            Structural.prototype.layout.call(this);
        },

        /**
         * Returns true if this Widget uses local coordinates.
         * This means its children are placed relative to
         * this Widget's top-left corner.
         * @return {boolean}
         */
        isLocalCoordinates: function () {
            this.desc('isLocalCoordinates', [], true);
            return true;
        }
    });

    return G;
});
