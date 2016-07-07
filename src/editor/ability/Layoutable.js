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
 * @file Layoutable
 * @since 1.0.0
 * @author hw.shim@samsung.com
 */

define([
    'external/genetic/genetic',
    './Ability'
], function (
    genetic,
    Ability
) {
    'use strict';

    /**
     * A Layoutable supports interaction with children Controllers
     * with host's LayoutManager This ability and it's derrived Classes
     * are responsible for moving, resizing, and creating children.
     * They should provide Commands for all of these operations.
     * The Layoutables will decorate it's host's children with
     * 'Child Abilities'. Please refer to Resizable, Movable.
     * Simple layouts will use either of them depencing on how
     * the LayoutManager works, and/or attributes of the child Controller.
     * @constructor
     */
    function Layoutable() {
        Ability.apply(this, arguments);
        this._addChildListener = null;
        this._sizeOnDropFeedback = null;
    }

    genetic.inherits(Layoutable, Ability, {

        /**
         * Extends activate() to allow proper decoration of children.
         */
        activate: function () {
            this.desc('activate');
            this._addHostListener();
            this._decorateChildren();
            Ability.prototype.activate.call(this);
        },

        /**
         * Sets the Listener used to decorate new children.
         * The listener will be notified when children are added to the host.
         */
        _addHostListener: function () {
            var layoutable = this;
            this._addChildListener = function (child, index) {
                layoutable._decorateChild(child);
            };
            this.host().on('addChild', this._addChildListener);
        },

        /**
         * Removes the Listener used to decorate new children.
         */
        _removeHostListener: function () {
            this.host().off('addChild', this._addChildListener);
            this._addChildListener = null;
        },

        /**
         * Overrides deactivate to remove the HostListener.
         * @see Ability#deactivate()
         */
        deactivate: function () {
            if (this._sizeOnDropFeedback) {
                this._removeFeedback(this._sizeOnDropFeedback);
                this._sizeOnDropFeedback = null;
            }
            this._removeHostListener();
            Ability.prototype.deactivate.call(this);
        },

        /**
         * Decorates all existing children. This method is called on activation.
         * @protected
         */
        _decorateChildren: function () {
            this.desc('_decorateChildren');
            this.host().children().forEach(function (child) {
                this._decorateChild(child);
            }, this);
        },

        /**
         * Decorates the child with a 'PRIMARY_DRAG_ROLE'
         * such as {@link Resizable}.
         * @param {Controller} child - the child being decorated
         * @protected
         */
        _decorateChild: function (child) {
            this.desc('_decorateChild', child);
            child.installAbility('PRIMARY_DRAG_ROLE',
                    this._createChildAbility(child));
        },

        /**
         * Removes all decorations added by {@link #_decorateChildren()}.
         * @protected
         */
        _undecorateChildren: function () {
            this.desc('_undecorateChildren');
            this.host().children().forEach(function (child) {
                this._undecorateChild(child);
            }, this);
        },

        /**
         * Removes the decoration added in {@link #_decorateChild(Controller)}.
         * @param {Controller} child
         *  - the child whose decoration is being removed.
         * @protected
         */
        _undecorateChild: function (child) {
            child.uninstallAbility('PRIMARY_DRAG_ROLE');
        },

        /**
         * Returns the child Ability used to decorate the child.
         * @param {Controller} child
         * @return {Ability}
         * @protected
         */
        _createChildAbility: function (child) {
            this.isInterface('_createChildAbility', child);
        },

        /**
         * Returns the host if the Request is an ADD, MOVE, CREATE or CLONE.
         * @param {Request} request
         * @see Ability#getTarget(Request)
         */
        getTarget: function (request) {
            var type = request.type();
            if (type === 'REQ_ADD' ||
                    type === 'REQ_MOVE' ||
                    type === 'REQ_CREATE' ||
                    type === 'REQ_CLONE') {
                return this.host();
            }
            return null;
        },

        /**
         * Factors out incoming requests into various specific methods.
         * @param {Request} request
         * @return {Command}
         * @see Ability#getCommand(Request)
         * @override
         */
        getCommand: function (request) {
            this.desc('getCommand', request);
            var type = request.type();
            if (type === 'REQ_DELETE_DEPENDANT')
                return getDeleteDependantCommand(request);

            if (type === 'REQ_ADD')
                return this._getAddCommand(request);

            if (type === 'REQ_ORPHAN_CHILDREN')
                return getOrphanChildrenCommand(request);

            if (type === 'REQ_MOVE_CHILDREN')
                return this._getMoveChildrenCommand(request);

            if (type === 'REQ_CLONE')
                return this._getCloneCommand(request);

            if (type === 'REQ_CREATE')
                return getCreateCommand(request);

            return null;
        },

        /**
         * Override to return the Command to perform an 'REQ_ADD ADD'.
         * @param {Request} request - the ADD Request
         * @return {Command} A command to perform the ADD.
         * @protected
         */
        _getAddCommand: function (request) {
            return null;
        },

        /**
         * Returns the Command to move a group of children.
         * @param {Request} request
         * @return {Command} the Command to perform the move
         * @abstract
         */
        _getMoveChildrenCommand: function (request) {
            this.isInterface('_getMoveChildrenCommand', request);
        },

        /**
         * Override to contribute to clone requests.
         * @param {ChangeBoundsRequest} request - the clone request
         * @return {Command} the command contribution to the clone
         * @protected
         */
        _getCloneCommand: function (request) {
            return null;
        },

        /**
         * Returns the Command to perform a create.
         * @param {CreateRequest} request
         * @return {Command}
         * @abstract
         */
        _getCreateCommand: function (request) {
            this.isInterface('_getMoveChildrenCommand', request);
        },

        /**
         * Factors feedback requests into two more specific methods.
         * @param {Request} request
         * @see Ability#showTargetFeedback(Request)
         */
        showTargetFeedback: function (request) {
            this.desc('showTargetFeedback', request);
            var type = request.type();
            if (type === 'REQ_ADD' ||
                    type === 'REQ_CLONE' ||
                    type === 'REQ_MOVE' ||
                    type === 'REQ_RESIZE_CHILDREN' ||
                    type === 'REQ_CREATE')
                this._showLayoutTargetFeedback(request);

            if (type === 'REQ_CREATE') {
                if (request.getSize()) {
                    this._showSizeOnDropFeedback(request);
                }
            }
        },

        /**
         * Calls two more specific methods depending on the Request.
         * @param {Request} request
         * @see Ability#eraseTargetFeedback(Request)
         */
        eraseTargetFeedback: function (request) {
            this.desc('eraseTargetFeedback', request);
            var type = request.type();
            if (type === 'REQ_ADD' ||
                    type === 'REQ_CLONE' ||
                    type === 'REQ_MOVE' ||
                    type === 'REQ_RESIZE_CHILDREN' ||
                    type === 'REQ_CREATE')
                this._eraseLayoutTargetFeedback(request);
    
            if (type === 'REQ_CREATE')
                this._eraseSizeOnDropFeedback(request);
        },

        /**
         * Erases target layout feedback.
         * @param {Request} request
         * @protected
         */
        _eraseLayoutTargetFeedback: function (request) {
        },

        /**
         * Erases size-on-drop feedback used during creation.
         * @param {Request} request
         * @protected
         */
        _eraseSizeOnDropFeedback: function (request) {
            if (this._sizeOnDropFeedback) {
                this._removeFeedback(this._sizeOnDropFeedback);
                this._sizeOnDropFeedback = null;
            }
        },

        /**
         * Shows target layout feedback. During moves, reparents, and
         * creation, this method is called to allow the Layoutable to
         * temporarily show features of its layout that will help the User
         * understand what will happen if the operation is performed in the
         * current location.
         * By default, no feedback is shown.
         * 
         * @param {Request} request
         * @see #eraseLayoutTargetFeedback(Request)
         * @protected
         */
        _showLayoutTargetFeedback: function (request) {
        },

        /**
         * Shows size-on-drop feedback during creation.
         * @param {CreateRequest} request
         * @protected
         */
        _showSizeOnDropFeedback: function (request) {
        },

        /**
         * Returns the layout's origin relative to the
         * {@link Layoutable#_getLayoutContainer()}.
         * In other words, what Point on the parent does the LayoutManager use
         * a reference when generating the child widget's bounds from
         * the child's constraint.
         * By default, it is assumed that the layout manager positions children
         * relative to the client area of the layout container. Thus, when
         * processing Viewer-relative Points or Rectangles, the clientArea's
         * location (top-left corner) will be subtracted from the Point/Rectangle,
         * resulting in an offset from the LayoutOrigin.
         * @return {Point}
         * @protected
         */
        _getLayoutOrigin: function () {
            return this._getLayoutContainer().clientArea().location();
        },

        /**
         * Returns the host's contentPane. The contentPane is the Widget
         * which parents the children. It is also the Widget which has
         * the LayoutManager that corresponds to this Ability.
         * All operations should be interpreted with respect to this Widget.
         * @return {Widget}
         *  - the Widget that owns the corresponding LayoutManager
         * @protected
         */
        _getLayoutContainer: function () {
            return this.host().contentPane();
        },

        /**
         * Translates a Translatable in absolute coordinates to be
         * layout-relative, i.e. relative to the _getLayoutContainer().
         * @param {Translatable} t
         *  - the Translatable in absolute coordinates to be translated to
         *     layout-relative coordinates.
         * @protected
         */
        _translateFromAbsoluteToLayoutRelative: function (t) {
            var widget = this._getLayoutContainer();
            widget.translateToRelative(t);
            widget.translateFromParent(t);
            var negatedOrigin = this._getLayoutOrigin().getNegated();
            t.translate(negatedOrigin.x, negatedOrigin.y);
        }
    });

    return Layoutable;
});
