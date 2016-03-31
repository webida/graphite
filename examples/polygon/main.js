document.getElementById('btnRun').addEventListener('click', function(oEvent) {
    require(['graphite/graphite'], function(graphite) {

        var GraphiteShell = graphite.view.system.GraphiteShell;
        var Color = graphite.base.Color;
        var PointList = graphite.view.geometry.PointList;
        var Rectangle = graphite.view.geometry.Rectangle;
        var Polygon = graphite.view.widget.svg.Polygon;
        var Svg = graphite.view.widget.svg.Svg;

        var shell = new GraphiteShell('container');
        var svg = new Svg();
        shell.contents(svg);

        var p1 = new Polygon();
        p1.cursor('move')
            .border(2, 'salmon')
            .bgColor('bisque')
            .points(100,100,140,140,100,180);
        svg.append(p1);

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
    document.getElementById('mask').addEventListener('mousemove', function (ev) {
        layerXY.textContent = posInEl(ev).x+', '+posInEl(ev).y;
    });
})();
