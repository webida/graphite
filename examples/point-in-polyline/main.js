document.getElementById('btnRun').addEventListener('click', function(oEvent) {
    require(['graphite/graphite', 'external/dom/dom'], function(graphite, dom) {

        var GraphiteShell = graphite.view.system.GraphiteShell;
        var Geometry = graphite.view.geometry.Geometry;
        var Point = graphite.view.geometry.Point;
        var PointList = graphite.view.geometry.PointList;

        var shell = new GraphiteShell('container');
        var svg = shell.getUpdateManager().getGraphicContext().getSVG();
        svg.setAttribute('shape-rendering', 'auto');

        var points1 = [200,100, 200,200, 350,100, 400,200, 300,400];

        var pointList = new PointList(points1);

        var point = new Point(100, 100);
        
        var tolerance = 10;
        
        var containsPoint = Geometry.polylineContainsPoint(
                pointList, point, tolerance);

        var polyline = dom.makeSvgElement('polyline', {
            'points': points1.join(','),
            'stroke': '#000',
            'stroke-width': 1,
            'fill': 'none'
        });

        var text1 = dom.makeSvgElement('text', {
            'fill': '#000',
            'font-size': 9,
            'x': 50,
            'y': 50
        });
        text1.textContent = containsPoint;

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
        svg.appendChild(text1);

        (function() {
            var isDrag = false;
            var mask = document.getElementById('mask');
            function posInEl(oEvent) {
                return {
                    x: oEvent.offsetX || oEvent.layerX,
                    y: oEvent.offsetY || oEvent.layerY
                };
            };
            function rearrange(x, y) {
                var point = new Point(x, y);
                var containsPoint = Geometry.polylineContainsPoint(
                        pointList, point, tolerance);
                text1.textContent = containsPoint;
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
                var x = posInEl(ev).x;
                var y = posInEl(ev).y;
                layerXY.textContent = x + ', ' + y;
                if (isDrag) {
                    rearrange(x, y);
                }
            });
            mask.addEventListener('mouseup', function(ev) {
                isDrag = false;
            });
        })();
    });
});

