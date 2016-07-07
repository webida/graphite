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
 * @file CustomXYLayoutable
 * @since 1.0.0
 * @author hw.shim@samsung.com
 */

define([
    'graphite/graphite',
    '../command/ShapeConstraintCommand',
    '../controller/ShapeController'
], function (
    graphite,
    ShapeConstraintCommand,
    ShapeController
) {
    'use strict';

    var XYLayoutable = graphite.editor.ability.XYLayoutable;
    var genetic = graphite.util.genetic;
    var Rectangle = graphite.view.geometry.Rectangle;

    /**
     * A CustomXYLayoutable.
     * @constructor
     */
    function CustomXYLayoutable() {
        XYLayoutable.apply(this, arguments);
    }

    genetic.inherits(CustomXYLayoutable, XYLayoutable, {

        /**
         * Returns a command that can move and/or resize a Shape.
         * @param {ChangeBoundsRequest} request
         * @param {Controller} child
         * @param {Object} constraint
         * @see ConstrainedLayoutable#_createChangeConstraintCommand(
         *      ChangeBoundsRequest, Controller, Object)
         * @inheritdoc
         * @implemented
         */
        _createChangeConstraintCommand: function (req, child, constraint) {
            if (child instanceof ShapeController
                    && constraint instanceof Rectangle) {
                return new ShapeConstraintCommand(
                        child.model(), req, constraint);
            }
            return null;
        },

        /**
         * Returns a command that can add a Shape to a ShapesDiagram
         * @param {CreateRequest} request
         * @return {Command}
         * @see Layoutable#getCreateCommand(CreateRequest)
         * @protected
         */
        __getCreateCommand: function (request) {
            var newShape = request.getNewObject();
            if (newShape instanceof Shape) {
                return new ShapeCreateCommand(newShape,
                        this.host().model(),
                        this.getConstraintFor(request));
            }
            return null;
        }
    });

    return CustomXYLayoutable;
});
