// --------------------------------------------------------------------
// draw.creatures.js
// Author: Sahil Chopra
// Date: December 21, 2018
// Goal: Helper functions utilized in drawing creatures for 
//       multiplayer game 6.
// --------------------------------------------------------------------

function drawBoxTable(numButtons, numLights, numStars, train, roundProps) {
    var lights = []
    for(var i = 1; i<=numLights; i++){
        let ran_Num = Math.floor(Math.random()*lights.length)
        var light = "<div id='light" + i + "' style='width:125px;padding:50px 0px;background-color:" + color(i) +"; margin:10px;" +
                " opacity:0.5;text-align:center;font-size:25px;border-radius:50%;display:inline-block'>light " + i + "</div>";
        lights.splice(ran_Num, 0, light)
    }
    var buttons = []
    for(var j = 1; j<=numButtons; j++){
        let ran_Num = Math.floor(Math.random()*buttons.length)
        var button = "<div id='button" + j + "' style='width:125px;padding:50px 0px;background-color:" + color(j) +"; margin:10px;" +
                " opacity:0.5;text-align:center;font-size:25px;display:inline-block'>button "+ j +"</div>"
        buttons.splice(ran_Num, 0, button)
    }
    var stars = []
    for(var j = 1; j<=numStars; j++){
        let ran_Num = Math.floor(Math.random()*stars.length)
        var star = "<div id='star" + j + "' style='width:125px;padding:50px 0px;background-color:" + color(j) +"; margin:10px;" +
                "text-align:center;font-size:25px;border-radius:20%;display:inline-block'></div>"
        stars.splice(ran_Num, 0, star)
    }
    let starsStr = stars.toString()
    starsStr = starsStr.replace(/,/g, "")
    let buttonsStr = buttons.toString()
    buttonsStr = buttonsStr.replace(/,/g, "")
    let lightsStr = lights.toString()
    lightsStr = lightsStr.replace(/,/g, "")
    if (train === true) {
        $("#train_creatures_slide_grid").append(starsStr + "<br></br>" + buttonsStr + "<br></br>" + lightsStr);
    } else {
        $("#test_creatures_slide_grid").append(buttons + lights);
    }
    for(var h = 1; h<=numButtons; h++){
        drawTrainingScenario(roundProps, h)
    }
    for(var h = 1; h<=numStars; h++){
        if(Math.random() < .5){
            $("#star" + h).css({"opacity":0});
        }
    }

}

    /**
    // Draw a table of creatures in a grid of numCols columns
    var numRows = Math.ceil(creatures.length / numCols);
    var table = "<table class='creatures_table'>";
    var creatureInd = 0;

    for(var i = 0; i < numRows; i++) {
        table += "<tr>";
        for(var j = 0; j < numCols; j++) {
            if (creatureInd >= creatures.length) break;
            if (train === true){
                table += "<td class='train_creature_cell' id='train_cell_" + creatureInd + "'\">";
            } else {
                table += "<td class='test_creature_cell' id='test_cell_" + creatureInd + "'\">";
            }
            if (train === true) {
                table += "<svg class='creature_svg' id='train_creature_" + creatureInd + "'>" +
                    "</svg></td>";
            } else {
                table += "<svg class='creature_svg' id='test_creature_" + creatureInd + "'>" +
                "</svg></td>";
            }
            creatureInd += 1;
        }
        table += "</tr>";
    }
    table += "</table>";

    // Append table to appropriate table
    if (train === true) {
        $("#train_creatures_slide_grid").append(table);
    } else {
        $("#test_creatures_slide_grid").append(table);
    }

    // Draw the creatures
    for (var i = 0; i < creatures.length; i++) {
        var scale = 0.75;
        var c = creatures[i];
        if (train === true) {
            var cell_id = "#train_cell_" + i;
            $(cell_id).attr("belongs_to_concept", c.belongs_to_concept);
        }
        if (train) drawTrainCreature(c, speciesName, i, creatures.length, scale, roundProps);
        else drawTestCreature(c, i, scale, roundProps);
    }
    */
  
  function drawTrainingScenario(roundProps, i){
      var id = "#button" + i
      $(id).click(function(event) {
          var event_id = event.target.id;
          if(!roundProps.selected_train_stim.includes(id)){
              darken(id)
              roundProps.selected_train_stim.push(id)
          }else {
              lighten(id)
              roundProps.selected_train_stim.splice(roundProps.selected_train_stim.indexOf(id), 1)
          }
          console.log("Currently selected buttons: " + roundProps.selected_train_stim)
      })

   /**
      // Draw Creature
    var id = "train_creature_" + creatureInd;
    Ecosystem.draw(stim.creature, stim.props, id, scale);
  
    // Construct Label
    var label = "";
    if (stim.belongs_to_concept) {  
        label = "<div class='species-label' id='train_cell_" + creatureInd + "_label'>" + speciesName + "</div>";
    } else {
        label = "<div class='species-label' id='train_cell_" + creatureInd + "_label'> </div>";
    }
    $(label).insertAfter("#" + id);
  
    // Add Click Handlers to Creature's Table Cell
    $("#train_cell_" + creatureInd).click(function(event) {
        var event_id = event.target.id;
        var creature_id_prefix = "train_creature_";
        var cell_id_prefix = "train_cell_";
        var id = "#train_cell_" + creatureInd;

        // Visualize Changes (Post-Click)
        darken(id);
        showSpeciesIndicator(id, speciesName);
  
        if (!roundProps.selected_train_stim.includes(id)) {
            // Clicked Creature Not Previously Selected
            roundProps.selected_train_stim.push(id);
            if (roundProps.selected_train_stim.length === num_creatures) {
                // Show "Continue" button -- exploration complete
                $("#train_creatures_slide_continue_button").prop("disabled", false);
                $("#train_creatures_slide_continue_button").show();

                alert(
                    "Exploration Complete! " +
                     "Please take a moment to review your findings before continuing to the chatroom."
                );
            }
        }
    });
    */
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
    $(id).css({"opacity":.5});
}
  
function turnLightsOn(buttonsOn, test1, numButtons, numLights, lightsPrev) {
    var lightsOn = [];
    var dictOfButtons = "";
    for(var i = 1; i<=numButtons; i++){
        if(buttonsOn.includes("#button" + i)){
            dictOfButtons = dictOfButtons + "1"
        }
        else {
            dictOfButtons = dictOfButtons + "0"
        }
    }
    for(var j = 1; j<=numLights; j++){
        $("#light" + j).css({"opacity":0.5});
    }
    for(var h = 0; h<test1[dictOfButtons].length; h++){
        var id = "#light" + (h+1)
        if(test1[dictOfButtons][h]){
            $(id).css({"opacity":1.0});
            lightsOn.push(id)
        }
    }
    for(var k = 0; k<lightsOn.length; k++){
        if(!lightsPrev.includes(lightsOn[k])){
            lightsPrev.push(lightsOn[k]);
        }
    }
    if(lightsPrev.length === numLights){
        $("#train_creatures_slide_continue_button").prop("disabled", false);
        $("#train_creatures_slide_continue_button").show();
    }
    return lightsPrev
}
  
function markAsSpecies(id) {
    $(id).css({"background-color":"yellow"});
}
  
function unmarkAsSpecies(id) {
    $(id).css({"background-color":"transparent"});
}
function color(num){
    switch(num){
    case 1:
        return "red"
    case 2:
        return "orange"
    case 3:
        return "yellow"
    case 4:
        return "green"
    case 5:
        return "blue"
    case 6:
        return "purple"
    case 7:
        return "pink"
    case 8:
        return "brown"
    default:
        return "black"
    }
}
