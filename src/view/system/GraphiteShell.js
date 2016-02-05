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
    'graphite/base/Base',
    'graphite/view/layout/StackLayout',
    'graphite/view/system/EventReceiver',
    'graphite/view/system/GraphicContainer',
    'graphite/view/system/GraphicContext',
    'graphite/view/update-manager/AsyncUpdateManager',
    'graphite/view/widget/Widget'
], function (
    EventEmitter,
    genetic,
    Base,
    StackLayout,
    EventReceiver,
    GraphicContainer,
    GraphicContext,
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
     * @constructor
     */
    function GraphiteShell(container) {
        Base.apply(this, arguments);
        this.setUpdateManager(new AsyncUpdateManager());
        this.setRootWidget(this.createRootWidget());
        if (container) {
            this.setContainer(container);
        }
    }

    genetic.inherits(GraphiteShell, Base, {

        /**
         * Sets the GraphicContainer.
         * @param {GraphicContainer|HTMLElement|string} c
         */
        setContainer: function (c) {
            if(typeof c === 'string' && document.getElementById(c)){
                c = document.getElementById(c);
            }
            if(c instanceof HTMLElement){
                c = new GraphicContainer(c);
            }
            if(c instanceof GraphicContainer){
                if (this._container === c){
                    return;
                }
                this._container = c;
                this.getUpdateManager().setGraphicContext(
                        new GraphicContext(c));
                this.setEventReceiver(new EventReceiver());
                this.getRootWidget().bounds(c.getClientArea());
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
         * Sets widget tree's root node.
         * @param {Widget} root
         */
        setContents: function (widget) {
            this.desc('setContents', widget);
            var root = this.getRootWidget();
            if (this._contents) {
                root.remove(this._contents);
            }
            this._contents = widget;
            root.append(widget);
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
         * Sets EventReceiver.
         * @param {EventReceiver} receiver
         */
        setEventReceiver: function (receiver) {
            this._eventReceiver = receiver;
            receiver.setRoot(this.getRootWidget());
            receiver.listen(this.getContainer());
        },

        /**
         * Returns EventReceiver.
         * @return {EventReceiver}
         */
        getEventReceiver: function () {
            return this._eventReceiver;
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
