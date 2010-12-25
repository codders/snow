var CanvasFlakeView = Class.create({
  initialize: function(flake) {
    this.flake = flake;
  },
  draw: function(context) {
    context.fillStyle = 'rgb(255,255,255)';
    context.fillCircle(this.flake.getX(), this.flake.getY(), this.flake.getRadius());
  }
});

var CanvasGroundView = Class.create({
  initialize: function(ground, dimensions) {
    this.ground = ground;
    this.dimensions = dimensions;
  },
  draw: function(context) {
    var groundLevels = this.ground.getLevels();
    context.fillStyle = 'rgb(255,255,255)';
    context.beginPath();
    context.moveTo(0, parseInt(this.dimensions.getHeight()));
    for (var i=0; i < this.dimensions.getWidth(); i++) {
      context.lineTo(i, groundLevels[i]);
    }
    context.lineTo(this.dimensions.getWidth(), this.dimensions.getHeight());
    context.closePath();
    context.fill();
  }
});

var CanvasRenderer = Class.create(AbstractRenderer, {
  initialize: function($super, element) {
    $super();
    this.canvasElement = $(element);
    this.dimensions = new Dimensions(this.canvasElement.width, this.canvasElement.height);
  },
  createFlakeView: function(flake) {
    return new CanvasFlakeView(flake);
  },
  createGroundView: function(ground, dimensions) {
    return new CanvasGroundView(ground, dimensions);
  },
  getRenderContext: function() {
    return this.canvasElement.getContext('2d');
  },
  prepareRender: function(context) {
    context.fillStyle = 'rgb(0,0,0)';
    context.fillRect(0, 0, this.dimensions.getWidth(), this.dimensions.getHeight());
  }
});
