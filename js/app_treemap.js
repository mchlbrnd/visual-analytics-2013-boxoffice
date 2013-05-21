// create treemap legend
var svg = d3.select("#casttreemapvislegend")
		.append("svg:svg")
		.attr("width", 100)
		.attr("height", 10);

var gradient = svg.append("svg:defs")
  .append("svg:linearGradient")
	.attr("id", "gradient")
	.attr("r0", "0%")
	.attr("r5", "50%")
	.attr("r10", "100%")
	.attr("spreadMethod", "pad");

gradient.append("svg:stop")
	.attr("offset", "0%")
	.attr("stop-color", "#ff4e4e")
	.attr("stop-opacity", 1);

gradient.append("svg:stop")
	.attr("offset", "50%")
	.attr("stop-color", "#ffffff")
	.attr("stop-opacity", 1);

gradient.append("svg:stop")
	.attr("offset", "100%")
	.attr("stop-color", "cornflowerblue")
	.attr("stop-opacity", 1);

svg.append("svg:rect")
	.attr("width", 100)
	.attr("height", 10)
	.style("fill", "url(#gradient)");


// create treemap
var chartWidth = 1024 - 80;
var chartHeight = 800 - 180;
var xscale = d3.scale.linear().range([0, chartWidth]);
var yscale = d3.scale.linear().range([0, chartHeight]);
var color = d3.scale.linear()
	.domain([0, 5, 10])
	.range(["#ff4e4e", "white", "cornflowerblue"]);

var headerHeight = 20;
var headerColor = "#555555";
var transitionDuration = 500;
var root;
var node;

var treemap = d3.layout.treemap()
		.round(false)
		.size([chartWidth, chartHeight])
		.sticky(true)
		.padding([headerHeight + 1, 1, 1, 1])
		.value(function(d) {
			return d.ow_recode;
		});

var chart = d3.select("#casttreemapvis")
		.append("svg:svg")
		.attr("width", chartWidth)
		.attr("height", chartHeight)
		.append("svg:g");
	
d3.json("data/imdb/Texas Chainsaw 3D (2013).json", function(data) {
	node = root = data;
	
	var nodes = treemap.nodes(root);

	var children = nodes.filter(function(d) {
		return !d.children;
	});
	var parents = nodes.filter(function(d) {
		return d.children;
	});
	
	// output totals to text
	d3.select(".help-wrapper")
		.append("p")
		.text(function(d) {
			total_openingweekend = total_movies = total_rating = 0;
			children.forEach(function(c) {
				total_rating += c.rating;
				total_movies += 1;
				total_openingweekend += c.ow_recode;
			});
			return "The complete cast played in a total of {0} movies with a mean rating of {2}. The total opening weekend revenue weigthed by the cast member's position in credits is ${1}. "
				.format(total_movies, total_openingweekend, Number(total_rating/total_movies).toFixed(1));
		});

	// create parent cells
	var parentCells = chart.selectAll("g.cell.parent")
			.data(parents, function(d) {
				return "p-" + d.name;
			});
	var parentEnterTransition = parentCells.enter()
			.append("g")
			.attr("class", "cell parent")
			.on("click", function(d) {
				zoom(d);
			});
	parentEnterTransition.append("rect")
			.attr("width", function(d) {
				return Math.max(0.01, d.dx - 1);
			})
			.attr("height", headerHeight)
			.style("fill", headerColor);
	parentEnterTransition.append('foreignObject')
			.attr("class", "foreignObject")
			.append("xhtml:body")
			.attr("class", "labelbody")
			.append("div")
			.attr("class", "label");
	// update transition
	var parentUpdateTransition = parentCells.transition().duration(transitionDuration);
	parentUpdateTransition.select(".cell")
			.attr("transform", function(d) {
				return "translate(" + d.dx + "," + d.y + ")";
			});
	parentUpdateTransition.select("rect")
			.attr("width", function(d) {
				return Math.max(0.01, d.dx - 1);
			})
			.attr("height", headerHeight)
			.style("fill", headerColor);
	parentUpdateTransition.select(".foreignObject")
			.attr("width", function(d) {
				return Math.max(0.01, d.dx - 1);
			})
			.attr("height", headerHeight)
			.select(".labelbody .label")
			.attr("style", function(d) {
				return "width:" + Math.max(0.01, (d.dx - 1)) + "px;" +
					   "height:" + headerHeight + "px;";
			});
	// remove transition
	parentCells.exit()
			.remove();

	// create children cells
	var childrenCells = chart.selectAll("g.cell.child")
			.data(children, function(d) {
				return "c-" + d.name;
			});
	// enter transition
	var childEnterTransition = childrenCells.enter()
			.append("g")
			.attr("class", "cell child")
			.text(function(d) { 
				return d.name + "$" + d.ow_recode + "(" + d.rating + ")"; 
			})
			.on("click", function(d) {
				zoom(node === d.parent ? root : d.parent);
			});
	childEnterTransition.append("rect")
			.classed("background", true)
			.style("fill", function(d) {
				return color(d.rating);
			});
	childEnterTransition.append('foreignObject')
			.attr("class", "foreignObject")
			.attr("width", function(d) {
				return Math.max(0.01, d.dx - 1);
			})
			.attr("height", function(d) {
				return Math.max(0.01, d.dy - 1);
			})
			.style("display", "none")
			.append("xhtml:body")
			.attr("class", "labelbody")
			.append("div")
			.attr("class", "label")
			.text(function(d) {
				(d.children) ? d.name : d.name + "$" + d.ow_recode + "(" + d.rating + ")";
			});
	// update transition
	var childUpdateTransition = childrenCells.transition().duration(transitionDuration);
	childUpdateTransition.select(".cell")
			.attr("transform", function(d) {
				return "translate(" + d.x  + "," + d.y + ")";
			});
	childUpdateTransition.select("rect")
			.attr("width", function(d) {
				return Math.max(0.01, d.dx - 1);
			})
			.attr("height", function(d) {
				return (d.dy - 1);
			})
			.style("fill", function(d) {
				return color(d.rating);
			});
	childUpdateTransition.select(".foreignObject")
			.attr("width", function(d) {
				return Math.max(0.01, d.dx - 1);
			})
			.attr("height", function(d) {
				return Math.max(0.01, d.dy - 1);
			})
			.select(".labelbody .label")
			.attr("style", function(d) {
				return "width:"  + Math.max(0.01, (d.dx - 1)) + "px;" +
					   "height:" + (d.dy - 1) + "px;";
			})
			.text(function(d) {
				(d.children) ? d.name : d.name + "$" + d.ow_recode + "(" + d.rating + ")";
			});
	// exit transition
	childrenCells.exit()
			.remove();
	zoom(node);
});

