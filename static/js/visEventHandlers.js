// function to update bar chart when a topic is selected
function onTopicSelected(topicSelected) {
    if (topicSelected == null)
        return null;

    // grab data bound to this element
    var topicData = topicSelected.__data__
    var Freq = Math.round(topicData.Freq * 10) / 10,
        topic = topicData.topics;

    // change opacity and fill of the selected circle
    topicSelected.style.opacity = highlightOpacity;
    topicSelected.style.fill = highlightColor;

    // Remove 'old' bar chart title
    var currentBarChartTitle = d3.select(".bubble-tool");
    currentBarChartTitle.remove();

    // append text with info relevant to topic of interest
    d3.select("#termsBarGraph")
        .append("text")
        .attr("x", termVisWidth / 2)
        .attr("y", -30)
        .attr("class", "bubble-tool")
        .style("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Top-" + numTerms + " Most Relevant Terms for Topic " + topic + " (" + Freq + "% of tokens)");

    // grab the bar-chart data for this topic only:
    barDataForTopic = termLambdaData.filter(function(d) {
        return d.Category == "Topic" + topic
    });

    // define relevance:
    for (var i = 0; i < barDataForTopic.length; i++) {
        barDataForTopic[i].relevance = lambda.current * barDataForTopic[i].logprob +
            (1 - lambda.current) * barDataForTopic[i].loglift;
    }

    // sort by relevance:
    barDataForTopic.sort(keySort("relevance"));

    // truncate to the top R tokens:
    topTermsData = barDataForTopic.slice(0, numTerms);

    // scale the bars to the top R terms:
    var newYScale = d3.scale.ordinal()
        .domain(topTermsData.map(function(d) {
            return d.Term;
        }))
        .rangeRoundBands([0, termVisHeight], 0.15);
    var newXScale = d3.scale.linear()
        .domain([0, d3.max(topTermsData, function(d) {
            return d.Total;
        })])
        .range([0, termVisWidth])
        .nice();

    // remove the red bars if there are any:
    d3.selectAll(".overlay").remove();

    // Change Total Frequency bars
    d3.selectAll(".bar-totals")
        .data(topTermsData)
        .attr("x", 0)
        .attr("y", function(d) {
            return newYScale(d.Term);
        })
        .attr("height", newYScale.rangeBand())
        .attr("width", function(d) {
            return newXScale(d.Total);
        })
        .style("fill", baseColor)
        .attr("opacity", 0.4);

    // Change word labels
    d3.selectAll(".terms")
        .data(topTermsData)
        .attr("x", -5)
        .attr("y", function(d) {
            return newYScale(d.Term) + 12;
        })
        .attr("id", function(d) {
            return (termId + d.Term)
        })
        .style("text-anchor", "end")
        .text(function(d) {
            return d.Term;
        });

    // Create red bars (drawn over the gray ones) to signify the frequency under the selected topic
    d3.select("#termsBarGraph").selectAll(".overlay")
        .data(topTermsData)
        .enter()
        .append("rect")
        .attr("class", "overlay")
        .attr("x", 0)
        .attr("y", function(d) {
            return newYScale(d.Term);
        })
        .attr("height", newYScale.rangeBand())
        .attr("width", function(d) {
            return newXScale(d.Freq);
        })
        .style("fill", highlightColor)
        .attr("opacity", 0.8);

    // adapted from http://bl.ocks.org/mbostock/1166403
    var xAxis = d3.svg.axis().scale(newXScale)
        .orient("top")
        .tickSize(-termVisHeight)
        .tickSubdivide(true)
        .ticks(6);

    // redraw x-axis
    d3.selectAll(".xaxis")
        //.attr("class", "xaxis")
        .call(xAxis);

}

