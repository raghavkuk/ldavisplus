function setupTopicScatterplot() {

    var rangeX = d3.extent(topicData, function(d) {
        return d.x;
    });
    var xRangeDiff = rangeX[1] - rangeX[0];
    var xPadding = 0.05;

    var rangeY = d3.extent(topicData, function(d) {
        return d.y;
    });
    var yRangeDiff = rangeY[1] - rangeY[0];
    var yPadding = 0.05;

    if (xRangeDiff > yRangeDiff) {
        var xScale = d3.scale.linear()
            .range([0, topicVisWidth])
            .domain([rangeX[0] - xPadding * xRangeDiff, rangeX[1] + xPadding * xRangeDiff]);

        var yScale = d3.scale.linear()
            .range([topicVisHeight, 0])
            .domain([rangeY[0] - 0.5 * (xRangeDiff - yRangeDiff) - yPadding * xRangeDiff, rangeY[1] + 0.5 * (xRangeDiff - yRangeDiff) + yPadding * xRangeDiff]);
    } else {
        var xScale = d3.scale.linear()
            .range([0, topicVisWidth])
            .domain([rangeX[0] - 0.5 * (yRangeDiff - xRangeDiff) - xPadding * yRangediff, rangeY[1] + 0.5 * (yRangeDiff - xRangeDiff) + xPadding * yRangeDiff]);

        var yScale = d3.scale.linear()
            .range([topicVisHeight, 0])
            .domain([rangeY[0] - yPadding * yRangeDiff, rangeY[1] + yPadding * yRangeDiff]);
    }


    topicVis = visSvg.append("g")
        .attr("id", "topicsPanel")
        .attr("class", "points")
        .attr("transform", "translate(" + margin.left + "," + 2 * margin.top + ")");

    topicVis
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("height", topicVisHeight)
        .attr("width", topicVisWidth)
        .style("fill", baseColor)
        .attr("opacity", 0)
        .on("click", function() {
            stateReset();
            stateSave(true);
        });

    topicVis.append("line")
        .attr("x1", 0)
        .attr("x2", topicVisWidth)
        .attr("y1", topicVisHeight / 2)
        .attr("y2", topicVisHeight / 2)
        .attr("stroke", "gray")
        .attr("opacity", 0.3);

    topicVis.append("text")
        .attr("x", 0)
        .attr("y", topicVisHeight / 2 - 5)
        .text("PC1")
        // .text(data['plot.opts'].xlab)
        .attr("fill", "gray");


    topicVis.append("line")
        .attr("x1", topicVisWidth / 2)
        .attr("x2", topicVisWidth / 2)
        .attr("y1", 0)
        .attr("y2", topicVisHeight)
        .attr("stroke", "gray")
        .attr("opacity", 0.3);

    topicVis.append("text")
        .attr("x", topicVisWidth / 2 + 5)
        .attr("y", 7)
        .text("PC2")
        // .text(data['plot.opts'].ylab)
        .attr("fill", "gray");

    var points = topicVis.selectAll("points")
        .data(topicData)
        .enter();

    points.append("text")
        .attr("class", "txt")
        .attr("x", function(d) {
            return (xScale(+d.x));
        })
        .attr("y", function(d) {
            return (yScale(+d.y) + 4);
        })
        .attr("stroke", "black")
        .attr("opacity", 1)
        .style("text-anchor", "middle")
        .style("font-size", "11px")
        .style("fontWeight", 100)
        .text(function(d) {
            return d.topics;
        });

    points.append("circle")
        .attr("class", "dot")
        .style("opacity", 0.2)
        .style("fill", baseColor)
        .attr("r", function(d) {
            //return (rScaleMargin(+d.Freq));
            return (Math.sqrt((d.Freq / 100) * topicVisWidth * topicVisHeight * circleProportion / Math.PI));
        })
        .attr("cx", function(d) {
            return (xScale(+d.x));
        })
        .attr("cy", function(d) {
            return (yScale(+d.y));
        })
        .attr("stroke", "black")
        .attr("id", function(d) {
            return (topicId + d.topics)
        })
        .on("mouseover", function(d) {
            var prevTopic = topicId + visState.topic;
            if (visState.topic > 0 && prevTopic != this.id) {
                onTopicUnseleted(document.getElementById(prevTopic));
            }
            onTopicSelected(this);
        })
        .on("click", function(d) {
            // prevent click event defined on the div container from firing 
            // http://bl.ocks.org/jasondavies/3186840
            d3.event.stopPropagation();
            var prevTopic = topicId + visState.topic;
            if (visState.topic > 0 && prevTopic != this.id) {
                onTopicUnseleted(document.getElementById(prevTopic));
            }
            // make sure topic input box value and fragment reflects clicked selection
            document.getElementById(topicId).value = visState.topic = d.topics;
            // state_save(true);
            onTopicSelected(this);
        })
        .on("mouseout", function(d) {
            if (visState.topic != d.topics)
                onTopicUnseleted(this);
            if (visState.topic > 0)
                onTopicSelected(document.getElementById(topicId + visState.topic));
        });

    visSvg.append("text")
        .text("Intertopic Distance Map (via multidimensional scaling)")
        .attr("x", topicVisWidth / 2 + margin.left)
        .attr("y", 30)
        .style("font-size", "16px")
        .style("text-anchor", "middle");
}

function setupTopicLegend() {

    var cx = 10 + largeArea,
        cx2 = cx + 1.5 * largeArea;

    circleGuide = function(rSize, size) {
        d3.select("#topicsPanel").append("circle")
            .attr('class', "circleGuide" + size)
            .attr('r', rSize)
            .attr('cx', cx)
            .attr('cy', topicVisHeight + rSize)
            .style('fill', 'none')
            .style('stroke-dasharray', '2 2')
            .style('stroke', '#999');
        d3.select("#topicsPanel").append("line")
            .attr('class', "lineGuide" + size)
            .attr("x1", cx)
            .attr("x2", cx2)
            .attr("y1", topicVisHeight + 2 * rSize)
            .attr("y2", topicVisHeight + 2 * rSize)
            .style("stroke", "gray")
            .style("opacity", 0.3);
    }

    circleGuide(smallArea, "Small");
    circleGuide(mediumArea, "Medium");
    circleGuide(largeArea, "Large");

    var defaultLabelSmall = "2%";
    var defaultLabelMedium = "5%";
    var defaultLabelLarge = "10%";

    d3.select("#topicsPanel").append("text")
        .attr("x", 10)
        .attr("y", topicVisHeight - 10)
        .attr('class', "circleGuideTitle")
        .style("text-anchor", "left")
        .style("fontWeight", "bold")
        .text("Marginal topic distribtion");
    d3.select("#topicsPanel").append("text")
        .attr("x", cx2 + 10)
        .attr("y", topicVisHeight + 2 * smallArea)
        .attr('class', "circleGuideLabelSmall")
        .style("text-anchor", "start")
        .text(defaultLabelSmall);
    d3.select("#topicsPanel").append("text")
        .attr("x", cx2 + 10)
        .attr("y", topicVisHeight + 2 * mediumArea)
        .attr('class', "circleGuideLabelMedium")
        .style("text-anchor", "start")
        .text(defaultLabelMedium);
    d3.select("#topicsPanel").append("text")
        .attr("x", cx2 + 10)
        .attr("y", topicVisHeight + 2 * largeArea)
        .attr('class', "circleGuideLabelLarge")
        .style("text-anchor", "start")
        .text(defaultLabelLarge);
}