function setupClickNextTopicHandler(nextTopic) {

    d3.select("#" + nextTopic)
        .on("click", function() {

            // clear any existing term selection
            var existingTermSelection = document.getElementById(termId + visState.term);

            if (existingTermSelection !== undefined)
                onTermUnselected(existingTermSelection);

            visState.term = "";
            var existingTopicValue = document.getElementById(topicId).value;
            var newTopicValue = Math.min(numTopics, +existingTopicValue + 1).toFixed(0);

            document.getElementById(topicId).value = newTopicValue;
            onTopicUnseleted(document.getElementById(topicId + existingTopicValue));
            onTopicSelected(document.getElementById(topicId + newTopicValue));
            visState.topic = newTopicValue;
            stateSave(true);
        });
}

function setupClickPreviousTopicHandler(prevTopic) {

    d3.select("#" + prevTopic)
        .on("click", function() {

            // clear any existing term selection
            var existingTermSelection = document.getElementById(termId + visState.term);
            if (existingTermSelection !== undefined)
                onTermUnselected(existingTermSelection);

            visState.term = "";
            var existingTopicValue = document.getElementById(topicId).value;
            var newTopicValue = Math.max(0, +existingTopicValue - 1).toFixed(0);

            document.getElementById(topicId).value = newTopicValue;
            onTopicUnseleted(document.getElementById(topicId + existingTopicValue));
            onTopicSelected(document.getElementById(topicId + newTopicValue));
            visState.topic = newTopicValue;
            stateSave(true);
        });
}

function setupClickTopicCircleHandler(topicId) {

    d3.select("#" + topicId)
        .on("keyup", function() {

            // clear any existing term selection
            var existingTermSelection = document.getElementById(termId + visState.term);
            if (existingTopicValue !== undefined)
                onTermUnselected(existingTermSelection);

            visState.term = "";
            onTopicUnseleted(document.getElementById(topicId + visState.topic))

            var newTopicValue = document.getElementById(topicId).value;
            if (!isNaN(newTopicValue) && newTopicValue > 0) {
                newTopicValue = Math.min(numTopics, Math.max(1, newTopicValue))
                onTopicSelected(document.getElementById(topicId + newTopicValue));
                visState.topic = newTopicValue;
                stateSave(true);
                document.getElementById(topicId).value = visState.topic;
            }
        });
}

function setupClickClearTopic(clearTopic) {
    d3.select("#" + clearTopic)
        .on("click", function() {
            stateReset();
            stateSave(true);
        });
}

function setupLambdaUpdateHandler(lambdaSelected) {

    d3.select(lambdaSelected)
        .on("mouseup", function() {
            // previous lambda value
            lambda.old = lambda.current;
            lambda.current = document.getElementById(lambdaId).value;
            visState.lambda = +this.value;

            // adjust text
            d3.select(lambdaSelected).property("value", visState.lambda);
            d3.select(lambdaSelected + "-value").text(visState.lambda);
            // transition the order of the bars
            var isGreater = lambda.old < visState.lambda;
            if (visState.topic > 0)
                reorderBars(isGreater);

            stateSave(true);
            document.getElementById(lambdaId).value = visState.lambda;
        });
}