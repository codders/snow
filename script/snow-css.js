var CSSGroundView = Class.create({
  initialize: function(ground, dimensions, element) {
    this.dimensions = dimensions;
    this.levelElements = [];
    this.ground = ground;
    var levels = ground.getLevels();
    for (var i=0; i<dimensions.getWidth(); i++) {
      var line = new Element('div');
      element.appendChild(line);
      line.setStyle({ 'top': (levels[i] + "px"),
                       left: (i + "px"),
                      width: "1px",
                     height: ((dimensions.getHeight() - levels[i]) + "px"),
                    position: 'absolute',
                    backgroundColor: '#fff' });
      this.levelElements[i] = line;
    }
  },
  draw: function(context) {
    var levels = this.ground.getLevels();
    for (var i=0; i<this.dimensions.getWidth(); i++) {
      this.levelElements[i].setStyle({ 'top': (levels[i] + "px"),
                                      height: ((this.dimensions.getHeight() - levels[i]) + "px") });
    }
  }
});

var CSSFlakeView = Class.create({
  initialize: function(flake, parentElement) {
    this.flake = flake;
    this.element = new Element('div');
    parentElement.appendChild(this.element);
    this.element.setStyle({ position: 'absolute',
                               'top': (flake.getY() + "px"),
                                left: (flake.getX() + "px"),
                               width: (flake.getRadius() + "px"),
                              height: (flake.getRadius() + "px"),
                     backgroundColor: '#fff',
                        borderRadius: (flake.getRadius() + "px") });
    this.element.style.setProperty('-moz-border-radius', (flake.getRadius() + "px"), "");
  },
  draw: function(context) {
    this.element.setStyle({ 'top': this.flake.getY(), left: this.flake.getX() });
  }
});

var CSSRenderer = Class.create(AbstractRenderer, {
  initialize: function($super, element) {
    $super();
    this.element = $(element);
    this.dimensions = new Dimensions(this.element.getWidth(), this.element.getHeight());
  },
  createFlakeView: function(flake) {
    return new CSSFlakeView(flake, this.element);
  },
  createGroundView: function(ground, dimensions) {
    return new CSSGroundView(ground, dimensions, this.element);
  },
  getRenderContext: function() {
    return null;
  },
  prepareRender: function(context) {
  }
});
