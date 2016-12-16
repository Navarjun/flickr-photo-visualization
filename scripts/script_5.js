var monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

var margin = {l: 50, t: 50, r: 50, b: 50};

var animationDuration = 500;
var getImageURL = function(photoInfo, size="s") {
  var photoId = photoInfo.id;
  var farmId = photoInfo.farm;
  var serverId = photoInfo.server;
  var secret = photoInfo.secret;
  return "https://farm"+farmId+".staticflickr.com/"+serverId+"/"+photoId+"_"+secret+"_"+size+".jpg";
};

var xAxisSVG = d3.select("#xAxisSVG").attr("height", d3.select(".buttonDiv").node().offsetHeight).attr("width", d3.select("#xAxisSVG").node().parentNode.offsetWidth);
var yAxisSVG = d3.select("#yAxisSVG").attr("height", 12*200).attr("width", d3.select("#yAxisSVG").node().parentNode.offsetWidth);
var vizSVG = d3.select("#vizSVG").attr("height", 12*200).attr("width", xAxisSVG.attr("width"));
var plot = vizSVG.append("g").attr("transform", "translate("+margin.l+","+margin.t+")");

var xAxis, yAxis, mode = function(d){ return d.date.month(); };
var force = d3.na.force();

d3.queue()
  .defer(d3.json, "data/boston_dom_color.json")
  .defer(d3.json, "data/delhi_dom_color.json")
  .awaitAll(dataLoaded);

function dataLoaded(err, photos) {
  photos = photos[0].map(function(d){ d.city="Boston"; return d;})
    .concat(photos[1].map(function(d){ d.city="Delhi"; return d;}))
    .map(function(d) {
      d.date = new moment(d.dates.taken);
      d.dateuploaded = new moment(+d.dateuploaded*1000);
      return d;
    });
  console.log(photos[0]);
  var nodes = plot.selectAll("g")
    .data(photos)
    .enter()
    .append("g")
    .classed("photosG", true);
  nodes
    .append("image")
    .attr("width", 12)
    .attr("height", 12)
    .attr("xlink:href", function(d){ return getImageURL(d); })
    .style("opacity", 1)
    .on("click", function(d){
      var modeD = mode(d);
      d3.selectAll(".photosG").attr("opacity", function(e){
        return modeD == mode(e) ? 1 : 0.2;
      });
    })
    .on("dblclick", function(d){
      d3.select("#imageDetails").style("opacity", 1);
      d3.select("#description").text(d.description._content);
      d3.select("#selectedImage")
        .attr("src", getImageURL(d, "m"));
      d3.select("#tags")
        .text(d.tags.tag.map(function(e){ return e.raw; }).reduce(function(p, c) { return p==""? c : p+", "+c; }, ""));
    });

  var desiredHeight = vizSVG.attr("height") - margin.t - margin.b,
    desiredWidth = vizSVG.attr("width") - margin.l - margin.r,
    padding = 200, xDomain = ["Boston", "Delhi"];
  console.log((desiredWidth/2)-(padding*xDomain.length/2), (desiredWidth/2)+(padding*xDomain.length/2), padding*xDomain.length);
  var scaleX = d3.scaleOrdinal().domain(["boston", "delhi"]).range([(desiredWidth/4), (desiredWidth*3/4)]),
    scaleY = d3.scaleOrdinal().domain(d3.range(0, 12, 1)).range(d3.range(0, desiredHeight, desiredHeight/12));

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
      console.log(type);
      switch (type) {

        case "month":
          var padding = 200, catCount = 12;
          var scaleY = d3.scaleOrdinal().domain(d3.range(0, 11, 1)).range(d3.range(padding/2, padding*catCount, padding));
          yAxis.scale(scaleY).tickFormat(function(d){ return monthNames[d]; });
          d3.select(".axisY").call(yAxis);
          mode = function(d){ return d.date.month(); }
          force.groupY(mode)
            .scaleY(scaleY);
          setTimeout(force.draw, 0);
          vizSVG.transition().attr("height", padding*(catCount+1));
          yAxisSVG.transition().attr("height", padding*(catCount+1));
          break;

        case "time":
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
          vizSVG.transition().attr("height", padding*(catCount+1));
          yAxisSVG.transition().attr("height", padding*(catCount+1));
          break;

        case "time-upload":
          var padding = 200, catCount = 3;
          var scaleY = d3.scaleOrdinal().domain(["24 hours", "a Week", "a Month", "a Year", "> Year"]).range(d3.range(padding/2, padding*12, padding));
          yAxis.scale(scaleY).tickFormat(null);
          mode = function(d){
            var diff = d.date.toDate().valueOf() - d.dateuploaded.toDate().valueOf();
            diff = Math.abs(diff)/(24*60*60*1000);
            if (diff <= 1) { return "24 hours"; }
            else if (diff <= 7) { return "a Week"; }
            else if (diff <= 30) { return "a Month"; }
            else if (diff <= 30) { return "a Year"; }
            return "After a Year";
          };
          d3.select(".axisY").call(yAxis);
          force
            .groupY(mode)
            .scaleY(scaleY)
          setTimeout(force.draw, 0);
          vizSVG.transition().attr("height", padding*(catCount+1));
          yAxisSVG.transition().attr("height", padding*(catCount+1));
          break;
      }
    });
}
