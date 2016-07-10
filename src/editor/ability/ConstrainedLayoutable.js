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
 * @file ConstrainedLayoutable
 * @since 1.0.0
 * @author hw.shim@samsung.com
 */

define([
    'external/genetic/genetic',
    'graphite/view/geometry/Dimension',
    'graphite/view/geometry/Rectangle',
    '../command/CompoundCommand',
    './Layoutable',
    './Resizable'
], function (
    genetic,
    Dimension,
    Rectangle,
    CompoundCommand,
    Layoutable,
    Resizable
) {
    'use strict';

    /**
     * A ConstrainedLayoutable.
     * @constructor
     */
    function ConstrainedLayoutable() {
        Layoutable.apply(this, arguments);
    }

    /**
     * Constant being used to indicate that upon creation
     * (or during move) a size was not specified.
     */
    var UNSPECIFIED_SIZE = new Dimension();

    genetic.inherits(ConstrainedLayoutable, Layoutable, {

        /**
         * A {@link Resizable} is used by default for children.
         * Subclasses may override this to supply a different Ability.
         * @see Layoutable#_createChildAbility(Controller)
         * @implemented
         * @protected
         */
        _createChildAbility: function (child) {
            return new Resizable();
        },

        /**
         * Factors out RESIZE and ALIGN requests, otherwise calls super.
         * @param {Request} request
         * @return {Command}
         * @see Ability#getCommand(Request)
         */
        getCommand: function (request) {
            var type = request.type();
            if (type === 'REQ_RESIZE_CHILDREN')
                return this._getResizeChildrenCommand(request);
            if (type === 'REQ_ALIGN_CHILDREN')
                return this._getAlignChildrenCommand(request);
            return Layoutable.prototype.getCommand.call(this, request);
        },

        /**
         * Returns the Command to move a group of children.
         * By default, move and resize are treated
         * as the same for constrained layouts.
         * @param {Request} request
         * @return {Command} the Command to perform the move
         * @implemented
         */
        _getMoveChildrenCommand: function (request) {
            return this._getResizeChildrenCommand(request);
        },

        /**
         * Returns the Command to resize a group of children.
         * @param {ChangeBoundsRequest} request
         * @return {Command}
         * @protected
         */
        _getResizeChildrenCommand: function (request) {
            return this._getChangeConstraintCommand(request);
        },

        /**
         * Returns the Command for changing bounds for
         * a group of children.
         * @param {ChangeBoundsRequest} request
         * @return {Command}
         * @protected
         */
        _getChangeConstraintCommand: function (request) {
            var compoundCmd = new CompoundCommand();
            var command;
            request.controllers().forEach(function (child) {
                command = this._createChangeConstraintCommand(
                        request, child,
                        this._translateToModelConstraint(
                                this._getConstraintFor(request, child)));
                compoundCmd.add(command);
            }, this);
            return compoundCmd.unwrap();
        },

        /**
         * Generates a view constraint object for the given
         * ChangeBoundsRequest and child Controller.
         * If the Rectangle is omitted it will be calculated
         * based on the child Widget's current bounds and the
         * ChangeBoundsRequest's move and resize deltas.
         * It is made layout-relative by using
         * _translateFromAbsoluteToLayoutRelative(Translatable)
         * 
         * @param {ChangeBoundsRequest} request
         * @param {Controller} child
         * @param {Rectangle} rect
         * @return {Object} the view constraint
         */
        _getConstraintFor: function (request, child, rect) {
            if (!request) return null;
            if (child && !rect) {
                var view = child.view();
                rect = view.bounds().copy();
                view.translateToAbsolute(rect);
                rect = request.getTransformedRectangle(rect);
                this._translateFromAbsoluteToLayoutRelative(rect);
            }
            if (!rect) return null;
            if (rect.size().equals(UNSPECIFIED_SIZE)) {
                return this._getConstraintForPoint(rect.location());
            }
            return this._getConstraintForRectangle(rect);
        },

        /**
         * Generates a view constraint for the given CreateRequest by
         * delegating to _getConstraintFor(Request, Controller, Rectangle).
         * If the CreateRequest has a size, is used during
         * size-on-drop creation, a Rectangle of the request's location
         * and size is passed with the delegation.
         * Otherwise, a rectangle with the request's location
         * and an empty size (0,0) is passed over.
         * 
         * @param {CreateRequest} request
         * @return {Object} the view constraint
         */
        _getConstraintForCreate: function (request) {
            var size = request.size();
            if (!size || size.isEmpty()) {
                rect = new Rectangle(request.location(), UNSPECIFIED_SIZE);
            } else {
                rect = new Rectangle(request.location(), size);
            }
            this._translateFromAbsoluteToLayoutRelative(rect);
            return this._getConstraintFor(request, null, rect);
        },

        /**
         * Generates a constraint with given a Rectangle.
         * This method is called during most operations.
         * @param {Rectangle} rect
         * - the Rectangle relative to the _getLayoutOrigin()
         * @return {Object} the constraint
         * @protected
         * @abstarct
         */
        _getConstraintForRectangle: function (rect) {
            this.isInterface('_getConstraintForRectangle', rect);
        },

        /**
         * Generates a constraint with given a Point.
         * This method is called during creation,
         * when only a mouse location is available, as well as
         * during move, in case no resizing is involved.
         * @param {Point} point
         * - the Point relative to the _getLayoutOrigin()
         * @return {Object} the constraint
         * @protected
         * @abstarct
         */
        _getConstraintForPoint: function (point) {
            this.isInterface('_getConstraintForPoint', point);
        },

        /**
         * Returns the Command to change the specified child's constraint.
         * The constraint has been converted from a graphite-view constraint
         * to an object suitable for the model. Clients should implement.
         * @param {ChangeBoundsRequest} request
         * @param {Controller} child - child being changed.
         * @param {Object} constraint - the new constraint, after translation.
         * @return {Command} A Command to change the constraints of
         *    the given child as specified in the given request.
         * @protected
         * @abstract
         */
        _createChangeConstraintCommand: function (request, child, constraint) {
            this.isInterface('_createChangeConstraintCommand', arguments);
        },

        /**
         * Converts a constraint from the format used by LayoutManagers,
         * to the form stored in the model.
         * @param {Rectangle} viewConstraint
         * @return {Object} the model constraint
         * @protected
         * @TODO rename
         */
        _translateToModelConstraint: function (viewConstraint) {
            return viewConstraint;
        }
    });

    return ConstrainedLayoutable;
});
