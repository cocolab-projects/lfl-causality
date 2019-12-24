// Object to store set of biconditionals
function AndObj(arg, comps){
    this.arg = arg
    this.comps = comps
    this.type = "and"
    this.eval = function(args){
        for(var i = 0; i < comps.length; i++){
            if(arg[comps[i]] !== args[comps[i]]) return false
        }
        return true
    }
}

// Object to store set of disjunctions
function OrObj(arg, comps){
    this.arg = arg
    this.comps = comps
    this.type = "or"
    this.eval = function(args){
        for(var i = 0; i < comps.length; i++){
            if(arg[comps[i]] === args[comps[i]]) return true
        }
        return false
    }
}

// Object to store a single conditional
function SingObj(arg, comps){
    this.arg = arg
    this.comps = comps
    this.type = "sing"
    this.eval = function(args){
        return arg[comps[0]] === args[comps[0]]
    }

}

//for a^(bVc), comps=[a,b,c] or [a,c,b]
function cdObj(arg, comps){
    this.arg = arg
    this.comps = comps
    this.type = "cd"
    this.eval = function(args){
        if(arg[comps[0]] !== args[comps[0]]){
            return false;
        } else {
            for(var i = 1; i < comps.length; i++){
                if(arg[comps[i]] === args[comps[i]]) return true
            }
        }
        return false;
    }
}

//for aV(b^c), comps=[a,b,c] or [a,c,b]
function dcObj(arg, comps){
    this.arg = arg
    this.comps = comps
    this.type = "dc"
    this.eval = function(args){
        if(arg[comps[0]] === args[comps[0]]){
            return true;
        } else {
            for(var i = 1; i < comps.length; i++){
                if(arg[comps[i]] !== args[comps[i]]) return false
            }
        }
        return true;
    }
}

//stores the configurations that will control (turn on) reactions
function Config(arg, numBeakers){
    this.controls = arg
    this.numBeakers = numBeakers
}

//generate the box. Takes in a config (what turns on what) and returns a function that
// determines what is turned on
function generateBox(config){
    //function to return, which will take in a setting and return what is turned on
    function configDict(){
        let dict = {} // keys: setting of beakers, values: reactions
        for(var i = 0; i < (Math.pow(2, config.numBeakers)); i++){
            var set = padStrStart(i.toString(2), config.numBeakers,'0')
            var setting = beakerDict(set)
            dict[set] = box(setting)
        }
        return dict
    }
    function box(setting){    
        let arr = [] //array of results
        for(var i = 0; i < config.controls.length; i++){
            arr.push(config.controls[i].eval(setting))
        }
        return arr //return the array
    }
    return configDict //return the function
}

// Takes in a configuration, and returns a string representation
function configToString(config){
    var dict = {}
    for(var i = 0; i < config.controls.length; i++){
        var actualControls = {}
        for(var j = 0; j < config.controls[i].comps.length; j++){
            actualControls[config.controls[i].comps[j]] = config.controls[i].arg[config.controls[i].comps[j]]
        }
        dict[`Reaction ${i+1}`] = {
            type: config.controls[i].type,
            controls: actualControls
        }
    }
    var stringWithCommas = JSON.stringify(dict);
    var stringWithoutCommas = stringWithCommas
    stringWithoutCommas = stringWithoutCommas.replace(/,/g, "%")
    return stringWithoutCommas;
}

