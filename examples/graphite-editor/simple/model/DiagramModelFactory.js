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
    'graphite/graphite',
    './Diagram',
    './Shape'
], function (
    graphite,
    Diagram,
    Shape
) {
    'use strict';

    var ModelFactory = graphite.editor.model.ModelFactory;
    var genetic = graphite.util.genetic;

    /**
     * A DiagramModelFactory.
     * @constructor
     */
    function DiagramModelFactory(editor) {
        ModelFactory.apply(this, arguments);
    }

    function createModelByData(data) {
        var model, childModel;
        var type = data.type;
        var styles = data.style;
        var children = data.children;
        if (type) {
            switch (type) {
                case 'root':
                    model = new Diagram();
                    break;
                case 'shape':
                    model = new Shape();
                    break;
            }
            if (children) {
                children.forEach(function (child) {
                    childModel = createModelByData(child);
                    if (childModel) {
                        model.append(childModel);
                    }
                });
            }
        }
        if (styles) {
            model.style(styles);
        }
        return model;
    }

    genetic.inherits(DiagramModelFactory, ModelFactory, {

        /**
         * @param {Function} callback
         */
        create: function (callback) {
            this.desc('create', callback);
            var factory = this;
            var xhr = new XMLHttpRequest();
            xhr.open('GET', 'data/example.json');
            xhr.send(null);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.responseText) {
                        callback(createModelByData(
                                JSON.parse(xhr.responseText)));
                    }
                }
            };
        }
    });

    return DiagramModelFactory;
});