function onTopicUnseleted(topicUnselected) {

    if (topicUnselected == null)
        return topicUnselected;

    // restore original state
    topicUnselected.style.opacity = baseOpacity;
    topicUnselected.style.fill = baseColor;

    var termsGraphTitle = d3.selectAll(".bubble-tool")
        .text("Top-" + numTerms + " Most Salient Terms");

    termsGraphTitle.append("tspan")
        .attr("baseline-shift", "super")
        .attr("font-size", 12)
        .text(1);

    // remove red bars
    d3.selectAll(".overlay").remove();

    // restore default data
    var defaultBarData = termLambdaData.filter(function(d) {
        return d.Category == "Default"
    });

    var defaultYScale = d3.scale.ordinal()
        .domain(defaultBarData.map(function(d) {
            return d.Term;
        }))
        .rangeRoundBands([0, termVisHeight], 0.15);

    var defaultXScale = d3.scale.linear()
        .domain([0, d3.max(defaultBarData, function(d) {
            return d.Total;
        })])
        .range([0, termVisWidth])
        .nice();

    // Change Total Frequency bars
    d3.selectAll(".bar-totals")
        .data(defaultBarData)
        .attr("x", 0)
        .attr("y", function(d) {
            return defaultYScale(d.Term);
        })
        .attr("height", defaultYScale.rangeBand())
        .attr("width", function(d) {
            return defaultXScale(d.Total);
        })
        .style("fill", baseColor)
        .attr("opacity", 0.4);

    //Change word labels
    d3.selectAll(".terms")
        .data(defaultBarData)
        .attr("x", -5)
        .attr("y", function(d) {
            return defaultYScale(d.Term) + 12;
        })
        .style("text-anchor", "end")
        .text(function(d) {
            return d.Term;
        });

    // adapted from http://bl.ocks.org/mbostock/1166403
    var defaultXAxis = d3.svg.axis().scale(defaultXScale)
        .orient("top")
        .tickSize(-termVisHeight)
        .tickSubdivide(true)
        .ticks(6);

    // redraw x-axis
    d3.selectAll(".xaxis")
        .attr("class", "xaxis")
        .call(defaultXAxis);
}

function onTermSelected(termSelected) {
    if (termSelected == null)
        return null;

    termSelected.style["fontWeight"] = "bold";
    var selectedTermData = termSelected.__data__
    var selectedTermId = selectedTermData.Term;

    var topicsContainingSelectedTerm = termData.filter(function(d2) {
        return d2.Term == selectedTermId
    });

    var numTopicsForTerm = topicsContainingSelectedTerm.length; // number of topics for this token with non-zero frequency

    var radius = [];
    for (var i = 0; i < numTopics; ++i) {
        radius[i] = 0;
    }

    for (i = 0; i < numTopicsForTerm; i++) {
        radius[topicsContainingSelectedTerm[i].Topic - 1] = topicsContainingSelectedTerm[i].Freq;
    }

    var size = [];
    for (var i = 0; i < numTopics; ++i) {
        size[i] = 0;
    }


    // update the size of topic circles
    d3.selectAll(".dot")
        .data(radius)
        .transition()
        .attr("r", function(d) {
            return (Math.sqrt(d * topicVisWidth * topicVisHeight * wordProportion / Math.PI));
        });

    // bind the topic data again
    d3.selectAll(".dot")
        .data(topicData)


    // Update the guide
    d3.select(".circleGuideTitle")
        .text("Conditional topic distribution given term = '" + termSelected.innerHTML + "'");
}

function onTermUnselected(termUnselected) {

    if (termUnselected == null)
        return null;

    termUnselected.style["fontWeight"] = "normal";

    d3.selectAll(".dot")
        .data(topicData)
        .transition()
        .attr("r", function(d) {
            return (Math.sqrt((d.Freq / 100) * topicVisWidth * topicVisHeight * circleProportion / Math.PI));
        });

    // Change sizes of topic numbers:
    d3.selectAll(".txt")
        .transition()
        .style("font-size", "11px");

    // Go back to the default guide
    d3.select(".circleGuideTitle")
        .text("Marginal topic distribution");
    d3.select(".circleGuideLabelLarge")
        .text(largeLabel);
    d3.select(".circleGuideLabelSmall")
        .attr("y", topicVisHeight + 2 * smallArea)
        .text(labelSmall);
    d3.select(".circleGuideSmall")
        .attr("r", smallArea)
        .attr("cy", topicVisHeight + smallArea);
    d3.select(".lineGuideSmall")
        .attr("y1", topicVisHeight + 2 * smallArea)
        .attr("y2", topicVisHeight + 2 * smallArea);
}

