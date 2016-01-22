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
    'external/math/math',
    'graphite/base/Base'
], function (
    genetic,
    math,
    Base
) {
    'use strict';

    var singleton = {};

    function getColor(args) {
        if (args.length === 1) {
            var rgb, hex, str, prefix;
            if (args[0] instanceof Color) {
                return args[0];
            } else if (typeof args[0] === 'string') {
                str = args[0].toLowerCase();
                if (args[0] === 'transparent') {
                    return {css: 'transparent'};
                }
                hex = Color[str];
                if (typeof hex === 'string') {
                    str = hex;
                }
                if (Color.isValid(str)) {
                    rgb = Color.hex2rgb(str);
                    return {
                        r: rgb.r,
                        g: rgb.g,
                        b: rgb.b,
                        css: 'rgb(' + rgb.join(',') + ')'
                    };
                } else {
                    console.warn('Invalid color argument');
                }
            }
        } else if (args.length > 2 && math.isAllNumber(args)) {
            if (args.length === 3) {
                prefix = 'rgb';
            } else if (args.length === 4) {
                prefix = 'rgba';
            }
            return {
                r: args[0],
                g: args[1],
                b: args[2],
                a: args[3],
                css: prefix + '(' + ([]).join.call(args, ',') + ')'
            };
        }
        return {css: 'transparent'};
    }

    /**
     * A Color.
     * @constructor
     * @param {number} r - 0 ~ 255
     * @param {number} g - 0 ~ 255
     * @param {number} b - 0 ~ 255
     * @param {number} a - 0 ~ 1.0
     *//**
     * @param {string} colorName - 'skyblue', 'transparent'
     *//**
     * @param {string} hexCode - '#ff0', '#ffff00', 'ff0', 'ffff00'
     *//**
     * @param {Color} color
     */
    function Color(r, g, b, a) {
        var color = getColor(arguments);
        if (singleton[color.css]) {
            return singleton[color.css];
        } else {
            Base.apply(this, arguments);
            //configurable: false, writable: false
            Object.defineProperties(this, {
                r: {
                    enumerable: true,
                    value: color.r
                },
                g: {
                    enumerable: true,
                    value: color.g
                },
                b: {
                    enumerable: true,
                    value: color.b
                },
                a: {
                    enumerable: true,
                    value: color.a
                },
                css: {
                    enumerable: true,
                    value: color.css
                }
            });
            singleton[color.css] = this;
        }
    }

    genetic.inherits(Color, Base, {

        /**
         * Without any color definition,
         * Color object is transparent.
         * @member {string}
         */
        css: 'transparent',

        /**
         * Returns css for this color for convenience.
         * For example, such as rgb(1,2,3) or rgba(1,2,3,0.1)
         * @return {string}
         */
        toString: function () {
            return this.css;
        },

        /**
         * Returns whether this Color is equal
         * to the given Color or not.
         * @param {string} color
         * @return {boolean}
         */
        equals: function (color) {
            if (color.r === this.r &&
                color.g === this.g &&
                color.b === this.b &&
                color.a === this.a) {
                return true;
            } else {
                return false;
            }
        }
    });

    /**
     * Tells whether the given string is hex code or not.
     * @static
     * @param {string} hexCode - '#fff', '#fff000', 'fff', 'fff000'
     * @return {boolean}
     */
    Color.isValid = function (hexCode) {
        if (hexCode.length === 3 || hexCode.length === 6) {
            hexCode = '#' + hexCode;
        }
        return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(hexCode);
    }

    /**
     * Returns r,g,b value for the given hex code.
     * @static
     * @param {string} hexCode - '#fff', '#fff000', 'fff', 'fff000'
     * @return {Object} array like object
     */
    Color.hex2rgb = function (hexCode) {
        var result = [];
        var hex = hexCode.trim().replace(/ |#/g, '');
        if (hex.length !== 3 && hex.length !== 6) {
            throw new Error('Color hex code length should be 3 or 6');
        }
        if (hex.length === 3) {
            hex = hex.replace(/(.)/g, '$1$1');
        }
        hex = hex.match(/../g);
        result.push(parseInt(hex[0], 16));
        result.push(parseInt(hex[1], 16));
        result.push(parseInt(hex[2], 16));
        result['r'] = result[0];
        result['g'] = result[1];
        result['b'] = result[2];
        return result;
    }

    /** @static */
    Color.aliceblue = '#f0f8ff';

    /** @static */
    Color.antiquewhite = '#faebd7';

    /** @static */
    Color.aqua = '#00ffff';

    /** @static */
    Color.aquamarine = '#7fffd4';

    /** @static */
    Color.azure = '#f0ffff';

    /** @static */
    Color.beige = '#f5f5dc';

    /** @static */
    Color.bisque = '#ffe4c4';

    /** @static */
    Color.black = '#000000';

    /** @static */
    Color.blanchedalmond = '#ffebcd';

    /** @static */
    Color.blue = '#0000ff';

    /** @static */
    Color.blueviolet = '#8a2be2';

    /** @static */
    Color.brown = '#a52a2a';

    /** @static */
    Color.burlywood = '#deb887';

    /** @static */
    Color.cadetblue = '#5f9ea0';

    /** @static */
    Color.chartreuse = '#7fff00';

    /** @static */
    Color.chocolate = '#d2691e';

    /** @static */
    Color.coral = '#ff7f50';

    /** @static */
    Color.cornflowerblue = '#6495ed';

    /** @static */
    Color.cornsilk = '#fff8dc';

    /** @static */
    Color.crimson = '#dc143c';

    /** @static */
    Color.cyan = '#00ffff';

    /** @static */
    Color.darkblue = '#00008b';

    /** @static */
    Color.darkcyan = '#008b8b';

    /** @static */
    Color.darkgoldenrod = '#b8860b';

    /** @static */
    Color.darkgray = '#a9a9a9';

    /** @static */
    Color.darkgreen = '#006400';

    /** @static */
    Color.darkkhaki = '#bdb76b';

    /** @static */
    Color.darkmagenta = '#8b008b';

    /** @static */
    Color.darkolivegreen = '#556b2f';

    /** @static */
    Color.darkorange = '#ff8c00';

    /** @static */
    Color.darkorchid = '#9932cc';

    /** @static */
    Color.darkred = '#8b0000';

    /** @static */
    Color.darksalmon = '#e9967a';

    /** @static */
    Color.darkseagreen = '#8fbc8f';

    /** @static */
    Color.darkslateblue = '#483d8b';

    /** @static */
    Color.darkslategray = '#2f4f4f';

    /** @static */
    Color.darkturquoise = '#00ced1';

    /** @static */
    Color.darkviolet = '#9400d3';

    /** @static */
    Color.deeppink = '#ff1493';

    /** @static */
    Color.deepskyblue = '#00bfff';

    /** @static */
    Color.dimgray = '#696969';

    /** @static */
    Color.dodgerblue = '#1e90ff';

    /** @static */
    Color.firebrick = '#b22222';

    /** @static */
    Color.floralwhite = '#fffaf0';

    /** @static */
    Color.forestgreen = '#228b22';

    /** @static */
    Color.fuchsia = '#ff00ff';

    /** @static */
    Color.gainsboro = '#dcdcdc';

    /** @static */
    Color.ghostwhite = '#f8f8ff';

    /** @static */
    Color.gold = '#ffd700';

    /** @static */
    Color.goldenrod = '#daa520';

    /** @static */
    Color.gray = '#808080';

    /** @static */
    Color.green = '#008000';

    /** @static */
    Color.greenyellow = '#adff2f';

    /** @static */
    Color.honeydew = '#f0fff0';

    /** @static */
    Color.hotpink = '#ff69b4';

    /** @static */
    Color.indianred = '#cd5c5c';

    /** @static */
    Color.indigo = '#4b0082';

    /** @static */
    Color.ivory = '#fffff0';

    /** @static */
    Color.khaki = '#f0e68c';

    /** @static */
    Color.lavender = '#e6e6fa';

    /** @static */
    Color.lavenderblush = '#fff0f5';

    /** @static */
    Color.lawngreen = '#7cfc00';

    /** @static */
    Color.lemonchiffon = '#fffacd';

    /** @static */
    Color.lightblue = '#add8e6';

    /** @static */
    Color.lightcoral = '#f08080';

    /** @static */
    Color.lightcyan = '#e0ffff';

    /** @static */
    Color.lightgoldenrodyellow = '#fafad2';

    /** @static */
    Color.lightgray = '#d3d3d3';

    /** @static */
    Color.lightgreen = '#90ee90';

    /** @static */
    Color.lightpink = '#ffb6c1';

    /** @static */
    Color.lightsalmon = '#ffa07a';

    /** @static */
    Color.lightseagreen = '#20b2aa';

    /** @static */
    Color.lightskyblue = '#87cefa';

    /** @static */
    Color.lightslategray = '#778899';

    /** @static */
    Color.lightsteelblue = '#b0c4de';

    /** @static */
    Color.lightyellow = '#ffffe0';

    /** @static */
    Color.lime = '#00ff00';

    /** @static */
    Color.limegreen = '#32cd32';

    /** @static */
    Color.linen = '#faf0e6';

    /** @static */
    Color.magenta = '#ff00ff';

    /** @static */
    Color.maroon = '#800000';

    /** @static */
    Color.mediumaquamarine = '#66cdaa';

    /** @static */
    Color.mediumblue = '#0000cd';

    /** @static */
    Color.mediumorchid = '#ba55d3';

    /** @static */
    Color.mediumpurple = '#9370db';

    /** @static */
    Color.mediumseagreen = '#3cb371';

    /** @static */
    Color.mediumslateblue = '#7b68ee';

    /** @static */
    Color.mediumspringgreen = '#00fa9a';

    /** @static */
    Color.mediumturquoise = '#48d1cc';

    /** @static */
    Color.mediumvioletred = '#c71585';

    /** @static */
    Color.midnightblue = '#191970';

    /** @static */
    Color.mintcream = '#f5fffa';

    /** @static */
    Color.mistyrose = '#ffe4e1';

    /** @static */
    Color.moccasin = '#ffe4b5';

    /** @static */
    Color.navajowhite = '#ffdead';

    /** @static */
    Color.navy = '#000080';

    /** @static */
    Color.oldlace = '#fdf5e6';

    /** @static */
    Color.olive = '#808000';

    /** @static */
    Color.olivedrab = '#6b8e23';

    /** @static */
    Color.orange = '#ffa500';

    /** @static */
    Color.orangered = '#ff4500';

    /** @static */
    Color.orchid = '#da70d6';

    /** @static */
    Color.palegoldenrod = '#eee8aa';

    /** @static */
    Color.palegreen = '#98fb98';

    /** @static */
    Color.paleturquoise = '#afeeee';

    /** @static */
    Color.palevioletred = '#db7093';

    /** @static */
    Color.papayawhip = '#ffefd5';

    /** @static */
    Color.peachpuff = '#ffdab9';

    /** @static */
    Color.peru = '#cd853f';

    /** @static */
    Color.pink = '#ffc0cb';

    /** @static */
    Color.plum = '#dda0dd';

    /** @static */
    Color.powderblue = '#b0e0e6';

    /** @static */
    Color.purple = '#800080';

    /** @static */
    Color.rebeccapurple = '#663399';

    /** @static */
    Color.red = '#ff0000';

    /** @static */
    Color.rosybrown = '#bc8f8f';

    /** @static */
    Color.royalblue = '#4169e1';

    /** @static */
    Color.saddlebrown = '#8b4513';

    /** @static */
    Color.salmon = '#fa8072';

    /** @static */
    Color.sandybrown = '#f4a460';

    /** @static */
    Color.seagreen = '#2e8b57';

    /** @static */
    Color.seashell = '#fff5ee';

    /** @static */
    Color.sienna = '#a0522d';

    /** @static */
    Color.silver = '#c0c0c0';

    /** @static */
    Color.skyblue = '#87ceeb';

    /** @static */
    Color.slateblue = '#6a5acd';

    /** @static */
    Color.slategray = '#708090';

    /** @static */
    Color.snow = '#fffafa';

    /** @static */
    Color.springgreen = '#00ff7f';

    /** @static */
    Color.steelblue = '#4682b4';

    /** @static */
    Color.tan = '#d2b48c';

    /** @static */
    Color.teal = '#008080';

    /** @static */
    Color.thistle = '#d8bfd8';

    /** @static */
    Color.tomato = '#ff6347';

    /** @static */
    Color.turquoise = '#40e0d0';

    /** @static */
    Color.violet = '#ee82ee';

    /** @static */
    Color.wheat = '#f5deb3';

    /** @static */
    Color.white = '#ffffff';

    /** @static */
    Color.whitesmoke = '#f5f5f5';

    /** @static */
    Color.yellow = '#ffff00';

    /** @static */
    Color.yellowgreen = '#9acd32';

    return Color;
});
