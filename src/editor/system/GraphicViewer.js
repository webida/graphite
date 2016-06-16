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
    'external/map/Map',
    'graphite/base/BaseEmitter',
    'graphite/editor/controller/Controller',
    'graphite/editor/controller/ControllerRuleFactory',
    'graphite/editor/controller/RootController',
    'graphite/editor/system/event/GraphicKeyHandler',
    'graphite/editor/model/BaseModel',
    'graphite/view/system/GraphiteShell',
    './DomainEventTransmitter'
], function (
    genetic,
    Map,
    BaseEmitter,
    Controller,
    ControllerRuleFactory,
    RootController,
    GraphicKeyHandler,
    BaseModel,
    GraphiteShell,
    DomainEventTransmitter
) {
    'use strict';

    /**
     * A GraphicViewer.
     * @constructor
     * @param {HTMLElement} container
     * @param {Object} option
     * @property {Function} 'factory' - Factory Class
     * @property {Array} 'rule' - Factory Rule
     * @property {Function} 'root' - RootController Class
     * @property {Function} 'key-handler' - KeyHandler Class
     * @property {Function} 'context-menu' - ContextMenu Class
     */
    function GraphicViewer(container, option) {
        BaseEmitter.apply(this, arguments);
        this._root = null;
        this._shell = null;
        this._domain = null;
        this._factory = null;
        this._keyHandler = null;
        this._transmitter = null;
        this._modelToController = new Map();
        this._viewToController = new Map();
        this.createShell(container);
        this.createControllerFactory(option);
        this.createRoot(option['root']);
        this.createKeyHandler(option['key-handler']);
        setTimeout(function (viewer) {
            viewer.emit('viewerReady', viewer);
        }, 0, this);
    }

    genetic.inherits(GraphicViewer, BaseEmitter, {

        /**
         * @param {HTMLElement} container
         */
        createShell: function (container) {
            this.desc('createShell', arguments);
            this.shell(new GraphiteShell(container));
            return this.shell();
        },

        /**
         * Creates Controller Factory for this Viewer.
         * @param {Object} option
         * @property {Function} 'factory' - Factory Class
         * @property {Function} 'rule' - Factory Rule
         */
        createControllerFactory: function (option) {
            this.desc('createControllerFactory', option);
            var Factory = option['factory'];
            var rule = option['rule'];
            if (Factory instanceof Function) {
                this._factory = new Factory();
            } else {
                this._factory = new ControllerRuleFactory(rule);
            }
        },

        /**
         * @param {Function} Root - RootController Class
         */
        createRoot: function (Root) {
            this.desc('createRoot', Root);
            if (Root instanceof Function) {
                this.root(new Root());
            } else {
                this.root(new RootController());
            }
        },

        /**
         * @param {KeyHandler} Handler
         */
        createKeyHandler: function (Handler) {
            if (typeof Handler === 'function') {
                this._keyHandler = new Handler(this);
            } else {
                this._keyHandler = new GraphicKeyHandler(this);
            }
        },

        /**
         * @return {KeyHandler}
         */
        getKeyHandler: function () {
            return this._keyHandler;
        },

        /**
         * @param {GraphiteShell} shell
         *//**
         * @return {GraphiteShell}
         */
        shell: function () {
            if (arguments.length) {
                this.desc('shell', arguments);
                if (this._shell) {
                    this._unhookShell();
                }
                this._shell = arguments[0];
                this._hookShell();
            } else {
                return this._shell;
            }
        },

        /**
         * @protected
         */
        _hookShell: function () {
            var viewer = this;
            var shell = this.shell();
            var root = this.root();
            //TODO override this to use selection manager
            shell.once('cleared', function () {
                viewer.shell(null);
            });
            if (root) {
                root.activate();
            }
            //TODO dnd from Palette
        },

        /**
         * @protected
         */
        _unhookShell: function () {
            var root = this.root();
            //TODO clear context menu
            this.shell().clear();
            if (root != null) {
                root.deactivate();
            }
        },

        /**
         * @param {Controller} controller
         *//**
         * @return {Controller}
         */
        root: function (controller) {
            this.desc('root', controller);
            if (arguments.length) {
                var root = this._root;
                if (root) {
                    if (root.isActive()) {
                        root.deactivate();
                    }
                    root.viewer(null);
                }
                this._root = controller;
                root = this._root;
                root.viewer(this);
                if (this.shell()) {
                    root.activate();
                }
                return this;
            } else {
                return this._root;
            }
        },

        /**
         * Sets the Domain for this viewer. The Viewer will route
         * all mouse and keyboard events to the Domain.
         * @param {Domain} domain
         *//**
         * Returns the Domain for this viewer.
         * @return {Domain}
         */
        domain: function (domain) {
            if (arguments.length) {
                this.desc('domain', domain);
                this._domain = domain;
                this._transmitter = new DomainEventTransmitter(domain, this);
                this.shell().setEventTransmitter(this._transmitter);
                return this;
            } else {
                return this._domain;
            }
        },

        /**
         * Returns the Map for registering Controllers by Keys.
         * Controllers may register themselves using any method, and may
         * register themselves with multiple keys. The purpose of such registration
         * is to allow an Controller to be found by other Controllers, or by listeners
         * of domain notifiers. By default, Controllers are registered by their model.
         * 
         * Some models use a "domain" notification system, in which all changes are
         * dispatched to a single listener. Such a listener might use this map to
         * lookup Controllers for a given model, and then ask the Controller to update.
         * 
         * @return {Map}
         */
        controllerRegistry: function () {
            return this._modelToController;
        },

        /**
         * Returns the Map for associating views with their Controllers.
         * This map is used for hit-testing. Hit testing is performed by
         * first determining which view is hit, and then mapping
         * that view to a Controller.
         * 
         * @return {Map}
         */
        viewControllerMap: function () {
            return this._viewToController;
        },

        /**
         * Creates an controller for the provided model object using the
         * ControllerFactory. That controller is then added to the
         * Rootcontroller, and becomes the viewer's contents controller.
         * 
         * @param {Object|Controller} contents
         *          - the contents model or Controller
         */
        contents: function (contents) {
            if (arguments.length) {
                this.desc('contents', contents);
                if (contents instanceof Controller) {
                    this.root().contents(contents);
                } else if (contents instanceof BaseModel) {
                    if (!this._factory) {
                        this.warn('A ControllerFactory '
                                + 'is required to call contents(Object)');
                    }
                    this.contents(this._factory.create(null, contents));
                }
            } else {
                
            }
        },

        /**
         * Returns the ControllerFactory for this viewer.
         * The ControllerFactory is used to create the contents Controller
         * when contents(Object) is called. It is made available so that
         * other Controllers can use it to create their children
         * or connection Controllers.
         * @return {ControllerFactory}
         */
        controllerFactory: function (factory) {
            if (arguments.length) {
                this._factory = factory;
            } else {
                return this._factory;
            }
        },

        /**
         * Sets the cursor for the viewer.
         * This method should only be called by {@link Tool}.
         * null can be used to indicate that
         * the default cursor should be restored.
         * @param {string} cursor
         */
        cursor: function (cursor) {
            var transmitter = this._transmitter;
            if (transmitter) {
                transmitter.overrideCursor(cursor);
            }
        },

        /**
         * Returns the Controller at the specified location,
         * using the given exclusion set and conditional.
         * This method behaves similarly to {@link #findObjectAt(Point)}.
         * 
         * @param {Point} p - The mouse location
         * @param {Array} except - The set of Controllers to be excluded
         * @param {Object} condition
         *  - the Conditional used to evaluate a potential hit
         * @return {Controller}
         * @see Widget#findWidgetAtExcept(x, y, except)
         */
        findObjectAtExcept: function (p, except, condition) {
            var that = this;
            var widget = this.shell().getRootWidget().findWidgetAt(
                    p.x, p.y, {
                        prune: function (widget) {
                            return except.indexOf(widget) > -1;
                        },
                        accept: function (widget) {
                            var ctrl = null;
                            while (!ctrl && widget) {
                                ctrl = that.viewControllerMap().get(widget);
                                widget = widget.getParent();
                            }
                            return !!ctrl
                                    && (!condition || condition.evaluate(ctrl));
                        }
                    });
            var controller = null;
            while (!controller && widget) {
                controller = this.viewControllerMap().get(widget);
                widget = widget.getParent();
            }
            if (!controller)
                return this.contents();
            return controller;
        },

        /**
         * Returns the Handle at the specified Point.
         * The specified point should be relative to the
         * {@link GraphicContainer#clientArea()}
         * 
         * @param {Point} p
         * @return {Handle} 
         */
        findHandleAt: function (p) {
            var container = this.shell().container();
            var context = container.graphicContext();
            var layer = context.getLayer('HANDLE_LAYER');
            if (layer) {
                return layer.findWidgetAt(p.x, p.y);
            }
        }
    });

    return GraphicViewer;
});
