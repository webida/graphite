# graphite
The Graphical Editing Framework for HTML and SVG.
Graphite consists of Graphite View & Graphite Control.

### Graphite View

#### Including graphite

```js
require(['path/to/graphite'], function(graphite){
  var GraphiteShell = graphite.view.system.GraphiteShell;
  var Div = graphite.view.widget.html.Div;
  
  var shell = new GraphiteShell('container');
  var div = new Div();
  shell.contents(div);
});
```

#### Making div

```js
require(['path/to/graphite'], function(graphite){
  var GraphiteShell = graphite.view.system.GraphiteShell;
  var Div = graphite.view.widget.html.Div;
  
  var shell = new GraphiteShell('container');
  var root = new Div();
  shell.contents(root);
  
  var div1 = new Div();
  div1.cursor('help').css({'margin': '20px'}).bounds(30, 30, 100, 100).bgColor('skyblue');
  root.append(div1);
});
```
![image](https://cloud.githubusercontent.com/assets/7447396/14417231/a9382998-ffed-11e5-89cf-6a23f83e8075.png)

#### Making svg rect

```js
require(['path/to/graphite'], function(graphite){
  var GraphiteShell = graphite.view.system.GraphiteShell;
  var Svg = graphite.view.widget.svg.Svg;
  var Rect = graphite.view.widget.svg.Rect;
  
  var shell = new GraphiteShell('container');
  var svg = new Svg();
  shell.contents(svg);
  
  var rect1 = new Rect();
  rect1.cursor('move')
      .border(10, 'salmon')
      .bgColor('moccasin')
      .bounds(100, 100, 100, 100);
  svg.append(rect1);
});
```
![image](https://cloud.githubusercontent.com/assets/7447396/14417238/cbbd5f2e-ffed-11e5-93af-87f3c285fd65.png)

#### Making connection

```js
require(['path/to/graphite'], function(graphite) {
    var GraphiteShell = graphite.view.system.GraphiteShell;
    var Connection = graphite.view.widget.connection.Connection;
    var CardinalAnchor = graphite.view.widget.connection.anchor.CardinalAnchor;
    var Rect = graphite.view.widget.svg.Rect;
    var Circle = graphite.view.widget.svg.Circle;
    var Svg = graphite.view.widget.svg.Svg;

    var shell = new GraphiteShell('container');
    var svg = new Svg();
    shell.contents(svg);

    var r1 = new Rect();
    r1.cursor('move').border(1, 'salmon').bgColor('moccasin').bounds(100, 100, 100, 100);
    svg.append(r1);

    var r2 = new Rect();
    r2.cursor('move').border(1, 'salmon').bgColor('moccasin').bounds(300, 100, 100, 100);
    svg.append(r2);

    var r3 = new Circle();
    r3.cursor('move').border(1, 'salmon').bgColor('moccasin').bounds(100, 300, 100, 100);
    svg.append(r3);

    var conn1 = new Connection();
    conn1.sourceAnchor(new CardinalAnchor(r1, {pos: 'E'}));
    conn1.targetAnchor(new CardinalAnchor(r2, {pos: 'W'}));
    svg.append(conn1);

    var conn2 = new Connection();
    conn2.sourceAnchor(new CardinalAnchor(r1, {pos: 'S'}));
    conn2.targetAnchor(new CardinalAnchor(r3, {pos: 'N'}));
    svg.append(conn2);
});
```
![image](https://cloud.githubusercontent.com/assets/7447396/14417472/ed450f68-fff0-11e5-999e-2a228e642a2c.png)

### Developing Environment

#### Using Logger

If your constructor inherits from graphite.base.Base constructor, you can use following methods.
```js
this.desc('methodName', arguments);
this.log('some log');
this.info('some info');
this.warn('some warn');
this.error('some error');
//this.trace(); //will be supported soon :)
```
And then, if you want show them in the developer console window, use like this.
```js
Debugger.log([
    //Modules you want check
    graphite.view.system.GraphiteShell,
    graphite.view.updateManager,
    Rect
], Debugger.LOG_LEVEL.ALL);
```
Debugger.LOG_LEVEL
```js
Debugger.LOG_LEVEL = {
  OFF: 0,
  LOG: 1,
  INFO: 2,
  WARN: 4,
  ERROR: 8,
  TRACE: 16,
  ALL: 31
}
```

#### Setting up Logger level

Load your app url with #loglevel=number.
You can use bit mask number using Debugger.LOG_LEVEL. To show LOG|INFO use 3.
```
http://localhost/examples/intersection/main.html#loglevel=31
```
![image](https://cloud.githubusercontent.com/assets/7447396/14845998/74fdb164-0c9c-11e6-928a-8310b926ef33.png)

#### Setting up debug mode

Just load your app url with #mode=debug
```
http://localhost/examples/intersection/main.html#mode=debug
```
![image](https://cloud.githubusercontent.com/assets/7447396/14526491/870f1f1e-027e-11e6-8116-bdcb8262d36e.png)


### Graphite Control

This module is for WYSIWYG edit for graphical model. now working ...

