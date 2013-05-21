var pos_count = neg_count = 0;
d3.json("data/twitter/hourly_sums.json", function(data) {
	data.forEach(function(d) {
		pos_count = pos_count + d.pos_count;
		neg_count = neg_count + d.neg_count;
	});
	var total = pos_count + neg_count;
	var dataset = [{key:"pos", value: pos_count}, {key:"neg", value: neg_count}];

	d3.select("#posnegtweetbarvis")
		.selectAll("div")
		.data(dataset)
		.enter()
		.append("div")
		.style("background-color", function(d) { return (d.key == "pos") ? "cornflowerblue" : "#ff4e4e"; })	
		.style("width", 25)
		//.style("vertical-align", "middle")
		.style("height", function(d) {
			return (500/total) * d.value + "px";
		});
});