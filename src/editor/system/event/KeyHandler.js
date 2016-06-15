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
 * @file KeyHandler
 * @since 1.0.0
 * @author hw.shim@samsung.com
 */

define([
    'external/genetic/genetic',
    'external/map/Map',
    'graphite/base/Base',
    './KeyStroke'
], function (
    genetic,
    Map,
    Base,
    KeyStroke
) {
    'use strict';

    /**
     * The KeyHandler should handle all normal keystrokes on an
     * GraphicViewer. Normal is simply defined as keystrokes
     * which are not associated with an Accelerator on the Menu.
     * The KeyHandler will be forwarded KeyEvents by the active Tool,
     * which is usually the SelectionTool.
     * The Tool may be in a state where keystrokes should not be processed,
     * in which case it will not forward the keystrokes. For this reason,
     * it is important to always handle KeyEvents by using a KeyHandler.
     * 
     * KeyHandlers can be chained by calling {@link #setParent(KeyHandler)}.
     * If this KeyHandler does not handle the keystroke, it will pass
     * the keystroke to its parent KeyHandler.
     * 
     * KeyHandlers can be implemented using two stragegies. One is to map
     * KeyStrokes to Actions  using the {@link #put(KeyStroke, Action)} and
     * {@link #remove(KeyStroke)} API. The other is to subclass KeyHandler,
     * and override various methods. A combination of the two is also useful.
     * @constructor
     */
    function KeyHandler() {
        Base.apply(this, arguments);
        this._actions = new Map();
        this._parent = null;
    }

    /**
     * @private
     */
    function performStroke(key) {
        var action = this._actions.get(key);
        if (!action) return false;
        if (action.isEnabled()) action.run();
        return true;
    }

    genetic.inherits(KeyHandler, Base, {

        /**
         * Processes a keyDown event. This method is called by the Tool
         * whenever a key is pressed, and the Tool is in the proper state.
         * @param {KeyboardEvent} e
         * @return {boolean} true if KeyEvent was handled in some way
         */
        onKeyDown: function (e) {
            if (performStroke.call(this, KeyStroke.singleton(e))) {
                e.doit = false;
                return true;
            }
            return this._parent && this._parent.onKeyDown(e);
        },

        /**
         * Processes a keyUp event. This method is called by the Tool
         * whenever a key is released, and the Tool is in the proper state.
         * @param {KeyboardEvent} e
         * @return {boolean} true if KeyEvent was handled in some way
         */
        onKeyUp: function (e) {
            if (performStroke.call(this, KeyStroke.singleton(e)))
                return true;
            return this._parent && this._parent.onKeyUp(e);
        },

        /**
         * Maps a specified KeyStroke to an Action.
         * When a KeyEvent occurs matching the given KeyStroke,
         * the Action will be run() if it is enabled.
         * @param {KeyStroke} keystroke
         * @param {Action} action
         * @example
            someKeyHandler.put(new KeyStroke({
                key: 'Delete',
                type: 'keyup'
            }), {
                isEnabled: function () {
                    return true;
                },
                run: function () {
                    console.log('run!');
                }
            });
         */
        put: function (keystroke, action) {
            this._actions.set(keystroke, action);
        },

        /**
         * Removed a mapped Action for the specified KeyStroke.
         * @param {KeyStroke} keystroke
         */
        remove: function (keystroke) {
            this._actions['delete'](keystroke);
        },

        /**
         * Sets a parent KeyHandler to which this KeyHandler
         * will forward un-consumed KeyEvents. This KeyHandler
         * will first attempt to handle KeyEvents.
         * If it does not recognize a given KeyEvent, that event
         * is passed to its parent
         * 
         * @param {KeyHandler} parent
         * @return {KeyHandler} - retruns this for convenience
         */
        setParent: function (parent) {
            this.parent = parent;
            return this;
        }
    });

    return KeyHandler;
});
