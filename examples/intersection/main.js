document.getElementById('btnRun').addEventListener('click', function(oEvent) {
    require(['graphite/graphite', 'external/dom/dom'], function(graphite, dom) {

        var GraphiteShell = graphite.view.system.GraphiteShell;
        var Geometry = graphite.view.geometry.Geometry;

        var shell = new GraphiteShell('container');
        var svg = shell.getUpdateManager().getGraphicContext().getSVG();
        svg.setAttribute('shape-rendering', 'auto');

        var points1 = [100, 100, 200, 300];
        var points2 = [300, 100, 50, 300];

        var node = Geometry.getLineIntersection(
                points1.concat(points2), true);
        var isIntersect = Geometry.isSegmentIntersect(
                points1.concat(points2));

        var line1 = dom.makeSvgElement('polyline', {
            'points': points1.join(','),
            'stroke': '#000',
            'stroke-width': 1
        });

        var line2 = dom.makeSvgElement('polyline', {
            'points': points2.join(','),
            'stroke': '#000',
            'stroke-width': 1
        });

        var text1 = dom.makeSvgElement('text', {
            'fill': '#000',
            'font-size': 9,
            'x': 50,
            'y': 50
        });
        text1.textContent = node + ', ' + isIntersect;

        var circle = dom.makeSvgElement('circle', {
            'cx': node.x,
            'cy': node.y,
            'r': 10,
            'fill': 'transparent',
            'stroke': '#000',
            'stroke-width': 1
        });

        svg.appendChild(line1);
        svg.appendChild(line2);
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
                points1 = [100, 100, x, y];
                var node = Geometry.getLineIntersection(
                        points1.concat(points2), true);
                var isIntersect = Geometry.isSegmentIntersect(
                        points1.concat(points2));
                text1.textContent = node + ', ' + isIntersect;
                line1.setAttribute('points', points1.join(','));
                if (!node) return;
                dom.setAttributes(circle, {
                    'cx': node.x,
                    'cy': node.y,
                });
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

