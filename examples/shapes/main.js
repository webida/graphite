document.getElementById('btnRun').addEventListener('click', function(oEvent) {
    require(['graphite/graphite'], function(graphite) {

        var GraphiteShell = graphite.view.system.GraphiteShell;
        var Rect = graphite.view.widget.svg.Rect;
        var Svg = graphite.view.widget.svg.Svg;
        var XYLayout = graphite.view.layout.XYLayout;
        var Rectangle = graphite.view.geometry.Rectangle;
        
        var shell = new GraphiteShell('container');
        var content = new Svg();
        content.setLayoutManager(new XYLayout());
        shell.setContents(content);

        var r1 = new Rect();
        r1.setLayoutManager(new XYLayout());
        r1.setBgColor('salmon');
        r1.setBorderColor('white');
        r1.setBorderWidth(5);
        content.addChild(r1, new Rectangle(30, 30, 100, 100));

        var r2 = new Rect();
        r2.setBgColor('orange');
        r2.setBorderColor('white');
        r2.setBorderWidth(5);
        content.addChild(r2, new Rectangle(230, 230, 50, 50));

        setTimeout(function () {
            console.log(content);
            //console.clear();
            r1.setBgColor('seagreen');
            r1.setBounds(100, 100, 200, 200);
            r2.setBounds(320, 300, 70, 70);
            r2.setBorderWidth(20);
        }, 1000);

        console.log('------ end of main ------');
    });
});
