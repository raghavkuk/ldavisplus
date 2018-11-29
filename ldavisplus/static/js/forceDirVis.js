function setupForceDirVis() {

    var normalStroke = 1.5;
    var maxStroke = 4.5;
    var baseNodeSize = 8;
    var maxBaseNodeSize = 36;
    var normalTextSize = 10;
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

    var min_score = 0;
    var max_score = 1;

    var zoom = d3.behavior.zoom()
        .scaleExtent([minZoom, maxZoom]);

    var color = d3.scale.linear()
        .domain([min_score, (min_score + max_score) / 2, max_score])
        .range(["#1f77b4", "#d62728"]);

    var size = d3.scale.pow().exponent(1)
        .domain([1, 100])
        .range([8, 24]);

    var forceGroup = forceDirSvg.append("g");

    var connections = {};

    forceLinks.forEach(function(d) {
        connections[d.source + "," + d.target] = true;
    });

    var forceLayout = d3.layout.force()
        .nodes(forceNodes)
        .links(forceLinks)
        .size([forceDirWidth, forceDirHeight])
        .linkDistance(250)
        .charge(-100)
        .start();

    var link = forceGroup.selectAll(".link")
        .data(forceLinks)
        .enter().append("line")
        .attr("class", "link")
        .style("stroke-width", normalStroke)
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


    var circle = node.append("path")
        .attr("d", d3.svg.symbol()
            .size(function(d) { return Math.PI * Math.pow(size(d.size) || baseNodeSize, 2); })
            .type(function(d) { return d.type; }))

        .style(toColor, function(d) {
            if (isNumber(d.score) && d.score >= 0)
                return color(d.score);
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
            return (size(d.size) || baseNodeSize);
        })
        .text(function(d) { return '\u2002' + d.id; });


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

    // zoom.on("zoom", function() {

    //     var stroke = normalStroke;
    //     if (normalStroke * zoom.scale() > maxStroke)
    //         stroke = maxStroke / zoom.scale();

    //     link.style("stroke-width", stroke);
    //     circle.style("stroke-width", stroke);

    //     var baseRadius = baseNodeSize;
    //     if (baseNodeSize * zoom.scale() > maxBaseNodeSize)
    //         baseRadius = maxBaseNodeSize / zoom.scale();

    //     circle.attr("d", d3.svg.symbol()
    //         .size(function(d) {
    //             return Math.PI * Math.pow(size(d.size) * baseRadius / baseNodeSize || baseRadius, 2);
    //         })
    //         .type(function(d) {
    //             return d.type;
    //         }));

    //     text.attr("dx", function(d) {
    //         return (size(d.size) * baseRadius / baseNodeSize || baseRadius);
    //     });

    //     var textSize = normalTextSize;
    //     if (normalTextSize * zoom.scale() > maxTextSize)
    //         textSize = maxTextSize / zoom.scale();
    //     text.style("font-size", textSize + "px");
    //     forceGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    // });

    // forceDirSvg.call(zoom);

    // resize();

    // d3.select(window).on("resize", resize);

    // function resize() {
    //     var width = forceDirWidth;
    //     var height = forceDirHeight;
    //     forceDirSvg.attr("width", width).attr("height", height);

    //     forceLayout.size([forceLayout.size()[0] + (width - w) / zoom.scale(), force.size()[1] + (height - h) / zoom.scale()]).resume();
    //     w = width;
    //     h = height;
    // }


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
        return connections[a.index + "," + b.index] || connections[b.index + "," + a.index] || a.index == b.index;
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