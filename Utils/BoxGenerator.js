// Object to store set of biconditionals
function AndObj(...arg){
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
function OrObj(...arg){
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
function SingObj(...arg){
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
function Config(...arg){
    this.controls = arg
}

// stores the current button settings
function Setting(...arg){ // buttons currently pressed
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
        dict[`light${i}`] = {
            type: config.controls[i].type
        }
        for(let j = 0; j < config.controls[i].arg.length; j++){
            console.log("i: " + i + "j: " + j)
            dict[`light${i}`][`button${j}`] = config.controls[i].arg[j]
        }
    }
    return dict
}

//////////////////////// Just testing below:////////////////////////////////////

//test settings (Expected results: 1 true, 2 true, 3 false)
var L_1_need = new OrObj(false, false, false); //First light needs at least one button unpressed
var L_2_need = new SingObj(false, false, true) //Second light needs the third button pressed
var L_3_need = new AndObj(true, true, false) //Third light needs the first two buttons pressed and third unpressed
var config1 = new Config(L_1_need, L_2_need, L_3_need) //creates the config
var test1 = generateBox(config1) //generates a box
var B_1 = true
var B_2 = false
var B_3 = true
var setting1 = new Setting(B_1, B_2, B_3) // creates setting of current button "setup"
//enters setting into the box, and logs the resulting scenario
console.log("First test: " + test1(setting1) + " (Expected results: 1 true, 2 true, 3 false)")
console.log(toString(config1))


//test settings (2 should be on, 1 should be off)
var B_B_need = new OrObj(false, false); //Blue light needs at least one button unpressed
var B_R_need = new AndObj(true, true); //Red light needs both buttons pressed
var config1 = new Config(B_R_need, B_B_need) //creates the config
var test1 = generateBox(config1) //generates a box
var blue = true // value of blue button in scenario
var red = false // value of red button in scenario
var setting1 = new Setting(red, blue) // creates setting of current button "setup"
//enters setting into the box, and logs the resulting scenario
console.log("First test: " + test1(setting1) + " (Expected result: 1 off, 2 on)")


//test settings (1 should be on, 2 should be on)
var B_B_need2 = new SingObj(false, true); //Blue light needs blue button pressed
var B_R_need2 = new AndObj(true, true); //Red light needs both buttons pressed
var config2 = new Config(B_R_need2, B_B_need2) //creates the config
var test2 = generateBox(config2) //generates a box
var blue2 = true // value of blue button in scenario
var red2 = true // value of red button in scenario
var setting2 = new Setting(red2, blue2) // creates setting of current button "setup"
//enters setting into the box, and logs the resulting scenario
console.log("Second test: " + test2(setting2) + " (Expected result: 1 on, 2 on)")


