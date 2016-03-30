document.getElementById('btnRun').addEventListener('click', function(oEvent) {
    require(['graphite/graphite', 'external/dom/dom'], function(graphite, dom) {

        var GraphiteShell = graphite.view.system.GraphiteShell;
        var Geometry = graphite.view.geometry.Geometry;
        var Point = graphite.view.geometry.Point;
        var PointList = graphite.view.geometry.PointList;
        var Rect = graphite.view.widget.svg.Rect;
        var Svg = graphite.view.widget.svg.Svg;

        var shell = new GraphiteShell('container');

        var svg = new Svg();
        shell.contents(svg);
        svg.element().setAttribute('shape-rendering', 'auto');

        var pointList = new PointList([200,100, 200,200, 350,100, 400,200, 300,400]);
        console.log(pointList.points());
        pointList.transpose();
        console.log(pointList.points());

        var rect = new Rect();
        rect.bgColor('salmon').border(10, 'bisque').bounds(80, 80, 100, 100);
        svg.append(rect);

        var intersects = pointList.intersects(rect.bounds());

        var polyline = dom.makeSvgElement('polyline', {
            'points': pointList.points().join(','),
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
        text1.textContent = intersects;

        svg.element().appendChild(polyline);
        svg.element().appendChild(text1);

        setTimeout(function(){
            console.clear();
            rect.borderWidth(30);
        },2000);

        (function() {
            var start;
            var startBounds;
            var isDrag = false;
            var mask = document.getElementById('mask');
            function posInEl(oEvent) {
                return {
                    x: oEvent.offsetX || oEvent.layerX,
                    y: oEvent.offsetY || oEvent.layerY
                };
            };
            function rearrange(x, y) {
                var dx = x - start.x;
                var dy = y - start.y;
                rect.location(startBounds.x + dx, startBounds.y + dy);
                interset = pointList.intersects(rect.bounds());
                text1.textContent = interset;
                if (interset) {
                    polyline.setAttribute('stroke', 'red');
                } else {
                    polyline.setAttribute('stroke', 'black');
                }
            }
            mask.addEventListener('mousedown', function(ev) {
                start = posInEl(ev);
                startBounds = rect.bounds().copy();
                isDrag = true;
            });
            mask.addEventListener('mousemove', function(ev) {
                var pos = posInEl(ev);
                layerXY.textContent = pos.x + ', ' + pos.y;
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
});

