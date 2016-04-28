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
    'graphite/base/Base'
], function (
    genetic,
    Base
) {
    'use strict';

    /**
     * A FocusManager.
     * @constructor
     */
    function FocusManager() {
        Base.apply(this, arguments);
    }

    function focusable(widget) {
        var result = (widget !== null && widget.focusTraversable() && widget.isShowing());
        this.info('focusable -> ', widget, result);
        return result;
    }

    function getDeepestRightmostChild(widget) {
        var children = widget.getChildren();
        while (children.length !== 0) {
            widget = children[children.length - 1];
        }
        return widget;
    }

    genetic.inherits(FocusManager, Base, {

        /**
         * Current focused Widget
         * @type {Widget}
         */
        focused: null,

        /**
         * Returns the Widget that will receive focus
         * upon a 'tab' traverse event.
         * @param {Widget} root
         * @param {Widget} current
         */
        getNextFocusable: function (root, current) {
            this.desc('getNextFocusable', arguments);
            var found = false;
            var nextFocus = current;
            var siblingPos, parent, siblings;
            var untraversedSiblingFound, p, gp;
            var parentSiblingCount, parentIndex;
            if (!current) {
                if (root.getChildren().length) {
                    nextFocus = root.getChildren()[0];
                    if (focusable.call(this, nextFocus)) {
                        return nextFocus;
                    }
                } else {
                    return null;
                }
            }
            siblingPos = nextFocus.getParent().getChildren().indexOf(nextFocus);
            /* pre-order left to right tree traversal algorithm */
            while (!found) {
                parent = nextFocus.getParent();
                siblings = parent.getChildren();

                if (nextFocus.getChildren().length) {
                    nextFocus = nextFocus.getChildren()[0];
                    siblingPos = 0;
                    if (focusable.call(this, nextFocus)) {
                        found = true;
                    }
                } else if (siblingPos < siblings.length - 1) {
                    nextFocus = siblings[++siblingPos];
                    if (focusable.call(this, nextFocus)) {
                        found = true;
                    }
                } else {
                    untraversedSiblingFound = false;
                    while (!untraversedSiblingFound) {
                        p = nextFocus.getParent();
                        gp = p.getParent();
    
                        if (gp != null) {
                            parentSiblingCount = gp.getChildren().length;
                            parentIndex = gp.getChildren().indexOf(p);
                            if (parentIndex < parentSiblingCount - 1) {
                                nextFocus = p.getParent().getChildren()[parentIndex + 1];
                                siblingPos = parentIndex + 1;
                                untraversedSiblingFound = true;
                                if (focusable.call(this, nextFocus)) {
                                    found = true;
                                }
                            } else {
                                nextFocus = p;
                            }
                        } else {
                            nextFocus = null;
                            untraversedSiblingFound = true;
                            found = true;
                        }
                    }
                }

            }
            return nextFocus;
        },

        /**
         * Returns the Widget that will receive focus
         * upon a 'shift-tab' traverse event.
         * @param {Widget} root
         * @param {Widget} current
         */
        getPrevFocusable: function (root, current) {
            this.desc('getPrevFocusable', arguments);
            var parent, child, siblings, siblingPos;
            var found = false;
            var nextFocus = current;
            while (!found) {
                parent = nextFocus.getParent();
                //For root, traversal is complete.
                if (parent === null) {
                    return null;
                }
                siblings = parent.getChildren();
                siblingPos = siblings.indexOf(nextFocus);
                /* post-order right to left tree traversal algorithm */
                if (siblingPos !== 0) {
                    child = getDeepestRightmostChild(siblings[siblingPos - 1]);
                    if (focusable.call(this, child)) {
                        found = true;
                        nextFocus = child;
                    } else if (child === nextFocus) {
                        if (focusable.call(this, nextFocus)) {
                            found = true;
                        }
                    } else {
                        nextFocus = child;
                    }
                } else {
                    nextFocus = parent;
                    if (focusable.call(this, nextFocus)) {
                        found = true;
                    }
                }
            }
            return nextFocus;
        }
    });

    return FocusManager;
});
