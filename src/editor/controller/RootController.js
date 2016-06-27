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
    'graphite/view/widget/structural/GridLayer',
    'graphite/view/widget/structural/LayeredPane',
    'graphite/view/widget/structural/Viewport',
    'graphite/view/widget/Widget',
    './AutoexposeHelper',
    './Controller',
    './LayerManager'
], function (
    genetic,
    GridLayer,
    LayeredPane,
    Viewport,
    Widget,
    AutoexposeHelper,
    Controller,
    LayerManager
) {
    'use strict';

    /**
     * A RootController.
     * @constructor
     */
    function RootController() {
        Controller.apply(this, arguments);
        this._viewer = null;
        this._contents = null;
        this._layeredPane = null;
        this._scaledLayers = null;
    }

    genetic.inherits(RootController, Controller, {

        /**
         * @param {GraphicViewer} viewer
         *//**
         * @return {GraphicViewer}
         */
        viewer: function (viewer) {
            if (arguments.length) {
                this.desc('viewer', viewer);
                if (this._viewer === viewer) {
                    return;
                }
                if (this._viewer !== null) {
                    this._unregister();
                }
                this._viewer = viewer;
                if (viewer) {
                    this._register();
                }
            } else {
                return this._viewer;
            }
        },

        /**
         * RootController's view is the GraphicContext's root widget.
         * Basically, this widget is a viewport.
         * @return {Widget}
         */
        _createView: function () {
            this.desc('createView');
            var shell = this.viewer().shell();
            var context = shell.container().graphicContext();
            return context.root();
        },

        /**
         * @override
         */
        model: function () {
            if (arguments.length) {
                this._model = arguments[0];
            } else {
                return LayerManager.ID;
            }
        },

        contents: function (contents) {
            if (arguments.length) {
                this.desc('contents', contents);
                if (this._contents === contents) return;
                if (this._contents !== null) {
                    this.removeChild(this._contents);
                }
                this._contents = contents;
                if (this._contents !== null) {
                    this._addChild(this._contents, 0);
                }
            } else {
                return this._contents;
            }
        },

        /**
         * Adds the contents controller's view as
         * a content of GraphicContext.
         * @param {Controller} child
         * @param {number} index
         */
        _addChildView: function (child, index) {
            this.desc('_addChildView', arguments);
            var shell = this.viewer().shell();
            var context = shell.container().graphicContext();
            context.setContents(child.view());
        },

        /**
         * @inheritdoc
         */
        root: function () {
            return this;
        },

        /**
         * @param {string} key
         * @return {Object}
         */
        getAdapter: function (key) {
            if (key === 'AutoexposeHelper')
                return new AutoexposeHelper(this);
            return Controller.prototype.getAdapter.call(this, key);
        }
    });

    return RootController;
});
