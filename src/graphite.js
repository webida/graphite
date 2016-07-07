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
    'external/genetic/genetic',
    'graphite/base/Base',
    'graphite/base/Color',
    'graphite/editor/ability/Ability',
    'graphite/editor/ability/ConstrainedLayoutable',
    'graphite/editor/ability/Containable',
    'graphite/editor/ability/HandleSelectable',
    'graphite/editor/ability/Layoutable',
    'graphite/editor/ability/Nestable',
    'graphite/editor/ability/Movable',
    'graphite/editor/ability/Resizable',
    'graphite/editor/ability/Selectable',
    'graphite/editor/ability/Undetachable',
    'graphite/editor/ability/XYLayoutable',
    'graphite/editor/command/Command',
    'graphite/editor/controller/Controller',
    'graphite/editor/controller/ControllerFactory',
    'graphite/editor/controller/ControllerRuleFactory',
    'graphite/editor/handle/Handle',
    'graphite/editor/handle/MoveHandle',
    'graphite/editor/model/BaseModel',
    'graphite/editor/model/ModelFactory',
    'graphite/editor/system/Domain',
    'graphite/editor/system/GraphicEditor',
    'graphite/editor/system/GraphicViewer',
    'graphite/editor/system/event/GraphicKeyHandler',
    'graphite/editor/system/event/KeyHandler',
    'graphite/editor/tool/Tool',
    'graphite/env/Debugger',
    'graphite/view/geometry/Geometry',
    'graphite/view/geometry/Point',
    'graphite/view/geometry/PointList',
    'graphite/view/geometry/Rectangle',
    'graphite/view/layout/StackLayout',
    'graphite/view/layout/XYLayout',
    'graphite/view/system/context/DefaultGraphicContextFactory',
    'graphite/view/system/context/GraphicContext',
    'graphite/view/system/event/EventTransmitter',
    'graphite/view/system/GraphiteShell',
    'graphite/view/update-manager/AsyncUpdateManager',
    'graphite/view/update-manager/UpdateManager',
    'graphite/view/widget/connection/anchor/CardinalAnchor',
    'graphite/view/widget/connection/anchor/EdgeAnchor',
    'graphite/view/widget/connection/Connection',
    'graphite/view/widget/connection/decoration/PolygonDecoration',
    'graphite/view/widget/connection/decoration/PolylineDecoration',
    'graphite/view/widget/html/Div',
    'graphite/view/widget/svg/Circle',
    'graphite/view/widget/svg/Ellipse',
    'graphite/view/widget/svg/G',
    'graphite/view/widget/svg/Polygon',
    'graphite/view/widget/svg/PolygonShape',
    'graphite/view/widget/svg/Polyline',
    'graphite/view/widget/svg/Rect',
    'graphite/view/widget/svg/Svg',
    'graphite/view/widget/Widget'
], function (
    genetic,
    Base,
    Color,
    Ability,
    ConstrainedLayoutable,
    Containable,
    HandleSelectable,
    Layoutable,
    Nestable,
    Movable,
    Resizable,
    Selectable,
    Undetachable,
    XYLayoutable,
    Command,
    Controller,
    ControllerFactory,
    ControllerRuleFactory,
    Handle,
    MoveHandle,
    BaseModel,
    ModelFactory,
    Domain,
    GraphicEditor,
    GraphicViewer,
    GraphicKeyHandler,
    KeyHandler,
    Tool,
    Debugger,
    Geometry,
    Point,
    PointList,
    Rectangle,
    StackLayout,
    XYLayout,
    DefaultGraphicContextFactory,
    GraphicContext,
    EventTransmitter,
    GraphiteShell,
    AsyncUpdateManager,
    UpdateManager,
    CardinalAnchor,
    EdgeAnchor,
    Connection,
    PolygonDecoration,
    PolylineDecoration,
    Div,
    Circle,
    Ellipse,
    G,
    Polygon,
    PolygonShape,
    Polyline,
    Rect,
    Svg,
    Widget
) {
    'use strict';

    var graphite = {
        base: {
            Base: Base,
            Color: Color
        },
        editor: {
            ability: {
                Ability: Ability,
                ConstrainedLayoutable: ConstrainedLayoutable,
                Containable: Containable,
                HandleSelectable: HandleSelectable,
                Layoutable: Layoutable,
                Nestable: Nestable,
                Movable: Movable,
                Resizable: Resizable,
                Selectable: Selectable,
                Undetachable: Undetachable,
                XYLayoutable: XYLayoutable
            },
            command: {
                Command: Command
            },
            controller: {
                Controller: Controller,
                ControllerFactory: ControllerFactory
            },
            handle: {
                Handle: Handle,
                MoveHandle: MoveHandle
            },
            model: {
                BaseModel: BaseModel,
                ModelFactory: ModelFactory
            },
            system: {
                Domain: Domain,
                GraphicEditor: GraphicEditor,
                GraphicViewer: GraphicViewer,
                event: {
                    GraphicKeyHandler: GraphicKeyHandler,
                    KeyHandler: KeyHandler
                }
            },
            tool: {
                Tool: Tool
            }
        },
        env: {
            Debugger: Debugger
        },
        util: {
            genetic: genetic
        },
        view: {
            geometry: {
                Geometry: Geometry,
                Point: Point,
                PointList: PointList,
                Rectangle: Rectangle
            },
            layout: {
                StackLayout: StackLayout,
                XYLayout: XYLayout
            },
            system: {
                context : {
                    DefaultGraphicContextFactory: DefaultGraphicContextFactory,
                    GraphicContext: GraphicContext
                },
                event: {
                    EventTransmitter: EventTransmitter
                },
                GraphiteShell: GraphiteShell
            },
            updateManager: {
                AsyncUpdateManager: AsyncUpdateManager,
                UpdateManager: UpdateManager
            },
            widget: {
                connection: {
                    anchor: {
                        CardinalAnchor: CardinalAnchor,
                        EdgeAnchor: EdgeAnchor
                    },
                    decoration : {
                        PolygonDecoration: PolygonDecoration,
                        PolylineDecoration: PolylineDecoration
                    },
                    Connection: Connection
                },
                html: {
                    Div: Div
                },
                svg: {
                    Circle: Circle,
                    Ellipse: Ellipse,
                    G: G,
                    Polygon: Polygon,
                    PolygonShape: PolygonShape,
                    Polyline: Polyline,
                    Rect: Rect,
                    Svg: Svg
                },
                Widget: Widget
            }
        }
    };

    return graphite;
});
