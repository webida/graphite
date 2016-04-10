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

### Graphite Control

now working ...
