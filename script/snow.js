var SnowField = Class.create({
  initialize: function(canvas) {
    this.fallTime = 40000;
    this.renderer = new RaphaelRenderer(canvas);
    this.dimensions = this.renderer.getDimensions();
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
