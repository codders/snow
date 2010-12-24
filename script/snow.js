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

var SnowField = Class.create({
  initialize: function(canvas) {
    this.fallTime = 40000;
    this.renderer = new CanvasRenderer(canvas);
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