//creates a random configuration
function createRandomBox(numBeakers, numReactions, types){
    let configArray = []
    let rulesUsed = []
    // create a control for each reaction
    for(var i = 0; i < numReactions; i++){
        var compsArray, compsDict //array and dict of components and their settings
        do{
            compsArray = []
            compsDict = {}
            for(var j = 0; j < numBeakers; j++){
                if(Math.random() < 0.5){
                    compsDict[`beaker${j+1}`] = (Math.random() < 1.0); //always be true
                    compsArray.push(`beaker${j+1}`)
                }
            }
        }while(compsArray.length !== 3 && numBeakers >= 3)
        shuffle(compsArray)
        let control
        let valid = false;
        while(!valid){
            switch(Math.floor(Math.random()*5)){
                case 0: //singular object
                    control = new SingObj(compsDict, compsArray.slice(0,1));
                    valid = types.includes("SINGLE_FEATURE") &&
                            (!rulesUsed.includes("sing") || rulesUsed.length >= types.length);
                    if(valid){
                        rulesUsed.push("sing")
                    }
                    break
                case 1: //and object
                    control = new AndObj(compsDict, compsArray.slice(0,2))
                    valid = types.includes("CONJUNCTION") &&
                            (!rulesUsed.includes("and") || rulesUsed.length >= types.length);
                    if(valid){
                        rulesUsed.push("and")
                    }
                    break
                case 2: //or object
                    control = new OrObj(compsDict, compsArray.slice(0,2))
                    valid = types.includes("DISJUNCTION") &&
                            (!rulesUsed.includes("or") || rulesUsed.length >= types.length);
                    if(valid){
                        rulesUsed.push("or")
                    }
                    break
                case 3: //cd
                    control = new cdObj(compsDict, compsArray)
                    valid = types.includes("CONJUNCTION_DISJUNCTION") &&
                            (!rulesUsed.includes("cd") || rulesUsed.length >= types.length);
                    if(valid){
                        rulesUsed.push("cd")
                    }
                    break
                case 4: // dc
                    control = new dcObj(compsDict, compsArray)
                    valid = types.includes("DISJUNCTION_CONJUNCTION") &&
                            (!rulesUsed.includes("dc") || rulesUsed.length >= types.length);
                    if(valid){
                        rulesUsed.push("dc")
                    }
                    break
            }
        }
        configArray.push(control)
    }
    let config = new Config(configArray, numBeakers)
    return config
}

//randomly selects a given number of rules
function randomRuleTypes(numRules, roundNum){
    var difficultRuleTypes = [
        "SINGLE_FEATURE",
        "CONJUNCTION",
        "DISJUNCTION",
        "CONJUNCTION_DISJUNCTION",
        "DISJUNCTION_CONJUNCTION"
    ];
    var easyRuleTypes = [
        "SINGLE_FEATURE",
        "CONJUNCTION",
        "DISJUNCTION",
    ];
    if(roundNum > 2){
        difficultRuleTypes = shuffle(difficultRuleTypes)
        difficultRuleTypes = difficultRuleTypes.slice(0, roundNum+1)
        return difficultRuleTypes
    } else {
        return [easyRuleTypes[roundNum]]
    }


}

/*
  Parameter: dictionary: keys: beakers --> values: reactions
  Return: dictionary: keys: reactions --> values: array of beakers
*/
function reverseDict(dict){
    var newDict = {}
    for(var config in dict){
        var stringOfReactions = ""
        for(var i = 0; i < dict[config].length; i++){
            stringOfReactions = stringOfReactions + ((dict[config][i] === true) ? "1":"0")
        }      
        if(!newDict.hasOwnProperty(stringOfReactions)){
            newDict[stringOfReactions] = [config]
        } else {
            newDict[stringOfReactions].push(config)
        }
    }
    return newDict
}

/*
  Parameters: array of beakers that are selected, total number of beakers,
              boolean value of current configuration
  Return: Binary string representation of beakers
*/
function beakerStr(beakersOn, numBeakers, tutorial, question, train){
    var beakers = ""
    if(beakersOn.includes("Not Possible")){
        beakers = "Not Possible"
    }else {
        for(var i = 1; i<=numBeakers; i++){
            beakers = beakers + (beakersOn.includes("#beaker" + i + (tutorial? "tutorial": "") + (question? "question": "")
                                                    + (train? "": "test"))? "1":"0")
        }
    }
    return beakers
}

/*
  Parameters: array of reactions that are selected, total number of reactions,
              boolean value of current configuration
  Return: Binary string representation of reactions
*/
function reactionStr(reactionsOn, numReactions, tutorial, question, train){
    var reactions = ""
    for(var i = 1; i<=numReactions; i++){
        reactions = reactions + (reactionsOn.includes("#reaction" + i + (tutorial? "tutorial": "") + (question? "question": "")
                                                + (train? "": "test"))? "1":"0")
    }
    return reactions
}

/*
  Parameters: binary string of beakers
  Return: Dictionary: keys: beakers --> values: booleans
*/
function beakerDict(str){
    var beakers = {}
    for(var i = 1; i<=str.length; i++){
        beakers[`beaker${i}`] = (str[i-1] === '1');
    }
    return beakers
}

/**
 * Shuffles array in place.
 * @param {Array} arr items An array containing the items.
 */
function shuffle(arr) {
    var j, x, i;
    for (i = arr.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = arr[i];
        arr[i] = arr[j];
        arr[j] = x;
    }
    return arr;
}