function onTermHover(termHovered) {
    var prevTerm = termId + visState.term;
    if (visState.term != "" && prevTerm != termHovered.id) {
        onTermUnselected(document.getElementById(prevTerm));
    }
    visState.term = termHovered.innerHTML;
    onTermSelected(termHovered);
    stateSave(true);
}

function reorderBars(isGreater) {

    var barDataForTopic = termLambdaData.filter(function(d) {
        return d.Category == "Topic" + visState.topic;
    });

    // relevance
    for (var i = 0; i < barDataForTopic.length; i++) {
        barDataForTopic[i].relevance = visState.lambda * barDataForTopic[i].logprob + (1 - visState.lambda) * barDataForTopic[i].loglift;
    }

    barDataForTopic.sort(keySort("relevance"));

    var topBarDataForTopic = barDataForTopic.slice(0, numTerms);

    var newYScale = d3.scale.ordinal()
        .domain(topBarDataForTopic.map(function(d) {
            return d.Term;
        }))
        .rangeRoundBands([0, termVisHeight], 0.15);

    var newXScale = d3.scale.linear()
        .domain([0, d3.max(topBarDataForTopic, function(d) {
            return d.Total;
        })])
        .range([0, termVisWidth])
        .nice();

    var baseBars = d3.select("#termsBarGraph")
        .selectAll(".bar-totals")
        .data(topBarDataForTopic, function(d) {
            return d.Term;
        });

    var labels = d3.select("#termsBarGraph")
        .selectAll(".terms")
        .data(topBarDataForTopic, function(d) {
            return d.Term;
        });

    var topicSpecificBars = d3.select("#termsBarGraph")
        .selectAll(".overlay")
        .data(topBarDataForTopic, function(d) {
            return d.Term;
        });

    var xAxis = d3.svg.axis()
        .scale(newXScale)
        .orient("top")
        .tickSize(-termVisHeight)
        .tickSubdivide(true)
        .ticks(6);

    var newAxis = d3.selectAll(".xaxis");

    var baseBarsEnter = baseBars.enter()
        .append("rect")
        .attr("class", "bar-totals")
        .attr("x", 0)
        .attr("y", function(d) {
            return newYScale(d.Term) + termVisHeight + margin.bottom + 2 * maxTopicRadius;
        })
        .attr("heignt", newYScale.rangeBand())
        .style("fill", baseColor)
        .attr("opacity", 0.4);

    var labelsEnter = labels.enter()
        .append("text")
        .attr("x", -5)
        .attr("class", "terms")
        .attr("y", function(d) {
            return newYScale(d.Term) + 12 + termVisHeight + margin.bottom + 2 * maxTopicRadius;
        })
        .attr("cursor", "pointer")
        .style("text-anchor", "end")
        .attr("id", function(d) {
            return (termId + d.Term);
        })
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

    var topicSpecificBarsEnter = topicSpecificBars.enter()
        .append("rect")
        .attr("class", "overlay")
        .attr("x", 0)
        .attr("y", function(d) {
            return newYScale(d.Term) + termVisHeight + margin.bottom + 2 * maxTopicRadius;
        })
        .attr("height", newYScale.rangeBand())
        .style("fill", highlightColor)
        .attr("opacity", 0.8);

    if (isGreater) {

        // base bar transition
        baseBarsEnter
            .attr("width", function(d) {
                return newXScale(d.Total);
            })
            .transition().duration(transitionDuration)
            .delay(transitionDuration)
            .attr("y", function(d) {
                return newYScale(d.Term);
            });

        // label transition
        labelsEnter.transition()
            .duration(transitionDuration)
            .delay(transitionDuration)
            .attr("y", function(d) {
                return newYScale(d.Term) + 12;
            });

        // topic specific bar transition            
        topicSpecificBarsEnter
            .attr("width", function(d) {
                return newXScale(d.Freq);
            })
            .transition().duration(transitionDuration)
            .delay(transitionDuration)
            .attr("y", function(d) {
                return newYScale(d.Term);
            });

        baseBars.transition().duration(transitionDuration)
            .attr("width", function(d) {
                return newXScale(d.Total);
            })
            .transition().duration(transitionDuration)
            .attr("y", function(d) {
                return newYScale(d.Term);
            });


        labels.transition()
            .duration(transitionDuration)
            .delay(transitionDuration)
            .attr("y", function(d) {
                return newYScale(d.Term) + 12;
            });

        topicSpecificBars
            .attr("width", function(d) {
                return newXScale(d.Freq);
            })
            .transition().duration(transitionDuration)
            .attr("y", function(d) {
                return newYScale(d.Term);
            });


        baseBars.exit()
            .transition().duration(transitionDuration)
            .attr("width", function(d) {
                return newXScale(d.Total);
            })
            .transition().duration(transitionDuration)
            .attr("y", function(d, i) {
                return termVisHeight + margin.bottom + 6 + i * 18;
            });

        labels.exit()
            .transition().duration(transitionDuration)
            .delay(transitionDuration)
            .attr("y", function(d, i) {
                return termVisHeight + margin.bottom + 18 + i * 18;
            })
            .remove();

        topicSpecificBars.exit()
            .transition().duration(transitionDuration)
            .attr("width", function(d) {
                return newXScale(d.Freq);
            })
            .transition().duration(transitionDuration)
            .attr("y", function(d, i) {
                return termVisHeight + margin.bottom + 6 + i * 18;
            })
            .remove();

        newAxis.transition()
            .duration(transitionDuration)
            .call(xAxis)
            .transition()
            .duration(transitionDuration);

    } else {

        baseBarsEnter
            .transition().duration(transitionDuration)
            .attr("y", function(d) {
                return newYScale(d.Term);
            })
            .transition().duration(transitionDuration)
            .attr("width", function(d) {
                return newXScale(d.Total);
            });

        labelsEnter
            .transition().duration(transitionDuration)
            .attr("y", function(d) {
                return newYScale(d.Term) + 12;
            });

        topicSpecificBarsEnter
            .transition().duration(transitionDuration)
            .attr("y", function(d) {
                return newYScale(d.Term);
            })
            .transition().duration(transitionDuration)
            .attr("width", function(d) {
                return newXScale(d.Freq);
            });



        baseBars.transition().duration(transitionDuration)
            .attr("y", function(d) {
                return newYScale(d.Term);
            })
            .transition().duration(transitionDuration)
            .attr("width", function(d) {
                return newXScale(d.Total);
            });

        labels.transition().duration(transitionDuration)
            .attr("y", function(d) {
                return newYScale(d.Term) + 12;
            });

        topicSpecificBars.transition().duration(transitionDuration)
            .attr("y", function(d) {
                return newYScale(d.Term);
            })
            .transition().duration(transitionDuration)
            .attr("width", function(d) {
                return newXScale(d.Freq);
            });



        baseBars.exit()
            .transition().duration(transitionDuration)
            .attr("y", function(d, i) {
                return termVisHeight + margin.bottom + 6 + i * 18 + 2 * maxTopicRadius;
            })
            .remove();

        labels.exit()
            .transition().duration(transitionDuration)
            .attr("y", function(d, i) {
                return termVisHeight + margin.bottom + 18 + i * 18 + 2 * maxTopicRadius;
            })
            .remove();

        topicSpecificBars.exit()
            .transition().duration(transitionDuration)
            .attr("y", function(d, i) {
                return termVisHeight + margin.bottom + 6 + i * 18 + 2 * maxTopicRadius;
            })
            .remove();

        // https://github.com/mbostock/d3/wiki/Transitions#wiki-d3_ease
        newAxis.transition().duration(transitionDuration)
            .transition().duration(transitionDuration)
            .call(xAxis);

    }

    initializeForceVisData();
    setupForceDirVis();
}