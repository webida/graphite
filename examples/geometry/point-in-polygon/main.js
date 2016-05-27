require(['graphite/graphite', 'external/dom/dom'], function(graphite, dom) {

    var GraphiteShell = graphite.view.system.GraphiteShell;
    var Geometry = graphite.view.geometry.Geometry;
    var Point = graphite.view.geometry.Point;
    var PointList = graphite.view.geometry.PointList;

    var shell = new GraphiteShell('container');
    var container = shell.container();
    var context = container.getGraphicContext();
    var svg = context.getLayer('SVG_LAYER').element();
    svg.setAttribute('shape-rendering', 'auto');

    var points1 = [200, 110, 140, 298, 290, 178, 110, 178, 260, 298];
    var pointList = new PointList(points1);
    var point = new Point(100, 100);
    
    var polygon = dom.makeSvgElement('polygon', {
        'points': points1.join(','),
        'stroke': '#000',
        'stroke-width': 1,
        'fill': 'none'
    });

    var circle = dom.makeSvgElement('circle', {
        'cx': point.x,
        'cy': point.y,
        'r': 5,
        'fill': 'transparent',
        'stroke': '#000',
        'stroke-width': 1
    });

    svg.appendChild(polygon);
    svg.appendChild(circle);

    (function() {
        var isDrag = false;
        var mask = context.getEventReceiver();
        function rearrange(x, y) {
            var point = new Point(x, y);
            var containsPoint = Geometry.polygonContainsPoint(pointList, point);
            dom.setAttributes(circle, {
                'cx': x, 'cy': y,
            });
            if (containsPoint) {
                polygon.setAttribute('stroke', 'red');
            } else {
                polygon.setAttribute('stroke', 'black');
            }
        }
        mask.addEventListener('mousedown', function(ev) {
            isDrag = true;
        });
        mask.addEventListener('mousemove', function(ev) {
            var pos = dom.getEventPos(ev);
            if (isDrag) {
                rearrange(pos.x, pos.y);
            }
        });
        mask.addEventListener('mouseup', function(ev) {
            isDrag = false;
        });
    })();
});
