require(['graphite/graphite', 'external/dom/dom'], function(graphite, dom) {

    var Debugger = graphite.env.Debugger;
    var GraphiteShell = graphite.view.system.GraphiteShell;
    var Rect = graphite.view.widget.svg.Rect;
    var Svg = graphite.view.widget.svg.Svg;

    var shell = new GraphiteShell('container');

    var svg = new Svg();
    shell.contents(svg);

    svg.focusTraversable(true);
    svg.bounds(0, 0, 400, 400);

    var r1 = new Rect();
    r1.cursor('move')
        .border(10, 'salmon')
        .bgColor('moccasin')
        .bounds(100, 100, 100, 100)
        .textToolTip('This is a test tooltip.');
    svg.append(r1);

    var r2 = new Rect();
    r2.bgColor('skyblue')
        .bounds(300, 300, 100, 100)
        .textToolTip('This is another test tooltip.');
    svg.append(r2);

    (function () {
        var start;
        var startBounds;
        var isDrag = false;
        function rearrange(x, y) {
            var dx = x - start.x;
            var dy = y - start.y;
            r1.location(startBounds.x + dx, startBounds.y + dy);
        }
        r1.on('mousedown', function (ev) {
            isDrag = true;
            startBounds = r1.bounds().copy();
            start = dom.getEventPos(ev.uiEvent);
        });
        r1.on('drag', function (ev) {
            svg.emit('drag', ev);
        });
        r1.on('mouseup', function (ev) {
            isDrag = false;
        });
        svg.on('drag', function (ev) {
            var pos;
            if (isDrag) {
                pos = dom.getEventPos(ev.uiEvent);
                rearrange(pos.x, pos.y);
            }
        });
    })();
});
