var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var data = [];
var ns = {};
ns.colorgraph = function() {
  ns.svg = d3.select("#div-container-color")
              .append("svg")
              .attr("width", $("#div-container-color").innerWidth())
              .attr("height", innerHeight*(2/3));
  ns.canvas = {
    origin: {x: 60,y: 30}
  };
  ns.canvas.size = {width: ns.svg.attr("width") - ns.canvas.origin.x * 2, height: ns.svg.attr("height") - ns.canvas.origin.y * 2};

  var q = d3.queue()
    .defer(d3.json, "data/photos_info_boston_colors.json")
    .defer(d3.json, "data/photos_info_delhi_colors.json")
    .await(function(error, boston, delhi) {
      if (error) throw error;
      data.push({city: "Boston", data:boston.map(function(d) {
          d.dates.taken = new moment(d.dates.taken);
          return d;
        })
      });
      data.push({city: "Delhi", data:delhi.map(function(d) {
          d.dates.taken = new moment(d.dates.taken);
          return d;
        })
      });
      ns.visualize(data[0].data);
    });
};

ns.visualize = function(rawData) {
  // CATEGORIZE BASED ON MONTH
  var data = d3.nest()
              .key(function(d) { return d.dates.taken.month(); })
              .key(function(d) {
                if (d.dates.taken.hour() > 4 && d.dates.taken.hour() <= 12) {
                  return "morning";
                } else if (d.dates.taken.hour() > 12 && d.dates.taken.hour() <= 17) {
                  return "afternoon";
                } else {
                  return "night";
                }
              })
              .entries(rawData);

  var maxPhotosInSection = d3.max(data, function(d) {
    return d3.max(d.values, function(e){
        return e.values.length;
      });
  });

  var maxPhotosInMorning = d3.max(data, function(d) {
    return d.values.filter(function(e){
        return e.key == "morning";
      })[0].values.length;
  });
  var maxPhotosInAfternoon = d3.max(data, function(d) {
    return d.values.filter(function(e){
        return e.key == "afternoon";
      })[0].values.length;
  });
  var maxPhotosInNight = d3.max(data, function(d) {
    return d.values.filter(function(e){
        return e.key == "night";
      })[0].values.length;
  });
  var maxPhotosSum = maxPhotosInMorning + maxPhotosInNight + maxPhotosInAfternoon;
  console.log(data, maxPhotosInSection, maxPhotosInMorning, maxPhotosInAfternoon, maxPhotosInNight);
  var cellHeight = 4;
  var sectionPadding = 30;

  ns.canvas.size.height = ((maxPhotosInMorning + maxPhotosInAfternoon + maxPhotosInNight)*cellHeight + sectionPadding*3);
  ns.svg.attr("height", ns.canvas.size.height + ns.canvas.origin.y*2);
  ns.scaleX = d3.scaleBand().domain(d3.range(0, 12, 1)).range([0, ns.canvas.size.width]).paddingOuter(5).paddingInner(0.1);
  ns.scaleY = d3.scaleOrdinal().domain(["morning", "afternoon", "night"]).range([ns.canvas.size.height, (ns.canvas.size.height)*(maxPhotosInNight + maxPhotosInAfternoon)/maxPhotosSum, (ns.canvas.size.height)*(maxPhotosInNight)/maxPhotosSum]);

  ns.axisX = d3.axisBottom().scale(ns.scaleX).tickFormat(function(d) { return monthNames[d]; });
  ns.axisY = d3.axisLeft().scale(ns.scaleY);
  if (ns.axisXGMorning) {
    ns.axisXGMorning.remove();
    ns.axisXGAfternoon.remove();
    ns.axisXGNight.remove();
    ns.axisYG.remove();
  }

  ns.axisXGMorning = ns.svg.append("g")
          .attr("transform", "translate("+ns.canvas.origin.x+","+(ns.scaleY.range()[0]+30)+")")
          .call(ns.axisX);
  ns.axisXGAfternoon = ns.svg.append("g")
          .attr("transform", "translate("+ns.canvas.origin.x+","+(ns.scaleY.range()[1]+30)+")")
          .call(ns.axisX);
  ns.axisXGNight = ns.svg.append("g")
          .attr("transform", "translate("+ns.canvas.origin.x+","+(ns.scaleY.range()[2]+30)+")")
          .call(ns.axisX);
  ns.axisYG = ns.svg.append("g")
          .classed("yAxis", true)
          .attr("transform", "translate("+ns.canvas.origin.x+","+ns.canvas.origin.y+")")
          .call(ns.axisY);

  if (!ns.gs) {
    ns.gs = ns.svg.append('g')
          .attr("transform", "translate("+(ns.canvas.origin.x)+","+(ns.canvas.origin.y)+")");
  } else {
    ns.gs.remove();
    ns.gs = ns.svg.append('g')
          .attr("transform", "translate("+(ns.canvas.origin.x)+","+(ns.canvas.origin.y)+")");
  }
  var gs = ns.gs.selectAll("g")
        .data(data)
        .enter()
        .append("g")
        .attr("transform", function(d) { return "translate("+ns.scaleX(d.key)+", 0)"; })
        .selectAll("g")
        .data(function(d) {
          return d.values;
        })
        .enter()
        .append("g")
        .attr("transform", function(d, i) { return "translate(0, "+ns.scaleY(d.key)+")"; })
        .selectAll("g")
        .data(function(d) {
          var c = d.values.sort(function(a, b) {
            var colorA = a.colors[0]._rgb, colorCatA = getColorCategory(colorA);
            var colorB = b.colors[0]._rgb, colorCatB = getColorCategory(colorB);
            if (colorCatA == colorCatB) {
              switch (colorCatA) {
                case "red":
                  return colorA[0] > colorB[0];
                case "green":
                  return colorA[1] > colorB[1];
                default:
                  return colorA[2] > colorB[2];
              }
            } else {
              colorCatA = colorCatA == "red" ? 3 : (colorCatA == "green" ? 2 : 1);
              colorCatB = colorCatB == "red" ? 3 : (colorCatB == "green" ? 2 : 1);
              return colorCatA > colorCatB;
            }
          });
          return c;
        })
        .enter()
        .append("g")
        .attr("transform", function(d, i) { return "translate(0, -"+(cellHeight*i)+")"; });
      gs.on('click', function(d) {
        console.log("d", d);
        d3.select("#cool").html("<a href='"+getImageURL(d)+"'><img src='"+getImageURL(d)+"'/></a>");
      });
      gs.selectAll("rect")
        .data(function(d) { return d.colors; })
        .enter()
        .append("rect")
        .attr("x", function(d, i){
          if (i === 0) { return 0; }
          else {
            var sum = 0;
            var lastFraction = ns.scaleX.bandwidth();
            for (var j = 0; j < i; j++) {
              lastFraction = lastFraction/2;
              sum += lastFraction;
            }
            return sum;
          }
        })
        .attr("y", -cellHeight)
        .attr("width", function(d,i){ return ns.scaleX.bandwidth()/(Math.pow(2,i+1)); })
        .attr("height", cellHeight)
        .attr("fill", function(d,i){ return "rgba("+d._rgb[0]+","+d._rgb[1]+","+d._rgb[2]+", 1)"; });
};

function categorize(d) {
  if (d < 120) { return 0; }
  else if (d < 240) { return 1; }
  else if (d < 360) { return 3; }
}

function getImageURL(photoInfo) {
  var photoId = photoInfo.id;
  var farmId = photoInfo.farm;
  var serverId = photoInfo.server;
  var secret = photoInfo.secret;

  return "https://farm"+farmId+".staticflickr.com/"+serverId+"/"+photoId+"_"+secret+"_m.jpg";
}

function getColorCategory(_rgb) {
  if (_rgb[0] > _rgb[1] && _rgb[0] > _rgb[2]) {
    return "red";
  } else if (_rgb[1] > _rgb[0] && _rgb[1] > _rgb[2]) {
    return "green";
  } else {
    return "blue";
  }
}

var switchData = function(index, ele) {
  d3.selectAll("button.btn").classed("active", false);
  d3.select(ele).classed("active", true);
  ns.visualize(data[index].data);
};

ns.colorgraph();
