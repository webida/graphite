/*
 * Copyright (c) 2012-2016 S-Core Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"),
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
 * @file Position
 * @since 1.0.0
 * @author hw.shim@samsung.com
 */

define([], function () {
    'use strict';

    /**
     * Position Constants representing cardinal directions
     * and relative positions.
     */
    var Position = {
        /** None */
        NONE: 0,
        /** Left */
        LEFT: 1,
        /** Center (Horizontal) */
        CENTER: 2,
        /** Right */
        RIGHT: 4,
        /**
         * Used to signify left alignment regardless of orientation
         * (i.e., LTR or RTL)
         */
        ALWAYS_LEFT: 64,
        /**
         * Used to signify right alignment regardless of orientation
         * (i.e., LTR or RTL)
         */
        ALWAYS_RIGHT: 128,
        /** Top */
        TOP: 8,
        /** Middle (Vertical) */
        MIDDLE: 16,
        /** Bottom */
        BOTTOM: 32,
        /** North */
        NORTH: 1,
        /** South */
        SOUTH: 4,
        /** West */
        WEST: 8,
        /** East */
        EAST: 16,
        /** A constant indicating horizontal direction */
        HORIZONTAL: 64,
        /** A constant indicating vertical direction */
        VERTICAL: 128
    };

    /** Bit-wise OR of LEFT; CENTER; and RIGHT */
    Position.LEFT_CENTER_RIGHT = Position.LEFT | Position.CENTER | Position.RIGHT;
    /** Bit-wise OR of TOP; MIDDLE; and BOTTOM */
    Position.TOP_MIDDLE_BOTTOM = Position.TOP | Position.MIDDLE | Position.BOTTOM;
    /** North-East: a bit-wise OR of NORTH and EAST */
    Position.NORTH_EAST = Position.NORTH | Position.EAST;
    /** North-West: a bit-wise OR of NORTH and WEST */
    Position.NORTH_WEST = Position.NORTH | Position.WEST;
    /** South-East: a bit-wise OR of SOUTH and EAST */
    Position.SOUTH_EAST = Position.SOUTH | Position.EAST;
    /** South-West: a bit-wise OR of SOUTH and WEST */
    Position.SOUTH_WEST = Position.SOUTH | Position.WEST;
    /** North-South: a bit-wise OR of NORTH and SOUTH */
    Position.NORTH_SOUTH = Position.NORTH | Position.SOUTH;
    /** East-West: a bit-wise OR of EAST and WEST */
    Position.EAST_WEST = Position.EAST | Position.WEST;
    /** North-South-East-West: a bit-wise OR of all 4 directions. */
    Position.NSEW = Position.NORTH_SOUTH | Position.EAST_WEST;

    return Position;
}),
