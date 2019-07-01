let possible_config_array = [];
// Finds "and" truth value of array of variables
function andSum(args){
    let bool = true
    for(let elem of args){
        bool = bool && elem
    }
    return bool
}

// Object to store set of biconditionals
function AndObj(...arg){
    this.arg = arg
    this.value = andSum(arg)
    this.type = "and"
}

//Finds "or" truth value of array of variables
function orSum(args){
    let bool = false
    for(let elem of args){
        bool = bool || elem
    }
    return bool
}

// Object to store set of disjunctions
function OrObj(...arg){
    this.arg = arg
    this.value = orSum(arg)
    this.type = "or"
}

// Object to store a single conditional
function SingObj(...arg){
    this.arg = arg
    this.value = arg[0] || arg[1]
    this.type = "sing"
}

//stores the configurations that will control (turn on) lights
function Config(L_R_control, L_B_control){
    this.L_R_control = L_R_control //and or or object - both have a value
    this.L_B_control = L_B_control // same as above
}

// stores the current button settings
function Setting(L_R_state, L_B_state){ // Red button, Blue button
    this.L_R_state = L_R_state
    this.L_B_state = L_B_state
}

//generate the box. Takes in a config (what turns on what) and returns a function that
// determine what is turned on
function generateBox(config){
    //function to return, which will take in a setting and return what is turned on
    function box(setting){
        //array of what is turned on
        let arr = []
        //variables to keep track of lights
        var checkRed
        var checkBlue

        //check what type of variable the red light is controlled by
        if(config.L_R_control.type === "or"){
            checkRed = new OrObj(config.L_R_control.arg[0] === setting.L_R_state,
                                 config.L_R_control.arg[1] === setting.L_B_state); //check if the conditions are met
        } else if (config.L_R_control.type === "and"){
            checkRed = new AndObj(config.L_R_control.arg[0] === setting.L_R_state,
                                      config.L_R_control.arg[1] === setting.L_B_state);//check if the conditions are met
        } else if (config.L_R_control.type === "sing"){
            checkRed = new AndObj(config.L_R_control.arg[0] === setting.L_R_state,
                                      config.L_R_control.arg[1] === setting.L_B_state);//check if the conditions are met
        }

        arr.push("Red Button: ")
        arr.push(checkRed.value) //log the value to the array

        //check what type of variable the blue light is controlled by
        if(config.L_B_control.type === "or"){
            checkBlue = new OrObj(config.L_B_control.arg[0] === setting.L_R_state, config.L_B_control.arg[1] === setting.L_B_state);
        } else if (config.L_B_control.type === "and"){
            checkBlue = new AndObj(config.L_B_control.arg[0] === setting.L_R_state, config.L_B_control.arg[1] === setting.L_B_state);
        } else if (config.L_B_control.type === "sing"){
            checkBlue = new AndObj(config.L_B_control.arg[0] === setting.L_R_state, config.L_B_control.arg[1] === setting.L_B_state);
        }
        arr.push("Blue Button: ")
        arr.push(checkBlue.value) //log the value to the array
        return arr //return the array
    }
    return box //return the function
}

//test settings for first scenario (blue should be on, red should be off)
var B_B_need = new OrObj(false, false); //Blue button needs at least one button unpressed
var B_R_need = new AndObj(true, true); //Red button needs both buttons pressed
var config1 = new Config(B_R_need, B_B_need) //creates the config
var test1 = generateBox(config1) //generates a box
var blue = true // value of blue button in scenario
var red = false // value of red button in scenario
var setting1 = new Setting(red, blue) // creates setting of current button "setup"
//enters setting into the box, and logs the resulting scenario
console.log("First test: " + test1(setting1) + " (Expected result: blue on, red off)")

//test settings for second scenario (blue should be on, red should be on)
var B_B_need2 = new SingObj(null, true); //Blue button needs second pressed
var B_R_need2 = new AndObj(true, true); //Red button needs both buttons pressed
var config2 = new Config(B_B_need2, B_R_need2) //creates the config
var test2 = generateBox(config2) //generates a box
var blue2 = true // value of blue button in scenario
var red2 = true // value of red button in scenario
var setting2 = new Setting(red2, blue2) // creates setting of current button "setup"
//enters setting into the box, and logs the resulting scenario
console.log("Second test: " + test2(setting2) + " (Expected result: blue on, red on)")

