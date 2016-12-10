var margin = {l: 50, t: 50, r: 50, b: 50};
var colors = ["black", "gray", "white", "purple", "cyan", "yellow", "blue", "green", "red"];
var animationDuration = 500;
var getImageURL = function(photoInfo) {
  var photoId = photoInfo.id;
  var farmId = photoInfo.farm;
  var serverId = photoInfo.server;
  var secret = photoInfo.secret;
  return "https://farm"+farmId+".staticflickr.com/"+serverId+"/"+photoId+"_"+secret+"_s.jpg";
};

var force = d3.na.force();
var tempW = d3.select(".canvas-boston").node().parentNode.offsetWidth;
var plot = d3.select(".canvas-boston")
  .attr("width", tempW)
  .attr("height", window.innerHeight)
  .style("background", "#eee")
  .append("g")
  .attr("transform", "translate("+(margin.l)+","+(margin.t)+")");

var masterData = {};
var dataLoaded = function(err, photos) {
  // bostonPhotos = photos[0].concat(photos[1]);
  setupButtonFunctionality();
  // BOSTON PHOTOS
  var bostonPhotos = photos[0];
  bostonPhotos = bostonPhotos.map(function(d) {
    d.date = new moment(d.dates.taken);
    return d;
  });
  masterData.bostonPhotos = bostonPhotos;
  console.log("dataLoaded", bostonPhotos);
  force.data = bostonPhotos.slice();
  force.draw(plot);

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

function setupButtonFunctionality() {
  d3.selectAll("button")
    .on("click", function() {
      d3.selectAll("button").classed("btn-primary", false).classed("btn-default", true);
      d3.select(this).classed("btn-primary", true).classed("btn-default", false);
      var type = d3.select(this).attr("id");
      switch (type) {
        case "month":
          force.groupLabels = {0: "Jan", 1:"Feb", 2:"Mar", 3:"Apr", 4:"May", 5:"Jun",
            6:"Jul", 7:"Aug", 8:"Sep", 9:"Oct", 10:"Nov", 11:"Dec"};
          force.group = function(d) { return d.date.month(); }
          force.draw(plot);
          break;
        case "time":
          force.group = function(d) {
            if (d.date.hour() <= 5) { return "night"; }
            else if (d.date.hour() <= 11) { return "morning"; }
            else if (d.date.hour() <= 17) { return "afternoon"; }
            return "night";
          };
          force.groupLabels = {beforeNight: "before-night", morning: "morning", afternoon: "afternoon", night: "night"};
          force.draw(plot);
          break;
      }
    })
}
