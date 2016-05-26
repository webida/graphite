require(['graphite/graphite', 'external/dom/dom'], function(graphite, dom) {

    var GraphiteShell = graphite.view.system.GraphiteShell;
    var Geometry = graphite.view.geometry.Geometry;
    var PointList = graphite.view.geometry.PointList;
    var Rect = graphite.view.widget.svg.Rect;
    var Svg = graphite.view.widget.svg.Svg;

    var shell = new GraphiteShell('container');

    var svg = new Svg();
    shell.contents(svg);
    svg.element().setAttribute('shape-rendering', 'auto');

    var pointList = new PointList([200,100, 200,200, 350,100, 400,200, 300,400]);

    var r1 = new Rect();
    r1.bgColor('salmon').border(20, 'bisque').bounds(80, 80, 100, 100);
    svg.append(r1);

    var polyline = dom.makeSvgElement('polyline', {
        'points': pointList.points().join(','),
        'stroke': '#000',
        'stroke-width': 1,
        'fill': 'none'
    });
    svg.element().appendChild(polyline);

    (function() {
        var start;
        var startBounds;
        var isDrag = false;
        function rearrange(x, y) {
            var dx = x - start.x;
            var dy = y - start.y;
            r1.location(startBounds.x + dx, startBounds.y + dy);
            var interset = pointList.intersects(r1.bounds());
            if (interset) {
                polyline.setAttribute('stroke', 'red');
            } else {
                polyline.setAttribute('stroke', 'black');
            }
        }
        r1.on('mousedown', function(ev) {
            isDrag = true;
            startBounds = r1.bounds().copy();
            start = dom.getEventPos(ev.uiEvent);
        });
        r1.on('drag', function (ev) {
            svg.emit('drag', ev);
        });
        r1.on('mouseup', function(ev) {
            isDrag = false;
        });
        svg.on('drag', function(ev) {
            var pos;
            if (isDrag) {
                pos = dom.getEventPos(ev.uiEvent);
                rearrange(pos.x, pos.y);
            }
        });
    })();
});