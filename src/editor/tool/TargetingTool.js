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
    '../controller/AutoexposeHelper',
    '../request/Request',
    './Tool'
], function (
    genetic,
    AutoexposeHelper,
    Request,
    Tool
) {
    'use strict';

    /** @constant {number} */
    var FLAG_LOCK_TARGET = Tool.MAX_FLAG << 1;
    var FLAG_TARGET_FEEDBACK = Tool.MAX_FLAG << 2;

    /**
     * A TargetingTool.
     * @constructor
     * The base implementation for tools which perform targeting of Controllers.
     * Targeting tools may operate using either mouse drags or just mouse moves.
     * Targeting tools work with a target request. This request is used along
     * with the mouse location to obtain an active target from the current
     * Viewer. This target is then asked for the Command that
     * performs the given request. The target is also asked to show target feedback.
     * 
     * TargetingTool also provides support for auto-expose (a.k.a. auto-scrolling).
     * Subclasses that wish to commence auto-expose can do so by calling
     * {@link #_updateAutoexposeHelper()}. An an AutoExposeHelper is found,
     * auto-scrolling begins. Whenever that helper scrolls the diagram of performs
     * any other change, <code>_onMove</code> will be called as if the mouse had
     * moved. This is because the target has probably moved, but there is no input
     * event to trigger an update of the operation.
     */
    function TargetingTool() {
        Tool.apply(this, arguments);
        this._target_ = null;
        this._targetRequest_ = null;
        this._exposeHelper = null;
    }

    genetic.inherits(TargetingTool, Tool, {

        /**
         * @see Tool#deactivate()
         */
        deactivate: function () {
            if (this._isHoverActive())
                this._resetHover();
            this._eraseTargetFeedback();
            this._target_ = null;
            this._targetRequest_ = null;
            this._setAutoexposeHelper(null);
            Tool.prototype.deactivate.call(this);
        },

        /**
         * Resets hovering to inactive.
         * @protected
         */
        _resetHover: function () {
            if (this._isHoverActive())
                this._onHoverStop();
            this._setHoverActive(false);
        },

        /**
         * Called from _resetHover() iff hover is active. Subclasses may extend this
         * method to handle the hover stop event. Returns <code>true</code> if
         * something was done in response to the call.
         * 
         * @return {boolean}
         * @protected
         */
        _onHoverStop: function () {
            return false;
        },

        /**
         * Asks the target Controller to show target feedback
         * and sets the target feedback flag.
         * @protected
         */
        _showTargetFeedback: function () {
            var target = this._target();
            if (target) {
                target.showTargetFeedback(this._targetRequest());
            }
            this.setFlag(FLAG_TARGET_FEEDBACK, true);
        },

        /**
         * Asks the current target Controller to erase target feedback
         * using the target request. If target feedback is not being shown,
         * this method does nothing and returns. Otherwise, the target feedback
         * flag is reset to false, and the target Controller is asked to
         * erase target feedback. This methods should rarely be overridden.
         * @protected
         */
        _eraseTargetFeedback: function () {
            if (!this._isShowingTargetFeedback()) return;
            this.setFlag(FLAG_TARGET_FEEDBACK, false);
            var target = this._target();
            if (target) {
                target.eraseTargetFeedback(this._targetRequest());
            }
        },

        /**
         * Returns true if target feedback is being shown.
         * @return {boolean}
         * @protected
         */
        _isShowingTargetFeedback: function () {
            return this.getFlag(FLAG_TARGET_FEEDBACK);
        },

        /**
         * Sets the target Controller. If the target Controller is changing,
         * this method will call {@link #_onLeaveTarget()} for the
         * previous target if not null, and {@link #_onEnterTarget()}
         * for the new target, if not null.
         * @param {Controller} target
         * @protected
         *//**
         * Returns the current target Controller.
         * @return {Controller}
         * @protected
         */
        _target: function (target) {
            if (arguments.length) {
                if (target !== this._target_) {
                    if (this._target_)
                        this._onLeaveTarget();
                    this._target_ = target;
                    var req = this._targetRequest();
                    if (typeof req.setTarget === 'function')
                        req.setTarget(target);
                    this._onEnterTarget();
                }
            } else {
                return this._target_;
            }
        },

        /**
         * Lazily creates and returns the request used
         * when communicating with the target Controller.
         * @return {Request} the target request
         * @protected
         */
        _targetRequest: function () {
            if (!this._targetRequest_) {
                this._targetRequest_ = this._createTargetRequest();
            }
            return this._targetRequest_;
        },

        /**
         * Creates the target request that will be used with the target Controller.
         * This request will be cached and updated as needed.
         * @return {Request} the new target request
         * @protected
         */
        _createTargetRequest: function () {
            var request = new Request();
            request.type(this._getCommandName());
            return request;
        },

        /**
         * Subclasses should override to update the target request.
         * @protected
         */
        _updateTargetRequest: function () {
        },

        /**
         * Queries the target Controller for a command.
         * @return {Command}
         * @protected
         * @override
         */
        _getCommand: function () {
            var target = this._target();
            if (target == null)
                return null;
            return target.getCommand(this._targetRequest());
        },

        /**
         * Extended to reset the target lock flag.
         * @protected
         * @override
         */
        _resetFlags: function () {
            this.setFlag(FLAG_LOCK_TARGET, false);
            Tool.prototype._resetFlags.call(this);
        },

        /**
         * Locks-in the given Controller as the target. Updating of the target will
         * not occur until {@link #_unlockTarget()} is called.
         * 
         * @param {Controller} controller
         *            the target to be locked-in
         * @protected
         */
        _lockTarget: function (controller) {
            if (!controller) {
                this._unlockTarget();
                return;
            }
            this.setFlag(FLAG_LOCK_TARGET, true);
            this._target(controller);
        },

        /**
         * Releases the targeting lock, and updates the target
         * in case the mouse is already over a new target.
         * @protected
         */
        _unlockTarget: function () {
            this.setFlag(FLAG_LOCK_TARGET, false);
            this._updateTargetUnderMouse();
        },

        /**
         * Updates the target Controller and returns true
         * if the target changes. The target is updated by using
         * the target conditional and the target request.
         * If the target has been locked, this method does nothing
         * and returns false.
         * @return {boolean} - true if the target was changed
         * @protected
         */
        _updateTargetUnderMouse: function () {
            if (!this._isTargetLocked()) {
                var controller = null;
                var viewer = this.viewer();
                if (viewer)
                    controller = viewer.findObjectAtExcept(
                            this.location(),
                            this._getExclusionSet(),
                            this._getTargetingConditional());
                if (controller)
                    controller = controller.getTarget(this._targetRequest());
                var changed = this._target() !== controller;
                this._target(controller);
                return changed;
            } else
                return false;
        },

        /**
         * Returns a Array of objects that should be excluded
         * as potential targets for the operation.
         * @return {Array}
         * @protected
         */
        _getExclusionSet: function () {
            return [];
        },

        /**
         * Returns the conditional object used for obtaining the target
         * from the current viewer. By default, a conditional is returned
         * that tests whether an Controller at the current mouse location
         * indicates a target for the operation's request, using
         * {@link Controller#target(Request)}. If null is
         * returned, then the conditional fails, and the search continues.
         * 
         * @return {Object}
         * @protected
         */
        _getTargetingConditional: function() {
            var req = this._targetRequest();
            return {
                evaluate: function (controller) {
                    return !!controller.getTarget(req);
                }
            };
        },

        /**
         * Return <code>true</code> if the current target is locked.
         * @return {boolean}
         * @protected
         */
        _isTargetLocked: function () {
            return this.getFlag(FLAG_LOCK_TARGET);
        },

        /**
         * Called whenever the target Controller has changed. By default, the target
         * request is updated, and the new target is asked to show feedback.
         * Subclasses may extend this method if needed.
         * 
         * @return {boolean}
         * @protected
         */
        _onEnterTarget: function () {
            this._updateTargetRequest();
            this._showTargetFeedback();
            return true;
        },

        /**
         * Called whenever the target Controller is about to change. By default, hover
         * is reset, in the case that a hover was showing something, and the target
         * being exited is asked to erase its feedback.
         * 
         * @return {boolean}
         * @protected
         */
        _onLeaveTarget: function () {
            this._resetHover();
            this._eraseTargetFeedback();
            return true;
        },

        /**
         * Sets the target to null.
         * @return {boolean}
         * @protected
         * @override
         */
        _onMouseLeave: function () {
            this._target(null);
            return true;
        },

        /**
         * Called when invalid input is encountered. By default, feedback is erased,
         * and the current command is set to the unexecutable command. The state
         * does not change, so the caller must set the state to Tool.STATE_INVALID.
         * @return {boolean}
         * @protected
         */
        _onInvalidInput: function () {
            this._eraseTargetFeedback();
            this._currentCommand(UnexecutableCommand.SINGLETON);
            return true;
        },

        /**
         * Sets the active autoexpose helper to the given helper, or
         * null. If the helper is not null, a runnable is queued
         * on the event thread that will trigger a subsequent
         * {@link #_doAutoexpose()}. The helper is typically updated
         * only on a hover event.
         * 
         * @param helper
         *            the new autoexpose helper
         */
        _setAutoexposeHelper: function (helper) {
            this._exposeHelper = helper;
            if (!helper) return;
            this._queueAutoexpose();
        },

        _queueAutoexpose: function () {
            setTimeout(function (that) {
                if (that._exposeHelper)
                    that._doAutoexpose();
            }, 0, this);
        },

        /**
         * Called to perform an iteration of the autoexpose process.
         * If the expose helper is set, it will be asked to step
         * at the current mouse location. If it returns true,
         * another expose iteration will be queued. There is no
         * delay between autoexpose events, other than the time
         * required to perform the step().
         * @protected
         */
        _doAutoexpose: function () {
            var helper = this._exposeHelper;
            if (!helper) return;
            if (helper.step(this.location())) {
                this._onAutoexpose();
                this._queueAutoexpose();
            } else
                this._setAutoexposeHelper(null);
        },

        /**
         * This method is called whenever an autoexpose occurs.
         * When an autoexpose occurs, it is possible that everything
         * in the viewer has moved a little.
         * Therefore, by default, {@link Tool#_onMove()} is
         * called to simulate the mouse moving even though it didn't.
         * @protected
         */
        _onAutoexpose: function () {
            this._onMove();
        },

        /**
         * Updates the active {@link AutoexposeHelper}. Does nothing if there is
         * still an active helper. Otherwise, obtains a new helper (possible
         * <code>null</code>) at the current mouse location and calls
         * {@link #setAutoexposeHelper(AutoexposeHelper)}.
         * @protected
         */
        _updateAutoexposeHelper: function () {
            //TODO make ViewPort then releases comment
            return;
            if (this._exposeHelper) return;
            var loc = this.location();
            var search = new AutoexposeHelper.Search(loc);
            this.viewer().findObjectAtExcept(loc, [], search);
            this._setAutoexposeHelper(search.result);
        },

        /**
         * Returns the current autoexpose helper.
         * @return {AutoexposeHelper}
         * @protected
         */
        _getAutoexposeHelper: function () {
            return this._exposeHelper;
        }
    });

    /**
     * The max flag.
     */
    TargetingTool.MAX_FLAG = FLAG_TARGET_FEEDBACK;

    return TargetingTool;
});