/*
  Parameters: array of bools
  Return: Binary string representation of array
*/
function boolsToBin(bools){
    var stringRep = '';
    for(var i = 0; i < bools.length; i++){
        stringRep = stringRep +(bools[i] ? "1" : "0")
    }
    return stringRep
}

/*
  Parameters: dictionary: keys: beakers --> values: reactions
  Return: dictionary: keys: beaker configurations --> values: dictionary of answers [a], and questions [q1, q2]
*/
function generateBeakerQuestions(dict){
    var beakerQuestions = [];
    for(var beakerConfig in dict){
        if(beakerConfig !== '00000'){
            beakerQuestions.push({
                type: "beaker",
                config: beakerConfig,
                q1: "<div>" +
                    "<p class=\"question\">ChemCo will mix the following chemicals: " + binBeakersToString(beakerConfig) +
                    ".</div>",
                q2: "<div>" +
                    "<p class=\"question\">Click on the measurements that ChemCo should expect to see.</p></div>",
                a: boolsToBin(dict[beakerConfig]),
            })
        }
    }
    return beakerQuestions;
}


/*
  Parameters: dictionary: keys: reactions --> values: beakers , number of Reactions
  Return: dictionary: keys: reaction configurations --> values: dictionary of answers [a], and questions [q1, q2]
*/
function generateReactionQuestions(dict, numReactions){
    var questions = [];
    var singIndices = [];
    if(numReactions == 3){
        var trios = Object.keys(dict);
        trios = sortOutThrees(trios, dict, numReactions)
        shuffle(trios);
        //Add three reaction configs
        for(var i = 0; i < 4 ; i++){
            var reactionConfig = trios[i];
            var answer = "";
            if(dict.hasOwnProperty(reactionConfig)){
                answer = (dict[reactionConfig].length === 1 && dict[reactionConfig].includes('000')) ? ['Not Possible'] :
                                                                                                       dict[reactionConfig]
            } else {
                answer = ['Not Possible']
            }
            questions.push({
                type: "reaction",
                config: reactionConfig,
                q1: "<div><p class=\"question\">ChemCo wants to find a chemical that " +
                    binReactionsToString(reactionConfig) + "</p></div>",
                q2: "<div><p class=\"question\">Click on a possible mixture ChemCo could use. If there is no possible " +
                                   "mixture, then click 'This Outcome is not Possible'.</p></div>",
                a: answer
            })
        }
    }
    if(numReactions >= 2){
        //add doubles
        var doubles = findDoubles();
        shuffle(doubles)
        for(var i = 0; i<(doubles.length >= 4? 4:doubles.length); i++){
            questions.push({
                type: "reaction",
                config: doubles[i],
                q1: "<div><p class='question'>ChemCo wants to find a chemical that " +
                    binReactionsToString(doubles[i]) + ". It does not care about any other reactions.</p></div>",
                q2: "<div><p class=\"question\">Click on a possible mixture ChemCo could use. If there is no possible " +
                                   "mixture, then click 'This Outcome is not Possible'.</p></div>",
                a: findConfigsForDoubReac(dict, doubles[i])
            })
        }
    }
    // Add single reaction configs
    for(var i = 0; i < numReactions; i++){
        var ZeroStr = ""
        var OneStr = "";
        for(var j = 0; j < numReactions; j++){
            if(j !== i){
                ZeroStr = ZeroStr + "x"
                OneStr = OneStr + "x"
            }
            else{
                ZeroStr = ZeroStr + "0"
                OneStr = OneStr + "1"
            }
        }
        singIndices.push(questions.length)
        questions.push({
            type: "reaction",
            config: ZeroStr,
            q1: "<div><p class=\"question\">ChemCo wants to find a chemical that " +
                binReactionsToString(ZeroStr) + ".</p></div>",
            q2: "<div><p class=\"question\">Click on a possible mixture ChemCo could use. If there is no possible " +
                               "mixture, then click 'This Outcome is not Possible'.</p></div>",
            a: findConfigsForSingReac(dict, i, false)
        })
        questions.push({
            type: "reaction",
            config: OneStr,
            q1: "<div><p class=\"question\">ChemCo wants to find a chemical that " +
                binReactionsToString(OneStr) + ".</p></div>",
            q2: "<div><p class=\"question\">Click on a possible mixture ChemCo could use. If there is no possible " +
                "mixture, then click 'This Outcome is not Possible'.</p></div>",
            a: findConfigsForSingReac(dict, i, true)
        })
    }
    return questions;
}

