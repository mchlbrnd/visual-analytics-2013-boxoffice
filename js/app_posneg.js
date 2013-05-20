
var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 1150 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

var parseDate = d3.time.format("%Y-%m-%d %Hh").parse;
var formatTime = d3.time.format("%d %b %Hh");

var formatNumber = d3.format(",.0f");

var x = d3.time.scale()
    .range([0, width]);

var yp = d3.scale.log()
    .range([height, 0]);
	
var yn = d3.scale.log()
    .range([0, height]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var ypAxis = d3.svg.axis()
    .scale(yp)
    .orient("left")
	.ticks(5,function(d, i) {
		return formatNumber(d) - 1;
	});
	
var ynAxis = d3.svg.axis()
    .scale(yn)
    .orient("left")
	.ticks(5,function(d, i) {
		return formatNumber(d) - 1;
	});

var area_pos = d3.svg.area()
    .x(function(d) { return x(d.hour); })
    .y0(height)
    .y1(function(d) { return yp(d.pos_count); });
	
var area_neg = d3.svg.area()
    .x(function(d) { return x(d.hour); })
    .y0(function(d) { return yn(d.neg_count); })
    .y1(0);

var svg = d3.select("#posnegtweetvis").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", 2 * height + margin.top + 2 * margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
var ttip = d3.select("#posnegtweetvis").append("div")   
    .attr("class", "tooltip")               
    .style("opacity", 0)
	.on("mouseout", function(d) {       
		ttip.transition()        
			.duration(500)      
			.style("opacity", 0)
			.each("end", function() {
			  d3.select(this).style("top", "30px");
			});
	});

d3.json("data/twitter/hourly_sums.json", function(data) {
  data.forEach(function(d) {
    d.hour = parseDate(d.hour);
	d.pos_count += 1;
	d.neg_count += 1;
  });

  x.domain(d3.extent(data, function(d) { return d.hour; }));
  yp.domain([1, d3.max(data, function(d) { return d.pos_count; })]);
  yn.domain([1, d3.max(data, function(d) { return d.neg_count; })]);

  svg.append("path")
      .datum(data)
      .attr("class", "area posarea")
      .attr("d", area_pos);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis positive")
      .call(ypAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Positive count");
	  
  svg.append("g").selectAll('g.generator')
	  .data(data)
	  .enter().append("svg:circle")
	  .attr("class", "positive")
	  .attr("cx", function(d){ return x(d.hour);})
	  .attr("cy", function(d){ return yp(d.pos_count);})
	  // hide datapoints with value 0 (is 1 due to log scale)
	  .attr("r", function(d){
			if (d.pos_count > 1) {return 2}
			else {return 0};
			})
	  .on("mouseover", function(d) {      
		ttip.transition()        
			.duration(200)      
			.style("opacity", .9);      
		ttip.html(formatTime(d.hour) + "<br/>"  + d.pos_terms)
			.style("background", "cornflowerblue")
			.style("left", (d3.event.pageX) + "px")     
			.style("top", (d3.event.pageY - 28) + "px");    
		});

	  
  var neg = svg.append("g")
	  .attr("class", "negative")
	  .attr("transform", "translate(0," + (height + margin.bottom) + ")");
	  
	  neg.append("path")
		.datum(data)
		.attr("class", "area negarea")
		.attr("d", area_neg);
		
	  neg.append("g")
		.attr("class", "y axis negative")
		.call(ynAxis)
      .append("text")
		.attr("transform", "rotate(-90)")
		.attr("x", -0.9*height)
		.attr("y", 6)
		.attr("dy", ".71em")
		.style("text-anchor", "start")
		.text("Negative count");
		
	  neg.append("g").selectAll('g.generator')
		.data(data)
		.enter().append("svg:circle")
		.attr("cx", function(d){ return x(d.hour);})
		.attr("cy", function(d){ return yn(d.neg_count);})
		// hide datapoints with value 0 (is 1 due to log scale)
		.attr("r", function(d){
			if (d.neg_count > 1) {return 2}
			else {return 0};
			})
		.on("mouseover", function(d) {      
		ttip.transition()        
			.duration(200)      
			.style("opacity", .9);      
		ttip.html(formatTime(d.hour) + "<br/>"  + d.neg_terms)
			.style("background", "gold")
			.style("left", (d3.event.pageX) + "px")     
			.style("top", (d3.event.pageY - 28) + "px");    
		});
});