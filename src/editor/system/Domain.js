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
    'graphite/editor/tool/SelectionTool',
    './CommandStack'
], function (
    genetic,
    Base,
    SelectionTool,
    CommandStack
) {
    'use strict';

    /**
     * The collective state of a graphite "application",
     * loosely defined by a CommandStack, one or more Viewers,
     * and the active Tool. A Domain is usually tied with an Editor object.
     * However, the distinction between Editor and Domain was
     * made to allow for much flexible use of the Graphite.
     * 
     * A default implementation of Domain. An editor is
     * required in the constructor, but it can be null.
     * 
     * A SelectionTool will be the active Tool until:
     * 
     * A PaletteRoot is provided which contains a default entry
     * which is a ToolEntry. In which case that entry's tool is
     * made the active Tool.
     * 
     * Domain can be configured with a PaletteViewer. When provided,
     * the Domain will listen for PaletteEvents, and will switch
     * the active Tool automatically in response.
     * @constructor
     */
    function Domain(editor) {
        Base.apply(this, arguments);
        this._viewers = [];
        this._editor = null;
        this._palette = null;
        this._paletteRoot = null;
        this._activeTool = null;
        this._defaultTool = null;
        this._paletteListener = null;
        this._commandStack = new CommandStack();
        if (editor) {
            this.editor(editor);
        }
        this.loadDefaultTool();
    }

    genetic.inherits(Domain, Base, {

        /**
         * Sets editor object
         * @param {Object}
         *//**
         * Returns editor object
         * @return {Object}
         */
        editor: function (editor) {
            if (arguments.length) {
                this._editor = editor;
            } else {
                return this._editor;
            }
        },

        viewers: function () {
            return this._viewers;
        },

        /**
         * Sets the CommandStack.
         * @param {CommandStack} commandStack
         *//**
         * Returns the CommandStack. Command stacks could potentially
         * be shared across domains depending on the application.
         * @return {CommandStack}
         */
        commandStack: function (commandStack) {
            if (commandStack) {
                this._commandStack = commandStack;
            } else {
                return this._commandStack;
            }
        },

        /**
         * Adds viewer. Viewer is a view component of
         * editor's MVC structure.
         * @param {GraphicViewer} viewer
         */
        addViewer: function (viewer) {
            var viewers = this.viewers();
            viewer.domain(this);
            if (viewers.indexOf(viewer) < 0) {
                viewers.push(viewer);
            }
        },

        /**
         * Removes a previously added viewer from the Domain.
         * A Viewer that is removed from the Domain will
         * no longer forward input to the domain
         * and its active Tool.
         * 
         * @param viewer
         *            the Viewer being removed
         */
        removeViewer: function (viewer) {
            var index = this._viewers.indexOf(viewer);
            if (index > -1) {
                this._viewers.splice(index, 1);
                viewer.domain(null);
            }
        },

        /**
         * Loads the default Tool. If a palette has been provided
         * and that palette has a default, then that tool is loaded.
         * If not, the Domain's default tool is loaded.
         * By default, this is the SelectionTool.
         */
        loadDefaultTool: function () {
            this.desc('loadDefaultTool');
            this.activeTool(null);
            var palette = this.palette();
            var root = this._paletteRoot;
            if (root !== null && palette !== null) {
                if (root.getDefaultEntry() != null) {
                    palette.activeTool(root.getDefaultEntry());
                    return;
                } else
                    root.activeTool(null);
            }
            this.activeTool(this.defaultTool());
        },

        /**
         * Sets the active Tool for this Domain.
         * If a current Tool is active, it is deactivated.
         * The new Tool is told its Domain, and is activated.
         * @param {Tool} tool
         *//**
         * Returns the active Tool.
         * @return {Tool}
         */
        activeTool: function (tool) {
            if (arguments.length) {
                this.desc('activeTool', tool);
                if (this._activeTool) {
                    this._activeTool.deactivate();
                }
                this._activeTool = tool;
                if (tool) {
                    tool.domain(this);
                    tool.activate();
                }
            } else {
                return this._activeTool;
            }
        },

        /**
         * Sets the default Tool, which is used if the Palette
         * does not provide a default Tool.
         * @param {Tool} tool
         *//**
         * Returns the default tool for this domain.
         * This will be a SelectionTool unless specifically replaced
         * by defaultTool(Tool).
         * @return {Tool}
         */
        defaultTool: function (tool) {
            if (tool) {
                this._defaultTool = tool;
            } else {
                if (this._defaultTool === null) {
                    this._defaultTool = new SelectionTool();
                }
                return this._defaultTool;
            }
        },

        /**
         * Sets the <code>PaletteViewer</code> for this Domain.
         * @param {Palette} palette
         *//**
         * Returns the palette currently associated with this Domain.
         * @return {Palette}
         */
        palette: function (palette) {
            if (arguments.length) {
                var old = this._palette;
                var root = this._paletteRoot;
                if (old === palette){
                    return;
                }
                if (old) {
                    old.off('toolChanged', this._paletteListener);
                }
                this._palette = palette;
                if (palette) {
                    this._paletteListener = this.onToolChanged.bind(this);
                    palette.on('toolChanged', this._paletteListener);
                    if (root) {
                        palette.root(root);
                        this.loadDefaultTool();
                    }
                }
            } else {
                return this._palette;
            }
        },

        /**
         * Sets the PalatteRoot for this Domain. If the Domain already knows
         * about a Palette, this root will be set into the palette also.
         * Loads the default Tool after the root has been set.
         * @param {PaletteRoot} root
         */
        setPaletteRoot: function (root) {
            var palette = this.palette();
            if (this._paletteRoot === root) return;
            this._paletteRoot = root;
            if (palette) {
                palette.setPaletteRoot(root);
                this.loadDefaultTool();
            }
        },

        /**
         * Listens to the PaletteViewer for changes in selection,
         * and sets the Domain's Tool accordingly.
         */
        onToolChanged: function () {
            var palette = this._palette;
            if (palette) {
                var entry = palette.activeEntry();
                if (entry) {
                    this.activeTool(entry.createTool());
                } else {
                    this.activeTool(this.defaultTool());
                }
            }
        },

        /**
         * Receives a event then pass it to a active tool.
         * Tool may convert the event to a Request.
         * @param {MouseEvent} e
         * @param {GraphicViewer} viewer
         */
        receiveEvent: function (eventName, e, viewer) {
            var tool = this.activeTool();
            if (tool) tool[eventName](e, viewer);
        }
    });

    return Domain;
});
