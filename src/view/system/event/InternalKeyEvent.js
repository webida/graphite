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
 * @file InternalKeyEvent
 * @since 1.0.0
 * @author hw.shim@samsung.com
 */

define([
    'external/genetic/genetic',
    './InternalInputEvent'
], function (
    genetic,
    InternalInputEvent
) {
    'use strict';

    var letter = '';
    var keys = {
        3: 'Cancel',
        6: 'Help',
        8: 'Backspace',
        9: 'Tab',
        12: 'Clear',
        13: 'Enter',
        16: 'Shift',
        17: 'Control',
        18: 'Alt',
        19: 'Pause',
        20: 'CapsLock',
        27: 'Escape',
        28: 'Convert',
        29: 'NonConvert',
        30: 'Accept',
        31: 'ModeChange',
        32: ' ',
        33: 'PageUp',
        34: 'PageDown',
        35: 'End',
        36: 'Home',
        37: 'ArrowLeft',
        38: 'ArrowUp',
        39: 'ArrowRight',
        40: 'ArrowDown',
        41: 'Select',
        42: 'Print',
        43: 'Execute',
        44: 'PrintScreen',
        45: 'Insert',
        46: 'Delete',
        48: ['0', ')'],
        49: ['1', '!'],
        50: ['2', '@'],
        51: ['3', '#'],
        52: ['4', '$'],
        53: ['5', '%'],
        54: ['6', '^'],
        55: ['7', '&'],
        56: ['8', '*'],
        57: ['9', '('],
        91: 'OS',
        93: 'ContextMenu',
        144: 'NumLock',
        145: 'ScrollLock',
        181: 'VolumeMute',
        182: 'VolumeDown',
        183: 'VolumeUp',
        186: [';', ':'],
        187: ['=', '+'],
        188: [',', '<'],
        189: ['-', '_'],
        190: ['.', '>'],
        191: ['/', '?'],
        192: ['`', '~'],
        219: ['[', '{'],
        220: ['\\', '|'],
        221: [']', '}'],
        222: ["'", '"'],
        224: 'Meta',
        225: 'AltGraph',
        246: 'Attn',
        247: 'CrSel',
        248: 'ExSel',
        249: 'EraseEof',
        250: 'Play',
        251: 'ZoomOut'
    }; 
    // Function keys (F1-24).
    for (var i = 1; i < 25; i++) {
        keys[111 + i] = 'F' + i;
    }
    // Printable ASCII characters.
    for (i = 65; i < 91; i++) {
        letter = String.fromCharCode(i);
        keys[i] = [letter.toLowerCase(), letter.toUpperCase()];
    }
    // For Non-Standard key attribute values.
    var keyFix = {
        Esc: 'Escape',
        Nonconvert: 'NonConvert',
        Left: 'ArrowLeft',
        Up: 'ArrowUp',
        Right: 'ArrowRight',
        Down: 'ArrowDown',
        Del: 'Delete',
        Spacebar: ' ',
        Menu: 'ContextMenu',
        MediaNextTrack: 'MediaTrackNext',
        MediaPreviousTrack: 'MediaTrackPrevious',
        SelectMedia: 'MediaSelect',
        HalfWidth: 'Hankaku',
        FullWidth: 'Zenkaku',
        RomanCharacters: 'Romaji',
        Crsel: 'CrSel',
        Exsel: 'ExSel',
        Zoom: 'ZoomToggle'
    }; 

    var traverseKeys = [
        'Escape',
        'Enter',
        'Tab',
        'ArrowLeft',
        'ArrowUp',
        'ArrowRight',
        'ArrowDown',
        'PageUp',
        'PageDown',
        'End',
        'Home'
    ];

    /**
     * A InternalKeyEvent.
     * @constructor
     * @param {Widget} widget
     * @param {KeyboardEvent} e
     */
    function InternalKeyEvent(widget, e) {
        InternalInputEvent.apply(this, arguments);
        this.key = InternalKeyEvent.getKey(e);
    }

    genetic.inherits(InternalKeyEvent, InternalInputEvent, {
    });

    /**
     * Returns key Values with given UI Events KeyboardEvent.
     * @see https://www.w3.org/TR/DOM-Level-3-Events-key/
     * @return {string} 
     * @static
     */
    InternalKeyEvent.getKey = function (e) {
        var key;
        if (e.key) {
            if (keyFix.hasOwnProperty(e.key)) {
                key = keyFix[e.key];
            } else {
                key = e.key;
            }
        } else if (e.keyCode) {
            key = keys[e.keyCode];
            if (Array.isArray(key)) {
                key = key[+e.shiftKey];
            }
        }
        return key;
    };

    /**
     * Returns bitmask of modifier keys for the given KeyboardEvent.
     * @param {KeyboardEvent} e
     * @return {number} 
     * @static
     */
    InternalKeyEvent.getMask = function (e) {
        var mask = 0;
        if (e.altKey) mask |= InternalKeyEvent.ALT;
        if (e.ctrlKey) mask |= InternalKeyEvent.CTRL;
        if (e.shiftKey) mask |= InternalKeyEvent.SHIFT;
        return mask;
    };

    /**
     * Returns true if the given mask contains the given modifier key.
     * @param {number} mask
     * @param {string} key
     * @static
     */
    InternalKeyEvent.maskHasKey = function (mask, key) {
        var bit = InternalKeyEvent[key];
        return bit && (mask & bit) !== 0;
    };

    /**
     * Returns true if the given KeyboardEvent's key is traverse key.
     * such as tab, arrows, escape, enter, home, end, page-up, page-down.
     * @return {boolean} 
     * @static
     */
    InternalKeyEvent.isTraverseKey = function (e) {
        var key = this.getKey(e);
        return traverseKeys.indexOf(key) > -1;
    };

    InternalKeyEvent.ALT = 1 << 15;
    InternalKeyEvent.CTRL = 1 << 16;
    InternalKeyEvent.SHIFT = 1 << 17;

    return InternalKeyEvent;
});
