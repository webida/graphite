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
 * @file Utilities for geometric calculations.
 * @since 1.0.0
 * @author hw.shim@samsung.com
 */

define([
    'external/math/math',
    './Point',
    './Rectangle'
], function (
    math,
    Point,
    Rectangle
) {
    'use strict';

    function getLineCoefficients(points) {
        var a = points[0], b = points[1],
            c = points[2], d = points[3],
            e = points[4], f = points[5],
            g = points[6], h = points[7];
        if (points.length !== 8 || !math.isAllNumber(points)) {
            return null;
        }
        var A = d - b;
        var B = a - c;
        var C = a - e;
        var D = h - f;
        var E = e - g;
        var F = b - f;
        var denominator = B * D - A * E;
        if (denominator === 0) {
            return null;
        }
        var t = (C * D + F * E) / denominator;
        var u = (C * A + F * B) / denominator;
        return {
            'a': a, 'b': b,
            'c': c, 'd': d,
            'e': e, 'f': f,
            'g': g, 'h': h,
            'A': A, 'B': B,
            'C': C, 'D': D,
            'E': E, 'F': F,
            'denominator': denominator,
            't': t, 'u': u
        }
    }

    /**
     * Tests if a point is Left|On|Right of an infinite line.
     * @param p0 {object} x,y point
     * @param p1 {object} x,y point
     * @param p2 {object} x,y point
     * @returns {number}
     *  >0 for P2 : left of the line through P0 and P1,
     *  =0 for P2 : on the line,
     *  <0 for P2 : right of the line
     */
    function isLeft(p0, p1, p2) {
        return ((p1.x - p0.x) * (p2.y - p0.y))
                - ((p2.x - p0.x) * (p1.y - p0.y));
    }

    /**
     * A utility object for geometry.
     */
    var Geometry = {

        /**
         * Returns point of intersection between two lines.
         * 
         * R(t) = P1 + tV1
         * where
         * vector R(t) = (x,y)
         * vector P1 = (a,b)
         * vector P2 = (c,d)
         * vector V1 = P2 - P1
         * float t
         * (x,y) = (a,b) + t(P2 - P1)
         * (x,y) = (a,b) + t(c-a, d-b)
         * 
         * @see {@link Geometry#isLineIntersect}
         * @param {Array} points
         * @param {boolean} isInt
         * @return {Object}
         */
        getLineIntersection: function (points, isInt) {
            var $ = getLineCoefficients(points);
            if (!$) {
                return null;
            }
            var x = $.a - $.t * $.B;
            var y = $.b + $.t * $.A;
            if (isInt) {
                x = Math.round(x);
                y = Math.round(y);
            }
            return new Point(x, y);
        },

        /**
         * Returns true if two line segments connecting given points intersect.
         * 
         * Using Parametric form of linear equation
         * 1) R(t) = P1 + tV1
         * 2) S(t) = P3 + uV2
         * Where
         * vector R(t) = (x,y)
         * vector P1 = (a,b)
         * vector P2 = (c,d)
         * vector V1 = P2 - P1
         * float t
         * 
         * vector S(t) = (x,y)
         * vector P3 = (e,f)
         * vector P4 = (g,h)
         * vector V2 = P4 - P3
         * float u
         * 
         * To reduce calculations
         * A = d - b
         * B = a - c
         * C = a - e
         * D = h - f
         * E = e - g
         * F = b - f
         * 
         * To intersect, t and u should be 0 < t,u < 1
         * Because, for the first equation
         * P(0) = P1, P(1) = P2
         * It's same for the other equation.
         * 
         * Deriving t, u,
         * For intersection point R(t) equals to S(t)
         * P1 + tV1 = P3 + uV2
         * P1 + t(P2 - P1) = P3 + u(P4 - P3)
         * (a,b) + t(c-a,d-b) = (e,f) + u(g-e,h-f)
         * (a,b) + t(-B,A) = (e,f) + u(-E,D)
         * 
         * Cross product of same vector is 0 (because sin(0) = 0)
         * 
         * To derive t, get cross product of (-E,D)
         * (a,b)x(-E,D) + t(-B,A)x(-E,D) = (e,f)x(-E,D)
         * t = (CD + FE)/(BD - AE)
         *
         * To derive u, get cross product of (-B,A)
         * (a,b)x(-B,A) = (e,f)x(-B,A) + u(-E,D)x(-B,A)
         * u = (CA + FB)/(BD - AE)
         * 
         * @param {Array} points
         * @return {boolean}
         */
        isSegmentIntersect: function (points) {
            var $ = getLineCoefficients(points);
            if (!$) {
                return false;
            }
            if ($.t < 0 || $.t > 1 || $.u < 0 || $.u > 1) {
                return false;
            }
            return true;
        },

        /**
         * Returns true if the least distance between specified point
         * and polyline drawn using given points is less then
         * the given tolerance.
         * @param {PointList} pointList
         * @param {Point} point
         * @param {number} tolerance - allowed distance between
         *      point and polyline segment
         * @return {boolean}
         */
        polylineContainsPoint: function (pointList, point, tolerance) {
            var size = pointList.size() - 1;
            for (var i = 0; i < size; i++) {
                if (this.pointCloseEnoughToSegment(pointList.get(i),
                        pointList.get(i+1), point, tolerance)) {
                    return true;
                }
            }
            return false;
        },

        /**
         * Returns true if the least distance between specified point
         * and segment drawn using given two points is less then
         * the given tolerance.
         * @param {Point} start
         * @param {Point} end
         * @param {Point} point
         * @param {number} tolerance - allowed distance between
         *      a point and a segment
         * @return {boolean}
         */
        pointCloseEnoughToSegment: function (start, end, point, tolerance) {

            /*
             * Point should be located inside Rectangle(x1 -+ tolerance, y1 -+
             * tolerance, x2 +- tolerance, y2 +- tolerance)
             */
            var bounds = Rectangle.SINGLETON;
            bounds.size(0, 0);
            bounds.location(start);
            bounds.union(end);
            bounds.expand(tolerance, tolerance);
            if (!bounds.contains(point)) {
                return false;
            }

            /*
             * If this is horizontal, vertical line or dot then the distance
             * between specified point and segment is not more then tolerance
             * (due to the lineBounds check above)
             */
            if (start.x == end.x || start.y == end.y) {
                return true;
            }

            /*
             * Calculating square distance from specified point to this segment
             * using formula for Dot product of two vectors.
             */
            var v1x = end.x - start.x;
            var v1y = end.y - start.y;
            var v2x = point.x - start.x;
            var v2y = point.y - start.y;
            var numerator = v2x * v1y - v1x * v2y;
            var denominator = v1x * v1x + v1y * v1y;
            var squareDistance = numerator * numerator / denominator;
            return squareDistance <= tolerance * tolerance;
        },

        /**
         * Returns true if a given point is in a given polygon of
         * specified point lists' connection.
         * This method uses Winding Number Method algorithm to determine
         * the inclusion of a point P in a 2D planar non-simple polygons.
         * @param {PointList} pointList
         * @param {Point} point
         * @return {boolean}
         */
        polygonContainsPoint: function (pointList, point) {
            //the winding number (=0 only when P is outside)
            var wn = 0;
            var size = pointList.size();
            //vertex points of a polygon V[n+1] with V[n]=V[0]
            var vertices = pointList.copy();
            vertices.add(pointList.get(0));
            // loop through all edges of the polygon
            // edge from V[i] to  V[i+1]
            for (var i = 0; i < size; i++) {
                // start y <= P.y
                if (vertices.get(i).y <= point.y) {
                    // an upward crossing
                    if (vertices.get(i+1).y > point.y) {
                        // P left of  edge
                        if (isLeft(vertices.get(i), vertices.get(i+1), point) > 0) {
                            // have  a valid up intersect
                            wn++;
                        }
                    }
                // start y > P.y (no test needed)
                } else {
                    // a downward crossing
                    if (vertices.get(i+1).y <= point.y) {
                        // P right of  edge
                        if (isLeft(vertices.get(i), vertices.get(i+1), point) < 0) {
                            // have  a valid down intersect
                            wn--;
                        }
                    }
                }
            }
            return wn !== 0;
        }
    }; 

    return Geometry;
});
