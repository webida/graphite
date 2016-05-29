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
 * @file GraphicContext
 * @since 1.0.0
 * @author hw.shim@samsung.com
 */

define([
    'external/genetic/genetic',
    'graphite/base/Base',
    'graphite/view/layout/StackLayout'
], function (
    genetic,
    Base,
    StackLayout
) {
    'use strict';

    /**
     * A GraphicContext is a place which user's contents will be painted.
     * @constructor
     * @param {GraphicContainer} container
     */
    function GraphicContext(container) {
        Base.apply(this, arguments);
        this._root = null;
        this._layers = {};
        this._mapRule = new Map(); //empty map
    }

    genetic.inherits(GraphicContext, Base, {

        /**
         * Sets Layer with given string of id.
         * @param {string} id
         * @param {Layer} layer
         */
        setLayer: function (id, layer) {
            this._layers[id] = layer;
        },

        /**
         * Returns Layer with given string of id.
         * This gives a way to access specific graphic context.
         * @param {string} id
         * @return {Layer}
         */
        getLayer: function (id) {
            return this._layers[id];
        },

        /**
         * Sets context's root widget or layer.
         * @param {Widget} root
         *//**
         * Returns context's root.
         * @return {Widget}
         */
        root: function (root) {
            if (arguments.length) {
                this._root = root;
            } else {
                return this._root;
            }
        },

        /**
         * Append contents to the context.
         * The appending location will be decided by
         * ContentsMapRule Map Object.
         * @see setContentsMapRule(Map rule) 
         * @param {Widget} contents
         */
        setContents: function (contents) {
            this.desc('setContents', contents);
            var key, layer;
            this._mapRule.forEach(function (KEY_NAME, Type) {
                if (contents instanceof Type) {
                    key = KEY_NAME;
                }
            });
            if (!key) return;
            layer = this.getLayer(key);
            if (layer) {
                layer.setLayout(new StackLayout());
                layer.append(contents);
            }
        },

        /**
         * Sets contents mapping rule. The appending
         * location will be decided by this rule.
         * @see setContents(Widget contents) 
         * @param {Map} rule
         */
        setContentsMapRule: function (rule) {
            this._mapRule = rule;
        },

        /**
         * Sets element which will receive all events on context.
         * @param {HTMLElement} receiver
         */
        setEventReceiver: function (receiver) {
            this._receiver = receiver;
        },

        /**
         * Returns event receiver element.
         * @return {HTMLElement}
         */
        getEventReceiver: function () {
            return this._receiver;
        }
    });

    return GraphicContext;
});
