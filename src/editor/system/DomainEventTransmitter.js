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
    'graphite/view/system/event/EventTransmitter',
    'graphite/view/system/event/InternalMouseEvent'
], function (
    genetic,
    EventTransmitter,
    InternalMouseEvent
) {
    'use strict';

    /**
     * A DomainEventTransmitter.
     * @constructor
     */
    function DomainEventTransmitter(domain, viewer) {
        EventTransmitter.apply(this, arguments);
        this.domain = domain;
        this.viewer = viewer;
        this._editorCaptured = false;
        this.setKeyTraversable(false);
    }

    function viewIsBusy() {
        if (this._currentEvent !== null)
            if (this._currentEvent.isConsumed())
                return true;
        if (this.isCaptured())
            return true;
        return false;
    }

    genetic.inherits(DomainEventTransmitter, EventTransmitter, {

        /**
         * @param {Widget} widget
         * @protected
         * @override
         */
        _capture: function (widget) {
            EventTransmitter.prototype._capture.call(this, widget);
            if (!widget) {
                this._release();
                this.routeEventsToEditor(true);
            }
        },

        /**
         * Sets whether events should go directly to the domain.
         * @param {boolean} value
         */
        routeEventsToEditor: function (value) {
            this._editorCaptured = value;
        },

        /**
         * Overrides cursor.
         * @param {string} cursor
         */
        overrideCursor: function (cursor) {
            if (this._overrideCursor === cursor) return;
            this._overrideCursor = cursor;
            this._updateCursor();
        },

        /**
         * Update cursor with cursor target.
         * @protected
         */
        _updateCursor: function () {
            if (this._cursorTarget) {
                if (this._overrideCursor) {
                    this._setCursor(this._overrideCursor);
                } else {
                    this._setCursor(this._cursorTarget.cursor());
                }
            }
        },

        /**
         * Transmits focus event.
         * @param {MouseEvent} e
         */
        transmitFocus: function (e) {
            EventTransmitter.prototype.transmitFocus.call(this, e);
            this.domain.receiveEvent('focus', e, this.viewer);
        },

        /**
         * Transmits focus event.
         * @param {MouseEvent} e
         */
        transmitBlur: function (e) {
            EventTransmitter.prototype.transmitBlur.call(this, e);
            this.domain.receiveEvent('blur', e, this.viewer);
            this.routeEventsToEditor(false);
        },

        /**
         * Transmits keydown event.
         * @param {KeyboardEvent} e
         */
        transmitKeyDown: function (e) {
            if (!this._editorCaptured) {
                EventTransmitter.prototype.transmitKeyDown.call(this, e);
                if (viewIsBusy.call(this)) return;
            }
            if (this.domain)
                this.domain.receiveEvent('keyDown', e, this.viewer);
        },

        /**
         * Transmits keyup event.
         * @param {KeyboardEvent} e
         */
        transmitKeyUp: function (e) {
            if (!this._editorCaptured) {
                EventTransmitter.prototype.transmitKeyUp.call(this, e);
                if (viewIsBusy.call(this)) return;
            }
            if (this.domain) this.domain.receiveEvent('keyUp', e, this.viewer);
        },

        /**
         * Transmits keytraverse event.
         * @param {KeyboardEvent} e
         */
        transmitKeyTraverse: function (e) {
            if (!this._editorCaptured) {
                EventTransmitter.prototype.transmitKeyTraverse.call(this, e);
                if (!e.doit) return;
            }
            if (this.domain)
                this.domain.receiveEvent('keyTraverse', e, this.viewer);
        },

        /**
         * Transmits wheel event.
         * @param {MouseEvent} e
         */
        transmitWheel: function (e) {
            if (!this._editorCaptured)
                EventTransmitter.prototype.transmitWheel.call(this, e);
            if (e.doit && this.domain)
                this.domain.receiveEvent('wheel', e, this.viewer);
        },

        /**
         * Transmits dblclick event to the mouseTarget.
         * @param {MouseEvent} e
         */
        transmitDblClick: function (e) {
            if (!this._editorCaptured) {
                EventTransmitter.prototype.transmitDblClick.call(this, e);
                if (viewIsBusy.call(this)) return;
            }
            if (this.domain)
                this.domain.receiveEvent('dblClick', e, this.viewer);
        },

        /**
         * Transmits mousedown event to the mouseTarget.
         * @param {MouseEvent} e
         */
        transmitMouseDown: function (e) {
            if (!this._editorCaptured) {
                EventTransmitter.prototype.transmitMouseDown.call(this, e);
                if (viewIsBusy.call(this))
                    return;
            }
            if (this.domain) {
                this._setFocused(null);
                this.routeEventsToEditor(true);
                this.domain.receiveEvent('mouseDown', e, this.viewer);
            }
        },

        /**
         * Transmits mouseup event to the mouseTarget.
         * @param {MouseEvent} e
         */
        transmitMouseUp: function (e) {
            if (!this._editorCaptured) {
                EventTransmitter.prototype.transmitMouseUp.call(this, e);
                if (viewIsBusy.call(this)) return;
            }
            if (this.domain) {
                this.routeEventsToEditor(false);
                this.domain.receiveEvent('mouseUp', e, this.viewer);
                this._updateWidgetUnderMouse(e);
            }
        },

        /**
         * Transmits mousemove event to the mouseTarget.
         * @param {MouseEvent} e
         */
        transmitMouseMove: function (e) {
            if (!this._editorCaptured) {
                EventTransmitter.prototype.transmitMouseMove.call(this, e);
                if (viewIsBusy.call(this)) return;
            }
            if (this.domain) {
                if (e.buttons & InternalMouseEvent.LEFT) {
                    this.domain.receiveEvent('mouseDrag', e, this.viewer);
                } else {
                    this.domain.receiveEvent('mouseMove', e, this.viewer);
                }
            }
        },

        /**
         * Transmits mousehover event to the mouseTarget.
         * @param {MouseEvent} e
         */
        transmitMouseHover: function (e) {
            if (!this._editorCaptured) {
                EventTransmitter.prototype.transmitMouseHover.call(this, e);
                if (viewIsBusy.call(this)) return;
            }
            if (this.domain)
                this.domain.receiveEvent('mouseHover', e, this.viewer);
        },

        /**
         * Transmits mouseenter event to the mouseTarget.
         * @param {MouseEvent} e
         */
        transmitMouseEnter: function (e) {
            if (!this._editorCaptured) {
                EventTransmitter.prototype.transmitMouseEnter.call(this, e);
                if (viewIsBusy.call(this)) return;
            }
            if (this.domain) {
                this.domain.receiveEvent('mouseEnter', e, this.viewer);
            }
        },

        /**
         * Transmits mouseleave event to the mouseTarget.
         * @param {MouseEvent} e
         */
        transmitMouseLeave: function (e) {
            if (!this._editorCaptured) {
                EventTransmitter.prototype.transmitMouseLeave.call(this, e);
                if (viewIsBusy.call(this)) return;
            }
            if (this.domain) {
                this.domain.receiveEvent('mouseLeave', e, this.viewer);
            }
        },

        /**
         * Transmits nativeDragStart event.
         * @param {MouseEvent} e
         * @param {GraphicViewer} viewer
         */
        transmitNativeDragStart: function (e, viewer) {
            this.routeEventsToEditor(false);
            this.domain.receiveEvent('nativeDragStart', e, viewer);
        },

        /**
         * Transmits nativeDragEnd event.
         * @param {MouseEvent} e
         * @param {GraphicViewer} viewer
         */
        transmitNativeDragEnd: function (e, viewer) {
            this.domain.receiveEvent('nativeDragEnd', e, viewer);
        }
    });

    return DomainEventTransmitter;
});
