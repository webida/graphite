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
 * @file Dom utility
 * @author: hw.shim@samsung.com
 */

/* jshint unused:false */

define(function () {
    'use strict';

    function int(prop) {
        return parseInt(prop);
    };

    return {

        byId: function (id) {
            return document.getElementById(id);
        },

        byTag: function (tagName) {
            return document.getElementsByTagName(tagName);
        },

        bySelector: function (selector, element) {
            element = element || document;
            return element.querySelectorAll(selector);
        },

        appliedCss: function (element) {
            var prop, result = {};
            for (prop in element.style) {
                if (element.style.hasOwnProperty(prop)) {
                    result[prop] = element.style[prop];
                }
            }
            return result;
        },

        computedCss: function (element) {
            var styles = window.getComputedStyle(element);
            var len = styles.length, i, prop, result = {};
            for (i = 0; i < len; i++) {
                prop = styles[i];
                result[prop] = styles.getPropertyValue(prop);
            }
            return result;
        },

        computedCssDiff: function (styleOrg, styleVar) {
            var prop, result = {};
            for (prop in styleOrg) {
                if (styleOrg[prop] !== styleVar[prop]) {
                    result[prop] = styleVar[prop];
                }
            }
            return result;
        },

        checkComputedCssDiff: function (styleOrg, styleVar) {
            var i, check = false;
            var result = this.computedCssDiff(styleOrg, styleVar);
            for (i in result) {
                if (result.hasOwnProperty(i)) {
                    check = true;
                }
            }
            return check;
        },

        getStyle: function (element, prop) {
            var styles = window.getComputedStyle(element);
            return styles.getPropertyValue(prop);
        },

        setStyles: function (element, propSet) {
            var prop, style = element.style;
            for (prop in propSet) {
                if (propSet.hasOwnProperty(prop)) {
                    style.setProperty(prop, propSet[prop]);
                }
            }
        },

        setAttributes: function (element, propSet) {
            var prop;
            for (prop in propSet) {
                if (propSet.hasOwnProperty(prop)) {
                    element.setAttribute(prop, propSet[prop]);
                }
            }
        },

        makeElementNs: function (tag, namespace, properties) {
            var element = document.createElementNS(namespace, tag);
            if (properties) {
                for (var p in properties) {
                    if (properties.hasOwnProperty(p)) {
                        element.setAttribute(p, properties[p]);
                    }
                }
            }
            return element;
        },

        makeSvgElement: function (tag, properties) {
            return this.makeElementNs(tag, 'http://www.w3.org/2000/svg', properties);
        },

        makeElement: function (tag, properties, where, win) {
            if (typeof win === 'undefined') {
                win = window;
            }
            var element = win.document.createElement(tag);
            if (properties) {
                for (var p in properties) {
                    if (properties.hasOwnProperty(p)) {
                        element.setAttribute(p, properties[p]);
                    }
                }
            }
            if (where) {
                this.addElement(element, where.element, where.position);
            }
            return element;
        },

        addElement: function (element, node, pos) {
            if (!pos || pos === 'after') {
                node.parentNode.insertBefore(element, node.nextSibling);
            } else if (pos == 'before') {
                node.parentNode.insertBefore(element, node);
            } else if (pos == 'inside') {
                node.appendChild(element);
            }
        },

        addEvent: function (element, eventName, handler, useCapture) {
            if (element.addEventListener) {
                if (typeof useCapture === 'undefined') {
                    useCapture = false;
                }
                element.addEventListener(eventName, handler, useCapture);
            } else {
                element.attachEvent('on' + eventName, handler);
            }
            return handler;
        },

        removeEvent: function (element, eventName, handler) {
            if (element.removeEventListener) {
                element.removeEventListener(eventName, handler, false);
            } else {
                element.detachEvent('on' + eventName, handler);
            }
        },

        getRect: function (e, isInt) {
            if (isInt === true) {
                return {
                    left: parseInt(this.getStyle(e, 'left')),
                    top: parseInt(this.getStyle(e, 'top')),
                    width: parseInt(this.getStyle(e, 'width')),
                    height: parseInt(this.getStyle(e, 'height'))
                };
            } else {
                return {
                    left: parseFloat(this.getStyle(e, 'left')),
                    top: parseFloat(this.getStyle(e, 'top')),
                    width: parseFloat(this.getStyle(e, 'width')),
                    height: parseFloat(this.getStyle(e, 'height'))
                };
            }
        },

        getWindow: function (elem) {
            var doc;
            if (elem.nodeType === 9) {
                doc = elem;
            } else {
                doc = elem.ownerDocument;
            }
            return doc.defaultView || doc.parentWindow;
        },

        /**
         * Gets element's offset from it's document. 
         * @param {HTMLElement} elem
         */
        getOffset: function (elem) {
            var doc, win, docElem, rect;
            if (!elem.getClientRects().length) {
                return {
                    'top': 0,
                    'left': 0
                };
            }
            rect = elem.getBoundingClientRect();
            if (rect.width || rect.height) {
                doc = elem.ownerDocument;
                win = this.getWindow(elem);
                docElem = doc.documentElement;
                return {
                    'top': rect.top + win.pageYOffset - docElem.clientTop,
                    'left': rect.left + win.pageXOffset - docElem.clientLeft
                };
            }
            return rect;
        },

        /**
         * Gets element's offset from it's parent. 
         * @param {HTMLElement} elem
         */
        getLocalOffset: function (elem) {
            var parentOffset = {
                'top': 0,
                'left': 0
            };
            var offset = this.getOffset(elem);
            if (elem.parentNode) {
                parentOffset = this.getOffset(elem.parentNode);
            }
            return {
                'top': offset.top - parentOffset.top,
                'left': offset.left - parentOffset.left
            };
        },

        /**
         * Returns event's offset position. 
         * @param {Event} event
         * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Event|Event}
         */
        getEventPos: function (event) {
            return {
                'x': event.offsetX || event.layerX,
                'y': event.offsetY || event.layerY
            };
        }
    };
});
