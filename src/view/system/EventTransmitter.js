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
    'external/dom/dom',
    'external/genetic/genetic',
    'graphite/base/Base',
    './event/InternalMouseEvent'
], function (
    dom,
    genetic,
    Base,
    InternalMouseEvent
) {
    'use strict';

    /**
     * A EventTransmitter.
     * @constructor
     */
    function EventTransmitter() {
        Base.apply(this, arguments);
    }

    function receive(e) {
        this.desc('receive', e);
        var wiz;
        var p = mousePos(e);
        var root = this.getRoot();
        this.currentEvent = null;
        this._updateWidgetUnderMouse(e);
        if (this._captured) {
            if (this._mouseTarget) {
                this._currentEvent = new InternalMouseEvent(this._mouseTarget, e);
            }
        } else {
            wiz = root.getMouseEventTargetAt(p.x, p.y);
            if (wiz === this._mouseTarget) {
                if (this._mouseTarget) {
                    this._currentEvent = new InternalMouseEvent(this._mouseTarget, e);
                }
                return;
            }
            if (this._mouseTarget) {
                this._currentEvent = new InternalMouseEvent(this._mouseTarget, e);
                this._mouseTarget.emit('mouseleave', this._currentEvent);
            }
            this._setMouseTarget(wiz);
            if (this._mouseTarget) {
                this._currentEvent = new InternalMouseEvent(this._mouseTarget, e);
                this._mouseTarget.emit('mouseenter', this._currentEvent);
            }
        }
    }

    function mousePos(e) {
        var x = Math.round(e.offsetX);
        var y = Math.round(e.offsetY);
        return {
            x: x,
            y: y
        };
    }

    genetic.inherits(EventTransmitter, Base, {

        _captured: false,

        _currentEvent: null,

        _cursorTarget: null,

        _mouseTarget: null,

        _hoverTarget: null,

        /**
         * @param {Widget} widget
         */
        setRoot: function (widget) {
            this._root = widget;
        },

        /**
         * @return {Widget}
         */
        getRoot: function () {
            return this._root;
        },

        /**
         * Listens to the given container events.
         * @param {GraphicContainer} container
         */
        listen: function (container) {
            this.desc('listen', container);
            var that = this;
            var mask = container.getEventMask();
            this.setContainer(container);
            dom.addEvent(mask, 'mousedown', function (e) {
                that.transmitMouseDown(e);
            });
        },

        /**
         * Ignores the given container events.
         * @param {GraphicContainer} container
         */
        ignore: function (container) {
            //TODO
            //dom.removeEvent(mask, ...
        },

        /**
         * Return whether events are captured by a Widget.
         * @return {boolean}
         */
        isCaptured: function () {
            return this._captured;
        },

        /**
         * Sets capture to the given Widget. All subsequent events
         * will be sent to the given Widget until _release() is called.
         * @param {Widget} widget
         * @protected
         */
        _capture: function (widget) {
            this._captured = true;
            this._mouseTarget = widget;
        },

        /**
         * Releases a captured Widget.
         * @protected
         */
        _release: function () {
            this._captured = false;
        },

        /**
         * Updates the widget under the mouse cursor.
         * If the event has been captured by a Widget,
         * all the events will be routed to the Widget.
         * @param {MouseEvent} e
         * @protected
         */
        _updateWidgetUnderMouse: function (e) {
            var p = mousePos(e);
            this.desc('_updateWidgetUnderMouse', p.x +', '+ p.y);
            if (!this._captured) {
                var wiz = this.getRoot().getWidgetAt(p.x, p.y);
                this._setCursorTarget(wiz);
                if (this._cursorTarget !== this._hoverTarget) {
                    this._updateHoverTarget(e);
                }
            }
        },

        /**
         * Sets the Widget under the mouse cursor.
         * @param {Widget} widget
         * @protected
         */
        _setCursorTarget: function (widget) {
            this.desc('_setCursorTarget', widget);
            if (this._cursorTarget === widget) {
                return;
            }
            this._cursorTarget = widget;
            this._updateCursor();
        },

        /**
         * Update cursor with cursor target.
         * @protected
         */
        _updateCursor: function () {
            var mask = this.getContainer().getEventMask();
            if (this._cursorTarget) {
                dom.setStyles(mask, {
                    'cursor': this._cursorTarget.cursor
                });
            }
        },

        /**
         * @param {MouseEvent} e
         * @protected
         */
        _updateHoverTarget: function (e) {
            this.desc('_updateHoverTarget', e);
            var found = false, target;
            if (this._cursorTarget) {
                target = this._cursorTarget;
                while (!found && target.getParent()) {
                    if (target.toolTip()) {
                        found = true;
                    } else {
                        target = target.getParent();
                    }
                }
                this._setHoverTarget(target, e);
            } else {
                this._setHoverTarget(null, e);
            }
        },

        /**
         * Sets the Widget the mouse is hovering.
         * @param {Widget} widget
         * @param {MouseEvent} e
         * @protected
         */
        _setHoverTarget: function (widget, e) {
            this.desc('_setHoverTarget', arguments);
            this._hoverTarget = widget;
            //TODO shows tool tip
            this.warn('TODO shows tool tip');
        },

        /**
         * Sets the given Widget to be the target of
         * future mouse events.
         * @param {Widget} widget
         * @protected
         */
        _setMouseTarget: function (widget) {
            this.desc('_setMouseTarget', arguments);
            this._mouseTarget = widget;
        },

        /**
         * Sets container.
         * @param {GraphicContainer} container
         */
        setContainer: function (container) {
            this._container = container;
        },

        /**
         * Returns container.
         * @return {GraphicContainer}
         */
        getContainer: function () {
            return this._container;
        },

        /**
         * Transmits mousedown event to the mouseTarget.
         * @param {MouseEvent} e
         */
        transmitMouseDown: function (e) {
            receive.call(this, e);
            if (this._mouseTarget) {
                this._mouseTarget.emit('mousedown', this._currentEvent);
                if (this._currentEvent.isConsumed()) {
                    this._capture(this._mouseTarget);
                }
            }
        },
    });

    return EventTransmitter;
});
