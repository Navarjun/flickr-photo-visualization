var margin = {l: 50, t: 50, r: 50, b: 50};
var colors = ["black", "gray", "white", "purple", "cyan", "yellow", "blue", "green", "red"];
// var colors = ["red", "green", "blue", "yellow", "cyan", "purple", "white", "gray", "black"];
var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var animationDuration = 500;
var getImageURL = function(photoInfo) {
  var photoId = photoInfo.id;
  var farmId = photoInfo.farm;
  var serverId = photoInfo.server;
  var secret = photoInfo.secret;
  return "https://farm"+farmId+".staticflickr.com/"+serverId+"/"+photoId+"_"+secret+"_s.jpg";
};

var simulation = d3.forceSimulation();

var dataLoaded = function(err, photos) {
  console.log("dataLoaded", photos[0]);
  // bostonPhotos = photos[0].concat(photos[1]);

  // BOSTON PHOTOS
  var bostonPhotos = photos[0];
  bostonPhotos = bostonPhotos.map(function(d) {
    d.date = new moment(d.dates.taken);
    return d;
  });
  console.log("dataLoaded", bostonPhotos);
  tempW = d3.select(".canvas-boston").node().parentNode.offsetWidth;
  var canvasBoston = d3.select(".canvas-boston")
    .attr("width", tempW)
    .attr("height", window.innerHeight)
    .style("background", "#eee")
    .append("g")
    .attr("transform", "translate("+(margin.l)+","+(margin.t)+")");
  setTimeout(drawData, 0, bostonPhotos, canvasBoston);

};

d3.queue()
  .defer(d3.json, "data/boston_thief_colors.json")
  .awaitAll(dataLoaded)
// d3.json("data/dom_color_data.json", dataLoaded);

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

var masterData;
var positionForIndex = function(index, rows, columns, desiredWidth, desiredHeight) {
  return {
    x: ((index)%columns)*(desiredWidth/columns) + desiredHeight/7,
    y: parseInt((index)/columns)*(desiredHeight/rows) + desiredWidth/7
  };
};

function drawData(photos, plot) {
  // photos = photos.filter(function(d){return d.colors;})
  var parent = d3.select(plot.node().parentNode);
  var desiredHeight = parent.attr("height") - margin.t - margin.b,
    desiredWidth = parent.attr("width") - margin.l - margin.r;

  var scaleX = d3.scaleLinear().range([0, desiredWidth]).domain([new Date(2015, 0, 1), new Date(2015, 11, 31, 23, 59, 59)]),
    scaleY = d3.scaleLinear().range([0, desiredHeight]).domain([0, 5625]);

  photos = photos.map(function(d){
    d.x = scaleX(d.date.toDate());
    d.y = 10;
    return d;
  });

  simulation.on("tick", function() {
    plot.selectAll(".photo-group")
      .attr("transform", function(d){ return "translate("+d.x+","+d.y+")"; })
  });

  var index = [];
  var links = [];
  photos.forEach(function(d, i){
    var j = index.filter(function(e){ return e.key == d.date.month(); });
    if (j.length == 0) {
      j = {key: d.date.month(), index: i};

      d.fx = positionForIndex(index.length, 3, 4, desiredWidth, desiredHeight).x;
      d.fy = positionForIndex(index.length, 3, 4, desiredWidth, desiredHeight).y;
      index.push(j);
    } else {
      j = j[0];
      links.push({source: j.index, target: i, value: 10});
    }
  });

  var labels = plot.selectAll("labelsGroup")
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
    .text(function(d){ return months[d.key]; })
    .attr("fill", "#222")
    .transition().duration(animationDuration)
    .attr("x", function(_, i){ return positionForIndex(i, 3, 4, desiredWidth, desiredHeight).x - 20; })
    .attr("y", function(_, i){ return positionForIndex(i, 3, 4, desiredWidth, desiredHeight).y - 60; })

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
    .attr("class", function(d){ return "photo-group photo-"+d.id; });
  var photo = photosGroup.selectAll("image").data(function(d){ return [d]; });
  photo.exit().remove();
  photo.enter()
    .append("image")
    .merge(photo)
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 10)
    .attr("height", 10)
    .attr("xlink:href", function(d){ return getImageURL(d); })
    .style("opacity", 1)
    .on("mouseenter", function(d){
      plot.selectAll(".photo-group")
        .style("opacity", function(e){ return d.date.month() == e.date.month() ? 1 : 0.6; })
    })
    .on("mouseleave", function(d){
      plot.selectAll(".photo-group")
        .style("opacity", 1);
    });

  simulation.nodes(photos);

  simulation
    .force("link", d3.forceLink(links).strength(0.1))
    .force("collide", d3.forceCollide(5));
}
