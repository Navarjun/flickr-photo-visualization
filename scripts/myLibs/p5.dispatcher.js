p5.point = function(x, y) {
  if (!x || !y) {
    console.error("p5.position", "constructor takes 2 arguments");
  }
  this.x = x;
  this.y = y;
};

p5.size = function(width, height) {
  this.width = width;
  this.height = height;
};

p5.rect = function(x, y, width, height) {
  if (!x || !y || !width || !height) {
    console.error("p5.frame", "constructor takes 4 arguments");
  }
  this.origin = new p5.point(x, y);
  this.size = new p5.size(width, height);
};

p5.img = function(imageData, x, y, width, height) {
  if (!imageData || !x || !y) {
    console.error("p5.image", "constructor takes 3 arguments");
  }
  this.image = imageData;
  this.frame = new p5.rect(x, y, width, height);
  this.draw = function() {
    image(this.image, this.frame.origin.x, this.frame.origin.y, this.frame.size.width, this.frame.size.height);
  };
};

p5.dispatcher = {
  eventListeners: {},
  addEventListener: function(eventName, listener, callback, data) {
    if(this.eventListeners[eventName]) {
      this.eventListeners[eventName].callback(listener, data);
    }
  }
};
