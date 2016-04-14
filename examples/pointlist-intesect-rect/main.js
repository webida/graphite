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

    var rect = new Rect();
    rect.bgColor('salmon').border(20, 'bisque').bounds(80, 80, 100, 100);
    svg.append(rect);

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
        var mask = shell.getContainer().mask;
        function rearrange(x, y) {
            var dx = x - start.x;
            var dy = y - start.y;
            rect.location(startBounds.x + dx, startBounds.y + dy);
            var interset = pointList.intersects(rect.bounds());
            if (interset) {
                polyline.setAttribute('stroke', 'red');
            } else {
                polyline.setAttribute('stroke', 'black');
            }
        }
        mask.addEventListener('mousedown', function(ev) {
            start = dom.getEventPos(ev);
            startBounds = rect.bounds().copy();
            isDrag = true;
        });
        mask.addEventListener('mousemove', function(ev) {
            var pos = dom.getEventPos(ev);
            if (isDrag) {
                rearrange(pos.x, pos.y);
            }
        });
        mask.addEventListener('mouseup', function(ev) {
            start = null;
            isDrag = false;
        });
    })();
});