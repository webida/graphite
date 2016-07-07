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
    './Model'
], function (
    graphite,
    Model
) {
    'use strict';

    var genetic = graphite.util.genetic;

    /**
     * A Shape.
     * @constructor
     */
    function Shape() {
        Model.apply(this, arguments);
    }

    genetic.inherits(Shape, Model, {

        setColor: function (color) {
            if (this.styles.color !== color) {
                this.styles.color = color;
                this.emit('change', {
                    type: 'color',
                    value: color
                });
            }
        },

        setSize: function (size) {
            if (this.styles.w !== size.w
                    || this.styles.h !== size.h) {
                this.styles.w = size.w;
                this.styles.h = size.h;
                this.emit('change', {
                    type: 'size',
                    value: {
                        w: size.w,
                        h: size.h
                    }
                });
            }
        },

        setLocation: function (location) {
            if (this.styles.x !== location.x
                    || this.styles.y !== location.y) {
                this.styles.x = location.x;
                this.styles.y = location.y;
                this.emit('change', {
                    type: 'location',
                    value: {
                        x: location.x,
                        y: location.y
                    }
                });
            }
        }
    });

    return Shape;
});