function sortOutThrees(keys, dict, numReactions){
    shuffle(keys)
    if(keys.length === 4){
        return keys;
    } else if (keys.length >= 4){
        while(keys.length !== 4){
            var reactionConfig = keys[keys.length - 1];
            keys.pop();
            if(dict[reactionConfig].length !== 1){
                keys.splice(0, 0, reactionConfig)
            }
        }
        return keys;
    } else {
        var possibleCombos= []
        for(var i = 0; i < (Math.pow(2, numReactions)); i++){
            var combo = padStrStart(i.toString(2), numReactions,'0')
            if(!keys.includes(combo)){
                possibleCombos.push(combo);
            }
        }
        shuffle(possibleCombos);
        while(keys.length < 4){
            keys.push(possibleCombos.pop())
        }
        return keys;
    }
}

/*
  Parameters: binary string of beakers present
  Return: array of chemical names
*/
function binBeakersToString(beakers){
    var chemicals = []
    for(var i = 0; i<beakers.length;  i++){
        if(beakers[i] === '1'){
            chemicals.push(color(i) + "ase");
        }
    }
    if(chemicals.length === 0) chemicals.push["no chemicals"]
    return chemicals.toString();
}

/*
  Parameters: binary string of reactions present
  Return: array of reaction names
*/
function binReactionsToString(str){
    var reactions = []
    for(var i = 0; i<str.length;  i++){
        if(str[i] !== 'x'){
            reactions.push("<strong>" + reaction(i, str[i] === '1') + "</strong>");
        }
    }
    if(reactions.length === 1){
        return reactions.toString();
    } else if(reactions.length === 2){
        reactions[reactions.length - 1] = "and " + reactions[reactions.length - 1];
        return reactions.join(" ");
    } else {
        reactions[reactions.length - 1] = "and " + reactions[reactions.length - 1];
        return reactions.join(", ");
    }



}

/*
  Parameters: Dictionary: keys: binary reactions string --> values: arrays of beakers, i is reaction number, onOrOff: is reaction on
  Return: Array of possible beaker configurations
*/
function findConfigsForSingReac(reverseDict, i, onOrOff){
    var beakers = []
    for(var reactionsOn in reverseDict){
        if(reactionsOn[i] === '1' && onOrOff){
            beakers = beakers.concat(reverseDict[reactionsOn])
        }
        if(reactionsOn[i] === '0' && !onOrOff){
            beakers = beakers.concat(reverseDict[reactionsOn])
        }
    }
    return beakers
}

/*
  Parameters: None
  Return: Array of all possible doubles
*/
function findDoubles(){
    const pairs = [['0', '1'], ['1', '1'], ['1', '0'], ['0', '0']]
    var doubles = []
    for(var i = 0; i < 4; i++){
        for(var j = 0; j < 3; j++){
            var pair = pairs[i].slice()
            pair.splice(j,0,'x')
            doubles.push(pair.join(""))
        }
    }
    return doubles
}

/*
  Parameters: Dictionary: keys: binary reactions string --> values: arrays of beakers, string of desired double
  Return: Array of all possible answers
*/
function findConfigsForDoubReac(reverseDict, double){
    var configs = []
    for(var reactions in reverseDict){
        var isMatch = true;
        for(var i  = 0; i < double.length; i++){
            if(double[i] !== 'x' && double[i] !== reactions[i]) isMatch = false;
        }
        if(isMatch){
            configs = configs.concat(reverseDict[reactions])
        }
    }
    if(configs.length === 0 || (configs.length === 1 && configs.includes("000"))){
        configs = [];
        configs.push("Not Possible")
    }
    return configs
}

// Exports functions for use on server side
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined'){
    module.exports = {
        createRandomBox,
        generateBox,
        randomRuleTypes,
        generateReactionQuestions,
        generateBeakerQuestions,
        reverseDict,
        toString,
        shuffle,
        pickConfigs,
        pickGame,
    }
}

//returns correct color
function color(num){
    var colors = ['Red', 'Yellow', 'Blue', 'Green', 'Purple']
    return colors[num]
}

