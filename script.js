var svg = d3.select(".canvas").style("width", (window.innerWidth*10)+"px").style("height", window.innerHeight+"px")
  .append("svg").attr("width", (window.innerWidth*10)+"px").attr("height", window.innerHeight+"px");

d3.json("photos_info.json", function(rawData) {
  // console.log(data);
  var tagsDict = {};
  rawData.map(function(d) {
    var tagsArray = d.photo.tags.tag;
    for (var i in tagsArray) {
      var tag = tagsArray[i]._content;
      tagsDict[tag] = tagsDict[tag] ? tagsDict[tag]+1 : 1;
    }
  })

  var tagsData = _.reduce(tagsDict, function(arr, value, key) {
    arr.push({"tag": key, "count": value});
    return arr;
  }, []);

  console.log(tagsData);

  var scaleX = d3.scaleBand().domain(Object.keys(tagsDict)).range([0, window.innerWidth*10]);
  var scaleY = d3.scaleLinear().domain([0, 60]).range([0, window.innerHeight-70]);

  svg.append("g")
    .selectAll("rect")
    .data(tagsData)
    .enter()
    .append("rect")
    .attr("x", function(d, i) { return scaleX(d.tag)+45; })
    .attr("height", function(d) { return scaleY(d.count); })
    .attr("width", 10)
    .attr("y", function(d) { return window.innerHeight-50-scaleY(d.count); });


  var xAxis = d3.axisBottom()
    .scale(scaleX);

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0,"+(window.innerHeight-30)+")")
    .call(xAxis);

});
