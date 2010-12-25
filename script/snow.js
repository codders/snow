var SnowField = Class.create({
  initialize: function(container, options) {
    this.fallTime = 40000;
    this.dimensions = new Dimensions(options['width'], options['height']);
    if (options['renderer'] == null) {
      options['renderer'] = 'canvas';
    }
    switch(options['renderer']) {
      case 'canvas':
        this.renderer = new CanvasRenderer(this.dimensions, container);
        break;
      case 'svg':
        this.renderer = new RaphaelRenderer(this.dimensions, container);
        break;
      case 'css':
        this.renderer = new CSSRenderer(this.dimensions, container);
        break;
      default:
        alert("Unknown renderer: " + options['renderer']);
    }
    this.ground = new Ground(this.dimensions);
    this.renderer.addGroundModel(this.ground);
    this.flakes = $A([]);
  },
  getDimensions: function() {
    return this.dimensions;
  },
  getWidth: function() {
    return this.dimensions.getWidth();
  },
  getHeight: function() {
    return this.dimensions.getHeight();
  },
  addFlake: function() {
    var flake = new Flake(this);
    this.flakes.push(flake);
    return flake;
  },
  addFlakes: function(count) {
    for (var i=0; i < count; i++) {
      setTimeout(function() {
        this.renderer.addFlake(this.addFlake());
      }.bind(this), Math.floor(Math.random() * this.fallTime));
    }
    this.start();
  },
  start: function() {
    if (this.callback == null) {
      this.callback = setInterval(this.redrawSnow.bind(this), (this.fallTime / (this.getHeight() * 2)));
    }
  },
  stop: function() {
    if (this.callback != null) {
      clearTimeout(this.callback);
      this.callback = null;
    }
  },
  redrawSnow: function() {
    this.flakes.each(function(flake) {
      flake.update();
      if (this.ground.flakeLanded(flake)) {
        this.ground.updateGroundLevel(flake.getX());
        flake.reset();
      }
    }.bind(this));
    this.renderer.drawScreen();
  }
});
