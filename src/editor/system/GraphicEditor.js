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
    'graphite/base/Base',
    '../action/ActionRegistry',
    './Domain',
    './GraphicViewer'
], function (
    genetic,
    Base,
    ActionRegistry,
    Domain,
    GraphicViewer
) {
    'use strict';

    /**
     * A GraphicEditor.
     * @constructor
     * @param {string} viewerId
     * @param {string} paletteId
     */
    function GraphicEditor() {
        Base.apply(this, arguments);
        this._viewer = null;
        this._model = null;
        this._registry = new ActionRegistry();
        this.domain(new Domain(this));
    }

    genetic.inherits(GraphicEditor, Base, {

        /**
         * @param {Object} option
         * @property {string|HTMLElement} viewer
         * @property {Function} 'viewer-factory' - Factory Class
         * @property {Function} 'viewer-factory-rule' - Factory Rule
         * @property {Function} 'model-factory' - Model Class
         * @property {Function} 'root' - RootController Class
         * @property {Function} 'key-handler' - Key Handler Class
         * @property {Function} 'context-menu' - Context Menu Class
         * @property {string|HTMLElement} palette
         * @property {Function} 'palette-factory' - Factory Class
         * @property {Function} 'palette-factory-rule' - Factory Rule
         */
        create: function (option) {
            this.desc('create', arguments);
            this._initActions();
            var viewer = option['viewer'];
            var palette = option['palette'];
            var ModelFactory = option['model-factory'];
            if (viewer) {
                if (typeof viewer === 'string') {
                    viewer = document.getElementById(viewer);
                }
                if (viewer instanceof HTMLElement) {
                    this.createViewer(viewer, option);
                }
            }
            if (palette) {
                if (typeof palette === 'string') {
                    palette = document.getElementById(palette);
                }
                if (palette instanceof HTMLElement) {
                    this.createPalette(palette, option);
                }
            }
            if (ModelFactory) {
                this.createModelFactory(ModelFactory);
            }
        },

        /**
         * Initializes the ActionRegistry.
         * @protected
         */
        _initActions: function () {
            var editor = this;
            this.desc('_initActions');
            this._createActions();
            this._updateActions('property');
            this._updateActions('stack');
            this.commandStack().on('postStackChange', function (e) {
                editor._updateActions('stack');
            });
        },

        /**
         * Creates actions for this editor.
         * Subclasses should override this to customize actions.
         */
        _createActions: function () {
            this.desc('_createActions');
            var action;
            var reg = this._actionRegistry();
            //TODO
        },

        _updateActions: function (cat) {
            this.desc('_updateActions', cat);
            //TODO
        },

        /**
         * @return {ActionRegistry}
         */
        _actionRegistry: function () {
            return this._registry;
        },

        /**
         * @param {Function} ModelFactory
         */
        createModelFactory: function (ModelFactory) {
            this.desc('createModelFactory', arguments);
            var editor = this;
            var modelFactory = new ModelFactory(this);
            modelFactory.create(function (model) {
                editor.setModel(model);
                editor.initViewer();
            });
        },

        /**
         * @param {HTMLElement} container
         * @param {Object} option
         * @property {Function} 'viewer-factory' - Factory Class
         * @property {Array}    'viewer-factory-rule' - Factory Rule
         * @property {Function} 'root' - RootController Class
         * @property {Function} 'key-handler' - KeyHandler Class
         * @property {Function} 'context-menu' - ContextMenu Class
         * @return {GraphicViewer}
         */
        createViewer: function (container, option) {
            this.desc('createViewer', arguments);
            var viewer = new GraphicViewer(container, option);
            this.setViewer(viewer);
            this.hookViewer();
            return viewer;
        },

        /**
         * Sets the GraphicViewer for this editor.
         * @param {GraphicViewer} viewer
         */
        setViewer: function (viewer) {
            this.domain().addViewer(viewer);
            this._viewer = viewer;
        },

        /**
         * Returns the GraphicViewer for this editor.
         * @return {GraphicViewer}
         */
        getViewer: function () {
            return this._viewer;
        },

        /**
         * Developers can override this method to interfere
         * the rest of initilizing process of GraphicEditor.
         * For example, developers could add the GraphicViewer
         * as a Selection Provider or Selection Synchronizer
         * if they needs.
         */
        hookViewer: function () {
            this.desc('hookViewer');
            //Basically, does nothing
        },

        /**
         * Set up the editor's inital content (after creation).
         */
        initViewer: function () {
            this.desc('initViewer');
            var viewer = this.getViewer();
            viewer.contents(this.getModel());
            //TODO listen for dropped controllers
        },

        /**
         * @param {PartModel} model
         */
        setModel: function (model) {
            this.desc('setModel', model);
            this._model = model;
        },

        /**
         * @return {PartModel}
         */
        getModel: function () {
            return this._model;
        },

        /**
         * @param {Domain} domain
         *//**
         * @return {Domain}
         */
        domain: function (domain) {
            if (arguments.length) {
                this._domain = domain;
                return this;
            } else {
                return this._domain;
            }
        },

        /**
         * @param {HTMLElement} container
         */
        createPalette: function (container) {
            this.desc('createPalette', arguments);
        },

        /**
         * Returns the command stack.
         * @return {CommandStack}
         */
        commandStack: function () {
            return this.domain().commandStack();
        }
    });

    return GraphicEditor;
});