require(['graphite/graphite', 'external/dom/dom'], function(graphite, dom) {

    var GraphiteShell = graphite.view.system.GraphiteShell;
    var Connection = graphite.view.widget.connection.Connection;
    var CardinalAnchor = graphite.view.widget.connection.anchor.CardinalAnchor;
    var PolygonDecoration = graphite.view.widget.connection.decoration.PolygonDecoration;
    var PolylineDecoration = graphite.view.widget.connection.decoration.PolylineDecoration;
    var Rect = graphite.view.widget.svg.Rect;
    var Svg = graphite.view.widget.svg.Svg;

    var shell = new GraphiteShell('container');
    var svg = new Svg();
    shell.contents(svg);

    var target;

    var r1 = new Rect();
    r1.cursor('move')
        .border(10, 'salmon')
        .bgColor('moccasin')
        .bounds(100, 100, 100, 100);
    svg.append(r1);

    var r2 = new Rect();
    r2.cursor('move')
        .border(10, 'salmon')
        .bgColor('moccasin')
        .bounds(300, 100, 100, 100);
    svg.append(r2);

    var r3 = new Rect();
    r3.cursor('move')
        .border(10, 'salmon')
        .bgColor('moccasin')
        .bounds(100, 300, 100, 100);
    svg.append(r3);

    r1.on('mouseenter', function(ev){target = ev.target;});
    r2.on('mouseenter', function(ev){target = ev.target;});
    r3.on('mouseenter', function(ev){target = ev.target;});

    var conn1 = new Connection();
    conn1.sourceAnchor(new CardinalAnchor(r1, {pos: 'E'}));
    conn1.targetAnchor(new CardinalAnchor(r2, {pos: 'W'})); 
    conn1.targetDecoration(new PolygonDecoration());
    conn1.border(1, 'black').bgColor('black')
    svg.append(conn1);

    var conn2 = new Connection();
    conn2.sourceAnchor(new CardinalAnchor(r1, {pos: 'S'}));
    conn2.targetAnchor(new CardinalAnchor(r3, {pos: 'N'})); 
    conn2.targetDecoration(new PolylineDecoration());
    conn2.border(1, 'black');
    svg.append(conn2);

    (function () {
        var start;
        var startBounds;
        var isDrag = false;
        var context = shell.container().getGraphicContext();
        var mask = context.getEventReceiver();
        function rearrange(x, y) {
            var dx = x - start.x;
            var dy = y - start.y;
            target.location(startBounds.x + dx, startBounds.y + dy);
        }
        mask.addEventListener('mousedown', function (ev) {
            startBounds = target.bounds().copy();
            start = dom.getEventPos(ev);
            isDrag = true;
        });
        mask.addEventListener('mousemove', function (ev) {
            var pos = dom.getEventPos(ev);
            if (isDrag) {
                rearrange(pos.x, pos.y);
            }
        });
        mask.addEventListener('mouseup', function (ev) {
            isDrag = false;
        });
    })();
});
