function initializeForms(topicId, lambdaId, visId, lambdaStep) {

    // input container (outer)
    var formInputDiv = document.createElement("div");
    formInputDiv.setAttribute("id", topicAndLambdaInputDivId);
    formInputDiv.setAttribute("style", "width: 1210px");

    document.getElementById(visId).appendChild(formInputDiv);

    // topic container:
    var topicInputDiv = document.createElement("div");
    topicInputDiv.setAttribute("style", "padding: 5px; background-color: #e8e8e8; display: inline-block; width: " + topicVisWidth + "px; height: 50px; float: left");
    formInputDiv.appendChild(topicInputDiv);

    var topicInputLabel = document.createElement("label");
    topicInputLabel.setAttribute("for", topicId);
    topicInputLabel.setAttribute("style", "font-family: sans-serif; font-size: 14px");
    topicInputLabel.innerHTML = "Selected Topic: <span id='" + topicId + "-value'></span>";
    topicInputDiv.appendChild(topicInputLabel);

    var topicInputBox = document.createElement("input");
    topicInputBox.setAttribute("style", "width: 50px");
    topicInputBox.type = "text";
    topicInputBox.min = "0";
    topicInputBox.max = numTopics;
    topicInputBox.step = "1";
    topicInputBox.value = "0";
    topicInputBox.id = topicId;
    topicInputDiv.appendChild(topicInputBox);

    var previousTopicButton = document.createElement("button");
    previousTopicButton.setAttribute("id", prevTopic);
    previousTopicButton.setAttribute("style", "margin-left: 5px");
    previousTopicButton.innerHTML = "-";
    topicInputDiv.appendChild(previousTopicButton);

    var nextTopicButton = document.createElement("button");
    nextTopicButton.setAttribute("id", nextTopic);
    nextTopicButton.setAttribute("style", "margin-left: 5px");
    nextTopicButton.innerHTML = "+";
    topicInputDiv.appendChild(nextTopicButton);

    var clearTopicButton = document.createElement("button");
    clearTopicButton.setAttribute("id", clearTopic);
    clearTopicButton.setAttribute("style", "margin-left: 5px");
    clearTopicButton.innerHTML = "Clear";
    topicInputDiv.appendChild(clearTopicButton);

    var widthLambdaSliderDiv = termVisWidth;
    var lambdaInputDiv = document.createElement("div");
    lambdaInputDiv.setAttribute("id", "lambdaInput");
    lambdaInputDiv.setAttribute("style", "padding: 5px; background-color: #e8e8e8; display: inline-block; height: 50px; width: " + widthLambdaSliderDiv + "px; float: right; margin-right: 30px");
    formInputDiv.appendChild(lambdaInputDiv);


    var lambdaStart = document.createElement("div");
    lambdaStart.setAttribute("style", "padding: 5px; height: 20px; width: 220px; font-family: sans-serif; float: left");
    lambdaStart.setAttribute("id", "lambdaStart");
    lambdaInputDiv.appendChild(lambdaStart);

    var lambdaLabel = d3.select("#lambdaStart")
        .append("text")
        .attr("x", 0)
        .attr("y", 0)
        .style("font-size", "14px")
        .text("Slide to adjust relevance metric:");

    var lambdaLabelSubscript = d3.select("#lambdaStart")
        .append("text")
        .attr("x", 125)
        .attr("y", -5)
        .style("font-size", "10px")
        .style("position", "absolute")
        .text("(2)");

    var sliderInputDiv = document.createElement("div");
    sliderInputDiv.setAttribute("id", "sliderdiv");
    sliderInputDiv.setAttribute("style", "padding: 5px; height: 40px; width: 250px; float: right; margin-top: -5px; margin-right: 10px");
    lambdaInputDiv.appendChild(sliderInputDiv);

    var lambdaInputSlider = document.createElement("input");
    lambdaInputSlider.setAttribute("style", "width: 250px; margin-left: 0px; margin-right: 0px");
    lambdaInputSlider.type = "range";
    lambdaInputSlider.min = 0;
    lambdaInputSlider.max = 1;
    lambdaInputSlider.step = lambdaStep;
    lambdaInputSlider.value = visState.lambda;
    lambdaInputSlider.id = lambdaId;
    lambdaInputSlider.setAttribute("list", "ticks"); // to enable automatic ticks (with no labels, see below)
    sliderInputDiv.appendChild(lambdaInputSlider);

    var lambdaSymbolLabel = document.createElement("label");
    lambdaSymbolLabel.setAttribute("id", "lambdaSymbolLabel");
    lambdaSymbolLabel.setAttribute("for", lambdaId);
    lambdaSymbolLabel.setAttribute("style", "height: 20px; width: 60px; font-family: sans-serif; font-size: 14px; margin-left: 80px");
    lambdaSymbolLabel.innerHTML = "&#955 = <span id='" + lambdaId + "-value'>" + visState.lambda + "</span>";
    lambdaInputDiv.appendChild(lambdaSymbolLabel);

    var scaleContainer = d3.select("#sliderdiv")
        .append("svg")
        .attr("width", 250)
        .attr("height", 25);

    // Referred from http://bl.ocks.org/mbostock/1166403
    var sliderScale = d3.scale.linear()
        .domain([0, 1])
        .range([7.5, 242.5])
        .nice();

    var sliderAxis = d3.svg.axis()
        .scale(sliderScale)
        .orient("bottom")
        .tickSize(10)
        .tickSubdivide(true)
        .ticks(6);

    var sliderAxisGroup = scaleContainer.append("g")
        .attr("class", "slideraxis")
        .attr("margin-top", "-10px")
        .call(sliderAxis);
}