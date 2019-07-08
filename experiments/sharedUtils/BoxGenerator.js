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

//stores the configurations that will control (turn on) lights
function Config(arg, numButtons){
    this.controls = arg
    this.numButtons = numButtons
}

//generate the box. Takes in a config (what turns on what) and returns a function that
// determine what is turned on
function generateBox(config){
    //function to return, which will take in a setting and return what is turned on
    function configDict(){
        let dict = {} // keys: setting of buttons, values: lights
        for(var i = 0; i < (Math.pow(2, config.numButtons)); i++){
            var set = ""
            var setting = {}
            for(var j = 1; j <= config.numButtons; j++){
                if((i%(Math.pow(2,j)) >= (Math.pow(2, j-1)))){
                    set = set + "1"
                }
                else {
                    set = set + "0"
                }
                setting[`button${j}`] = (i%(Math.pow(2,j)) >= (Math.pow(2, j-1)))
            }
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
        dict[`Light ${i+1}`] = {
            type: config.controls[i].type,
            controls: config.controls[i].arg,
        }
    }
    return JSON.stringify(dict)
}

function createRandomBox(numButtons, numLights, numStars){
    let configArray = []
    // create a control for each light
    for(let i = 0; i < numLights; i++){
        let compsArray = [] //array of components that control the light
        let compsDict = {} //dict of components and their settings
        do{
            compsArray = []
            compsDict = {}
            for(let j = 0; j < numButtons; j++){
                if(Math.floor(Math.random()*2) === 1){
                    compsDict[`button${j+1}`] = (Math.floor(Math.random()*2) === 1)
                    compsArray.push(`button${j+1}`)
                }
            }
        } while(compsArray.length < 2 && numButtons >= 2); //keep going until there is at least one control
        let control
        switch(Math.floor(Math.random()*3)){
            case 0: //singular object
                let indexToChoose = Math.floor(Math.random()*numButtons)
                var singCompsDict = {}
                singCompsDict[`button${indexToChoose+1}`] = (Math.floor(Math.random()*2) === 1)
                compsArray = [`button${indexToChoose+1}`]
                control = new SingObj(singCompsDict, compsArray)
                break
            case 1: //and object
                control = new AndObj(compsDict, compsArray)
                break
            case 2: //or object
                control = new OrObj(compsDict, compsArray)
                break
        }
        configArray.push(control)
    }
    let config = new Config(configArray, numButtons)
    return config
}


//////////////////////// Just testing below:////////////////////////////////////

////test settings (Expected results: 1 true, 2 true, 3 false)
//var L_1_need = new OrObj({'button1': true, 'button3': false}, ['button1', 'button3']); //First light needs either button 1 pressed or button 3 unpressed
//var L_2_need = new SingObj({'button3': true},['button3']) //Second light needs the third button pressed
//var L_3_need = new AndObj({'button1': true, 'button2': true},['button1', 'button2']) //Third light needs the first two buttons pressed
//var config1 = new Config([L_1_need, L_2_need, L_3_need], numButtons) //creates the config
//var test1 = generateBox(config1) //generates a box
//var B_1 = true
//var B_2 = true
//var B_3 = true
//var setting1 = new Setting({'button1': B_1, 'button2': B_2, 'button3': B_3}) // creates setting of current button "setup"
//var setting2 = new Setting({'button1': true, 'button2': true, 'button3': false})
//var setting3 = new Setting({'button1': true, 'button2': false, 'button3': true})
////enters setting into the box, and logs the resulting scenario
//console.log("First test: " + test1(setting1) + " (Expected results: 1 true, 2 true, 3 true)")
//console.log("")
//console.log("Second test: " + test1(setting2) + " (Expected results: 1 true, 2 false, 3 true)")
//console.log("")
//console.log("Third test: " + test1(setting3) + " (Expected results: 1 true, 2 true, 3 false)")

//console.log("String representation of configuration: " + toString(config1))

//console.log("Randomly generated boxes:")
//console.log()
//var ranBox = createRandomBox(3, 4)
//console.log(toString(ranBox))
//console.log(generateBox(ranBox)())
//console.log(toString(createRandomBox(4, 5)))


