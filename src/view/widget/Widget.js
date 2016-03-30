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
 * @file Widget
 * @since 1.0.0
 * @author hw.shim@samsung.com
 */

define([
    'external/genetic/genetic',
    'external/math/math',
    'graphite/base/BaseEmitter',
    'graphite/base/Color',
    'graphite/base/FlagSupport',
    'graphite/view/geometry/Point',
    'graphite/view/geometry/Rectangle',
    'graphite/view/geometry/Spaces'
], function (
    genetic,
    math,
    BaseEmitter,
    Color,
    FlagSupport,
    Point,
    Rectangle,
    Spaces
) {
    'use strict';

    /** @constant {number} */
    var FLAG_VALID = 1;
    var FLAG_FILLABLE = 1 << 1;
    var FLAG_VISIBLE = 1 << 2;
    var FLAG_ENABLED = 1 << 4;
    var FLAG_FOCUS_TRAVERSABLE = 1 << 5;
    var FLAG_FILL_PARENT = 1 << 8;

    /**
     * An abstract class for all Graphite Widgets.
     * @constructor
     */
    function Widget() {
        BaseEmitter.apply(this, arguments);
        this._parent = null;
        this._children = [];
        this._bounds = new Rectangle(0, 0, 0, 0);
        this._bgColor = new Color('transparent');
        this._borderColor = new Color('black');
        this._borderWidth = new Spaces(0, 0, 0, 0);
        this.setFlag(FLAG_VISIBLE, true);
        this.setFlag(FLAG_ENABLED, true);
    }

    var proto = genetic.mixin(BaseEmitter.prototype, FlagSupport.prototype, {

        _cursor: 'default',

        _toolTip: null,

        /**
         * Adds the given Widget as a child of this Widget with the given
         * index and constraint.
         * 
         * append(widget, index, constraint)
         * @param {Widget} widget - The Widget to add
         * @param {number} index - Where the new Widget should be added
         * @param {Object} constraint - The added Widget's constraint
         *//**
         * append(widget)
         * @param {Widget} widget - The Widget to add
         *//**
         * append(widget, index)
         * @param {Widget} widget - The Widget to add
         * @param {number} index - Where the new Widget should be added
         *//**
         * append(widget, constraint)
         * @param {Widget} widget - The Widget to add
         * @param {Object} constraint - The added Widget's constraint
         *//**
         * append(widget, x, y, w, h)
         * @param {Widget} widget - The Widget to add
         * @param {number} x
         * @param {number} y
         * @param {number} w
         * @param {number} h
         *//**
         * append(widget, index, x, y, w, h)
         * @param {Widget} widget - The Widget to add
         * @param {number} index - Where the new Widget should be added
         * @param {number} x
         * @param {number} y
         * @param {number} w
         * @param {number} h
         */
        append: function () {
            this.desc('append', arguments);
            if (!this.isContainer()) {
                throw new Error(this.constructor.name
                        + ' is not container widget');
            }
            var args = arguments;
            var child = args[0];
            var index, constraint;
            var others = ([]).slice.call(args);
            others.shift();
            if (args.length === 1) {
                index = -1;
                constraint = child.bounds().copy();
            } else if (args.length === 2) {
                if (args[1] instanceof Object) {
                    index = -1;
                    constraint = args[1];
                } else if (typeof args[1] === 'number') {
                    index = args[1];
                    constraint = child.bounds().copy();
                }
            } else if (args.length === 3) {
                index = args[1];
                constraint = args[2];
            } else if (args.length === 5
                    && math.isAllNumber(others)) {
                index = -1;
                constraint = genetic.getInstanceOf(Rectangle, others);
            } else if (args.length === 6
                    && math.isAllNumber(others)) {
                index = args[1];
                others.shift();
                constraint = genetic.getInstanceOf(Rectangle, others);
            } else {
                throw new Error('Illegal parameters');
            }

            var children = this.getChildren();
            if (index < -1 || index > children.length) {
                throw new Error('Index does not exist');
            }
            /* check cycle */
            var w = this;
            while (w !== null) {
                if (w === child) {
                    throw new Error('Child makes cycle on appending');
                }
                w = w.getParent();
            }
            /* remove previous parent */
            if (child.getParent() !== null) {
                child.getParent().remove(child);
            }
            if (index === -1) {
                children.push(child);
            } else {
                children.splice(index, 0, child);
            }
            child.setParent(this);
            /* constraint */
            var layoutManager = this.getLayout();
            if (constraint && layoutManager) {
                layoutManager.setConstraint(child, constraint);
            }
            this.revalidate();
            if (this.getFlag(Widget.FLAG_REALIZED)) {
                child.onAdded();
            }
            child.redraw();
        },

        /**
         * Tells whether this can contain other Widget.
         * In default, Widget can containe other Widget,
         * so returns true.
         * @return {boolean}
         */
        isContainer: function () {
            return true;
        },

        /**
         * Returns true if this Widget is enabled.
         * @return {boolean}
         */
        isEnabled: function () {
            return this.getFlag(FLAG_ENABLED);
        },

        /**
         * Sets cursor for this Widget and
         * returns this Widget for convenience.
         * @see https://developer.mozilla.org/en-US/docs/Web/CSS/cursor
         * @param {string} cursor
         * @return {Widget}
         *//**
         * Returns cursor for this Widget.
         * @return {string}
         */
        cursor: function () {
            if (arguments.length) {
                this._cursor = arguments[0];
                return this;
            } else {
                return this._cursor;
            }
        },

        /**
         * Sets true if this Widget can get
         * a traverse KeyboardEvent event.
         * @see InternalKeyEvent#traverseKeys
         * @param {boolean} traversable
         *//**
         * Returns true if this Widget can get
         * a traverse KeyboardEvent event.
         * @see InternalKeyEvent#traverseKeys
         * @return {boolean}
         */
        focusTraversable: function () {
            if (arguments.length) {
                this.setFlag(FLAG_FOCUS_TRAVERSABLE, !!arguments[0]);
                return this;
            } else {
                return this.getFlag(FLAG_FOCUS_TRAVERSABLE);
            }
        },

        /**
         * Called after this Widget is added to its parent.
         */
        onAdded: function () {
            this.desc('onAdded');
            if (this.getFlag(Widget.FLAG_REALIZED)) {
                throw new Error('onAdded() called multiple times');
            }
            this.setFlag(Widget.FLAG_REALIZED, true);
            this.getChildren().forEach(function (child) {
                child.onAdded();
            });
        },

        /**
         * Called before this Widget is removed from its parent.
         */
        onRemoved: function () {
            this.desc('onRemoved');
            this.getChildren().forEach(function (child) {
                child.onRemoved();
            });
            this.setFlag(Widget.FLAG_REALIZED, false);
        },

        /**
         * Called after this Widget is translated.
         * @protected
         * @param {number} dx
         * @param {number} dy
         */
        _onMoved: function (dx, dy) {
            this.desc('_onMoved', arguments);
            /**
             * moved event.
             * @event Widget#moved
             * @type {object}
             * @dx {number} dx
             * @dy {number} dy
             */
            this.emit('moved', {
                dx: dx,
                dy: dy
            });
        },

        /**
         * Sets this Widget's parent.
         * @param {Widget} parent 
         */
        setParent: function (parent) {
            this.desc('setParent', arguments);
            if (!parent.isContainer()) {
                throw new Error('parent is not container widget');
            }
            var old = this.getParent();
            this._parent = parent;
            /**
             * setParent event.
             * @event Widget#setParent
             * @type {object}
             * @property {Widget} oldParent
             * @property {Widget} newParent
             */
            this.emit('setParent', {
                oldParent: old,
                newParent: parent
            });
        },

        /**
         * Returns parent Widget or null (if not exists).
         * @return {Widget}
         */
        getParent: function () {
            return this._parent;
        },

        /**
         * Returns array of children by reference.
         * @return {Array<Widget>}
         */
        getChildren: function () {
            return this._children;
        },

        /**
         * @param {Layout} layout
         */
        setLayout: function (layout) {
            this.desc('setLayout', arguments);
            this._layout = layout;
            this.revalidate();
        },

        /**
         * @return {Layout}
         */
        getLayout: function () {
            return this._layout;
        },

        /**
         * Returns the UpdateManager for this widget by reference.
         * @return {UpdateManager}
         */
        getUpdateManager: function () {
            var manager = null;
            if (this.getParent()) {
                manager = this.getParent().getUpdateManager();
            }
            this.desc('getUpdateManager', [], manager + '');
            return manager;
        },

        /**
         * Invalidates this Widget and revalidates its parent.
         * If a Widget is a root (ie. does not have a parent),
         * it will request a validation from it UpdateManager.
         * Calling this method does not guarantee a redraw.
         */
        revalidate: function () {
            this.desc('revalidate');
            var updateManager = null;
            this.invalidate();
            if (this.getParent() === null || !this.revalidateParent()) {
                updateManager = this.getUpdateManager();
                if (updateManager) {
                    updateManager.addInvalidWidget(this);
                }
            } else {
                this.getParent().revalidate();
            }
        },

        /**
         * Invalidates this Widget. If this widget has a Layout,
         * then layoutManager.invalidate() should be called.
         */
        invalidate: function () {
            this.desc('invalidate');
            if (this.getLayout()){
                this.getLayout().invalidate();
            }
            this.setValid(false);
        },

        /**
         * Returns true if revalidation this Widget require
         * its parent's revalidation.
         * @return {boolean}
         */
        revalidateParent: function () {
            return true;
        },

        /**
         * Sets this widget's validity.
         * @param {boolean} value
         */
        setValid: function (value) {
            this.desc('setValid', arguments);
            this.setFlag(FLAG_VALID, value);
        },

        /**
         * Returns true if this widget is valid.
         * @return {boolean}
         */
        isValid: function () {
            return this.getFlag(FLAG_VALID);
        },

        /**
         * Indicates that this widget should make itself valid. Validation includes
         * invoking layout on a Layout if present, and then validating all
         * children widgets. Default validation uses pre-order, depth-first
         * ordering.
         */
        validate: function () {
            this.desc('validate');
            if (this.isValid()) {
                return;
            }
            this.setValid(true);
            this.layout();
            this.getChildren().forEach(function (child) {
                child.validate();
            });
        },

        /**
         * Lays out this Widget using its Layout.
         */
        layout: function () {
            this.desc('layout');
            var layoutManager = this.getLayout();
            this.info('layoutManager --> ' + layoutManager);
            if (layoutManager) {
                layoutManager.layout(this);
            }
        },

        /**
         * Returns the rectangular area within this Widget's bounds
         * in which children will be placed via Layout and
         * the drawing of children will be clipped.
         * @param {Rectangle} [rect]
         * @return {Rectangle}
         */
        getClientArea: function (rect) {
            if (!(rect instanceof Rectangle)) {
                rect = new Rectangle();
            }
            rect.setBounds(this.bounds());
            rect.shrink(this.borderWidth());
            if (this.isLocalCoordinates()) {
                rect.location(0, 0);
            }
            this.desc('getClientArea', arguments, rect + '');
            return rect;
        },

        /**
         * Returns true if this widget's visibility flag is set to
         * true. Does not walk up the parent chain.
         * @return {boolean}
         */
        isVisible: function () {
            return this.getFlag(FLAG_VISIBLE);
        },

        /**
         * Returns true where this widget is visible
         * and its parent is showing, or it has no parent.
         * @return {boolean}
         */
        isShowing: function () {
            return this.isVisible() && (!this.getParent() || this.getParent().isShowing());
        },

        /**
         * Sets whether this widget can have background color or not.
         * @param {boolean} value
         */
        setFillable: function (value) {
            this.setFlag(FLAG_FILLABLE, value);
        },

        /**
         * Returns true if this widget can have background color.
         * @return {boolean}
         */
        isFillable: function () {
            return this.getFlag(FLAG_FILLABLE);
        },

        /**
         * Sets the bounds of this Widget to the Rectangle <i>rect</i>. Note that
         * rect is compared to the Widget's current bounds to determine what
         * needs to be rendered again and/or exposed and if validation is required. Since
         * {@link #bounds()} may return the current bounds by reference, it is
         * not safe to modify that Rectangle and then call bounds() after making
         * modifications. The widget would assume that the bounds are unchanged, and
         * no layout or paint would occur. For proper behavior, always use a copy.
         * 
         * @param {Rectangle|Object} newBounds - Rectangle or Rectangle like Object
         * @return {Widget}
         *//**
         * @param {number} x
         * @param {number} y
         * @param {number} w
         * @param {number} h
         * @return {Widget}
         */
        /**
         * Returns the smallest rectangle completely enclosing the widget.
         * Rectangle might be returned by reference. So, users should not
         * modify the returned Rectangle.
         * @return {Rectangle}
         */
        bounds: function () {
            if (arguments.length) {
                this.desc('bounds', arguments);
                if (arguments.length === 4) {
                    return this.bounds(genetic.getInstanceOf(Rectangle, arguments));
                } else if (arguments.length === 1) {
                    var newBounds = arguments[0];
                }

                var bounds = this.bounds();
                var dx = newBounds.x - bounds.x;
                var dy = newBounds.y - bounds.y;
                var dw = newBounds.w - bounds.w;
                var dh = newBounds.h - bounds.h;

                var isMoved = dx || dy;
                var isResized = dw || dh;
                var isChanged = isMoved || isResized;
                this.info('isMoved = ' + Boolean(isMoved),
                        ', isResized = ', Boolean(isResized));

                if (isMoved) {
                    this.translate(dx, dy);
                }
                if (isResized) {
                    bounds.w = newBounds.w;
                    bounds.h = newBounds.h;
                    this.invalidate();
                }
                if (isChanged) {
                    var parent = this.getParent();
                    if (parent) {
                        var layoutManager = parent.getLayout();
                        if (layoutManager) {
                            layoutManager.setConstraint(this, bounds);
                        }
                    }
                    this.redraw();
                }
                return this;
            } else {
                return this._bounds;
            }
        },

        /**
         * Sets this Widget's size.
         * @param {number} w
         * @param {number} h
         * @return {Widget}
         */
        /**
         * Returns this Widget's size.
         * @return {Object}
         * @property {number} w
         * @property {number} h
         */
        size: function (w, h) {
            this.desc('size', arguments);
            if (arguments.length) {
                var bounds = this.bounds();
                return this.bounds(bounds.x, bounds.y, w, h);
            } else {
                return {
                    w: bounds.w,
                    h: bounds.h
                };
            }
        },

        /**
         * Sets this Widget's location.
         * @param {number} x
         * @param {number} y
         * @return {Widget}
         */
        /**
         * Returns this Widget's location.
         * @return {Object}
         * @property {number} x
         * @property {number} y
         */
        location: function (x, y) {
            this.desc('location', arguments);
            if (arguments.length) {
                var bounds = this.bounds();
                return this.bounds(x, y, bounds.w, bounds.h);
            } else {
                return {
                    x: bounds.x,
                    y: bounds.y
                };
            }
        },

        /**
         * Repaints this Widget.
         * 
         * @param {Rectangle} newBounds
         *//**
         * @param {number} x
         * @param {number} y
         * @param {number} w
         * @param {number} h
         * @override
         */
        redraw: function () {
            this.desc('redraw', arguments);
            var man = this.getUpdateManager();
            if (man) {
                man.addInvalidWidget(this);
            }
        },

        /**
         * Returns true if this Widget uses local coordinates.
         * This means its children are placed relative to
         * this Widget's top-left corner.
         * @return {boolean}
         */
        isLocalCoordinates: function () {
            this.desc('isLocalCoordinates', [], 'false');
            return false;
        },

        /**
         * Moves this Widget x pixels horizontally and y
         * pixels vertically.
         * @param {number} dx
         * @param {number} dy
         */
        translate: function (dx, dy) {
            this.desc('translate', arguments);
            this._primTranslate(dx, dy);
            this._onMoved(dx, dy);
        },

        /**
         * Translates this Widget's bounds.
         * @param {number} dx - The amount to translate horizontally
         * @param {number} dy - The amount to translate vertically
         * @protected
         */
        _primTranslate: function (dx, dy) {
            var bounds = this.bounds();
            bounds.x += dx;
            bounds.y += dy;
            if (this.isLocalCoordinates()) {
                /**
                 * moved event.
                 * @event Widget#moved
                 * @type {object}
                 * @dx {number} dx
                 * @dy {number} dy
                 */
                this.emit('coordinateSystemChanged', this);
                return;
            }
            this.getChildren().forEach(function (child) {
                child.translate(dx, dy);
            });
        },

        /**
         * Translates a Translatable from this Widget's coordinates
         * to its parent's coordinates.
         * Translates coordinates that are relative to this Widget
         * into coordinates relative to its parent.
         * @param {Translatable} t
         */
        translateToParent: function (t) {
            this.desc('translateToParent', t);
            var bounds = this.bounds();
            var border = this.borderWidth();
            if (this.isLocalCoordinates()) {
                t.translate(bounds.x + border.left, bounds.y + border.top);
            }
        },

        /**
         * Translates coordinates that are relative to this Widget
         * into coordinates that are relative to the root.
         * @param {Translatable} t
         */
        translateToAbsolute: function (t) {
            this.desc('translateToAbsolute', t);
            this.warn('TODO');
            //TODO : Calculate bounds from this Widget's settings and environment
        },

        /**
         * Translates a Translatable from this Widget's parent's coordinates to
         * this Widget's local coordinates.
         * Translates coordinates that are relative to this Widget’s parent
         * into coordinates that are relative to this Widget.
         * @param {Translatable} t
         */
        translateFromParent: function (t) {
            this.desc('translateFromParent', t);
            var bounds = this.bounds();
            var border = this.borderWidth();
            if (this.isLocalCoordinates()) {
                t.translate(-1*(bounds.x + border.left), -1*(bounds.y + border.top));
            }
        },

        /**
         * Renders this Widget and its children.
         * @param {GraphicContext} context
         */
        draw: function (context) {
            this.desc('draw', context, undefined, 'tomato');
            this.bgColor(this.bgColor());
            this.borderColor(this.borderColor());
            this.borderWidth(this.borderWidth());
            this._drawWidget(context);
            this._drawChildren(context);
        },

        /**
         * Renders the Widget itself.
         * Each widget should know how to draw itself.
         * @param {GraphicContext} context
         * @abstract
         * @protected
         */
        _drawWidget: function (context) {
            throw new Error('_drawWidget(' + context + ') should be'
                    + 'implemented by ' + this.constructor.name);
        },

        /**
         * Renders this Widget's children.
         * @param {GraphicContext} context
         * @protected
         */
        _drawChildren: function (context) {
            this.desc('_drawChildren', context);
            //TODO clippingStrategy
            this.getChildren().forEach(function (child) {
                if (child.isVisible()) {
                    child.draw(context);
                }
            });
        },

        /**
         * Sets this widget's background color.
         * Returns this widget for method chaining.
         * @param {number} r - 0 ~ 255
         * @param {number} g - 0 ~ 255
         * @param {number} b - 0 ~ 255
         * @param {number} a - 0 ~ 1.0
         * @return {Widget}
         *//**
         * @param {string} colorName - 'skyblue', 'transparent'
         * @return {Widget}
         *//**
         * @param {string} hexCode - '#ff0', '#ffff00', 'ff0', 'ffff00'
         * @return {Widget}
         *//**
         * @param {Color} color
         * @return {Widget}
         */
        /**
         * Returns this widget's background color.
         * @return {Color}
         */
        bgColor: function () {
            this.desc('bgColor', arguments);
            if (arguments.length) {
                this._bgColor = genetic.getInstanceOf(Color, arguments);
                return this;
            } else {
                return this._bgColor;
            }
        },

        /**
         * Sets this widget's border color.
         * Returns this widget for method chaining.
         * @param {number} r - 0 ~ 255
         * @param {number} g - 0 ~ 255
         * @param {number} b - 0 ~ 255
         * @param {number} a - 0 ~ 1.0
         * @return {Widget}
         *//**
         * @param {string} colorName - 'skyblue', 'transparent'
         * @return {Widget}
         *//**
         * @param {string} hexCode - '#ff0', '#ffff00', 'ff0', 'ffff00'
         * @return {Widget}
         *//**
         * @param {Color} color
         * @return {Widget}
         */
        /**
         * Returns this widget's border color.
         * @return {Color}
         */
        borderColor: function () {
            this.desc('borderColor', arguments);
            if (arguments.length) {
                this._borderColor = genetic.getInstanceOf(Color, arguments);
                return this;
            } else {
                return this._borderColor;
            }
        },

        /**
         * Sets this widget's border's spaces.
         * Returns this widget for method chaining.
         * @param {number} top
         * @param {number} right
         * @param {number} bottom
         * @param {number} left
         * @return {Widget}
         *//**
         * @param {Spaces} spaces
         * @return {Widget}
         *//**
         * @param {number} number - If same values for each sides
         * @return {Widget}
         */
        /**
         * Returns this widget's border's spaces.
         * @return {Spaces}
         */
        borderWidth: function () {
            if (arguments.length) {
                this.desc('borderWidth', arguments);
                this._borderWidth = genetic.getInstanceOf(Spaces, arguments);
                return this;
            } else {
                this.desc('borderWidth', arguments, this._borderWidth + '');
                return this._borderWidth;
            }
        },

        /**
         * Convenient method for width, color for border.
         * Returns this widget for method chaining.
         * @param {Spaces|number} width
         * @param {Color|string} color
         * @return {Widget}
         */
        border: function (width, color) {
            this.desc('border', arguments);
            if (typeof width !== 'undefined'
                    && (typeof width === 'number'
                            || width instanceof Spaces)) {
                this.borderWidth.call(this, width);
            }
            if (typeof color !== 'undefined'
                    && (typeof color === 'string'
                            || color instanceof Color)) {
                this.borderColor.call(this, color);
            }
            return this;
        },

        /**
         * Returns whether this Widget has the given widget as a child.
         * @return {boolean}
         */
        hasChild: function (widget) {
            return this.getChildren().indexOf(widget) > -1;
        },

        /**
         * Returns whether the given widget is
         * in this Widget's descendant.
         * @return {boolean}
         */
        hasDescendant: function (widget) {
            var children = this.getChildren();
            if (this.hasChild(widget)) {
                return true;
            }
            for (var i in children) {
                if (children[i].hasDescendant(widget)) {
                    return true;
                }
            }
            return false;
        },

        /**
         * Sets whether this Widget's bounds expands
         * to parent's client area.
         * @param {boolean} isFill
         * @return {Widget}
         *//**
         * Returns whether this Widget's bounds should
         * be expanded to parent's client area.
         * @return {boolean}
         */
        fillParent: function () {
            this.desc('fillParent', arguments);
            if (arguments.length) {
                this.setFlag(FLAG_FILL_PARENT, !!arguments[0]);
                return this;
            } else {
                return this.getFlag(FLAG_FILL_PARENT);
            }
        },

        /**
         * Returns the Widget at the specified location.
         * @param {number} x
         * @param {number} y
         * @param {Object} filter
         * @return {Widget}
         */
        getWidgetAt: function (x, y, filter) {
            this.desc('getWidgetAt', arguments);
            var child;
            var noFilter = {
                prune: function (widget) {
                    return false;
                },
                accept: function (widget) {
                    return true;
                }
            };
            if (!filter) {
                filter = noFilter;
            }
            if (!this.containsPoint(x, y)) {
                return null;
            }
            if (filter.prune(this)) {
                return null;
            }
            child = this._getDescendantAt(x, y, filter);
            if (child !== null) {
                return child;
            }
            if (filter.accept(this)) {
                return this;
            }
            return null;
        },

        /**
         * Returns the Widget at the specified location
         * except for given array of widgets.
         * @param {number} x
         * @param {number} y
         * @param {Array} except
         * @return {Widget}
         */
        getWidgetAtExcept: function (x, y, except) {
            return this.getWidgetAt(x, y, {
                prune: function (widget) {
                    return except.indexOf(widget) > -1;
                },
                accept: function (widget) {
                    return true;
                }
            });
        },

        /**
         * Returns the descendant Widget at the specified location.
         * @param {number} x
         * @param {number} y
         * @param {Object} filter
         * @return {Widget}
         * @protected
         */
        _getDescendantAt: function (x, y, filter) {
            this.desc('_getDescendantAt', arguments);
            var child, children = this.getChildren();
            Point.SINGLETON.location(x, y);
            this.translateFromParent(Point.SINGLETON);
            if (!this.getClientArea(Rectangle.SINGLETON).contains(Point.SINGLETON)) {
                return null;
            }
            x = Point.SINGLETON.x;
            y = Point.SINGLETON.y;
            for (var i = children.length - 1; i >= 0; i--) {
                child = children[i];
                if (child.isVisible()) {
                    child = child.getWidgetAt(x, y, filter);
                    if (child !== null) {
                        return child;
                    }
                }
            }
            return null;
        },

        /**
         * Returns true if the given point is contained
         * within this Widget's bounds.
         * @param {number} x
         * @param {number} y
         * @return {boolean}
         *//**
         * Returns true if the given point is contained
         * within this Widget's bounds.
         * @param {Point} p
         * @return {boolean}
         */
        containsPoint: function () {
            var x, y, args = arguments, result;
            if (args.length === 1
                    && args[0] instanceof Point) {
                x = args[0].x;
                y = args[0].y;
            } else if (args.length === 2) {
                x = args[0];
                y = args[1];
            }
            result = this.bounds().contains(x, y);
            this.desc('containsPoint', args, result + '');
            return result;
        },

        /**
         * Erases this Widget.
         */
        erase: function () {
            if (this.getParent() === null || !this.isVisible()) {
                return;
            }
            this.getParent().redraw();
        },

        /**
         * Sets tool tip for this Widget.
         * @param {Widget} toolTip
         * @return {Widget}
         *//**
         * Returns tool tip for this Widget.
         * @return {Widget}
         */
        toolTip: function () {
            if (arguments.length) {
                this._toolTip = arguments[0];
                return this;
            } else {
                return this._toolTip;
            }
        },

        /**
         * Returns the deepest descendant for which
         * _canReceiveMouseEvent() returns true.
         * @param {number} x
         * @param {number} y
         * @return {Widget}
         */
        getMouseEventTargetAt: function (x, y) {
            this.desc('getMouseEventTargetAt', arguments);
            if (!this.containsPoint(x, y)) {
                return null;
            }
            var wiz = this._getMouseEventTargetInDescendantsAt(x, y);
            if (wiz) {
                return wiz;
            }
            if (this._canReceiveMouseEvent()) {
                return this;
            }
            return null;
        },

        /**
         * Searches this Widget's children for the deepest descendant
         * where the child Widget can receive MouseEvent.
         * @return {boolean}
         * @protected
         */
        _getMouseEventTargetInDescendantsAt: function (x, y) {
            this.desc('_getMouseEventTargetInDescendantsAt', arguments);
            var child, children = this.getChildren();
            Point.SINGLETON.location(x, y);
            this.translateFromParent(Point.SINGLETON);
            if (!this.getClientArea(Rectangle.SINGLETON).contains(Point.SINGLETON)) {
                return null;
            }
            for (var i = children.length - 1; i >= 0; i--) {
                child = children[i];
                if (child.isVisible() && child.isEnabled()) {
                    if (child.containsPoint(Point.SINGLETON.x, Point.SINGLETON.y)) {
                        child = child.getMouseEventTargetAt(Point.SINGLETON.x, Point.SINGLETON.y);
                        return child;
                    }
                }
            }
            return null;
        },

        /**
         * Returns true if this Widget can receive MouseEvent.
         * @return {boolean}
         * @protected
         */
        _canReceiveMouseEvent: function () {
            return true;
        }
    });

    genetic.inherits(Widget, BaseEmitter, proto);

    /** @constant {number} */
    Widget.FLAG_REALIZED = 1 << 31;
    Widget.FLAG_MAX = FLAG_FILL_PARENT;

    return Widget;
});
