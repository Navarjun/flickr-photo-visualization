var monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

var margin = {l: 50, t: 50, r: 50, b: 50};

var animationDuration = 500;
var getImageURL = function(photoInfo) {
  var photoId = photoInfo.id;
  var farmId = photoInfo.farm;
  var serverId = photoInfo.server;
  var secret = photoInfo.secret;
  return "https://farm"+farmId+".staticflickr.com/"+serverId+"/"+photoId+"_"+secret+"_s.jpg";
};

var margin = {l: 100, t: 100, r: 100, b: 100};
var xAxisSVG = d3.select("#xAxisSVG").attr("height", d3.select(".buttonDiv").node().offsetHeight).attr("width", d3.select("#xAxisSVG").node().parentNode.offsetWidth);
var yAxisSVG = d3.select("#yAxisSVG").attr("height", 12*300).attr("width", d3.select("#yAxisSVG").node().parentNode.offsetWidth);
var vizCanvas = d3.select("#vizCanvas").attr("height", 12*300).attr("width", xAxisSVG.attr("width"));
var plot = new createjs.Stage("vizCanvas", false, false);
plot.x = margin.l; plot.y = margin.t;
var xAxis, yAxis, mode = function(d){ return d.date.month(); };
var force = d3.na.force();

d3.queue()
  .defer(d3.json, "data/boston_dom_color.json")
  .defer(d3.json, "data/delhi_dom_color.json")
  .awaitAll(dataLoaded)

function dataLoaded(err, photos) {
  photos = photos[0].map(function(d){ d.city="boston"; return d;})
    .concat(photos[1].map(function(d){ d.city="delhi"; return d;}))
    .map(function(d) {
      d.date = new moment(d.dates.taken);
      d.dateuploaded = new moment(+d.dateuploaded*1000);
      return d;
    });

  var nodes = [];
  photos.forEach(function(d){
    var image = new createjs.Bitmap(getImageURL(d));
    image.scaleX = 0.1; image.scaleY = 0.1;
    nodes.push({image: image, data: d});
    plot.addChild(image);
  });
  nodes.forEach(function(d){
    d.image.addEventListener("click", function(){
      nodes.forEach(function(e){
        if (mode(d.data) == mode(e.data)) {
            e.image.alpha = 1;
        } else {
          e.image.alpha = 0.2;
        }
      })
    });
  });
  plot.update();

  var desiredHeight = vizCanvas.attr("height") - margin.t - margin.b,
    desiredWidth = vizCanvas.attr("width") - margin.l - margin.r,
    padding = 200, xDomain = ["boston", "delhi"];
    console.log((desiredWidth/2)-(padding*xDomain.length/2), (desiredWidth/2)+(padding*xDomain.length/2), padding*xDomain.length);
  var scaleX = d3.scaleOrdinal().domain(["boston", "delhi"]).range(d3.range((desiredWidth/2)-(padding*xDomain.length/2), (desiredWidth/2)+(padding*xDomain.length/2), padding)),
    scaleY = d3.scaleOrdinal().domain(d3.range(0, 12, 1)).range(d3.range(0, desiredHeight, desiredHeight/12));

  xAxis = d3.axisBottom().scale(scaleX);
  xAxis(xAxisSVG.append("g").attr("transform", "translate("+margin.l+", 0)").attr("class", "axis axisX"));
  yAxis = d3.axisRight().scale(scaleY)
    .tickFormat(function(d){
      return monthNames[d];
    });
  yAxis(yAxisSVG.append("g").attr("transform", "translate(0, "+margin.t+")").attr("class", "axis axisY"));

  force.nodes(nodes)
    .canvas(plot)
    .groupY(function(d){ return d.date.month(); })
    .scaleY(scaleY)
    .groupX(function(d){ return d.city; })
    .scaleX(scaleX);
  force.draw();

  setupButtons();
}

function setupButtons() {
  var desiredHeight = vizCanvas.attr("height") - margin.t - margin.b,
    desiredWidth = vizCanvas.attr("width") - margin.l - margin.r;
  d3.selectAll("button")
    .on("click", function() {
      d3.selectAll("button").classed("btn-primary", false).classed("btn-default", true);
      d3.select(this).classed("btn-primary", true).classed("btn-default", false);
      var type = d3.select(this).attr("id");
      switch (type) {

        case "taken_month":
          var padding = 200, catCount = 12;
          var scaleY = d3.scaleOrdinal().domain(d3.range(0, 11, 1)).range(d3.range(padding/2, padding*catCount, padding));
          yAxis.scale(scaleY).tickFormat(function(d){ return monthNames[d]; });
          d3.select(".axisY").call(yAxis);
          mode = function(d){ return d.date.month(); };
          force.groupY(mode)
            .scaleY(scaleY);
          setTimeout(force.draw, 0);
          vizCanvas.transition().attr("height", padding*(catCount+1));
          yAxisSVG.transition().attr("height", padding*(catCount+1));
          break;

        case "uploaded_month":
          var padding = 200, catCount = 12;
          var scaleY = d3.scaleOrdinal().domain(d3.range(0, 11, 1)).range(d3.range(padding/2, padding*catCount, padding));
          yAxis.scale(scaleY).tickFormat(function(d){ return monthNames[d]; });
          d3.select(".axisY").call(yAxis);
          mode = function(d){ return d.dateuploaded.month(); };
          force.groupY(mode)
            .scaleY(scaleY);
          setTimeout(force.draw, 0);
          vizCanvas.transition().attr("height", padding*(catCount+1));
          yAxisSVG.transition().attr("height", padding*(catCount+1));
          break;

        case "taken_time":
          var padding = 300, catCount = 3;
          var scaleY = d3.scaleOrdinal().domain(["morning", "afternoon", "night"]).range(d3.range(padding/2, padding*12, padding));
          yAxis.scale(scaleY).tickFormat(null);
          mode = function(d){
            if (d.date.hour() <= 5) { return "night"; }
            else if (d.date.hour() <= 11) { return "morning"; }
            else if (d.date.hour() <= 17) { return "afternoon"; }
            return "night";
          };
          d3.select(".axisY").call(yAxis);
          force
            .groupY(mode)
            .scaleY(scaleY)
          setTimeout(force.draw, 0);
          vizCanvas.transition().attr("height", padding*(catCount+1));
          yAxisSVG.transition().attr("height", padding*(catCount+1));
          break;

        case "uploaded_time":
          var padding = 300, catCount = 3;
          var scaleY = d3.scaleOrdinal().domain(["morning", "afternoon", "night"]).range(d3.range(padding/2, padding*12, padding));
          yAxis.scale(scaleY).tickFormat(null);
          mode = function(d){
            if (d.dateuploaded.hour() <= 5) { return "night"; }
            else if (d.dateuploaded.hour() <= 11) { return "morning"; }
            else if (d.dateuploaded.hour() <= 17) { return "afternoon"; }
            return "night";
          };
          d3.select(".axisY").call(yAxis);
          force
            .groupY(mode)
            .scaleY(scaleY)
          setTimeout(force.draw, 0);
          vizCanvas.transition().attr("height", padding*(catCount+1));
          yAxisSVG.transition().attr("height", padding*(catCount+1));
          break;
      }
    })
}
