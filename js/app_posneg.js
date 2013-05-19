
var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 1150 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

var parseDate = d3.time.format("%Y-%m-%d %Hh").parse;

var formatNumber = d3.format(",.0f");

var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.log()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
	.ticks(5,function(d, i) {
		return formatNumber(d) - 1;
	});

var area = d3.svg.area()
    .x(function(d) { return x(d.hour); })
    .y0(height)
    .y1(function(d) { return y(d.pos_count); });

var svg = d3.select("#posnegtweetvis").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.json("data/twitter/hourly_sums.json", function(data) {
  data.forEach(function(d) {
    d.hour = parseDate(d.hour);
	d.pos_count += 1;
  });

  x.domain(d3.extent(data, function(d) { return d.hour; }));
  y.domain([1, d3.max(data, function(d) { return d.pos_count; })]);

  svg.append("path")
      .datum(data)
      .attr("class", "area")
      .attr("d", area);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Positive count");
	  
  svg.selectAll('g.generator')
	  .data(data)
	  .enter().append("svg:circle")
	  .attr("cx",function(d){ return x(d.hour);})
	  .attr("cy", function(d){ return y(d.pos_count);})
	  .attr("r", function(d){ return 2;});
});