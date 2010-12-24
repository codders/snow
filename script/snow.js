Object.extend(CanvasRenderingContext2D.prototype, {
  fillCircle:function(aX, aY, aDiameter){
      this.beginPath();
      this.arc(aX, aY, aDiameter / 2, 0, Math.PI * 2, false);
      this.closePath();
      this.fill();
  }
});

var Oscillator = Class.create({
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
  initialize: function(startX, field) {
    this.x = startX;
    this.maxWidth = field.getWidth() / 2;
    this.minWidth = 10;
    this.width = Math.floor(Math.random() * (this.maxWidth - this.minWidth)) + this.minWidth;
    this.oscillator = new Oscillator();
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
  initialize: function(field) {
    Object.Event.extend(this);
    this.field = field;
    this.reset();
  },
  reset: function() {
    var x = Math.floor(Math.random() * this.field.getWidth());
    this.driftManager = new DriftManager(x, this.field);
    this.y = 0;
    this.radius = Math.floor(Math.random() * 7) + 1;
    this.fallRate = (Math.random() / 2) + 0.5;
  },
  getX: function() {
    return this.driftManager.getX();
  },
  update: function() {
    this.y += this.fallRate;
    this.driftManager.next();
    if (Math.abs(this.y - this.field.getGround(this.driftManager.getX(), this.radius)) < 2 || this.y > this.field.getHeight()) {
      clearTimeout(this.callback);
      this.callback = null;
      this.notify("fallen", this);
    }
  },
  draw: function(context) {
    context.fillStyle = "rgb(255,255,255)";
    context.fillCircle(this.driftManager.getX(), this.y, this.radius);
  }
});

var SnowField = Class.create({
  initialize: function(canvas) {
    this.canvasElement = $(canvas);
    this.limits = [];
    for (var i=0; i<this.canvasElement.width; i++) {
      this.limits[i] = this.canvasElement.height;
    }
    this.updateInterval = 100;
    this.flakes = $A([]);
  },
  getContext: function() {
    return this.canvasElement.getContext('2d');
  },
  getWidth: function() {
    return this.canvasElement.width;
  },
  getHeight: function() {
    return this.canvasElement.height;
  },
  getGround: function(x, radius) {
    return this.limits[Math.floor(x)] - (radius /2);
  },
  addFlake: function() {
    var flake = new Flake(this);
    flake.observe("fallen", function(flake) {
      this.updateFieldDepth(flake.getX());
      flake.reset();
    }.bind(this));
    this.flakes.push(flake);
  },
  addFlakes: function(count) {
    for (var i=0; i < count; i++) {
      setTimeout(function() {
        this.addFlake();
      }.bind(this), Math.floor(Math.random() * (this.canvasElement.height * this.updateInterval)));
    }
    setInterval(this.redrawSnow.bind(this), 100);
  },
  redrawSnow: function() {
    var context = this.canvasElement.getContext('2d');
    context.fillStyle = 'rgb(0,0,0)';
    context.fillRect(0, 0, this.canvasElement.width, this.canvasElement.height);
    this.flakes.each(function(flake) {
      flake.update();
      flake.draw(context);
    });
    this.drawGround(context);
  },
  drawGround: function(context) {
    context.fillStyle = 'rgb(255,255,255)';
    context.beginPath();
    context.moveTo(0, parseInt(this.canvasElement.height));
    for (var i=0; i < this.canvasElement.width; i++) {
      context.lineTo(i, this.limits[i]);
    }
    context.lineTo(this.canvasElement.width, this.canvasElement.height);
    context.closePath();
    context.fill();
  },
  setLimit: function(xPos, value) {
    if (value < 0) {
      value = 0;
    }
    this.limits[xPos] = value;
    this.tumble(xPos);
  },
  tumble: function(xPos) {
    if (xPos > 0) {
      while (this.limits[xPos-1] - this.limits[xPos] > 1) {
        this.limits[xPos] += 1;
        this.limits[xPos-1] -= 1;
        this.tumble(xPos - 1);
      }
    }
    if (xPos < this.canvasElement.width) {
      while (this.limits[xPos+1] - this.limits[xPos] > 1) {
        this.limits[xPos] += 1;
        this.limits[xPos+1] -= 1;
        this.tumble(xPos + 1);
      }
    }
  },
  updateFieldDepth: function(xPos) {
    var x = Math.floor(xPos);
    this.setLimit(x, this.limits[x] - 1);
  }
});

