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
 * @file GraphiteShell
 * @since: 1.0.0
 * @author: hw.shim@samsung.com
 */

define([
    'external/eventEmitter/EventEmitter',
    'external/genetic/genetic',
    'graphite/base/BaseEmitter',
    'graphite/env/Environment',
    'graphite/view/layout/StackLayout',
    'graphite/view/system/event/EventTransmitter',
    'graphite/view/system/GraphicContainer',
    'graphite/view/update-manager/AsyncUpdateManager',
    'graphite/view/widget/Widget'
], function (
    EventEmitter,
    genetic,
    BaseEmitter,
    Environment,
    StackLayout,
    EventTransmitter,
    GraphicContainer,
    AsyncUpdateManager,
    Widget
) {
    'use strict';

    /**
     * The GraphiteShell is the link between browser and GraphiteView.
     * The GraphiteShell manages widget's event, layouting, painting.
     * This translates browser events then dispatches to corresponding
     * widgets, or layouts, paints inside of widgets according to
     * layout-events such as move, resize.
     * @param {GraphicContainer|HTMLElement|string} c
     * @param {GraphicContextFactory} GCFactory
     * @constructor
     */
    function GraphiteShell(container, GCFactory) {
        BaseEmitter.apply(this, arguments);
        this._root = null;
        this._container = null;
        this._transmitter = null;
        this._rootContents = null;
        this._updateManager = null;
        this.setUpdateManager(new AsyncUpdateManager());
        this.setRootWidget(this.createRootWidget());
        if (container) {
            this.setContainer(container, GCFactory);
        }
    }

    genetic.inherits(GraphiteShell, BaseEmitter, {

        /**
         * Conveinient method for setContainer and getContainer.
         */
        container: function () {
            if (arguments.length) {
                this.setContainer.apply(this, arguments);
                return this;
            } else {
                return this.getContainer();
            }
        },

        /**
         * Sets the GraphicContainer.
         * @param {GraphicContainer|HTMLElement|string} c
         * @param {GraphicContextFactory} GCFactory
         */
        setContainer: function (c, GCFactory) {
            var shell = this;
            if(typeof c === 'string' && document.getElementById(c)){
                c = document.getElementById(c);
            }
            if(c instanceof HTMLElement){
                c = new GraphicContainer(c, GCFactory);
                c.once('ready', function () {
                    if (Environment.global.get('mode') === 'debug') {
                        Environment.loadDebugMode(shell);
                    }
                });
            }
            if(c instanceof GraphicContainer){
                if (this._container === c){
                    return;
                }
                if (this._container) {
                    this._container.clear();
                }
                this._container = c;
                var context = c.graphicContext();
                this.getUpdateManager().setGraphicContext(context);
                this.setEventTransmitter(new EventTransmitter());
                this.getRootWidget().bounds(c.clientArea());
                this.rootContents(context.root());
            }
        },

        /**
         * Returns the GraphicContainer.
         * @return {GraphicContainer}
         */
        getContainer: function () {
            return this._container;
        },

        /**
         * Creates and returns the root widget.
         * @return {Widget}
         */
        createRootWidget: function () {
            this.desc('createRootWidget');
            var widget = new RootWidget(this);
            widget.onAdded();
            widget.setLayout(new StackLayout());
            return widget;
        },

        /**
         * Sets the root widget.
         * @param {RootWidget} widget
         */
        setRootWidget: function (widget) {
            this.desc('setRootWidget', widget);
            this.getUpdateManager().setRoot(widget);
            this._root = widget;
        },

        /**
         * Gets the root widget.
         * @return {RootWidget}
         */
        getRootWidget: function () {
            return this._root;
        },

        /**
         * Sets root widget's first child.
         * Usually GraphicContainer uses this method to
         * construct layers.
         * @param {Widget} widget
         * @return {GraphiteShell}
         *//**
         * Returns root widget's first child.
         * @return {Widget}
         */
        rootContents: function (widget) {
            if (arguments.length) {
                this.desc('rootContents', widget);
                var root = this.getRootWidget();
                if (this._rootContents) {
                    root.remove(this._rootContents);
                }
                this._rootContents = widget;
                root.append(widget);
                return this;
            } else {
                return this._rootContents;
            }
        },

        /**
         * Sets user's widget model's root node.
         * @param {Widget} root
         * @return {GraphiteShell}
         * @see GraphicContainer#contents(Widget)
         *//**
         * Returns user's widget model's root node.
         * @see GraphicContainer#contents()
         * @return {Widget}
         */
        contents: function (widget) {
            if (widget) {
                this.desc('contents', widget);
                this.getContainer().setContents(widget);
            } else {
                return this.getContainer().getContents();
            }
        },

        /**
         * Sets update-manager for the GraphiteShell.
         * This will be used default update manager for all widgets
         * without specified update-manager.
         * @param {UpdateManager} manager
         */
        setUpdateManager: function (manager) {
            this._updateManager = manager;
            manager.setRoot(this.getRootWidget());
        },

        /**
         * Retrives update-manager for the GraphiteShell.
         * @return {UpdateManager}
         */
        getUpdateManager: function () {
            return this._updateManager;
        },

        /**
         * Sets EventTransmitter.
         * @param {EventTransmitter} transmitter
         */
        setEventTransmitter: function (transmitter) {
            var container = this.getContainer();
            var old = this._transmitter;
            if (old) {
                old.ignore(container);
            }
            this._transmitter = transmitter;
            transmitter.setRoot(this.getRootWidget());
            transmitter.listen(container);
        },

        /**
         * Returns EventTransmitter.
         * @return {EventTransmitter}
         */
        getEventTransmitter: function () {
            return this._transmitter;
        },

        /**
         * Clears related resources.
         */
        clear: function () {
            var that = this;
            var container = this.getContainer();
            this.getEventTransmitter().ignore(container);
            container.once('cleared', function () {
                that.emit('cleared', that);
            });
            container.clear();
        }
    });

    /**
     * The widget at the root of the GraphiteShell.
     * This ensures root node of widget tree should always work right.
     * If some properties are not set, the RootWidget will retrive
     * these from GraphiteShell's container element.
     */
    function RootWidget(shell) {
        Widget.apply(this, arguments);
        this.shell = shell;
    }

    genetic.inherits(RootWidget, Widget, {

        /**
         * @override
         * @return {UpdateManager}
         */
        getUpdateManager: function () {
            var upman = this.shell.getUpdateManager();
            return upman;
        },

        /**
         * @see Widget#_drawWidget
         * @param {GraphicContext} context
         */
        _drawWidget: function (context) {
            this.desc('_drawWidget', context, 'does nothing');
        }
    });

    GraphiteShell.RootWidget = RootWidget;

    return GraphiteShell;
});
