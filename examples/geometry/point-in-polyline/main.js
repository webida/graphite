/* Test example for Geometry.polylineContainsPoint() */
require(['graphite/graphite', 'external/dom/dom'], function(graphite, dom) {

    var GraphiteShell = graphite.view.system.GraphiteShell;
    var Geometry = graphite.view.geometry.Geometry;
    var Point = graphite.view.geometry.Point;
    var PointList = graphite.view.geometry.PointList;

    var shell = new GraphiteShell('container');
    var container = shell.getContainer();
    var context = container.getGraphicContext();
    var svg = context.getLayer('SVG_LAYER').element();
    svg.setAttribute('shape-rendering', 'auto');

    var points1 = [200,100, 200,200, 350,100, 400,200, 300,400];
    var pointList = new PointList(points1);
    var point = new Point(100, 100);
    var tolerance = 10;
    
    var polyline = dom.makeSvgElement('polyline', {
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

    svg.appendChild(polyline);
    svg.appendChild(circle);

    (function() {
        var isDrag = false;
        var mask = context.getEventReceiver();
        function rearrange(x, y) {
            var point = new Point(x, y);
            var containsPoint = Geometry.polylineContainsPoint(
                    pointList, point, tolerance);
            dom.setAttributes(circle, {
                'cx': x,
                'cy': y,
            });
            if (containsPoint) {
                polyline.setAttribute('stroke', 'red');
            } else {
                polyline.setAttribute('stroke', 'black');
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