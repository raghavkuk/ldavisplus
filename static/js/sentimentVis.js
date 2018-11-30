function setupSentimentVis() {

    var padding = 25;
    var topicSelected = visState.topic;

    //Scale function for axes and radius
    var max = sentimentData[topicSelected-1][0].conf;
    var min = sentimentData[topicSelected-1][0].conf;

    for(var i=0; i<sentimentData[topicSelected-1].length; i++){
    	if(sentimentData[topicSelected-1][i].conf < min)
    		min = sentimentData[topicSelected-1][i].conf;
    	if(sentimentData[topicSelected-1][i].conf > max)
    		max = sentimentData[topicSelected-1][i].conf;
    }

    min = min < 0 ? min : 0;

    var yScale = d3.scale.linear()
        .domain([min, max])
        // .domain(d3.extent(sentimentData[topicSelected-1], function(d) { return d.conf; }))
        .range([sentimentVisWidth + padding, padding]);

    var xScale = d3.scale.ordinal()
        .domain(sentimentData[topicSelected - 1].map(function(d) { return d.doc_id; }))
        .rangeRoundBands([padding, sentimentVisHeight + padding], .5);

    //To format axis as a percent
    var formatPercent = d3.format("%1");

    //Create y axis
    var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(5).tickFormat(formatPercent);

    //Define key function
    var key = function(d) { return d.doc_id };

    var tooltipDiv = d3.select(sentimentDiv).append("div")   
  							.attr("class", "tooltip")               
  							.style("opacity", 0);;

    //Create barchart
    sentimentSvg.selectAll("rect")
        .data(sentimentData[topicSelected - 1], key)
        .enter()
        .append("rect")
        .attr("class", function(d) {
            if (d.pol == "positive")
                return "positive";
            else if (d.pol == "negative")
                return "negative";
            else
                return "neutral";
        })
        .attr({
            x: function(d) {
                return xScale(d.doc_id);
            },
            y: function(d) {
                return yScale(Math.max(0, d.conf));
            },
            width: xScale.rangeBand(),
            height: function(d) {
                return Math.abs(yScale(d.conf) - yScale(0));
            }
        })
        .on('mouseover', function(d) {
            d3.select(this)
                .style("opacity", 0.5)
                .style("stroke", "black");

            var info = tooltipDiv
                .style("opacity", 1)
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY - 30) + "px")
                .text("Document: " + d.doc_id);

            // var perc = formatPercent(d.conf);
            info.append("p")
                    .text("Confidence: " + formatPercent(Math.abs(d.conf)));



        })
        .on('mouseout', function(d) {
            d3.select(this)
                .style({ 'stroke-opacity': 0.5, 'stroke': '#a8a8a8' })
                .style("opacity", 1);

            tooltipDiv.style("opacity", 0);

        });

    //Add y-axis
    sentimentSvg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(40,0)")
        .call(yAxis);
}