function size(d) {
	return d.size;
}

function count(d) {
	return 1;
}

String.prototype.format = function() {
    var formatted = this;
    for (var i = 0; i < arguments.length; i++) {
        var regexp = new RegExp('\\{'+i+'\\}', 'gi');
        formatted = formatted.replace(regexp, arguments[i]);
    }
    return formatted;
};

//and another one
function textHeight(d) {
	var ky = chartHeight / d.dy;
	yscale.domain([d.y, d.y + d.dy]);
	return (ky * d.dy) / headerHeight;
}

function getRGBComponents (color) {
	var r = color.substring(1, 3);
	var g = color.substring(3, 5);
	var b = color.substring(5, 7);
	return {
		R: parseInt(r, 16),
		G: parseInt(g, 16),
		B: parseInt(b, 16)
	};
}


function idealTextColor (bgColor) {
	var nThreshold = 105;
	var components = getRGBComponents(bgColor);
	var bgDelta = (components.R * 0.299) + (components.G * 0.587) + (components.B * 0.114);
	return ((255 - bgDelta) < nThreshold) ? "#000000" : "#ffffff";
}

function zoom(d) {
	this.treemap
			.padding([headerHeight/(chartHeight/d.dy), 0, 0, 0])
			.nodes(d);

	// moving the next two lines above treemap layout messes up padding of zoom result
	var kx = chartWidth  / d.dx;
	var ky = chartHeight / d.dy;
	var level = d;

	xscale.domain([d.x, d.x + d.dx]);
	yscale.domain([d.y, d.y + d.dy]);

	if (node != level) {
		chart.selectAll(".cell.child .foreignObject").style("display", "none");

	}

	var zoomTransition = chart.selectAll("g.cell").transition().duration(transitionDuration)
			.attr("transform", function(d) {
				return "translate(" + xscale(d.x) + "," + yscale(d.y) + ")";
			})
			.each("start", function() {
				d3.select(this).select("label")
						.style("display", "none");
			})
			.each("end", function(d, i) {
				if (!i && (level !== self.root)) {
					chart.selectAll(".cell.child")
						.filter(function(d) {
							return d.parent === self.node; // only get the children for selected group
						})
						.select(".foreignObject")
						.style("display", "")
						.style("color", function(d) {
							return idealTextColor(color(d.rating));
						});
				}
			});

	zoomTransition.select(".foreignObject")
			.attr("width", function(d) {
				return Math.max(0.01, kx * d.dx - 1);
			})
			.attr("height", function(d) {
				return d.children ? headerHeight: Math.max(0.01, ky * d.dy - 1);
			})
			.select(".labelbody .label")
			.attr("style", function(d) {
				return "width:"  + Math.max(0.01, (kx * d.dx - 1)) + "px;" +
					   "height:" + (d.children ? headerHeight + "px": ky * d.dy - 1 + "px;");
			})
			.text(function(d) {
				return (d.children) ? d.name : d.name + "\n$" + d.ow_recode + "\n(" + d.rating + ")";
			});

	// update the width/height of the rects
	zoomTransition.select("rect")
			.attr("width", function(d) {
				return Math.max(0.01, kx * d.dx - 1);
			})
			.attr("height", function(d) {
				return d.children ? headerHeight : Math.max(0.01, ky * d.dy - 1);
			})
			.style("fill", function(d) {
				return d.children ? headerColor : color(d.rating);
			});

	node = d;

	if (d3.event) {
		d3.event.stopPropagation();
	}
}
