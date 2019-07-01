// Object to store set of biconditionals
function AndObj(arg){
    this.arg = arg
    this.type = "and"
    this.eval = function(args){
        for(let i = 0; i < arg.length; i++){
            if(arg[i] !== args[i]) return false
        }
        return true
    }
}

// Object to store set of disjunctions
function OrObj(arg){
    this.arg = arg
    this.type = "or"
    this.eval = function(args){
        for(let i = 0; i < arg.length; i++){
            if(arg[i] === args[i]) return true
        }
        return false
    }
}

// Object to store a single conditional
function SingObj(arg){
    this.arg = arg
    this.type = "sing"
    this.eval = function(args){
        for(let i = 0; i < arg.length; i++){
            if(arg[i] && args[i]) return true
        }
        return false
    }

}

//stores the configurations that will control (turn on) lights
function Config(arg){
    this.controls = arg
}

// stores the current button settings
function Setting(arg){ // buttons currently pressed
    this.args = arg
}

//generate the box. Takes in a config (what turns on what) and returns a function that
// determine what is turned on
function generateBox(config){
    //function to return, which will take in a setting and return what is turned on
    function box(setting){    
        let arr = [] //array of results
        for(let i = 0; i < config.controls.length; i++){
            arr.push(`Light ${i+1}: ${config.controls[i].eval(setting.args)}`)
        }
        return arr //return the array
    }
    return box //return the function
}

// Takes in a configuration, and returns a string representation
function toString(config){
    var dict = {}
    for(let i = 0; i < config.controls.length; i++){
        dict[`Light ${i+1}`] = {
            type: config.controls[i].type
        }
        for(let j = 0; j < config.controls[i].arg.length; j++){
            dict[`Light ${i+1}`][`b_${j+1}`] = config.controls[i].arg[j]
        }
    }
    return JSON.stringify(dict)
}

function createRandomBox(numButtons, numLights){
    let configArray = []
    // create a control for each light
    for(let i = 0; i < numLights; i++){
        let buttonArray = []
        for(let j = 0; j < numButtons; j++){
            buttonArray.push(Math.floor(Math.random()*2) === 1)
        }
        let control
        switch(Math.floor(Math.random()*3)){
            case 0: //singular object
                buttonArray.fill(false)
                buttonArray[Math.floor(Math.random()*buttonArray.length)] = true
                control = new SingObj(buttonArray)
                break
            case 1: //and object
                control = new AndObj(buttonArray)
                break
            case 2: //or object
                control = new OrObj(buttonArray)
                break
        }
        configArray.push(control)
    }
    let config = new Config(configArray)
    return config
}


//////////////////////// Just testing below:////////////////////////////////////

//test settings (Expected results: 1 true, 2 true, 3 false)
var L_1_need = new OrObj([false, false, false]); //First light needs at least one button unpressed
var L_2_need = new SingObj([false, false, true]) //Second light needs the third button pressed
var L_3_need = new AndObj([true, true, false]) //Third light needs the first two buttons pressed and third unpressed
var config1 = new Config([L_1_need, L_2_need, L_3_need]) //creates the config
var test1 = generateBox(config1) //generates a box
var B_1 = true
var B_2 = false
var B_3 = true
var setting1 = new Setting([B_1, B_2, B_3]) // creates setting of current button "setup"
//enters setting into the box, and logs the resulting scenario
console.log("First test: " + test1(setting1) + " (Expected results: 1 true, 2 true, 3 false)")
console.log("String representation of configuration: " + toString(config1))

console.log("Randomly generated boxes:")
console.log()
console.log(toString(createRandomBox(2, 4)))
console.log(toString(createRandomBox(4, 5)))


