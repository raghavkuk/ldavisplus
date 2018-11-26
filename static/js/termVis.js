function setupTermBarGraph() {

    var defaultBarDomain = termLambdaData.filter(function(d) {
        return d.Category == "Default"
    });

    var yScaleTerms = d3.scale.ordinal()
        .domain(defaultBarDomain.map(function(d) {
            return d.Term;
        }))
        .rangeRoundBands([0, termVisHeight], 0.15);
    var xScaleTerms = d3.scale.linear()
        .domain([0, d3.max(defaultBarDomain, function(d) {
            return d.Total;
        })])
        .range([0, termVisWidth])
        .nice();

    var termsYAxis = d3.svg.axis()
        .scale(yScaleTerms);

    termsVis = visSvg.append("g")
        .attr("transform", "translate(" + +(topicVisWidth + margin.left + interPanelWidth) + "," + 2 * margin.top + ")")
        .attr("id", "termsBarGraph");

    var globalFreqBars = termsVis.selectAll(".bar-totals")
        .data(defaultBarDomain)
        .enter();

    globalFreqBars
        .append("rect")
        .attr("class", "bar-totals")
        .attr("x", 0)
        .attr("y", function(d) {
            return yScaleTerms(d.Term);
        })
        .attr("height", yScaleTerms.rangeBand())
        .attr("width", function(d) {
            return xScaleTerms(d.Total);
        })
        .style("fill", baseColor)
        .attr("opacity", 0.4);


    globalFreqBars
        .append("text")
        .attr("x", -5)
        .attr("class", "terms")
        .attr("y", function(d) {
            return yScaleTerms(d.Term) + 12;
        })
        .attr("cursor", "pointer")
        .attr("id", function(d) {
            return (termId + d.Term)
        })
        .style("text-anchor", "end")
        .text(function(d) {
            return d.Term;
        })
        .on("mouseover", function() {
            onTermHover(this);
        })
        .on("mouseout", function() {
            visState.term = "";
            onTermUnselected(this);
            stateSave(true);
        });

    var termVisTitle = termsVis.append("text")
        .attr("x", termVisWidth / 2)
        .attr("y", -30)
        .attr("class", "bubble-tool")
        .style("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Top-" + numTerms + " Most Salient Terms");

    termVisTitle.append("tspan")
        .attr("baseline-shift", "super")
        .attr("font-size", "12px")
        .text("(1)");

    // barchart axis adapted from http://bl.ocks.org/mbostock/1166403
    var barsXAxis = d3.svg.axis().scale(xScaleTerms)
        .orient("top")
        .tickSize(-termVisHeight)
        .tickSubdivide(true)
        .ticks(6);

    termsVis.attr("class", "xaxis")
        .call(barsXAxis);
}

function setupTermLegend() {

    var individualBarInfo = { "width": 100, "height": 15 };
    d3.select("#termsBarGraph").append("rect")
        .attr("x", 0)
        .attr("y", topicVisHeight + 10)
        .attr("height", individualBarInfo.height)
        .attr("width", individualBarInfo.width)
        .style("fill", baseColor)
        .attr("opacity", 0.4);
    d3.select("#termsBarGraph").append("text")
        .attr("x", individualBarInfo.width + 5)
        .attr("y", termVisHeight + 10 + individualBarInfo.height / 2)
        .style("dominant-baseline", "middle")
        .text("Overall term frequency");

    d3.select("#termsBarGraph").append("rect")
        .attr("x", 0)
        .attr("y", topicVisHeight + 10 + individualBarInfo.height + 5)
        .attr("height", individualBarInfo.height)
        .attr("width", individualBarInfo.width / 2)
        .style("fill", highlightColor)
        .attr("opacity", 0.8);
    d3.select("#termsBarGraph").append("text")
        .attr("x", individualBarInfo.width / 2 + 5)
        .attr("y", topicVisHeight + 10 + (3 / 2) * individualBarInfo.height + 5)
        .style("dominant-baseline", "middle")
        .text("Estimated term frequency within the selected topic");

    d3.select("#termsBarGraph")
        .append("a")
        .attr("xlink:href", "http://vis.stanford.edu/files/2012-Termite-AVI.pdf")
        .attr("target", "_blank")
        .append("text")
        .attr("x", 0)
        .attr("y", topicVisHeight + 10 + (6 / 2) * individualBarInfo.height + 5)
        .style("dominant-baseline", "middle")
        .text("1. saliency(term w) = frequency(w) * [sum_t p(t | w) * log(p(t | w)/p(t))] for topics t; see Chuang et. al (2012)");
    d3.select("#termsBarGraph")
        .append("a")
        .attr("xlink:href", "http://nlp.stanford.edu/events/illvi2014/papers/sievert-illvi2014.pdf")
        .attr("target", "_blank")
        .append("text")
        .attr("x", 0)
        .attr("y", topicVisHeight + 10 + (8 / 2) * individualBarInfo.height + 5)
        .style("dominant-baseline", "middle")
        .text("2. relevance(term w | topic t) = \u03BB * p(w | t) + (1 - \u03BB) * p(w | t)/p(w); see Sievert & Shirley (2014)");
}