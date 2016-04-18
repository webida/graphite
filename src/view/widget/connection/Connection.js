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
 * @author youngd.hwang@samsung.com
 */

define([
    'external/genetic/genetic',
    'graphite/view/geometry/Rectangle',
    'graphite/view/layout/DelegatingLayout',
    'graphite/view/locator/ConnectionLocator',
    'graphite/view/locator/ArrowLocator',
    './anchor/ConnectionAnchor',
    './router/OrthogonalRouter',
    '../svg/G',
    '../svg/Polyline',
    '../svg/Structural'
], function (
    genetic,
    Rectangle,
    DelegatingLayout,
    ConnectionLocator,
    ArrowLocator,
    ConnectionAnchor,
    OrthogonalRouter,
    G,
    Polyline,
    Structural
) {
    'use strict';

    /**
     * A Connection.
     * @constructor
     */
    function Connection() {
        G.apply(this, arguments);
        this.line = new Polyline();
        this._router = new OrthogonalRouter();
        this.setLayout(new DelegatingLayout());
        this.append(this.line);
    }

    genetic.inherits(Connection, G, {

        /** @member {PolylineDecoration} or {PolygonDecoration} */
        sourceDeco: null,

        /** @member {PolylineDecoration} or {PolygonDecoration} */
        targetDeco: null,

        /** @member {ConnectionAnchor} */
        _sourceAnchor: null,

        /** @member {ConnectionAnchor} */
        _targetAnchor: null,

        /** @inheritdoc */
        isLocalCoordinates: function () {
            this.desc('isLocalCoordinates', [], false);
            return false;
        },

        /** @inheritdoc */
        draw: function (context) {
            this.desc('draw', context, undefined, 'tomato');
            this._drawChildren(context);
        },

        /** @inheritdoc */
        bgColor: function () {
            var args = arguments;
            if (args.length) {
                this.getChildren().forEach(function(child) {
                    child.bgColor.apply(child, args);
                });
                return this;
            } else {
                return this._bgColor;
            }
        },

        /** @inheritdoc */
        borderColor: function () {
            var args = arguments;
            if (args.length) {
                this.getChildren().forEach(function(child) {
                    child.borderColor.apply(child, args);
                });
                return this;
            } else {
                return this._borderColor;;
            }
        },

        /** @inheritdoc */
        borderWidth: function () {
            var args = arguments;
            if (args.length) {
                this.getChildren().forEach(function(child) {
                    child.borderWidth.apply(child, args);
                });
                return this;
            }  else {
                return this._borderWidth;
            }
        },

        /**
         * Wrapper function of {@link Polyline#pointList}
         */
        pointList: function () {
            return this.line.pointList.apply(this.line, arguments);
        },

        /**
         * Sets the anchor to be used
         * at the start of this Connection.
         * @param {ConnectionAnchor} anchor
         * @return {Connection}
         */
        /**
         * Returns the anchor at the start of this Connection.
         * @return {ConnectionAnchor}
         */
        sourceAnchor: function (anchor) {
            this.desc('sourceAnchor', arguments);
            if (anchor) {
                if (anchor instanceof ConnectionAnchor
                        && anchor !== this._sourceAnchor) {
                    var self = this;
                    this._sourceAnchor = anchor;
                    this._sourceAnchor.owner().on('moved', function() {
                        self.onAnchorMoved();
                    });
                    this.revalidate();
                }
                return this;
            } else {
                return this._sourceAnchor;
            }
        },

        /**
         * Sets the anchor to be used
         * at the end of this Connection.
         * @param {ConnectionAnchor} anchor
         * @return {Connection}
         */
        /**
         * Returns the anchor at the end of this Connection.
         * @return {ConnectionAnchor}
         */
        targetAnchor: function (anchor) {
            this.desc('targetAnchor', arguments);
            if (anchor) {
                if (anchor instanceof ConnectionAnchor
                        && anchor !== this._targetAnchor) {
                    var self = this;
                    this._targetAnchor = anchor;
                    this._targetAnchor.owner().on('moved', function() {
                        self.onAnchorMoved();
                    });
                    this.revalidate();
                }
                return this;
            } else {
                return this._targetAnchor;
            }
        },

        /**
         * Sets the decoration to be used
         * at the start of this Connection.
         * @param {PolylineDecoration} or {PolygonDecoration} decoration
         * @return {Connection}
         */
        /**
         * Returns the decoration at the start of this Connection.
         * @return {PolylineDecoration} or {PolygonDecoration} 
         */
        sourceDecoration: function (decoration) {
            if (decoration) {
                if (decoration !== this.sourceDeco) {
                    if (this.sourceDeco) {
                        this.remove(this.sourceDeco);
                    }
                    this.sourceDeco = decoration;
                    this.append(this.sourceDeco,
                        new ArrowLocator(this, ConnectionLocator.SOURCE));
                }
                return this;
            } else {
                return this.sourceDeco;
            }
        },

        /**
         * Sets the decoration to be used
         * at the end of this Connection.
         * @param {PolylineDecoration} or {PolygonDecoration} decoration
         * @return {Connection}
         */
        /**
         * Returns the decoration at the end of this Connection.
         * @return {PolylineDecoration} or {PolygonDecoration} 
         */
        targetDecoration: function (decoration) {
            if (decoration) {
                if (decoration !== this.targetDeco) {
                    if (this.targetDeco) {
                        this.remove(this.targetDeco);
                    }
                    this.targetDeco = decoration;
                    this.append(this.targetDeco,
                            new ArrowLocator(this, ConnectionLocator.TARGET));
                }
                return this;
            } else {
                return this.targetDeco;
            }
        },

        /** @inheritdoc */
        revalidate: function () {
            G.prototype.revalidate.apply(this, arguments);
            this._router.invalidate(this);
        },

        /**
         * Sets the connection router
         * that handles the layout of this Connection.
         * @param {ConnectionRouter} router
         * @return {Connection}
         */
        /**
         * Returns the connection router
         * that used to layout this Connection.
         * @return {ConnectionRouter}
         */
        connectionRouter: function (router) {
            if (router) {
                if (router !== this._router) {
                    var oldRouter = this._router;
                    this._router.remove(this);
                    this._router = router;
                    this.emit('connectionRouter', oldRouter, router);
                    this.revalidate();
                }
                return this;
            } else {
                return this._router;
            }
        },

        /**
         * Called by the anchor of this connection
         * when they have moved.
         */
        onAnchorMoved: function () {
            this.revalidate();
        },

        /**
         * Called just before the receiver is being removed
         * from its parent.
         */
        onRemoved: function () {
            this._router.remove(this);
            G.prototype.onRemoved.apply(this, arguments);
        },

        /**
         * Sets the routing constraint for this connection.
         * @param {Object} constraint
         */
        /**
         * Returns this connection's routing constraint
         * from its connection router.
         * @return {Object}
         */
        routingConstraint: function (constraint) {
            if (constraint) {
                if (this._router) {
                    this._router.constraint(this, constraint);
                }
                this.revalidate();
            } else {
                if (this._router) {
                    return this._router.getConstraint(this);
                } else {
                    return null;
                }
            }
        },

        /**
         * Lays out this connection.
         * If the source and target anchors are present,
         * the connection router is used to route this,
         * after which it is laid out.
         */
        layout: function () {
            if (this.sourceAnchor() && this.targetAnchor()) {
                this._router.route(this);
            }
            var newBounds;
            var oldBounds = this.line.bounds().copy();
            Structural.prototype.layout.apply(this, arguments);
            this._bounds = null;
            this.line._bounds = null;            
            newBounds = (this.bounds() && this.line.bounds());
            this.redraw();
            this._onMoved(newBounds.x - oldBounds.x, 
                newBounds.y - oldBounds.y);
        },

        /** @inheritdoc */
        bounds: function () {
            if (arguments.length) {
                // do nothing
                return this;
            } else {
                if (this._bounds === null) {
                    this._bounds = new Rectangle();
                    this.getChildren().forEach(function (child) {                        
                        if (child instanceof Polyline) {
                            Polyline.prototype.bounds.apply(child);
                        }
                    }, this);                
                }
                return this._bounds;
            }
        }
    });

    return Connection;
});
