// --------------------------------------------------------------------
// draw.creatures.js
// Author: Sahil Chopra
// Date: December 21, 2018
// Goal: Helper functions utilized in drawing creatures for 
//       multiplayer game 6.
// --------------------------------------------------------------------
function drawBox(numBeakers, numReactions, train, roundProps, game) {
    var reactions = []
    for(var i = 1; i<=numReactions; i++){
        reactions.push("<figure><img id='reaction" + i + "'src = 'Graphics/Reaction"+i+"Off.svg' "+
                       "alt = 'Reaction"+i+"' class = 'reaction'><figcaption id='cap_reaction" + i + "'>"+
                       captions(i-1) +"</figcaption></figure>");
    }
    shuffle(reactions)
    var beakers = []
    for(var j = 1; j<=numBeakers; j++){
        beakers.push("<figure><img id='beaker" + j + "'src = 'Graphics/"+ color(j-1) + "_Beaker.svg' "+
                     "alt = '"+ color(j-1) + " Beaker' class = 'beaker'><figcaption>"+ color(j-1) + "ase</figcaption></figure>")
    }
    shuffle(beakers)
    beakers.push("<figure><img id='mix_box'src = 'Graphics/Box_000.svg' alt = 'Mix Box' class = 'mixbeaker'>" +
                 "<figcaption>Mixing Box</figcaption></figure>")
    let beakersStr = beakers.join('')
    let reactionsStr = reactions.join('')
    if (train === true) {
        $("#train_creatures_slide_grid").append(beakersStr + reactionsStr);
        for(var h = 1; h<=numBeakers; h++){
            drawTrainingScenario(roundProps, h, game)
        }
        for(var i = 1; i<=numReactions; i++){
            lighten("#cap_reaction" + i)
        }
    } else {
        $("#test_creatures_slide_grid").append(beakers + reactions);
    }
}
  
function drawTrainingScenario(roundProps, i, game){
    var id = "#beaker" + i
    $(id).click(function(event) {
        var event_id = event.target.id;
        if(game.testStage){
            if(!roundProps.selected_train_stim.includes(id)){
                lighten(id)
                empty(id)
                roundProps.selected_train_stim.push(id)
            }else {
                darken(id)
                fill(id[7])
                roundProps.selected_train_stim.splice(roundProps.selected_train_stim.indexOf(id), 1)
            }
            var img = "Graphics/Box_" + beakerStr(roundProps.selected_train_stim, game.numBeakers) + ".svg"
            console.log(img);
            $("#mix_box").attr("src", img);
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
    $(id).attr("src", "Graphics/Empty_Beaker.svg");
}
function fill(i){
    var id='#beaker' + i
    var img = "Graphics/" + color(i-1) + "_Beaker.svg"
    $(id).attr("src", img)
}
function turnOn(i){
    var id='#reaction' + i
    var img = "Graphics/Reaction"+ i + "On.svg"
    $(id).attr("src", img)
}
function turnOff(i){
    var id='#reaction' + i
    var img = "Graphics/Reaction"+ i + "Off.svg"
    $(id).attr("src", img)
}

function turnReactionsOff(numReactions, numBeakers){
    for(var i = 1; i<=numReactions; i++){
        lighten("#reaction" + i)
        lighten("#cap_reaction" + i)
        turnOff(i)
    }
    for(var i = 1; i<=numBeakers; i++){
        darken("#beaker" + i)
        fill(i)
    }
    $("#mix_box").attr("src", 'Graphics/Box_000.svg')
}

  
function turnReactionsOn(beakersOn, reactionsDict, numBeakers, numReactions) {
    var reactionsOn = [];
    var beakersKey = beakerStr(beakersOn, numBeakers)
    for(var h = 0; h<reactionsDict[beakersKey].length; h++){
        var id = "#reaction" + (h+1)
        if(reactionsDict[beakersKey][h]){
            darken("#cap_reaction" + (h+1))
            darken(id)
            turnOn(h+1)
            reactionsOn.push(id)
        } else {
            turnOff(h+1)
            lighten(id)
            lighten("#cap_reaction" + (h+1))
        }
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

function captions(num){
    var colors = ['Glows', 'Hot', 'Conducts Electricity']
    return colors[num]
}