//returns correct reaction
function reaction(num, isOn){
    var onCaps = ['Glows', 'Bubbles', 'Conducts Electricity']
    var offCaps = ['Does not Glow', 'Does not Bubble', 'Does Not Conduct Electricity']
    return isOn? onCaps[num]:offCaps[num]
}
function padStrStart(str, length, pad){
    while(str.length < length){
        str = pad + str;
    }
    return str
}

function generateConfigSet(numBeakers, numReactions, numRounds, numRules){
    var configSet = [];
    for(var i = 0; i< numRounds; i++){
        var cap = 3;
        var configsForRound = [];
        var configsStringList = [];
        for(var j = 0; j < cap; j++){
            do{
                var rules = randomRuleTypes(numRules, i)
                do{
                    var config = createRandomBox(numBeakers, numReactions, rules);
                    var boxConfig = generateBox(config)();
                }while(boxConfig['00000'].toString() !== [false].toString());
                var configStr = JSON.stringify(boxConfig)
                var beakerQs = generateBeakerQuestions(boxConfig)
                var reactionQs = generateReactionQuestions(reverseDict(boxConfig), numReactions)
                shuffle(beakerQs)
                beakerQs = beakerQs.splice(0,8)
                var questions = beakerQs.concat(reactionQs)
                shuffle(questions);
            }while(configsStringList.includes(configStr) || noYesQuestions(questions))
            configsStringList.push(configStr)
            configsForRound.push({
                                 configType: "Round" + i + "_Config"+ (configsForRound.length + 1),
                                 rules: rules,
                                 config: configToString(config).replace(/%/g, ","),
                                 dict: configStr,
                                 questions: JSON.stringify(questions)
                             })
        }
        configSet.push(configsForRound)
    }
    return configSet
}

function noYesQuestions(questions){
    for(var i = 0; i < questions.length; i++){
        if(questions[i].type == "beaker" && questions[i].a == "1") return false;
    }
    return true;
}

function pickConfigs(numBeakers, numReactions, numRounds, numRules){
    var toPickFrom = JSON.parse(getJSON());
    var picked = [];
    for(var i = 0; i<numRounds; i++){
        var cap = (i === 0 ? 10 : 20);
        var randomPick = toPickFrom[i][0]
        picked.push(randomPick)
    }
    return picked
}

function makeJSON(){
    var fs = require('fs');
    var configs = generateConfigSet(5, 1, 3, 5)
    var toPickFrom = JSON.stringify(configs);
    var filePath = ['..', 'mp-game-6', 'configsJSON_sing'].join('/');
    fs.writeFile(filePath, toPickFrom, function(err) {
        if (err) {
            console.log(err);
        }
    });
    // Make a CSV file of all the configs
    var dataPoint = configs[0][0];
    var csvFilePath = ['..', 'mp-game-6', 'configsCSV_sing.csv'].join('/');
    // Write header
    var header = Object.keys(dataPoint).join('\t') + '\n';
    fs.writeFileSync(csvFilePath, header, err => {if(err) throw(err);});
    for(var i = 0; i < configs.length; i++){
        for(var j = 0; j < configs[i].length; j++){
            dataPoint = configs[i][j];
            var line = Object.values(dataPoint).join('\t') + "\n";
            fs.appendFileSync(csvFilePath, line, err => {if(err) throw err;})
        }
    }
}

function getJSON(){
    var content = "";
    var fs = require('fs');
    var filePath = ['mp-game-6', 'configsJSON_sing'].join('/');
    return fs.readFileSync(filePath, "utf8", err => {if(err) throw err;});
}

function pickGame(){
    var fs = require('fs');
    var filePath = ['..', 'data', 'mp-game-6', 'teachersUsed.json'].join('/');
    var toPickFrom = JSON.parse(fs.readFileSync(filePath, "utf8", err => {if(err) throw err;}));
    var games_num = 0;
    var game_pick = 0;
    var num_games = toPickFrom.length;
    while(toPickFrom[game_pick].num_used != games_num) {
        if ( game_pick == (num_games - 1) ) {
            game_pick = 0;
            games_num++;
        } else {
            game_pick++;
        }
    }
    console.log("Game picked: " + game_pick + ", ID: " + toPickFrom[game_pick].Game);
    toPickFrom[game_pick].num_used++;
    var updatedGames = JSON.stringify(toPickFrom);
    fs.writeFile(filePath, updatedGames, function(err) {
        if (err) {
            console.log(err);
        }
    });
    return toPickFrom[game_pick].Game;
}

