/*
 * Copyright (c) 2012-2016 S-Core Co., Ltd.
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
 * @file
 * A small square handle approximately 7x7 pixels in size,
 * that is either black or white.
 * @since 1.0.0
 * @author hw.shim@samsung.com
 */

define([
    'external/genetic/genetic',
    'graphite/view/geometry/Dimension',
    './Handle'
], function (
    genetic,
    Dimension,
    Handle
) {
    'use strict';

    /**
     * Creates a SquareHandle.
     * @param {Controller} owner
     * @param {Locator} locator - The locator to position the handle
     * @param {string} cursor
     *  - The cursor to display when the mouse is over the handle
     * @constructor
     */
    function SquareHandle(owner, locator, cursor) {
        this.defaultSize(new Dimension(
                SquareHandle.DEFAULT_HANDLE_SIZE,
                SquareHandle.DEFAULT_HANDLE_SIZE));
        Handle.call(this, owner, locator, cursor);
    }

    genetic.inherits(SquareHandle, Handle, {

        /**
         * Returns true if the handle's owner is the primary selection.
         * @return {boolean}
         * @protected
         */
        _isPrimary: function () {
            return this.owner().selectedState() === 'SELECTED_PRIMARY';
        },

        /**
         * Returns the color for the inside of the handle.
         * @return {string} the color of the handle bg
         * @protected
         */
        _handleBgColor: function () {
            return this._isPrimary() ? 'black' : 'white';
        },

        /**
         * Draws the handle with fill color and outline color
         * dependent on the primary selection status of the owner.
         * @param {GraphicContext} context
         * @override
         * @protected
         */
        _drawWidget: function (context) {
            this.bgColor(this._handleBgColor());
            this.border(1, 'black');
            Handle.prototype._drawWidget.call(this, context);
        },
    });

    /**
     * The default size for square handles.
     */
    SquareHandle.DEFAULT_HANDLE_SIZE = 7;

    return SquareHandle;
});
