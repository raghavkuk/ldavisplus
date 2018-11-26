// d3.json(json_data, function (error, data) {

//     initializeDataVariables(data);

//     initializeForms(topicId, lambdaId, visId, data['lambda.step']);

//     setupLambdaUpdateHandler(lambdaSelected);

//     setupClickNextTopicHandler(nextTopic);

//     setupClickPreviousTopicHandler(prevTopic);

//     setupClickTopicCircleHandler(topicId);

//     setupClickClearTopic(clearTopic);

//     visSvg = d3.select(ldaDiv)
//                 .append("svg")
//                 .attr("width", topicVisWidth + termVisWidth + margin.left + interPanelWidth + margin.right)
//                 .attr("height", topicVisHeight + 2 * margin.top + margin.bottom + maxTopicRadius);

//     setupTopicScatterplot();

//     setupTopicLegend();

//     setupTermBarGraph();

//     setupTermLegend();

//     sentimentSvg = d3.select(sentimentDiv)
//                         .append("svg")
//                         .attr("width", sentimentVisWidth + margin.left + margin.right)
//                         .attr("height", sentimentVisHeight + 2 * margin.top + margin.bottom + maxTopicRadius);


//     forceDirSvg = d3.select(forceDirDiv)
//                         .append("svg")
//                         .attr("width", forceDirWidth + margin.left + margin.right)
//                         .attr("height", forceDirHeight + 2 * margin.top + margin.bottom + maxTopicRadius);

//     setupForceDirVis();

// });


init_params(json_data);

function init_params(json_data) {
    // var data = json_data;
    initializeDataVariables(json_data);

    initializeForms(topicId, lambdaId, visId, json_data['lambda.step']);

    setupLambdaUpdateHandler(lambdaSelected);

    setupClickNextTopicHandler(nextTopic);

    setupClickPreviousTopicHandler(prevTopic);

    setupClickTopicCircleHandler(topicId);

    setupClickClearTopic(clearTopic);

    visSvg = d3.select(ldaDiv)
        .append("svg")
        .attr("width", topicVisWidth + termVisWidth + margin.left + interPanelWidth + margin.right)
        .attr("height", topicVisHeight + 2 * margin.top + margin.bottom + maxTopicRadius);

    setupTopicScatterplot();

    setupTopicLegend();

    setupTermBarGraph();

    setupTermLegend();
}



function stateUrl() {
    return location.origin + location.pathname + "#topic=" + visState.topic +
        "&lambda=" + visState.lambda + "&term=" + visState.term;
}

function stateSave(replace) {
    if (replace)
        history.replaceState(visState, "Query", stateUrl());
    else
        history.pushState(visState, "Query", stateUrl());
}

function stateReset() {
    if (visState.topic > 0) {
        onTopicUnseleted(document.getElementById(topicId + visState.topic));
    }
    if (visState.term != "") {
        onTermUnselected(document.getElementById(termId + visState.term));
    }
    visState.term = "";
    document.getElementById(topicId).value = visState.topic = 0;
    stateSave(true);
}