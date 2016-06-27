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
 * @file Graphite Controller
 * @since 1.0.0
 * @author hw.shim@samsung.com
 */

define([
    'external/genetic/genetic',
    'external/map/Map',
    'graphite/base/BaseEmitter',
    'graphite/base/FlagSupport',
    '../ability/Ability',
    '../tool/MoveTracker'
], function (
    genetic,
    Map,
    BaseEmitter,
    FlagSupport,
    Ability,
    MoveTracker
) {
    'use strict';

    /**
     * An abstract class for all Graphite Controller.
     * @constructor
     */
    function Controller() {
        BaseEmitter.apply(this, arguments);
        this._model = null;
        this._parent = null;
        this._children = [];
        this._abilities = new Map();
        this._selectState = Controller.SELECTED_NONE;
    }

    var proto = genetic.mixin(BaseEmitter.prototype, FlagSupport.prototype, {

        /**
         * Activates this Controller, which in turn activates its children and
         * Abilities. Activation indicates that the Controller is realized
         * in an GraphicViewer. deactivate() is the inverse,
         * and is eventually called on all Controllers.
         * 
         * @see #deactivate()
         */
        activate: function () {
            this.desc('activate');
            this.setFlag(Controller.FLAG_ACTIVE, true);
            this._activateAbilities();
            this.children().forEach(function (child) {
                child.activate();
            });
            this.emit('activated', this);
        },

        /**
         * Returns true if this is active.
         * @return {boolean}
         */
        isActive: function() {
            return this.getFlag(Controller.FLAG_ACTIVE);
        },

        /**
         * A Controller is regarded to be selectable,
         * if it is active and its view is showing.
         * @return {boolean}
         */
        isSelectable: function () {
            return this.isActive() && this.view()
                    && this.view().isShowing();
        },

        /**
         * Sets the selected state for this Controller,
         * which may be one of:
         * SELECTED
         * SELECTED_NONE
         * SELECTED_PRIMARY
         * 
         * As only selectable {@link Controller}s may get selected,
         * the method may only be called with a selected value of
         * SELECTED or SELECTED_PRIMARY in case the receiver is selectable.
         * The method should rarely be overridden. Instead, Abilities that are
         * selection-aware listen for selectionChanged event.
         * 
         * @see Selectable
         * @param {number} state
         *//**
         * Returns the selected state of this Controller. This method should only be
         * called internally or by helpers such as Abilities.
         * 
         * @return {number}
         * SELECTED
         * SELECTED_NONE
         * SELECTED_PRIMARY
         */
        selectedState: function (state) {
            if (arguments.length) {
                if (this.isSelectable()
                    || state === Controller.SELECTED_NONE) {
                    if (this._selectState === state) return;
                    this._selectState = state;
                    this._onSelectionChanged();
                }
            } else {
                return this._selectState;
            }
        },

        /**
         * Only be called by GraphicViewer to indicate that
         * the Controller has been focused or blured keyboard focus.
         * Focus is considered to be part of the selected state.
         * Therefore, only selectable Controllers are able to
         * obtain focus, and the method may thus only be called with
         * a value of true in case the receiver is selectable.
         * 
         * The method should rarely be overridden. Instead, Abilities that are
         * selection-aware listen for notifications about the change of focus.
         * 
         * @param {boolean} value
         * @see Selectable
         *//**
         * Returns true if this Controller has focus.
         * The focused Controller is a property of the GraphicViewer.
         * The Viewer keeps this property in sync with its focus.
         * @see GraphicViewer#focused()
         * @return {boolean}
         */
        isFocus: function (value) {
            if (arguments.length) {
                if (this.isSelectable() || !value) {
                    if (this.isFocus() === value)
                        return;
                    this.setFlag(Controller.FLAG_FOCUS, value);
                    this._onSelectionChanged();
                }
            } else {
                return this.getFlag(Controller.FLAG_FOCUS);
            }
        },

        /**
         * Emits 'selectionChanged' event.
         * @protected
         */
        _onSelectionChanged: function () {
            this.emit('selectionChanged', this);
        },

        /**
         * Activates all Abilities installed on this Controller.
         * There is no reason to override this method.
         * @protected
         */
        _activateAbilities: function () {
            this.desc('activateAbilities');
            this._abilities.forEach(function (ability) {
                ability.activate();
            });
        },

        /**
         * Adds a child Controller to this Controller. This method is
         * called from _refreshChildren(). The followings occur
         * 
         * 1. The child is added to the this._children List,
         * and its parent is set to this.
         * 2. _addChildView(Controller, index) is called to add the child's visual.
         * 3. addNotify() is called on the child.
         * 4. child.activate() is called if this is active.
         * 5. emits that the child has been added.
         * 
         * Subclasses should implement addChildView(Controller, index).
         * 
         * @protected
         * @param {Controller} child
         * @param {number} index
         * @see #_addChildView(Controller, index)
         * @see #removeChild(Controller)
         * @see #reorderChild(Controller, index)
         */
        _addChild: function (child, index) {
            this.desc('_addChild', arguments);
            var children = this.children();
            if (!(child instanceof Controller)) {
                console.warn('child is not a Controller');
                return;
            }
            if (typeof index !== 'number') {
                index = children.length;
            }
            children.splice(index, 0, child);
            child.parent(this);
            this._addChildView(child, index);
            child.addNotify();
            if (this.isActive()) {
                child.activate();
            }
            this.emit('addChild', child, index);
        },

        /**
         * Removes a child Controller. This method is called from
         * _refreshChildren(). The followings occur in the order listed:
         * 
         * 1. ControllerListeners are notified that the child is being removed
         * 2. deactivate() is called if the child is active
         * 3. {@link Controller#removeNotify()} is called on the child.
         * 4. {@link #removeChildVisual(Controller)} is called to remove the child's
         * visual object.
         * 5. The child's parent is set to null
         * 
         * Subclasses should implement _removeChildView(Controller).
         * 
         * @protected
         * @param {Controller} child
         * @see #addChild(Controller, index)
         */
        _removeChild: function (child) {
            var children = this.children();
            var index = children.indexOf(child);
            if (index > -1) {
                this.emit('removeChild', child, index);
                if (this.isActive()) {
                    child.deactivate();
                }
                child.removeNotify();
                this._removeChildView(child);
                child.setParent(null);
                children.splice(index, 1);
            }
        },

        /**
         * Adds the child's view to this Controller's view.
         * @param {Controller} child
         * @param {number} index
         */
        _addChildView: function (child, index) {
            this.desc('_addChildView', arguments);
            var childView = child.view();
            this.contentPane().append(childView, index);
        },

        /**
         * Called after the Controller has been added to its parent.
         * This is used to indicate to the Controller that
         * it should refresh itself for the first time.
         */
        addNotify: function () {
            this.desc('addNotify');
            this._register();
            this._createAbilities();
            this.children().forEach(function (child) {
                child.addNotify();
            });
            this.refresh();
        },

        /**
         * Creates the initial Abilities and/or reserves slots for dynamic ones.
         * Should be implemented to install the inital Abilities based on the
         * model's initial state. null can be used to reserve a "slot",
         * should there be some desire to guarantee the ordering of Abilities.
         * @protected
         * @see installAbility(Object, Ability)
         */
        _createAbilities: function () {
            this.isInterface('_createAbilities');
        },

        /**
         * Installs an Ability for a specified role. A <i>role</i> is is
         * simply an Object used to identify the Ability. An example of a role is
         * layout. 'LAYOUT_ROLE' is generally used as the key for this Ability.
         * null is a valid value for reserving a location.
         * 
         * @param {string} role - an identifier
         * @param {Ability} ability
         */
        installAbility: function (role, ability) {
            this.desc('installAbility', arguments);
            var abilities = this._abilities;
            if (typeof role !== 'string') {
                throw new Error('role should be a string');
            }
            if (!(ability instanceof Ability)) {
                throw new Error('ability should be an instanceof Ability');
            }
            if (abilities.has(role) && this.isActive()) {
                abilities.get(role).deactivate();
            }
            abilities.set(role, ability);
            ability.host(this);
            if (this.isActive()) {
                ability.activate();
            }
        },

        /**
         * Refreshes all properties visually displayed by this Controller.
         * The default implementation will call _refreshChildren() to update
         * its structural features. It also calls _refreshViews() to update
         * its own displayed properties. Subclasses should extend this method to
         * handle additional types of structural refreshing.
         */
        refresh: function () {
            this.desc('refresh');
            this._refreshViews();
            this._refreshChildren();
        },

        /**
         * Refreshes this Controller's views. This method is called by
         * refresh(), and may also be called in response to notifications
         * from the model. This method does nothing by default.
         * Subclasses may override.
         */
        _refreshViews: function () {
            this.desc('_refreshViews', '', 'subclass should implement');
        },

        /**
         * Updates the set of children Controllers so that it is in sync with the
         * model children. This method is called from {@link #refresh()}, and may
         * also be called in response to notification from the model. This method
         * requires linear time to complete. Clients should call this method as few
         * times as possible. Consider also calling {@link #removeChild(Controller)}
         * and {@link #addChild(Controller, int)} which run in constant time.
         * 
         * The update is performed by comparing the existing Controllers with the set
         * of model children returned from {@link #getModelChildren()}. Controllers
         * whose models no longer exist are {@link #removeChild(Controller) removed}.
         * New models have their Controllers {@link #createChild(Object) created}.
         * 
         * This method should not be overridden.
         * 
         * @see #getModelChildren()
         */
        _refreshChildren: function () {
            this.desc('_refreshChildren');
            var controller;
            var children = this.children();
            var modelChildren = this._getModelChildren();
            var size = children.length;
            var mToC = new Map();
            if (size > 0) {
                children.forEach(function (child) {
                    mToC.set(child.model(), child);
                });
            }
            modelChildren.forEach(function (childModel, i) {
                if (!(children[i] && (children[i].model() === childModel))) {
                    controller = mToC.get(childModel);
                    if (controller) {
                        //Controller exist but wrong location.
                        this._reorderChild(controller, i);
                    } else {
                        //Controller doesn't exist, create and insert.
                        controller = this._createChild(childModel);
                        this._addChild(controller, i);
                    }
                }
            }, this);
            //If Controllers remain clean them.
            var ctrl, trash, trashLen;
            var childrenLen = children.length;
            var i = modelChildren.length;
            if (i < childrenLen) {
                trash = [];
                while (i < childrenLen) {
                    trash.push(children[i++]);
                }
                trashLen = trash.length;
                for (i = 0; i < trashLen; i++) {
                    ctrl = trash[i];
                    this.removeChild(ctrl);
                }
            }
        },

        /**
         * Returns a Array containing the children model objects.
         * If this Controller's model is a container, this method should be
         * overridden to returns its children. This is what causes children
         * Controllers to be created. Callers must not modify the returned List.
         * Must not return null.
         * @protected
         * @return {Array}
         */
        _getModelChildren: function () {
            return [];
        },

        /**
         * Create the child Controller for the given model object.
         * This method is called from _refreshChildren().
         * 
         * By default, the implementation will delegate to the
         * Viewer's ControllerFactory. Subclasses may override
         * this method instead of using a Factory.
         * 
         * @param {BaseModel} model
         * @return {Controller}
         */
        _createChild: function (model) {
            this.desc('_createChild', model);
            return this.viewer().controllerFactory().create(this, model);
        },

        /**
         * The view into which childrens' views will be added. May return the
         * same view as view(). The view may be composed of multiple views.
         * This is the view in that composition that will contain children's
         * views.
         * 
         * @return {Widget}
         */
        contentPane: function () {
            return this.view();
        },

        /**
         * Sets the parent Controller.
         * This should only be called by the parent Controller.
         * @param {Controller} parent
         * @return {Controller} this
         *//**
         * Returns the parent Controller.
         * @return {Controller}
         */
        parent: function (parent) {
            if (arguments.length) {
                this._parent = parent;
                return this;
            } else {
                return this._parent;
            }
        },

        /**
         * Returns the Array of children Controller. This method should
         * rarely be called, and is only made public so that helper objects
         * of this Controller, such as Abilities, can obtain the children.
         * The returned Array may be by reference, and should never be modified.
         * 
         * @return {Array}
         */
        children: function () {
            return this._children;
        },

        /**
         * Returns the Controller which is the target of the Request.
         * The default implementation delegates this method to
         * the installed Abilities. The first non-null result
         * returned by an Ability is returned. Subclasses should rarely
         * extend this method.
         * It is recommended that targeting be handled by Abilities,
         * and not directly by the Controller.
         * 
         * @param {Request} request
         *            Describes the type of target desired.
         * @return {Controller}
         * @see Ability#getTarget(Request)
         */
        getTarget: function (request) {
            var check, controller;
            this._abilities.forEach(function (ability) {
                check = ability.getTarget(request);
                if (check) controller = check;
            });
            if (controller) return controller; 
            if (request.type() === 'REQ_SELECTION') {
                if (this.isSelectable())
                    return this;
            }
            return null;
        },

        /**
         * @return {GraphicViewer}
         */
        viewer: function () {
            var root = this.root();
            if (root) {
                return root.viewer();
            }
            return null;
        },

        /**
         * Returns the RootController.
         * This method should only be called internally
         * or by Abilities. The root can be used to get the viewer.
         * @return {RootController}
         */
        root: function () {
            if (!this.parent()) {
                return null;
            }
            return this.parent().root();
        },

        /**
         * Set the primary model object that this Controller represents.
         * This method is used by an ControllerFactory
         * when creating an Controller.
         * @param {Object} model
         *//**
         * Returns the primary model object that this Controller represents.
         * Controllers may correspond to more than one model object,
         * or even no model object. In practice, the Object returned is used
         * by other Controllers to identify this Controller. In addition,
         * Abilities probably rely on this method to build
         * Commands that operate on the model.
         * @return {Object}
         */
        model: function () {
            if (arguments.length) {
                this._model = arguments[0];
            } else {
                return this._model;
            }
        },

        /**
         * Sets the primary Widget representing this Controller.
         * @param {Widget}
         *//**
         * Returns the primary Widget representing this Controller.
         * The parent will add this Widget to its content pane.
         * The Widget may be a composition of several Widgets.
         * @return {Widget}
         */
        view: function (view) {
            if (arguments.length) {
                this._view = view;
            } else {
                if (!this._view) {
                    this.view(this._createView());
                }
                return this._view;
            }
        },

        /**
         * Performs the specified Request. This method can be used to
         * send a generic message to an Controller. If the Controller
         * interprets this request to mean make a change in the model,
         * it should still use Commands and the CommandStack so that
         * the change is undoable. The CommandStack is available from
         * the Domain.
         * Subclasses should extend this method to handle Requests.
         * @param {Request} req 
         */
        request: function (req) {
        },

        /**
         * Used to filter Controllers from the current selection. If an
         * operation is going to be performed on the current selection, the
         * selection can first be culled to remove Controllers
         * that do not participate in the operation.
         * For example, when aligning the left edges of Controllers,
         * it makes sense to ignore any selected ConnectionControllers,
         * as they cannot be aligned.
         * 
         * Returns true if this understand the given Request.
         * By default, this responsibility is delegated
         * to this part's installed Abilities.
         * It is recommended that Abilities implement understands().
         * 
         * @param {Request} request
         * @return {boolean}
         */
        understands: function (request) {
            var result = false;
            this._abilities.forEach(function (ability) {
                if (ability.understands(request)) result = true;
            });
            this.desc('understands', request, result);
            return result;
        },

        /**
         * Creates the Widget to be used as this Controller's view.
         * This is called from view() if the view has not been created.
         * @return {Widget}
         * @protected
         */
        _createView: function () {
            this.isInterface('createView');
        },

        /**
         * Registers itself in the viewer's various registries.
         * If your Controller has a 1-to-1 relationship with a widget
         * and a 1-to-1 relationship with a model object,
         * the default implementation should be sufficent.
         * 
         * @see #_unregister()
         * @see GraphicViewer#viewControllerMap()
         * @see GraphicViewer#controllerRegistry()
         * @protected
         */
        _register: function () {
            this.desc('_register');
            this._registerModel();
            this._registerView();
            //TODO this._registerAccessibility();
        },

        /**
         * Registers the model in the GraphicViewer#controllerRegistry().
         * Subclasses should only extend this method if they need to
         * register this Controller in additional ways.
         */
        _registerModel: function () {
            this.desc('_registerModel');
            if (!this.model()) {
                throw new Error('null model error');
            }
            this.viewer().controllerRegistry().set(this.model(), this);
        },

        /**
         * Registers the views in the GraphicViewer#viewControllerMap().
         * Subclasses should override this method for the view they support.
         */
        _registerView: function () {
            this.viewer().viewControllerMap().set(this.view(), this);
        },

        /**
         * Returns default DragTracker.
         */
        getDragTracker: function () {
            return new MoveTracker(this);
        },

        /**
         * Shows or updates source feedback for the given Request.
         * By default, this responsibility is delegated to this' Abilities.
         * Subclasses should rarely extend this method.
         * It is recommended that feedback be handled by Abilities,
         * and not directly by the Controller.
         * @see Ability#showSourceFeedback(Request)
         * @see Controller#showSourceFeedback(Request)
         * @param {Request} request
         */
        showSourceFeedback: function (request) {
            if (!this.isActive())
                return;
            this._abilities.forEach(function (ability) {
                ability.showSourceFeedback(request);
            });
        },
    
        /**
         * Erases source feedback for the given Request. By default,
         * this responsibility is delegated to this' Abilities.
         * Subclasses should rarely extend this method.
         * It is recommended that feedback be handled by Abilities,
         * and not directly by the Controller.
         * @param {Request} request
         *  - identifies the type of feedback to erase.
         * @see #showSourceFeedback(Request)
         */
        eraseSourceFeedback: function (request) {
            if (this.isActive()) {
                this._abilities.forEach(function (ability) {
                    ability.eraseSourceFeedback(request);
                });
            }
        },

        /**
         * Shows or updates target feedback for the given Request.
         * By default, this responsibility is delegated to this' Abilities.
         * Subclasses should rarely extend this method.
         * It is recommended that feedback be handled by Abilities,
         * and not directly by the Controller.
         * @param {Request} request
         * @see Ability#showTargetFeedback(Request)
         */
        showTargetFeedback: function(request) {
            if (!this.isActive()) return;
            this._abilities.forEach(function (ability) {
                ability.showTargetFeedback(request);
            });
        },

        /**
         * Erases or updates target feedback for the given Request.
         * By default, this responsibility is delegated to this' Abilities.
         * Subclasses should rarely extend this method.
         * It is recommended that feedback be handled by Abilities,
         * and not directly by the Controller.
         * @param {Request} request
         * @see #showTargetFeedback(Request)
         */
        eraseTargetFeedback: function (request) {
            if (this.isActive()) {
                this._abilities.forEach(function (ability) {
                    ability.eraseTargetFeedback(request);
                });
            }
        },

        /**
         * Returns the specified adapter if recognized.
         * Additional adapter types may be added in the future.
         * Subclasses should extend this method as needed. 
         * @param {string} key
         * @return {Object}
         */
        getAdapter: function (key) {
            if (key === 'AccessibleController')
                return this._accessibleController();
            return null;
        },

        /**
         * Returns the AccessibleController adapter for this.
         * The same adapter instance must be used throughout the Controller's
         * existance. Each adapter has a unique ID which is registered during
         * {@link #register()}. Accessibility clients can only refer to this
         * Controller via that ID.
         * @return {AccessibleEditPart}
         */
        _accessibleController: function () {
            return null;
        }
    });

    genetic.inherits(Controller, BaseEmitter, proto);

    /** 
     * This flag is set during activate(), and reset on deactivate()
     * @constant {number}
     */
    Controller.FLAG_ACTIVE = 1;

    /**
     * This flag indicates that the Controller has focus.
     */
    Controller.FLAG_FOCUS = 2;

    /**
     * Used to indicate no selection
     */
    Controller.SELECTED_NONE = 0;

    /**
     * Used to indicate non-primary selection
     */
    Controller.SELECTED = 1;

    /**
     * Used to indicate primary selection, or "Anchor" selection.
     * Primary selection is defined as the last object selected.
     */
    Controller.SELECTED_PRIMARY = 2;

    return Controller;
});
