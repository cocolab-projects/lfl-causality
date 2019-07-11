// --------------------------------------------------------------------
// draw.creatures.js
// Author: Sahil Chopra
// Date: December 21, 2018
// Goal: Helper functions utilized in drawing creatures for 
//       multiplayer game 6.
// --------------------------------------------------------------------
function drawBox(numBeakers, numReactions, train, roundProps) {
    var reactions = []
    for(var i = 1; i<=numReactions; i++){
        reactions.push("<img id='reaction" + i + "'src = 'Reaction"+i+"On.svg' alt = 'Reaction"+i+"' class = 'beaker'>");
    }
    shuffle(reactions)
    var beakers = []
    for(var j = 1; j<=numBeakers; j++){
        beakers.push("<img id='beaker" + j + "'src = '"+ color(j-1) + "_Beaker.svg' alt = '"+ color(j-1) + " Beaker' class = 'beaker'>")
    }
    shuffle(beakers)
    beakers.push("<img id='mix_beaker 'src = 'Mix_Beaker.svg' alt = 'Mix Beaker' class = 'mixbeaker'>")
    let beakersStr = beakers.join('')
    let reactionsStr = reactions.join('')
    if (train === true) {
        $("#train_creatures_slide_grid").append(beakersStr + "<br></br>" + reactionsStr);
        for(var h = 1; h<=numBeakers; h++){
            drawTrainingScenario(roundProps, h)
        }
    } else {
        $("#test_creatures_slide_grid").append(beakers + reactions);
    }
}
  
function drawTrainingScenario(roundProps, i){
    var id = "#beaker" + i
    $(id).click(function(event) {
        var event_id = event.target.id;
        if(!roundProps.selected_train_stim.includes(id)){
            darken(id)
            empty(id)
            roundProps.selected_train_stim.push(id)
        }else {
            lighten(id)
            fill(id)
            roundProps.selected_train_stim.splice(roundProps.selected_train_stim.indexOf(id), 1)
        }
        console.log("Currently selected beakers: " + roundProps.selected_train_stim)
    })
}
  
function drawTestingScenario(stim, creatureInd, scale, roundProps){
    // Draw Creature
    var id = "test_creature_" + creatureInd;
    Ecosystem.draw(stim.creature, stim.props, id, scale);
  
    // Add Click Handlers to Creature's Table Cell
    $("#test_cell_" + creatureInd).click(function(event) {
        var id = "#test_cell_" + creatureInd;
        if (roundProps.selected_test_stim.includes(id)) {
            // Remove Previously Marked Creature
            unmarkAsSpecies(id);
            roundProps.selected_test_stim.splice(
                roundProps.selected_test_stim.indexOf(id),
                1
            );
        } else {
            // Mark Creature
            markAsSpecies(id);
            roundProps.selected_test_stim.push(id);
        }
    });
}
  
function darken(id) {
    $(id).css({"opacity":1.0});
}
function lighten(id){
    $(id).css({"opacity":0.5});
}
function empty(id){
    $(id).addClass("empty");
}
function fill(id){
    $(id).removeClass("empty");
}

function turnReactionsOff(numReactions, numBeakers){
    for(var i = 1; i<=numReactions; i++){
        lighten("#reaction" + i)
    }
    for(var i = 1; i<=numBeakers; i++){
        lighten("#beaker" + i)
    }
}

  
function turnReactionsOn(beakersOn, reactionsDict, numBeakers, numReactions, numTotalTests, numReqTests) {
    var reactionsOn = [];
    var beakersKey = beakerStr(beakersOn, numBeakers)
    for(var h = 0; h<reactionsDict[beakersKey].length; h++){
        var id = "#reaction" + (h+1)
        if(reactionsDict[beakersKey][h]){
            darken(id)
            reactionsOn.push(id)
        } else {
            lighten(id)
        }
    }
    console.log("numTotalTests: " + numTotalTests)
    console.log("numReqTests: " + numReqTests)
    if(numTotalTests >= numReqTests){
        console.log("click should enable")
        $("#train_creatures_slide_continue_button").prop("disabled", false);
    }
}
  
function markAsSpecies(id) {
    $(id).css({"background-color":"yellow"});
}
  
function unmarkAsSpecies(id) {
    $(id).css({"background-color":"transparent"});
}

//returns a color based off of the number of the object
function color(num){
    var colors = ['Red', 'Green', 'Blue', 'Yellow', 'Brown']
    return colors[num]
}
