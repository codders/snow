Object.extend(CanvasRenderingContext2D.prototype, {
  fillCircle:function(aX, aY, aDiameter){
      this.beginPath();
      this.arc(aX, aY, aDiameter / 2, 0, Math.PI * 2, false);
      this.closePath();
      this.fill();
  }
});

var SinusoidalOscillator = Class.create({
  initialize: function() {
    this.position = 360;
    this.direction = (Math.round(Math.random()) == 0);
  },
  next: function() {
    if (this.direction) {
      this.position = (this.position + 8) % 720;
    } else {
      this.position = (this.position - 8) % 720;
    }
  },
  getPercent: function() {
    return (Math.sin(Math.PI * (this.position / 360)) / 2) + 0.5;
  }
});

var SawtoothOscillator = Class.create({
  initialize: function() {
    this.position = 50;
    this.direction = (Math.round(Math.random()) == 0);
  },
  next: function() {
    if (this.direction) {
      this.position += 1;
    } else {
      this.position -= 1;
    }
    if (this.position == 0 || this.position == 100) {
      this.direction = !this.direction;
    }
  },
  getPercent: function() {
    return (this.position / 100);
  }
});

var DriftManager = Class.create({
  initialize: function(startX, dimensions) {
    this.x = startX;
    this.maxWidth = dimensions.getWidth() / 3;
    this.minWidth = 10;
    this.width = Math.floor(Math.random() * (this.maxWidth - this.minWidth)) + this.minWidth;
    this.oscillator = new SinusoidalOscillator();
    this.direction = Math.round(Math.random()) == 0;
  },
  getX: function() {
    return this.x - (this.width / 2) + (this.width * this.oscillator.getPercent());
  },
  next: function() {
    this.oscillator.next(); 
  }
});

var Flake = Class.create({
  initialize: function(dimensions) {
    this.fieldDimensions = dimensions;
    this.reset();
  },
  reset: function() {
    var x = Math.floor(Math.random() * this.fieldDimensions.getWidth());
    this.driftManager = new DriftManager(x, this.fieldDimensions);
    this.y = 0;
    this.radius = Math.floor(Math.random() * 7) + 1;
    this.fallRate = (Math.random() / 2) + 0.5;
  },
  getX: function() {
    return this.driftManager.getX();
  },
  getY: function() {
    return this.y;
  },
  getRadius: function() {
    return this.radius;
  },
  update: function() {
    this.y += this.fallRate;
    this.driftManager.next();
  }
});

var Dimensions = Class.create({
  initialize: function(width, height) {
    this.width = width;
    this.height = height;
  },
  getWidth: function() {
    return this.width;
  },
  getHeight: function() {
    return this.height;
  }
});

var AbstractRenderer = Class.create({
  initialize: function() {
    this.flakeViews = $A([]);
  },
  getDimensions: function() {
    return this.dimensions;
  },
  addFlake: function(flake) {
    this.flakeViews.push(this.createFlakeView(flake));
  },
  addGroundModel: function(ground) {
    this.groundView = this.createGroundView(ground, this.dimensions);
  },
  drawScreen: function() {
    var context = this.getRenderContext();
    this.prepareRender(context);
    this.flakeViews.each(function(flake) {
      flake.draw(context);
    }.bind(this));
    if (this.groundView != null) {
      this.groundView.draw(context);
    }
  }
});

var Ground = Class.create({
  initialize: function(dimensions) {
    this.dimensions = dimensions;
    this.limits = [];
    for (var i=0; i<this.dimensions.getWidth(); i++) {
      this.limits[i] = this.dimensions.getHeight();
    }
  },
  getLevels: function() {
    return this.limits;
  },
  getGroundLevel: function(x, radius) {
    return this.limits[Math.floor(x)] - (radius / 2);
  },
  flakeLanded: function(flake) {
    return (Math.abs(flake.getY() - this.getGroundLevel(flake.getX(), flake.getRadius())) < 2 || 
            flake.getY() > this.dimensions.getHeight());
  },
  setLimit: function(xPos, value) {
    if (value < 0) {
      value = 0;
    }
    this.limits[xPos] = value;
    this.tumble(xPos);
  },
  pointTumble: function(from, to) {
    while(this.limits[to] - this.limits[from] > 1) {
      this.limits[from] += 1;
      this.limits[to] -= 1;
      this.tumble(to);
    }
  },
  tumble: function(xPos) {
    if (xPos > 0) {
      this.pointTumble(xPos, xPos-1);
    }
    if (xPos < this.dimensions.getWidth()) {
      this.pointTumble(xPos, xPos+1);
    }
  },
  updateGroundLevel: function(xPos) {
    var x = Math.floor(xPos);
    this.setLimit(x, this.limits[x] - 1);
  }
});
