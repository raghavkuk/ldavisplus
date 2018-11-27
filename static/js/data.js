function initializeDataVariables(data) {

    var edges = [
    {"source": 0, "target": 1},
    {"source": 0, "target": 2},
    {"source": 0, "target": 3},
    {"source": 0, "target": 4},
    {"source": 0, "target": 5},
    {"source": 0, "target": 6},
    {"source": 1, "target": 3},
    {"source": 1, "target": 4},
    {"source": 1, "target": 5},
    {"source": 1, "target": 6},
    {"source": 2, "target": 4},
    {"source": 2, "target": 5},
    {"source": 2, "target": 6},
    {"source": 3, "target": 5},
    {"source": 3, "target": 6},
    {"source": 5, "target": 6},
    {"source": 0, "target": 7},
    {"source": 1, "target": 8},
    {"source": 2, "target": 9},
    {"source": 3, "target": 10},
    {"source": 4, "target": 11},
    {"source": 5, "target": 12},
    {"source": 6, "target": 13}];

    var nodes = [
    {"size": 60, "score": 0, "id": "Androsynth", "type": "circle"},
    {"size": 10, "score": 0.2, "id": "Chenjesu", "type": "circle"},
    {"size": 60, "score": 0.4, "id": "Ilwrath", "type": "circle"},
    {"size": 10, "score": 0.6, "id": "Mycon", "type": "circle"},
    {"size": 60, "score": 0.8, "id": "Spathi", "type": "circle"},
    {"size": 10, "score": 1, "id": "Umgah", "type": "circle"},
    {"id": "VUX", "type": "circle"},
    {"size": 60, "score": 0, "id": "Guardian", "type": "circle"},
    {"size": 10, "score": 0.2, "id": "Broodhmome", "type": "circle"},
    {"size": 60, "score": 0.4, "id": "Avenger", "type": "cicle"},
    {"size": 10, "score": 0.6, "id": "Podship", "type": "circle"},
    {"size": 60, "score": 0.8, "id": "Eluder", "type": "circle"},
    {"size": 10, "score": 1, "id": "Drone", "type": "circle"},
    {"id": "Intruder", "type": "circle"}];


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

    forceNodes = nodes;
    forceLinks = edges;
}