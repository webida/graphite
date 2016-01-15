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

define([
    'graphite/base/Color',
    'graphite/view/geometry/Rectangle',
    'graphite/view/layout/XYLayout',
    'graphite/view/system/GraphiteShell',
    'graphite/view/widget/html/Div',
    'graphite/view/widget/svg/Circle',
    'graphite/view/widget/svg/Ellipse',
    'graphite/view/widget/svg/Rect',
    'graphite/view/widget/svg/Svg',
    'graphite/view/widget/Widget'
], function (
    Color,
    Rectangle,
    XYLayout,
    GraphiteShell,
    Div,
    Circle,
    Ellipse,
    Rect,
    Svg,
    Widget
) {
    'use strict';

    var graphite = {
        base: {
            Color: Color
        },
        view: {
            geometry: {
                Rectangle: Rectangle
            },
            layout: {
                XYLayout: XYLayout
            },
            system: {
                GraphiteShell: GraphiteShell
            },
            widget: {
                html: {
                    Div: Div
                },
                svg: {
                    Circle: Circle,
                    Ellipse: Ellipse,
                    Rect: Rect,
                    Svg: Svg
                },
                Widget: Widget
            }
        }
    };

    return graphite;
});
