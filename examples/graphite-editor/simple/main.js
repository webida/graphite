require([
    'graphite/graphite',
    './controller/DiagramController',
    './controller/ShapeController',
    './menu/ContextMenu',
    './model/Diagram',
    './model/DiagramModelFactory',
    './model/Shape'
], function(
    graphite,
    DiagramController,
    ShapeController,
    ContextMenu,
    Diagram,
    DiagramModelFactory,
    Shape
) {

    var Debugger = graphite.env.Debugger;
    var Domain = graphite.editor.system.Domain;
    var Tool = graphite.editor.tool.Tool;
    var GraphicEditor = graphite.editor.system.GraphicEditor;
    var GraphicViewer = graphite.editor.system.GraphicViewer;
    var GraphiteShell = graphite.view.system.GraphiteShell;

    Debugger.log([
    ], Debugger.LOG_LEVEL.ALL);

    var editor = new GraphicEditor();
    editor.create({
        'viewer': 'viewer',
        'palette': 'palette',
        'model-factory': DiagramModelFactory,
        'viewer-factory-rule': [
            [Diagram, DiagramController],
            [Shape, ShapeController]
        ],
        'context-menu': ContextMenu
    });
});
