d3.na = {};

d3.na.force = function() {
  var self = this;

  self._canvas = null;
  self.canvas = function(newValue) {
    if (newValue) {
      self._canvas = newValue;
      return self;
    }
    return self._canvas;
  };

  self._links = [];

  self._nodes = [];
  self.nodes = function(newValue) {
    if (newValue) {
      self._nodes = newValue;
      return self;
    }
    return self._nodes;
  };

  self._force = d3.forceSimulation();

  self._groupX = function(d) { return d; };
  self.groupX = function(newValue) {
    if (newValue) {
      self._groupX = newValue;
      return self;
    }
    return self._groupX;
  };

  self._groupY = function(d) { return d; };
  self.groupY = function(newValue) {
    if (newValue) {
      self._groupY = newValue;
      return self;
    }
    return self._groupY;
  };

  self._scaleX = d3.scaleLinear().range([0, 100]).domain([0, 100]);
  self.scaleX = function(newValue) {
    if (newValue) {
      self._scaleX = newValue;
      return self;
    }
    return self._scaleX;
  };

  self._scaleY = d3.scaleLinear().range([0, 100]).domain([0, 100]);
  self.scaleY = function(newValue) {
    if (newValue) {
      self._scaleY = newValue;
      return self;
    }
    return self._scaleY;
  };

  self._processNodesData = function() {
    var index = [];
    self._links = [];
    self._nodes.forEach(function(d, i){
      var j = index.filter(function(e){ return e.keyX == self._groupX(d.data) && e.keyY == self._groupY(d.data); });
      if (j.length == 0) {
        j = {keyX: self._groupX(d.data), keyY: self._groupY(d.data), index: i};

        d.fx = self._scaleX(self._groupX(d.data));
        d.fy = self._scaleY(self._groupY(d.data));
        index.push(j);
      } else {
        j = j[0];
        self._links.push({source: j.index, target: i, value: 10});
        delete d["fx"];
        delete d["fy"];
      }
    });
  };

  self.draw = function() {
    self._force.stop();
    self._processNodesData();

    self._force.on("tick", function() {
      self._nodes.forEach(function(d){
        d.image.x = d.x;
        d.image.y = d.y;
      });
      self._canvas.update();
    });

    self._force.nodes(self._nodes);
    self._force
      .force("link", d3.forceLink(self._links).strength(0.1))
      .force("collide", d3.forceCollide(8));


    self._force.alpha(1);
    self._force.restart();
  };

  return this;
};
