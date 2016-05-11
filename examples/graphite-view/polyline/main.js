require(['graphite/graphite'], function(graphite) {

    var GraphiteShell = graphite.view.system.GraphiteShell;
    var Polyline = graphite.view.widget.svg.Polyline;
    var Svg = graphite.view.widget.svg.Svg;

    var shell = new GraphiteShell('container');
    var svg = new Svg();
    shell.contents(svg);

    var p1 = new Polyline();
    p1.cursor('move')
        .border(2, 'salmon')
        .points(100,100,140,140,100,180);
    svg.append(p1);

});