document.getElementById('btnRun').addEventListener('click', function(oEvent) {
    require(['graphite/graphite'], function(graphite) {

        var GraphiteShell = graphite.view.system.GraphiteShell;
        var Div = graphite.view.widget.html.Div;
        var Color = graphite.base.Color;
        var Rect = graphite.view.widget.svg.Rect;
        var Circle = graphite.view.widget.svg.Circle;
        var Ellipse = graphite.view.widget.svg.Ellipse;
        var Svg = graphite.view.widget.svg.Svg;
        var XYLayout = graphite.view.layout.XYLayout;
        var Rectangle = graphite.view.geometry.Rectangle;
        
        var shell = new GraphiteShell('container');

        var svg = new Svg();
        svg.setLayoutManager(new XYLayout());
        shell.setContents(svg);

        var r1 = new Rect();
        r1.setBgColor('salmon');
        r1.setBorderColor(new Color(132, 45, 123));
        r1.setBorderWidth(10);
        svg.addChild(r1, new Rectangle(0, 0, 100, 100));

        setTimeout(function () {
            console.log('r1.getClientArea() --> ', r1.getClientArea());
        }, 2000);

        return;

        var r2 = new Rect();
        r2.setBgColor('salmon');
        svg.addChild(r2, new Rectangle(100, 100, 100, 100));

        var ellipse = new Ellipse();
        ellipse.setBorderColor(new Color(132, 45, 123));
        ellipse.setBorderWidth(10);
        ellipse.setBgColor(new Color(135, 206, 235));
        ellipse.setBounds(new Rectangle(200, 200, 150, 100));
        svg.addChild(ellipse);

        setTimeout(function () {
            console.log('root --> ', svg, r1.getBounds().toString());
        }, 2000);

        return;

        var svg = new Svg();
        svg.setLayoutManager(new XYLayout());
        shell.setContents(svg);

        var r1 = new Rect();
        r1.setBgColor('salmon');
        r1.setBorderColor(new Color(132, 45, 123));
        r1.setBorderWidth(10);
        svg.addChild(r1, new Rectangle(0, 0, 100, 100));

        var r2 = new Rect();
        r2.setBgColor('salmon');
        r2.setBorderWidth(0);
        svg.addChild(r2, new Rectangle(100, 100, 100, 100));

        setTimeout(function () {
            console.log('root --> ', svg, r1.getBounds().toString());
        }, 2000);

        return;

        var root = new Div();
        shell.setContents(root);

/*
        var div1 = new Div();
        div1.setBgColor('orange');
        div1.setSize(50, 50);
        root.addChild(div1);

        var div2 = new Div();
        div2.setBgColor('yellow');
        div2.setSize(20, 20);
        div1.addChild(div2);

        setTimeout(function () {
            console.log('root --> ', root);
        }, 2000);

        return;
*/

        var div1 = new Div();
        div1.setBgColor('orange');
        div1.setSize(50, 50);
        div1.setStyle({'float': 'left'});
        root.addChild(div1);

        var div2 = new Div();
        div2.setBgColor('yellow');
        div2.setStyle({
            'position': 'relative',
            'float': 'left',
            'margin': '10px'
        });
        //div2.setSize(100, 100);
        div2.setBounds(50, 50, 100, 100);
        root.addChild(div2);

        setTimeout(function () {
            console.log('root --> ', root);
        }, 2000);

        return;

        var r3 = new Div();
        r3.setLayoutManager(new XYLayout());
        shell.setContents(r3);

        var r4 = new Div();
        r4.setLayoutManager(new XYLayout());
        r4.setBgColor('salmon');
        r3.addChild(r4, new Rectangle(230, 230, 50, 50));

        var r5 = new Div();
        r5.setBgColor('green');
        r4.addChild(r5, new Rectangle(5, 5, 10, 10));

        return;

        var svg = new Svg();
        svg.setLayoutManager(new XYLayout());
        shell.setContents(svg);
        svg.setLayoutManager(new XYLayout());
        r3.addChild(svg, new Rectangle(0, 0, 500, 500));

        var r1 = new Rect();
        r1.setLayoutManager(new XYLayout());
        r1.setBgColor('salmon');
        r1.setBorderColor('white');
        r1.setBorderWidth(5);
        svg.addChild(r1, new Rectangle(30, 30, 100, 100));

        var r2 = new Rect();
        r2.setBgColor('orange');
        r2.setBorderColor('white');
        r2.setBorderWidth(5);
        svg.addChild(r2, new Rectangle(330, 330, 50, 50));

        setTimeout(function () {
            console.log(svg);
            //console.clear();
            r1.setBgColor('seagreen');
            r1.setBounds(100, 100, 200, 200);
            r2.setBounds(320, 300, 70, 70);
            r2.setBorderWidth(20);
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
    document.getElementById('mask').addEventListener('mousemove', function (ev) {
        layerXY.textContent = posInEl(ev).x+', '+posInEl(ev).y;
    });
})();
