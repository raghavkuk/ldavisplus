var ldaDiv = "#lda";
var forceDirDiv = "#forceDirDiv";
var sentimentDiv = "#sentimentDiv";
// var json_file = "lda.json";
var numTopics;
var numTerms;
var topicData;
var termData;
var termLambdaData;

var coocMatrix;
var vocab;

var forceNodes;
var forceLinks;
var sentimentData;

var barDataForTopic;
var topTermsData;

var lambda = {
    old: 1,
    current: 1
}

var baseColor = "#1f77b4";
var highlightColor = "#d62728";

var transitionDuration = 750;

var margin = {
    top: 30,
    right: 30,
    bottom: 70,
    left: 30
}

var topicVisWidth = 530;
var topicVisHeight = 530;
var termVisWidth = 530;
var termVisHeight = 530;
var forceDirWidth = 530;
var forceDirHeight = 530;
var sentimentVisWidth = 530;
var sentimentVisHeight = 530;
var interPanelWidth = 110;

var visArea = topicVisWidth * topicVisHeight;
var visSvg;
var topicVis;
var termVis;
var forceDirSvg;
var sentimentSvg;

var maxTopicRadius = 60;

var circleProportion = 0.25;
var wordProportion = 0.25;

var baseOpacity = 0.2;
var highlightOpacity = 0.6;

var topicSelected = ldaDiv + "-topic";
var lambdaSelected = ldaDiv + "-lambda";

var splitDiv = ldaDiv.split("#");
var visId = splitDiv[splitDiv.length - 1];

var topicId = visId + "-topic";
var lambdaId = visId + "-lambda";
var termId = visId + "-term";

var prevTopic = topicId + "-prev";
var nextTopic = topicId + "-next";
var clearTopic = topicId + "-clear";

var topicAndLambdaInputDivId = "formTop";

var labelSmall = "2%";
var labelMedium = "5%"
var largeLabel = "10%";

var smallArea = Math.sqrt(0.02 * visArea * circleProportion / Math.PI);
var mediumArea = Math.sqrt(0.05 * visArea * circleProportion / Math.PI);
var largeArea = Math.sqrt(0.10 * visArea * circleProportion / Math.PI);

var visState = {
    lambda: 1,
    topic: 4,
    term: ""
};

var currentClicked = {
    what: "nothing",
    element: undefined
};

var curretHover = {
    what: "nothing",
    element: undefined
};

var prevWinningState = {
    what: "nothing",
    element: undefined
};

// http://stackoverflow.com/questions/16648076/sort-array-on-key-value
// default is decreasing order
function keySort(key, order) {

    order = (typeof order === "undefined") ? 1 : order;
    return function(a, b) {
        if (a[key] < b[key])
            return order;
        if (a[key] > b[key])
            return -1 * order;
        return 0;
    }
}
