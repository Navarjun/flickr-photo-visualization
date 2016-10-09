function ns_colorgraph() {
  this.svg = d3.select("#div-container-color")
              .append("svg")
              .attr("width", $("#div-container-color").innerWidth())
              .attr("height", innerHeight*(2/3));
  this.canvas = {
    origin: {x: 30,y: 30},
    size: {width: svg.attr("width") - 60, height: svg.attr("height") - 60}
  };

  var ns = this;

  d3.json("/data/photos_info_boston_colors.json", function(rawData) {
    rawData = rawData.filter(function(d){
        return d.dates.taken;
      }).map(function(d) {
        d.dates.taken = new moment(d.dates.taken);
        return d;
      });
    // CATEGORIZE BASED ON MONTH
    var data = d3.nest()
                .key(function(d) { return d.dates.taken.month(); })
                .entries(rawData);

    console.log(data);
    ns.svg.attr("height", d3.max(data.map(function(d){ return d.values.length;}))*6 + 100);
    ns.canvas.size.height = d3.max(data.map(function(d){ return d.values.length;}))*6 + 40;
    ns.scaleX = d3.scaleBand().domain(d3.range(0, 12, 1)).range([canvas.origin.x, canvas.origin.x + canvas.size.width]).paddingOuter(5).paddingInner(0.1);
    ns.scaleY = d3.scaleLinear().domain([0, 23]).range([canvas.origin.y + canvas.size.height, canvas.origin.y]);

    ns.axisX = d3.axisBottom().scale(ns.scaleX);

    ns.svg.append("g")
            .attr("transform", "translate(0,"+(ns.canvas.origin.y+ns.canvas.size.height)+")")
            .call(ns.axisX);

    var gs = ns.svg.append('g')
          .selectAll("g")
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
          .attr("transform", function(d, i) { return "translate(0, "+(ns.scaleY.range()[0]-5-i*5.5)+")"; });
        gs.on('click', function(d) {
          d3.select("#cool").html("<img src='"+getImageURL(d)+"'/>");
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
          .attr("y", 0)
          .attr("width", function(d,i){ return ns.scaleX.bandwidth()/(Math.pow(2,i+1)); })
          .attr("height", 6)
          .attr("fill", function(d,i){ return "rgba("+d._rgb[0]+","+d._rgb[1]+","+d._rgb[2]+", 1)"; });
  });
}

function categorize(d) {
  if (d < 120) { return 0; }
  else if (d < 240) { return 1; }
  else if (d < 360) { return 3; }
}

function getImageURL(photoInfo) {
  console.log(photoInfo);
  var photoId = photoInfo.id;
  var farmId = photoInfo.farm;
  var serverId = photoInfo.server;
  var secret = photoInfo.secret;

  return "https://farm"+farmId+".staticflickr.com/"+serverId+"/"+photoId+"_"+secret+"_m.jpg";
}

ns_colorgraph();
