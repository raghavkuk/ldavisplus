function setupForceDirVis() {

    var normalStroke = 1.5;
    var maxStroke = 4.5;
    var baseNodeSize = 8;
    var maxBaseNodeSize = 36;
    var normalTextSize = 15;
    var maxTextSize = 24;
    var defaultNodeColor = "#ccc";
    var defaultLinkColor = "#888";
    var highlightColor = "blue";
    var outline = false;

    var highlightTrans = 0.1;

    var focusNode = null,
        highlightNode = null;

    var minZoom = 0.1;
    var maxZoom = 7;

    var min_score = 0.1;
    var max_score = 0.7;

    var zoom = d3.behavior.zoom()
        .scaleExtent([minZoom, maxZoom]);

    var color = d3.scale.linear()
        // .domain([60, (60+566)/2, 566])
        .domain([min_score, (min_score + max_score) / 2, max_score])
        .range(["#1f77b4", "#d62728"]);

    var size = d3.scale.pow().exponent(1)
        .domain([200, 1700])
        .range([3, 10]);

    // if(typeof forceDirSvg !== "undefined")
        d3.select(forceDirDiv).html("");
    // else{
        forceDirSvg = d3.select(forceDirDiv)
                        .append("svg")
                        .attr("width", forceDirWidth + margin.left + margin.right)
                        .attr("height", forceDirHeight + 2 * margin.top + margin.bottom + maxTopicRadius);
    // }

    var forceGroup = forceDirSvg.append("g");

    var connections = {};

    forceLinks.forEach(function(d) {
        connections[d.source + "," + d.target] = true;
    });

    // var set1 = {};
    // for(var i=0; i<forceLinks.length; i++){
    //     set1[forceLinks[i]["\"source\""]] = true;
    //     set1[forceLinks[i]["\"target\""]] = true;
    //     console.log(forceLinks[i]);
    // }

    // var set2 = {};
    // for(var i=0; i<forceNodes.length; i++){
    //     set2[forceNodes[i]["\"id\""]] = true;
    //     console.log(forceNodes[i]);
    // }

    // console.log(set1);
    // console.log(set2);

    var edges = [];

    forceLinks.forEach(function(e) {
        var sourceNode = forceNodes.filter(function(n){
            return n.id === e.source;
        })[0],
        targetNode = forceNodes.filter(function(n){
            return n.id === e.target;
        })[0];

        edges.push({
            source: sourceNode,
            target: targetNode,
            value: 10
        });
    });

    var forceLayout = d3.layout.force()
        .nodes(forceNodes)
        .links(edges)
        .size([forceDirWidth, forceDirHeight])
        .linkDistance(250)
        .charge(-100)
        .start();

    var link = forceGroup.selectAll(".link")
        .data(edges)
        .enter().append("line")
        .attr("class", "link")
        .style("stroke-width", function(d){
            var x =  countOccurences(edges, d.source);
            return (d.source.weight+d.target.weight)*(d.source.weight+d.target.weight)/400;
        })
        .style("stroke", function(d) {
            if (isNumber(d.score) && d.score >= 0)
                return color(d.score);
            else
                return defaultLinkColor;
        });


    var node = forceGroup.selectAll(".node")
        .data(forceNodes)
        .enter().append("g")
        .attr("class", "node")
        .call(forceLayout.drag);

    node.on("dblclick.zoom", function(d) {
        d3.event.stopPropagation();
        var dcx = (forceDirWidth / 2 - d.x * zoom.scale());
        var dcy = (forceDirHeight / 2 - d.y * zoom.scale());
        zoom.translate([dcx, dcy]);
        forceGroup.attr("transform", "translate(" + dcx + "," + dcy + ")scale(" + zoom.scale() + ")");
    });

    node.on("mouseover", function(d) {

        d3.event.stopPropagation();
        focusNode = d;
        setFocus(d);

    }).on("mouseout", function(d) {
        exitFocus();
    });

    var toColor = "fill";
    var toWhite = "stroke";
    if (outline) {
        toColor = "stroke"
        toWhite = "fill"
    }

    function countOccurences(links, v){
        var count = 0;
        for(var i=0; i<links.length; i++){
            if(links[i].source == v)
                count++;
            if(links[i].target == v)
                count++;
        }
        return count;
    }


    var circle = node.append("path")
        .attr("d", d3.svg.symbol()
            .size(function(d) { return Math.PI * Math.pow(size(d['size']) || baseNodeSize, 0.9); })
            .type(function(d) { return "circle"; }))

        .style(toColor, function(d) {
            if (isNumber(d['score']) && d['score'] >= 0)
                return color(d['score']);
            else
                return defaultNodeColor;
        })
        .style("stroke-width", normalStroke)
        .style(toWhite, "white");

    var text = forceGroup.selectAll(".text")
        .data(forceNodes)
        .enter().append("text")
        .attr("dy", ".35em")
        .style("font-size", normalTextSize + "px")
        .attr("dx", function(d) {
            return (baseNodeSize);
        })
        .text(function(d) { return '\u2002' + d['name']; });

    var legend = forceDirSvg.append("text")
                    .attr("x", "50")
                    .attr("y", forceDirHeight + 45)
                    .style("font-size", "16px")
                    .text("Co-Occurence of the top terms for the selected topic.");


    forceLayout.on("tick", function() {

        node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
        text.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

        link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        node.attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
    });

    // d3.select(forceDirDiv)
    //     .append("text")
    //     .attr("x", 5)
    //     .attr("y", forceDirHeight + 10)
    //     // .style("dominant-baseline", "middle")
    //     .text("Co-Occurence of the top terms for the selected topic.");


    function isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    function setFocus(d) {
        if (highlightTrans < 1) {
            circle.style("opacity", function(o) {
                return isConnected(d, o) ? 1 : highlightTrans;
            });

            text.style("opacity", function(o) {
                return isConnected(d, o) ? 1 : highlightTrans;
            });

            link.style("opacity", function(o) {
                return o.source.index == d.index || o.target.index == d.index ? 1 : highlightTrans;
            });
        }
    }

    function isConnected(a, b) {
        return connections[a.id + "," + b.id] || connections[b.id + "," + a.id] || a.id == b.id;
    }

    function exitFocus() {

        if (focusNode !== null) {
            focusNode = null;
            if (highlightTrans < 1) {

                circle.style("opacity", 1);
                text.style("opacity", 1);
                link.style("opacity", 1);
            }
        }
    }
}