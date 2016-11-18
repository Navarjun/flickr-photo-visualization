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
  .attr("transform", "translate("+margin.l+","+margin.t+")");
var scaleX = d3.scaleBand().domain(d3.range(0, 12, 1)).paddingInner(0.4),
  subScaleX = d3.scaleLinear().domain([100, 0]),
  scaleY = d3.scaleLinear().domain([360,0]);
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
  });
  processData(photos);
};

d3.queue()
  .defer(d3.json, "data/dom_color_data.json")
  .defer(d3.json, "data/dom_color_data_1.json")
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

function processData(photos) {
  masterData = photos;
  masterData.map(function(d){
    var maxPercentage = d3.max(d.colors, function(e){ return e.percentage; });
    d.domColor = d.colors.filter(function(e){ return e.percentage == maxPercentage; })[0];
  });

  masterData = d3.nest().key(function(d){ return d.dates.taken.month(); }).entries(masterData);
  console.log(masterData);

  scaleX.range([margin.l, desiredWidth]);
  subScaleX.range([0, scaleX.bandwidth()])
  scaleY.range([margin.t, desiredHeight]);

  drawData();
}

function drawData() {

  plot.selectAll("g")
    .data(masterData)
    .enter()
    .append("g")
    .attr("class", function(d){ return "month"+d.key; })
    .attr("transform", function(d){ return "translate("+scaleX(d.key)+",0)"; })
    .selectAll("rect")
    .data(function(d){ return d.values; })
    .enter()
    .append("rect")
    .attr("width", 10)
    .attr("height", 10)
    .attr("x", function(d){ return subScaleX(d.domColor.average.l)-10; })
    .attr("y", function(d){ return scaleY(d.domColor.average.h)-10; })
    .attr("fill", function(d){ return "hsl("+d.domColor.average.h+","+d.domColor.average.s+"%, "+d.domColor.average.l+"%)"; })

  var month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var axisX = d3.axisBottom().scale(scaleX)
    .tickFormat(function(d){
      return month[d];
    });
  plot.append("g").call(axisX).attr("transform", "translate(0,"+desiredHeight+")");

  var axisY = d3.axisLeft().scale(scaleY);
  plot.append("g").call(axisY);

}
