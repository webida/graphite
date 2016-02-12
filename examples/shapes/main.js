document.getElementById('btnRun').addEventListener('click', function(oEvent) {
    require(['graphite/graphite'], function(graphite) {

        var GraphiteShell = graphite.view.system.GraphiteShell;
        var Color = graphite.base.Color;
        var Rectangle = graphite.view.geometry.Rectangle;
        var StackLayout = graphite.view.layout.StackLayout;
        var XYLayout = graphite.view.layout.XYLayout;
        var Div = graphite.view.widget.html.Div;
        var Circle = graphite.view.widget.svg.Circle;
        var Ellipse = graphite.view.widget.svg.Ellipse;
        var Rect = graphite.view.widget.svg.Rect;
        var Svg = graphite.view.widget.svg.Svg;

        var shell = new GraphiteShell('container');

        var svg = new Svg();
        shell.setContents(svg);

        var svg1 = new Svg();
        svg1.bounds(20, 20, 200, 200);
        svg.append(svg1);

        var r1 = new Rect();
        r1.border(10, 'moccasin').bgColor('salmon').bounds(10, 10, 100, 100);
        r1.on('mousedown', function (x) {
            console.log(x);
        });
        svg1.append(r1);

        setTimeout(function(){
            console.clear();
        });

        return;

        var r2 = new Rect();
        r2.bgColor('salmon');
        r2.bounds(10, 10, 100, 100);
        svg1.append(r2);

        setTimeout(function () {
            console.log('r1.bounds()', r1.bounds());
        }, 2000);

        return;

        var div = new Div();
        shell.setContents(div);

        /********************/

        var div1 = new Div();
        div1.css({
            float: 'left',
            padding: '10px',
            border: '10px solid lightyellow'
        }).size(100, 100).bgColor('salmon');
        div.append(div1);

        var div3 = new Div();
        div3.css({
            margin: '10px'
        }).bounds(10, 10, 20, 20).bgColor('moccasin');
        div1.append(div3);

        /********************/

        var div2 = new Div();
        div2.css({
            float: 'left',
            position: 'relative',
            padding: '10px'
        });
        div2.size(100, 100).bgColor('salmon');
        div.append(div2);

        var div4 = new Div();
        div4.css({
            position: 'absolute'
        });
        div4.bounds(10, 10, 20, 20).bgColor('moccasin');
        div2.append(div4);

        /********************/

        var svg = new Svg();
        svg.css({
            margin: '10px',
            padding: '10px'
        });
        svg.setLayout(new XYLayout());
        div.append(svg);

        var r1 = new Rect();
        r1.bgColor('burlywood').border(10, 'bisque');
        svg.append(r1, 0, 0, 100, 100);

        return;

        var r2 = new Rect();
        r2.bgColor('green');
        console.clear();
        r2.bounds(5, 5, 100, 100);
        svg.append(r2);

        var div2 = new Div();
        div2.bgColor('yellow');
        div2.size(20, 20);
        div1.append(div2);





        var e = new Ellipse();
        e.borderColor('green');
        e.bgColor('white');
        e.bounds(new Rectangle(200, 200, 150, 100));
        svg.append(e);

        setTimeout(function () {
            console.log(svg.bounds());
            //console.log('root --> ', root);
            //console.log('r1.getClientArea() --> ', r1.getClientArea());
        }, 2000);

        return;

        var svg = new Svg();
        svg.setLayout(new XYLayout());
        shell.setContents(svg);

        var r1 = new Rect();
        r1.bgColor('salmon');
        r1.borderColor(new Color(132, 45, 123));
        r1.borderWidth(10);
        svg.append(r1, new Rectangle(0, 0, 100, 100));

        var r2 = new Rect();
        r2.bgColor('salmon');
        r2.borderWidth(0);
        svg.append(r2, new Rectangle(100, 100, 100, 100));

        setTimeout(function () {
            console.log('root --> ', svg, r1.bounds().toString());
        }, 2000);

        return;

        var div1 = new Div();
        div1.bgColor('orange');
        div1.size(50, 50);
        div1.css({'float': 'left'});
        root.append(div1);

        var div2 = new Div();
        div2.bgColor('yellow');
        div2.css({
            'position': 'relative',
            'float': 'left',
            'margin': '10px'
        });
        //div2.size(100, 100);
        div2.bounds(50, 50, 100, 100);
        root.append(div2);

        setTimeout(function () {
            console.log('root --> ', root);
        }, 2000);

        return;

        var r3 = new Div();
        r3.setLayout(new XYLayout());
        shell.setContents(r3);

        var r4 = new Div();
        r4.setLayout(new XYLayout());
        r4.bgColor('salmon');
        r3.append(r4, new Rectangle(230, 230, 50, 50));

        var r5 = new Div();
        r5.bgColor('green');
        r4.append(r5, new Rectangle(5, 5, 10, 10));

        return;

        var svg = new Svg();
        svg.setLayout(new XYLayout());
        shell.setContents(svg);
        svg.setLayout(new XYLayout());
        r3.append(svg, new Rectangle(0, 0, 500, 500));

        var r1 = new Rect();
        r1.setLayout(new XYLayout());
        r1.bgColor('salmon');
        r1.borderColor('white');
        r1.borderWidth(5);
        svg.append(r1, new Rectangle(30, 30, 100, 100));

        var r2 = new Rect();
        r2.bgColor('orange');
        r2.borderColor('white');
        r2.borderWidth(5);
        svg.append(r2, new Rectangle(330, 330, 50, 50));

        setTimeout(function () {
            console.log(svg);
            //console.clear();
            r1.bgColor('seagreen');
            r1.bounds(100, 100, 200, 200);
            r2.bounds(320, 300, 70, 70);
            r2.borderWidth(20);
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
