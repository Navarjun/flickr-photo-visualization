d3.na = {};

d3.na.force = function() {
  var self = this;
  var positionForIndex = function(index, rows, columns, desiredWidth, desiredHeight) {
    return {
      x: ((index)%columns)*(desiredWidth/columns) + desiredHeight/7,
      y: parseInt((index)/columns)*(desiredHeight/rows) + desiredWidth/7
    };
  };
  this.data = [];
  this.rows = 3; this.columns = 4;
  this.simulation = d3.forceSimulation();
  this.group = function(d) { return d.date.month(); };
  this.groupLabels = {0: "Jan", 1:"Feb", 2:"Mar", 3:"Apr", 4:"May", 5:"Jun",
    6:"Jul", 7:"Aug", 8:"Sep", 9:"Oct", 10:"Nov", 11:"Dec"};

  this.draw = function(plot) {
    photos = self.data;
    self.simulation.stop();
    // photos = photos.filter(function(d){return d.colors;})
    var parent = d3.select(plot.node().parentNode);
    var desiredHeight = parent.attr("height") - margin.t - margin.b,
      desiredWidth = parent.attr("width") - margin.l - margin.r;

    var scaleX = d3.scaleLinear().range([0, desiredWidth]).domain([new Date(2015, 0, 1), new Date(2015, 11, 31, 23, 59, 59)]),
      scaleY = d3.scaleLinear().range([0, desiredHeight]).domain([0, 5625]);

    self.simulation.on("tick", function() {
      plot.selectAll(".photo-group")
        .attr("transform", function(d){ return "translate("+d.x+","+d.y+")"; })
    });

    var index = [];
    var links = [];

    photos.forEach(function(d, i){
      var j = index.filter(function(e){ return e.key == self.group(d); });
      if (j.length == 0) {
        j = {key: self.group(d), index: i};

        d.fx = positionForIndex(index.length, self.rows, self.columns, desiredWidth, desiredHeight).x;
        d.fy = positionForIndex(index.length, self.rows, self.columns, desiredWidth, desiredHeight).y;
        index.push(j);
      } else {
        j = j[0];
        links.push({source: j.index, target: i, value: 10});
        delete d["fx"];
        delete d["fy"];
      }
    });

    var labels = plot.selectAll(".labelsGroup")
      .data([1], function(d){ return d; });

    labels.exit().remove();
    labels = labels.enter()
      .append("g")
      .classed("labelsGroup", true)
      .merge(labels);
    var text = labels.selectAll("text").data(index, function(d) { return d.key; });
    text.exit().remove();
    text.enter()
      .append("text")
      .merge(text)
      .text(function(d){ return self.groupLabels[d.key]; })
      .attr("fill", "#222")
      .transition().duration(animationDuration)
      .attr("transform", function(d){ return "translate(-"+d3.select(this).node().getBBox().width/2+",0)"})
      .attr("x", function(_, i){ return positionForIndex(i, self.rows, self.columns, desiredWidth, desiredHeight).x; })
      .attr("y", function(_, i){ return positionForIndex(i, self.rows, self.columns, desiredWidth, desiredHeight).y - 60; });

    var gSelection = plot.selectAll(".photosG")
      .data([1], function(d){ return d; });

    gSelection.exit().remove();
    gSelection = gSelection.enter().append('g')
      .classed("photosG", true)
      .merge(gSelection);
    var photosGroup = gSelection.selectAll('g')
      .data(photos, function(d){ return d.id; });
    photosGroup.exit().remove();
    photosGroup = photosGroup.enter()
      .append('g')
      .attr("class", function(d){ return "photo-group photo-"+d.id; })
      .merge(photosGroup);
    var photo = photosGroup.selectAll("image").data(function(d){ return [d]; });
    photo.exit().remove();
    photo.enter()
      .append("image")
      .merge(photo)
      .attr("width", 10)
      .attr("height", 10)
      .attr("xlink:href", function(d){ return getImageURL(d); })
      .style("opacity", 1)
      .on("mouseenter", function(d){
        plot.selectAll(".photo-group")
          .style("opacity", function(e){ return self.group(d) == self.group(e) ? 1 : 0.6; })
      })
      .on("mouseleave", function(d){
        plot.selectAll(".photo-group")
          .style("opacity", 1);
      });

    self.simulation.nodes(photos);

    self.simulation
      .force("link", d3.forceLink(links).strength(0.1))
      .force("collide", d3.forceCollide(8));
    self.simulation.alpha(1);
    self.simulation.restart();
  }

  return this;
}
