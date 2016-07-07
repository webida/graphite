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
 * @file ShapeDeletable enables the removal
 *  of a Shapes instance from its container.
 * @since 1.0.0
 * @author hw.shim@samsung.com
 */

define([
    'graphite/graphite',
    '../command/ShapeDeleteCommand',
    '../model/Diagram',
    '../model/Shape'
], function (
    graphite,
    ShapeDeleteCommand,
    Diagram,
    Shape
) {
    'use strict';

    var Nestable = graphite.editor.ability.Nestable;
    var genetic = graphite.util.genetic;

    /**
     * A ShapeDeletable enables the removal of
     * a Shape instance from its container.
     * @constructor
     */
    function ShapeDeletable() {
        Nestable.apply(this, arguments);
    }

    genetic.inherits(ShapeDeletable, Nestable, {

        /**
         * Enables the removal of a Shape instance from its container.
         * @param {GroupRequest} deleteRequest
         * @return {Command}
         */
        _createDeleteCommand: function (deleteRequest) {
            var host = this.host();
            var parent = host.parent().model();
            var child = host.model();
            if (parent instanceof Diagram && child instanceof Shape) {
                return new ShapeDeleteCommand(parent, child);
            }
            return Nestable.prototype._createDeleteCommand.call(this, deleteRequest);
        }
    });

    return ShapeDeletable;
});
