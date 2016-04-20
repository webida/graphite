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
    'graphite/view/geometry/Point',
    'graphite/base/BaseEmitter'
], function (
    genetic,
    Point,
    BaseEmitter
) {
    'use strict';

    /**
     * A ConnectionRouter.
     * @constructor
     */
    function ConnectionRouter() {
        BaseEmitter.apply(this, arguments);
        this._start = new Point();
        this._end = new Point();
    }

    genetic.inherits(ConnectionRouter, BaseEmitter, {

        /**
         * Maps the given constraint to the given Connection.
         * @param {Connection} connection
         * @param {Object} constraint
         */
        constraint: function (connection, constraint) {
            if (arguments.length) {
                this.emit('constraint', connection, constraint);
            } else {
                return null;
            }
        },

        /**
         * Invalidates the given Connection.
         * @param {Connection} connection
         */
        invalidate: function (connection) {
            this.emit('invalidate', connection);
        },

        /**
         * Routes the given Connection.
         * @param {Connection} connection
         */
        route: function (connection) {
            this.emit('route', connection);
        },

        /**
         * Removes the Connection from this router.
         * @param {Connection} connection
         */
        remove: function (connection) {
            this.emit('remove', connection);
        },

        /**
         * Obtains a connection's start point.
         * @param {Connection} connection
         */
        startPoint: function (connection) {
            var ref = connection.targetAnchor().referencePoint();
            var start = connection.sourceAnchor().getLocation(ref);
            return this._start.location(start.x, start.y);
        },

        /**
         * Obtains a connection's end point.
         * @param {Connection} connection
         */
        endPoint: function (connection) {
            var ref = connection.sourceAnchor().referencePoint();
            var end = connection.targetAnchor().getLocation(ref);
            return this._end.location(end.x, end.y);
        }
    });

    ConnectionRouter.DEFAULT = new ConnectionRouter();
    ConnectionRouter.DEFAULT.route = function (connection) {
        var p;
        var points = connection.pointList();
        ConnectionRouter.prototype.route.call(this, connection);
        points.clear();
        connection.translateToRelative(p = this.startPoint(connection));
        points.add(p.x, p.y);
        connection.translateToRelative(p = this.endPoint(connection));
        points.add(p.x, p.y);
    }

    return ConnectionRouter;
});
