function setupSentimentVis() {

    var dataset = [
        { "document": 1, "polarity": 0.76, "category": "positive" },
        { "document": 2, "polarity": 0.24, "category": "positive" },
        { "document": 3, "polarity": -0.54, "category": "negative" },
        { "document": 4, "polarity": 0.90, "category": "positive" },
        { "document": 5, "polarity": -0.66, "category": "negative" },
        { "document": 6, "polarity": -0.20, "category": "negative" },
        { "document": 7, "polarity": 0.70, "category": "positive" },
        { "document": 8, "polarity": -0.85, "category": "negative" },
        { "document": 9, "polarity": 0.40, "category": "positive" },
        { "document": 10, "polarity": 0.55, "category": "positive" }
    ]

    var padding = 25;

    //Scale function for axes and radius
    var yScale = d3.scale.linear()
        .domain(d3.extent(dataset, function(d) { return d.polarity; }))
        .range([sentimentVisWidth + padding, padding]);

    var xScale = d3.scale.ordinal()
        .domain(dataset.map(function(d) { return d.document; }))
        .rangeRoundBands([padding, sentimentVisHeight + padding], .5);

    //To format axis as a percent
    var formatPercent = d3.format("%1");

    //Create y axis
    var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(5).tickFormat(formatPercent);

    //Define key function
    var key = function(d) { return d.document };

    div = d3.select(sentimentDiv);

    //Create barchart
    sentimentSvg.selectAll("rect")
        .data(dataset, key)
        .enter()
        .append("rect")
        .attr("class", function(d) { return d.category == "negative" ? "negative" : "positive"; })
        .attr({
            x: function(d) {
                return xScale(d.document);
            },
            y: function(d) {
                return yScale(Math.max(0, d.polarity));
            },
            width: xScale.rangeBand(),
            height: function(d) {
                return Math.abs(yScale(d.polarity) - yScale(0));
            }
        })
        .on('mouseover', function(d) {
            d3.select(this)
                .style("opacity", 0.2)
                .style("stroke", "black")


        })
        .on('mouseout', function(d) {
            d3.select(this)
                .style({ 'stroke-opacity': 0.5, 'stroke': '#a8a8a8' })
                .style("opacity", 1);

        });

    //Add y-axis
    sentimentSvg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(40,0)")
        .call(yAxis);
}