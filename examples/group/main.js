document.getElementById('btnRun').addEventListener('click', function(oEvent) {
    require(['graphite/graphite'], function(graphite) {

        var GraphiteShell = graphite.view.system.GraphiteShell;
        var Color = graphite.base.Color;
        var Rectangle = graphite.view.geometry.Rectangle;
        var StackLayout = graphite.view.layout.StackLayout;
        var XYLayout = graphite.view.layout.XYLayout;
        var G = graphite.view.widget.svg.G;
        var Rect = graphite.view.widget.svg.Rect;
        var Svg = graphite.view.widget.svg.Svg;

        var shell = new GraphiteShell('container');

        var svg = new Svg();
        shell.contents(svg);

        svg.focusTraversable(true);
        svg.bounds(0, 0, 400, 400);

        var g = new G();
        g.cursor('move');
        g.location(100, 100);
        svg.append(g);

        var r1 = new Rect();
        r1.cursor('cell')
            .border(10, 'salmon')
            .bgColor('moccasin')
            .bounds(0, 0, 100, 100);
        g.append(r1);

        var r2 = new Rect();
        r2.cursor('cell')
            .border(10, 'salmon')
            .bgColor('moccasin')
            .bounds(100, 100, 100, 100);
        g.append(r2);

        setInterval(function () {
            var x = parseInt(Math.random()*100);
            var y = parseInt(Math.random()*100);
            g.location(x, y);
        }, 1000);

        console.log('------ end of main ------');
    });
});

(function () {
    var posInEl = function(oEvent) {
        return {
            x: oEvent.offsetX || oEvent.layerX,
            y: oEvent.offsetY || oEvent.layerY
        };
    }; 
    return;
    document.getElementById('mask').addEventListener('mousemove', function (ev) {
        layerXY.textContent = posInEl(ev).x+', '+posInEl(ev).y;
    });
})();
