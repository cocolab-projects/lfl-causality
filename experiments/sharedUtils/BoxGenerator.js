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
            var set = i.toString(2).padStart(config.numBeakers,'0')
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
function toString(config){
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
    return JSON.stringify(dict)
}

function createRandomBox(numBeakers, numReactions, types){
    let configArray = []
    // create a control for each reaction
    for(let i = 0; i < numReactions; i++){
        var compsArray, compsDict //array and dict of components and their settings
        do{
            compsArray = []
            compsDict = {}
            for(let j = 0; j < numBeakers; j++){
                if(Math.random() < 0.5){
                    compsDict[`beaker${j+1}`] = (Math.random() < 0.5)
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
                    valid = types.includes("SINGLE_FEATURE");
                    break
                case 1: //and object
                    control = new AndObj(compsDict, compsArray.slice(0,2))
                    valid = types.includes("CONJUNCTION");
                    break
                case 2: //or object
                    control = new OrObj(compsDict, compsArray.slice(0,2))
                    valid = types.includes("DISJUNCTION");
                    break
                case 3: //cd
                    control = new cdObj(compsDict, compsArray)
                    valid = types.includes("CONJUNCTION_DISJUNCTION");
                    break
                case 4: // dc
                    control = new dcObj(compsDict, compsArray)
                    valid = types.includes("DISJUNCTION_CONJUNCTION");
                    break
            }
        }
        configArray.push(control)
    }
    let config = new Config(configArray, numBeakers)
    return config
}

function randomRuleTypes(numRules){
    var ruleTypes = [
        "SINGLE_FEATURE",
        "CONJUNCTION",
        "DISJUNCTION",
        "CONJUNCTION_DISJUNCTION",
        "DISJUNCTION_CONJUNCTION"
    ];
    ruleTypes = shuffle(ruleTypes)
    ruleTypes = ruleTypes.slice(0,numRules)
    return ruleTypes
}

//reverses a dict
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

//Turns the list of beakersOn to a  binary string
function beakerStr(beakersOn, numBeakers, tutorial){
    var beakers = ""
    for(var i = 1; i<=numBeakers; i++){
        beakers = beakers + (beakersOn.includes("#beaker" + i + (tutorial? "tutorial": ""))? "1":"0")
    }
    return beakers
}

//Turns a binary string of beakers to a  dictionary  of beaker settings
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

//Dict of beakers to reactions
function generateBeakerQuestions(dict){
    var beakerQuestions = {};
    for(var beakerConfig in dict){
        beakerQuestions[beakerConfig] = {
            q: "The following chemicals are in the box: " + binBeakersToString(beakerConfig) + ". Click on the reactions that will occur ",
            a: dict[beakerConfig]
        }
    }
    return beakerQuestions;
}

//Dict of reactions to beakers and total numbers of reactions
function generateReactionQuestions(dict, numReactions){
    var questions = {};
    //Add three reaction configs
    for(var reactionConfig in dict){
        questions[reactionConfig] = {
            q: "The following reactions are present: " + binReactionsToString(reactionConfig) +
               ". Click on a mixture of chemicals that will make this occur ",
            a: dict[reactionConfig]
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
        questions[ZeroStr] = {
            q: "The following reactions are present: " + binReactionsToString(OneStr) + ". All other reactions are unknown. " +
               "Click on a mixture of chemicals that could make this occur ",
            a: findConfigsForSingReac(dict, i, false)
        }
        questions[OneStr] = {
            q: "The following reactions are present: " + binReactionsToString(OneStr) + ". All other reactions are unknown. " +
               "Click on a mixture of chemicals that could make this occur ",
            a: findConfigsForSingReac(dict, i, true)
        }
    }
    //add doubles
    doubles = findDoubles(dict, numReactions)
    for(var i = 0; i<doubles.length; i++){
        questions[doubles[i]] = {
            q: "The following reactions are present: " + binReactionsToString(OneStr) + ". All other reactions are unknown. " +
               "Click on a mixture of chemicals that could make this occur ",
            a: findConfigsForDoubReac(dict, doubles[i])
        }
    }
    return questions;
}

function binBeakersToString(beakers){
    var chemicals = []
    for(var i = 0; i<beakers.length;  i++){
        if(beakers[i] === '1'){
            chemicals.push(color(i+1) + "ase");
        }
    }
    chemicals.push("alien water (as always)")
    return chemicals.toString();
}

function binReactionsToString(str){
    var reactions = []
    for(var i = 0; i<str.length;  i++){
        if(str[i] !== 'x'){
            reactions.push(captions(i, str[i] === '1'));
        }
    }
    return reactions.toString();
}

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

function findDoubles(reverseDict, numReactions){
    doubles = []
    for(var reactions in reverseDict){
        for(var i = 0; i<numReactions; i++){
            for(var j = 0; j < numReactions; j++){
                if(i < j){
                    var xStr = ""
                    for(var k = 0; k < numReactions; k++){
                        if(k === i) {
                            xStr =  xStr + reactions[i];
                        } else if(k === j){
                            xStr =  xStr + reactions[j];
                        } else {
                            xStr = xStr + "x"
                        }
                    }
                    if(!doubles.includes(xStr)) doubles.push(xStr)
                }
            }
        }
    }
    return doubles
}

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
    return configs
}

function doubleQuestion(double){
    var reactionsOn = [];
    var reactionsOff = [];
    for(var i  = 0; i < double.length; i++){
        if(double[i] !== 'x'){
            reactionsOn.push(captions(i, (double[i] === '1')))
        }
    }
    var q = "The following reactions are present: " + reactionsOn.toString() + ". ";
    q = q + "All other reactions are unknown. What is a possible beaker mixture?"
    return q
}


//////////////////////// Just testing below:////////////////////////////////////

////test settings (Expected results: 1 true, 2 true, 3 false)
//var L_1_need = new OrObj({'beaker1': true, 'beaker3': false}, ['beaker1', 'beaker3']); //First reaction needs either beaker 1 pressed or beaker 3 unpressed
//var L_2_need = new SingObj({'beaker3': true},['beaker3']) //Second reaction needs the third beaker pressed
//var L_3_need = new AndObj({'beaker1': true, 'beaker2': true},['beaker1', 'beaker2']) //Third reaction needs the first two beakers pressed
//var config1 = new Config([L_1_need, L_2_need, L_3_need], numBeakers) //creates the config
//var test1 = generateBox(config1) //generates a box
//var B_1 = true
//var B_2 = true
//var B_3 = true
//var setting1 = new Setting({'beaker1': B_1, 'beaker2': B_2, 'beaker3': B_3}) // creates setting of current beaker "setup"
//var setting2 = new Setting({'beaker1': true, 'beaker2': true, 'beaker3': false})
//var setting3 = new Setting({'beaker1': true, 'beaker2': false, 'beaker3': true})
////enters setting into the box, and logs the resulting scenario
//console.log("First test: " + test1(setting1) + " (Expected results: 1 true, 2 true, 3 true)")
//console.log("")
//console.log("Second test: " + test1(setting2) + " (Expected results: 1 true, 2 false, 3 true)")
//console.log("")
//console.log("Third test: " + test1(setting3) + " (Expected results: 1 true, 2 true, 3 false)")

//console.log("String representation of configuration: " + toString(config1))

//console.log("Randomly generated boxes:")
//console.log()
//var ranBox = createRandomBox(3, 4, ["cd", "dc", "sing"])
//console.log(toString(ranBox))
//console.log(generateBox(ranBox)())
//console.log(reverseDict(generateBox(ranBox)()))

////needs beaker1 on and either beaker2 or beaker3 on
//var L_1_need = new cdObj({'beaker1': true, 'beaker2': true, 'beaker3': true}, ['beaker1', 'beaker2', 'beaker3']);
////needs either beaker1 off or beaker2 and beaker4 on
//var L_2_need = new dcObj({'beaker1': false, 'beaker2': true, 'beaker4': true},['beaker1', 'beaker2', 'beaker4']) //Second reaction needs the third beaker pressed
//var numBeakers = 4
//var config1 = new Config([L_1_need, L_2_need], numBeakers) //creates the config
//var test1 = generateBox(config1)()//generates a box
//console.log(test1)
//console.log(reverseDict(test1))


