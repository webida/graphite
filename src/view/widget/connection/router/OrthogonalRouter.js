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
 * @file Provides a {@link Connection} with an orthohonal route 
 * between the Connection's source and target anchors.
 * @since 1.0.0
 * @author hw.shim@samsung.com
 * @author youngd.hwang@samsung.com
 */

define([
    'external/genetic/genetic',
    'graphite/view/geometry/Point',
    'graphite/view/geometry/PointList',
    'graphite/view/geometry/Rectangle',
    'graphite/view/geometry/Vector',
    './ConnectionRouter'
], function (
    genetic,
    Point,
    PointList,
    Rectangle,
    Vector,
    ConnectionRouter
) {
    'use strict';

    /** @constant {Vector} */
    var UP = new Vector(0, -1);
    var DOWN = new Vector(0, 1);
    var LEFT = new Vector(-1, 0);
    var RIGHT = new Vector(1, 0);

    /** @constant {number} */
    var MIN_DIST = 20;
    var TOL = 0.1;

    /**
     * A OrthogonalRouter.
     * @constructor
     */
    function OrthogonalRouter() {
        ConnectionRouter.apply(this, arguments);
    }

    genetic.inherits(OrthogonalRouter, ConnectionRouter, {

        /** @inheritdoc */
        route: function (conn) {
            if (conn.sourceAnchor() === null || conn.targetAnchor() === null) {
                return;
            }
            var startPoint = this.startPoint(conn);
            conn.translateToRelative(startPoint);
            var endPoint = this.endPoint(conn);
            conn.translateToRelative(endPoint);
            var points = new PointList();
            this._route(points, 
                endPoint, this._endDirection(conn), 
                startPoint, this._startDirection(conn));
            conn.pointList(points);
        },

        /**
         * Internal routing algorithm.
         * @param  {PointList} points
         * @param  {Point} startPt
         * @param  {Vector} startDir
         * @param  {Point} endPt
         * @param  {Vector} endDir
         */
        _route: function (points, startPt, startDir, endPt, endDir) {
            var diff = new Vector(endPt, startPt);
            var xDiff = diff.x;
            var yDiff = diff.y;
            var point, dir, pos;
            if (diff.length() < TOL) {
                points.add(endPt);
                return;
            }

            switch (startDir) {
                case LEFT:
                    if (xDiff > 0
                            && Math.abs(yDiff) < TOL 
                            && endDir === RIGHT) {
                        point = endPt;
                        dir = endDir;
                    } else {
                        if (xDiff < 0) {
                            point = new Point(startPt.x - MIN_DIST, startPt.y);
                        } else if ( (yDiff > 0 && endDir === DOWN) 
                                || (yDiff < 0 && endDir === UP) ) {
                            point = new Point(endPt.x, startPt.y);
                        } else if (startDir === endDir) {
                            pos = Math.min(startPt.x, endPt.x) - MIN_DIST;
                            point = new Point(pos, startPt.y);
                        } else {
                            point = new Point(startPt.x - (xDiff / 2), startPt.y);
                        }
                        dir = (yDiff > 0) ? UP : DOWN;
                    }
                    break;
                case RIGHT:
                    if (xDiff < 0
                            && Math.abs(yDiff) < TOL
                            && endDir === LEFT) {
                        point = endPt;
                        dir = endDir;
                    } else {
                        if (xDiff > 0) {
                            point = new Point(startPt.x + MIN_DIST, startPt.y);
                        } else if ( (yDiff > 0 && endDir === DOWN) 
                                || (yDiff < 0 && endDir === UP) )  {
                            point = new Point(endPt.x, startPt.y);
                        } else if (startDir === endDir) {
                            pos = Math.max(startPt.x, endPt.x) + MIN_DIST;
                            point = new Point(pos, startPt.y);
                        } else {
                            point = new Point(startPt.x - (xDiff / 2), startPt.y);
                        }
                        dir = (yDiff > 0) ? UP : DOWN;
                    }
                    break;
                case UP:
                    if (yDiff > 0
                            && Math.abs(xDiff) < TOL
                            && endDir === DOWN) {
                        point = endPt;
                        dir = endDir;
                    } else {
                        if (yDiff < 0) {
                            point = new Point(startPt.x, startPt.y - MIN_DIST);
                        } else if ( (xDiff > 0 && endDir === RIGHT) 
                                || (xDiff < 0) && (endDir === LEFT) ) {
                            point = new Point(startPt.x, endPt.y);
                        } else if (startDir === endDir) {
                            pos = Math.min(startPt.y, endPt.y) - MIN_DIST;
                            point = new Point(startPt.x, pos);
                        } else {
                            point = new Point(startPt.x, startPt.y - (yDiff / 2));
                        }
                        dir = (xDiff > 0) ? LEFT : RIGHT;
                    }
                    break;
                case DOWN:
                    if (yDiff < 0
                            && Math.abs(xDiff) < TOL
                            && endDir === UP) {
                        point = endPt;
                        dir = endDir;
                    } else {
                        if (yDiff > 0) {
                            point = new Point(startPt.x, startPt.y + MIN_DIST);
                        } else if ( (xDiff > 0 && endDir === RIGHT) 
                                || (xDiff < 0 && endDir === LEFT) ) {
                            point = new Point(startPt.x, endPt.y);
                        } else if (startDir === endDir) {
                            pos = Math.max(startPt.y, endPt.y) + MIN_DIST;
                            point = new Point(startPt.x, pos);
                        } else {
                            point = new Point(startPt.x, startPt.y - (yDiff / 2));
                        }
                        dir = (xDiff > 0) ? LEFT : RIGHT;
                    }
                    break;
                default:
                    ;
            }
            this._route(points, point, dir, endPt, endDir);
            points.add(startPt);
        },

        /**
         * Returns the direction the point is in relation
         * to the given rectangle.
         * Possible values are LEFT, RIGHT, UP, and DOWN.
         * @param  {Rectangle} rect
         * @param  {Point} point
         * @return {Vector}
         * @protected
         */
        _direction: function (rect, point) {
            var i;
            var distance = Math.abs(rect.x - point.x);
            var direction = LEFT;

            i = Math.abs(rect.y - point.y);
            if (i <= distance) {
                distance = i;
                direction = UP;
            }

            i = Math.abs(rect.bottom() - point.y);
            if (i <= distance) {
                distance = i;
                direction = DOWN;
            }

            i = Math.abs(rect.right() - point.x);
            if (i < distance) {
                distance = i;
                direction = RIGHT;
            }
            return direction;
        },

        /**
         * Returns the start direction from the source anchor 
         * of the connection.
         * @param  {Connection} conn
         * @return {Vector}
         * @protected
         */
        _startDirection: function (conn) {
            var anchor = conn.sourceAnchor();
            var p = this.startPoint(conn);
            var r;
            if (anchor.owner() === null) {
                r = new Rectangle(p.x -1, p.y -1, 2, 2);
            } else {
                r = conn.sourceAnchor().owner().bounds().copy();
                conn.sourceAnchor().owner().translateToAbsolute(r);
            }
            return this._direction(r, p);
        },

        /**
         * Returns the end direction from the target anchor 
         * of the connection.
         * @param  {Connection} conn
         * @return {Vector}
         * @protected
         */
        _endDirection: function (conn) {
            var anchor = conn.targetAnchor();
            var p = this.endPoint(conn);
            var r;
            if (anchor.owner() === null) {
                r = new Rectangle(p.x -1, p.y -1, 2, 2);
            } else {
                r = conn.targetAnchor().owner().bounds().copy();
                conn.targetAnchor().owner().translateToAbsolute(r);
            }
            return this._direction(r, p);
        },
    });

    return OrthogonalRouter;
});