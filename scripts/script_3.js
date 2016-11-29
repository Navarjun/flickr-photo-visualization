var pixelArray = [],
  masterData = [], aggregateData = [],
  currX = 0, currY = 0;
var margin = {l: 50, t: 50, r: 50, b: 50};
var desiredHeight = window.innerHeight-margin.t-margin.b,
  desiredWidth = window.innerWidth-margin.l-margin.r;
var plot = d3.select(".canvas")
  .attr("width", window.innerWidth)
  .attr("height", window.innerHeight)
  .append("g")
  .attr("transform", "translate("+(margin.l+desiredWidth/2)+","+(margin.t+desiredHeight/2)+")");
var scaleX = d3.scaleTime().range([0, 2*Math.PI]).domain([new Date(2014, 12, 31), new Date(2015, 12, 31)]),
  scaleY = d3.scaleLinear().range([100, desiredHeight/2]).domain([0, 5625]);
var colors = ["black", "gray", "white", "purple", "cyan", "yellow", "blue", "green", "red"];

var area = d3.radialArea()
    .curve(d3.curveBasis)
    .angle(function(d) { return scaleX(d.dates.taken.toDate()); })
    .innerRadius(100);

var getImageURL = function(photoInfo) {
  var photoId = photoInfo.id;
  var farmId = photoInfo.farm;
  var serverId = photoInfo.server;
  var secret = photoInfo.secret;
  return "https://farm"+farmId+".staticflickr.com/"+serverId+"/"+photoId+"_"+secret+"_s.jpg";
};

var dataLoaded = function(err, photos) {
  photos = photos[0].concat(photos[1]);
  photos = photos.map(function(d) {
    d.dates.taken = new moment(d.dates.taken);
    return d;
  }).sort(function(a, b) {
    return a.dates.taken.isBefore(b.dates.taken) ? -1 : 1;
  });
  console.log(photos[0]);
  processData(photos);
};

d3.queue()
  .defer(d3.json, "data/dom_color_data_rgb.json")
  .defer(d3.json, "data/dom_color_data_rgb_1.json")
  .awaitAll(dataLoaded)
// d3.json("data/dom_color_data.json", dataLoaded);

function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}
var lll = true;
function processData(photos) {
  masterData = photos.map(function(d){
    var data = [];
    var comm = 0;
    var x = clone(d);
    colors.forEach(function(color){
      console.log(color);
      var e = d.colors.filter(function(f){return f.color == color;})[0];
      e.count = e.count + comm;
      comm = e.count;
      data.push(e)
    });
    x.data = data;
    return x;
  });
  drawData(masterData);
}

function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}

function drawData(photos) {
  photos = photos.sort(function(a, b){ return a.dates.taken.toDate().valueOf() - b.dates.taken.toDate().valueOf(); })

  // CREATING START AND END POINTS
  var x = {dates: {taken: moment("2014-12-31")},
          data: []};
  var y = {dates: {taken: moment("2016-01-01")},
          data: []};
  colors.map(function(d){
    var temp = {color: d, count: 0, values: {r: 0, g: 0, b: 0}};
    x.data.push(temp);
    y.data.push(temp);
  });
  photos = [x].concat(photos);
  photos.push(y);
  console.log("photos", photos);

  for (var i = colors.length - 1; i >= 0; i--) {
    var color = colors[i];
    // area.y(function(d) { return scaleY(d.data.filter(function(e){return e.color == color; })[0].count); })
    // .y1(desiredHeight);
    area.outerRadius(function(d) { return scaleY(d.data.filter(function(e){return e.color == color; })[0].count); });
    plot.append("g")
      .attr("class", "layer "+color)
      .append("path")
      .datum(photos)
      .style("fill", function(d){
        var v = d.map(function(e){ return e.data.filter(function(f){return f.color == color; })[0].values; })
        var rMean = parseInt(d3.mean(v, function(e){ return e.r; }));
        var gMean = parseInt(d3.mean(v, function(e){ return e.g; }));
        var bMean = parseInt(d3.mean(v, function(e){ return e.b; }));
        // console.log("rgb("+rMean+", "+gMean+", "+bMean+")");
        // return color;
        return "rgb("+rMean+", "+gMean+", "+bMean+")";
      })
      .style("stroke", color)
      .style("stroke-width", "1px")
      .attr("d", area);
  }

}
