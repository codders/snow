
var RaphaelFlakeView = Class.create({
  initialize: function(flake, context) {
    this.flake = flake;
    this.circle = context.circle(this.flake.getX(), this.flake.getY(), this.flake.getRadius()/2);
    this.circle.attr({stroke: "#fff", fill: "#fff"});
  },
  draw: function(context) {
    this.circle.attr({cx: this.flake.getX(), cy: this.flake.getY()});
  }
});

var RaphaelGroundView = Class.create({
  initialize: function(ground, dimensions, context) {
    this.ground = ground;
    this.dimensions = dimensions;
    this.context = context;
    this.context.line = context.path("M0 0");
    this.context.line.attr({stroke: "#fff", fill: "#fff"});
  },
  draw: function(context) {
    var groundLevels = this.ground.getLevels();
    var moveTo = "M0 " + this.dimensions.getHeight();
    // At the end, there needs to be lines down to the bottom right, back to the bottom left and up
    var lineToBottomRight = "L"+this.dimensions.getWidth()+" "+this.dimensions.getHeight();
    var lineToBottomLeft  = "L0 "+this.dimensions.getHeight();
    var lineToCompletion  = "L0"+groundLevels[0];
    var linesForSnow = ""; // Default string value
    for (var i=0; i < this.dimensions.getWidth(); i++) {
      linesForSnow += "L"+i+" "+groundLevels[i];
    }
    var polygonPath = moveTo + linesForSnow + lineToBottomRight + lineToBottomLeft + lineToCompletion;
    context.line.attr({path: polygonPath});
  }
});

var RaphaelRenderer = Class.create(AbstractRenderer, {
  initialize: function($super, element) {
    $super();
    this.dimensions = new Dimensions($(element).getWidth(), $(element).getHeight());

    // Creates canvas 320 × 200 at 10, 50
    this.context = Raphael(element, this.dimensions.getWidth(), this.dimensions.getHeight());
  },
  createFlakeView: function(flake) {
    return new RaphaelFlakeView(flake, this.context);
  },
  createGroundView: function(ground, dimensions) {
    return new RaphaelGroundView(ground, dimensions, this.context);
  },
  getRenderContext: function() {
    return this.context;
  },
  prepareRender: function(context) {
  }
});
