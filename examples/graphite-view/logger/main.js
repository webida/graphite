require(['graphite/graphite', 'external/dom/dom'], function(graphite, dom) {

    var Debugger = graphite.env.Debugger;
    var GraphiteShell = graphite.view.system.GraphiteShell;
    var Rect = graphite.view.widget.svg.Rect;
    var Svg = graphite.view.widget.svg.Svg;

    Debugger.log([
        graphite.view.system.event.EventTransmitter,
        graphite.view.updateManager,
        Rect
    ], Debugger.LOG_LEVEL.ALL);

    var shell = new GraphiteShell('container');

    var svg = new Svg();
    shell.contents(svg);

    svg.focusTraversable(true);
    svg.bounds(0, 0, 400, 400);

    var r1 = new Rect();
    r1.cursor('move')
        .border(10, 'salmon')
        .bgColor('moccasin')
        .bounds(100, 100, 100, 100);
    svg.append(r1);

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
