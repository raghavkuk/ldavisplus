function initializeDataVariables(data) {

    numTopics = data['mdsDat'].x.length;
    numTerms = data['R'];

    topicData = [];
    for (var i = 0; i < numTopics; i++) {
        var obj = {};
        for (var key in data['mdsDat']) {
            obj[key] = data['mdsDat'][key][i];
        }
        topicData.push(obj);
    }

    termData = [];
    for (var i = 0; i < data['token.table'].Term.length; i++) {
        var obj = {};
        for (var key in data['token.table']) {
            obj[key] = data['token.table'][key][i];
        }
        termData.push(obj);
    }


    termLambdaData = [];
    for (var i = 0; i < data['tinfo'].Term.length; i++) {
        var obj = {}
        for (var key in data['tinfo']) {
            obj[key] = data['tinfo'][key][i];
        }
        termLambdaData.push(obj);
    }

    forceNodes = data.nodes;
    forceLinks = data.edges;
}