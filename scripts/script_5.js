var monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

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
var yAxisSVG = d3.select("#yAxisSVG").attr("height", 12*200).attr("width", d3.select("#yAxisSVG").node().parentNode.offsetWidth);
var vizSVG = d3.select("#vizSVG").attr("height", 12*200).attr("width", xAxisSVG.attr("width"));
var plot = vizSVG.append("g").attr("transform", "translate("+margin.l+","+margin.t+")");

var xAxis, yAxis;
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
      return d;
    });

  var nodes = plot.selectAll("g")
    .data(photos)
    .enter()
    .append("g");
  nodes
    .append("image")
    .attr("width", 10)
    .attr("height", 10)
    .attr("xlink:href", function(d){ return getImageURL(d); })
    .style("opacity", 1);

  var desiredHeight = vizSVG.attr("height") - margin.t - margin.b,
    desiredWidth = vizSVG.attr("width") - margin.l - margin.r;
  var scaleX = d3.scaleOrdinal().domain(["boston", "delhi"]).range(d3.range(0, desiredWidth, desiredWidth/2)),
    scaleY = d3.scaleOrdinal().domain(d3.range(0, 11, 1)).range(d3.range(0, desiredHeight, desiredHeight/12));

  xAxis = d3.axisBottom().scale(scaleX);
  xAxis(xAxisSVG.append("g").attr("transform", "translate("+margin.l+", 0)").attr("class", "axis axisX"));
  yAxis = d3.axisRight().scale(scaleY)
    .tickFormat(function(d){
      return monthNames[d];
    });
  yAxis(yAxisSVG.append("g").attr("transform", "translate(0, "+margin.t+")").attr("class", "axis axisY"));

  force.nodes(nodes)
    .nodesData(photos)
    .groupY(function(d){ return d.date.month(); })
    .scaleY(scaleY)
    .groupX(function(d){ return d.city; })
    .scaleX(scaleX);
  force.draw();

  setupButtons();
}

function setupButtons() {
  var desiredHeight = vizSVG.attr("height") - margin.t - margin.b,
    desiredWidth = vizSVG.attr("width") - margin.l - margin.r;
  d3.selectAll("button")
    .on("click", function() {
      d3.selectAll("button").classed("btn-primary", false).classed("btn-default", true);
      d3.select(this).classed("btn-primary", true).classed("btn-default", false);
      var type = d3.select(this).attr("id");
      switch (type) {
        case "month":
          var scaleY = d3.scaleOrdinal().domain(d3.range(0, 11, 1)).range(d3.range(0, desiredHeight, desiredHeight/12));
          yAxis.scale(scaleY).tickFormat(function(d){ return monthNames[d]; });
          d3.select(".axisY").call(yAxis);
          force.groupY(function(d){ return d.date.month(); })
            .scaleY(scaleY);
            force.draw();
          break;
        case "time":
          var scaleY = d3.scaleOrdinal().domain(["morning", "afternoon", "night"]).range([150, 450, 750]);
          yAxis.scale(scaleY).tickFormat(null)
          d3.select(".axisY").call(yAxis);
          force
            .groupY(function(d){
              if (d.date.hour() <= 5) { return "night"; }
              else if (d.date.hour() <= 11) { return "morning"; }
              else if (d.date.hour() <= 17) { return "afternoon"; }
              return "night";
            })
            .scaleY(scaleY)
          force.draw();
          break;
      }
    })
}
