document.getElementById('btnRun').addEventListener('click', function(oEvent) {
    require(['graphite/graphite'], function(graphite) {

        var GraphiteShell = graphite.view.system.GraphiteShell;
        var Connection = graphite.view.widget.connection.Connection;
        var CardinalAnchor = graphite.view.widget.connection.anchor.CardinalAnchor;
        var Color = graphite.base.Color;
        var Rectangle = graphite.view.geometry.Rectangle;
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
        svg.append(conn1);

        var conn2 = new Connection();
        conn2.sourceAnchor(new CardinalAnchor(r1, {pos: 'S'}));
        conn2.targetAnchor(new CardinalAnchor(r3, {pos: 'N'})); 
        svg.append(conn2);

        (function () {
            var start;
            var startBounds;
            var isDrag = false;
            var mask = document.getElementById('mask');
            function posInEl(oEvent) {
                return {
                    x: oEvent.offsetX || oEvent.layerX,
                    y: oEvent.offsetY || oEvent.layerY
                };
            }
            function rearrange(x, y) {
                var dx = x - start.x;
                var dy = y - start.y;
                target.location(startBounds.x + dx, startBounds.y + dy);
            }
            mask.addEventListener('mousedown', function (ev) {
                startBounds = target.bounds().copy();
                start = posInEl(ev);
                isDrag = true;
            });
            mask.addEventListener('mousemove', function (ev) {
                var p = posInEl(ev);
                layerXY.textContent = p.x+', '+p.y;
                if (isDrag) {
                    rearrange(p.x, p.y);
                }
            });
            mask.addEventListener('mouseup', function (ev) {
                isDrag = false;
            });
        })();
    });
});

