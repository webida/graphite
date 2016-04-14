require(['graphite/graphite'], function(graphite) {

    var GraphiteShell = graphite.view.system.GraphiteShell;
    var PolygonShape = graphite.view.widget.svg.PolygonShape;
    var Svg = graphite.view.widget.svg.Svg;

    var shell = new GraphiteShell('container');
    var svg = new Svg();
    shell.contents(svg);

    var p1 = new PolygonShape();
    p1.cursor('move')
        .border(2, 'salmon')
        .bgColor('bisque')
        .points(100,100,140,140,100,180)
        .bounds(100,100,200,200)
    svg.append(p1);

    setInterval(function(){
        var x = parseInt(Math.random()*100);
        var y = parseInt(Math.random()*100);
        p1.location(x, y);
    }, 1000);

});
