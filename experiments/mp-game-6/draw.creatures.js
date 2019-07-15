// --------------------------------------------------------------------
// draw.creatures.js
// Author: Sahil Chopra
// Date: December 21, 2018
// Goal: Helper functions utilized in drawing creatures for 
//       multiplayer game 6.
// --------------------------------------------------------------------
function drawBox(numBeakers, numReactions, train, tutorial, roundProps, game) {
    var reactions = ["<div id='reactions"+ (tutorial ? "tutorial": "") + "'>"]
    var beakers = ["<div id='beakers"+ (tutorial ? "tutorial": "") + "'>"]
    if(tutorial){
        reactions.push("<p id='reactionInstruct'class='instruct'>These are reactions. After you press the mix button" +
                       ", then the properties of that mixture will be displayed here. You can " +
                       "click the 'New Test' button to start a new mixture. There is no 'New Test' button in the later assessment phase</p>");
        beakers.push("<figure id='beakerInstruct'class='instruct'>These are beakers of chemicals. You can click once to add them" +
                     " to the mixture, and then click again to remove them. Try adding 'redase' and 'greenase'. </figure>")
    }

    for(var i = 1; i<=numReactions; i++){
        reactions.push("<figure><img id='reaction" + i + (tutorial ? "tutorial": "") + "'src = 'Graphics/Reaction"+i+"Off.svg' "+
                       "alt = 'Reaction"+i+"' class = 'reaction'><figcaption id='cap_reaction" + i + (tutorial ? "tutorial": "") +
                       "' class = 'caption" + ((i===3)?"long":"") + "'>"+ captions(i-1, false) + " / " + captions(i-1, true) + "</figcaption></figure>");
    } 
    for(var j = 1; j<=numBeakers; j++){
        beakers.push("<figure><img id='beaker" + j + (tutorial ? "tutorial": "") + "'src = 'Graphics/"+ color(j-1) + "_Beaker.svg' "+
                     "alt = '"+ color(j-1) + " Beaker' class = 'beaker'><figcaption>"+ color(j-1) + "ase</figcaption></figure>")
    }
    let mixBox;
    if (tutorial){
        beakers.push("</div>")
        mixBox = "<div id='mixBoxTutorial'> " +
                "<p id='mixInstruct'class='instruct'>This is the mixing box. It contains alien water, and you can add other " +
                "chemicals to it. Chemicals you have added appear in the box. Now that you have added the 'redase' and 'greenase' " +
                "to the mixture, scroll down and click the 'mix' button to see what happens. </p>" +
                "<figure><img id='mix_boxtutorial'src = 'Graphics/Box_000.svg' alt = 'Mix Box' class = 'mixbeaker'>" +
                "<figcaption>Mixing Box</figcaption></figure></div>"
    }
    else {
        beakers.push("<figure><img id='mix_box"+ (tutorial ? "tutorial": "") + "'src = 'Graphics/Box_000.svg' alt = 'Mix Box' class = 'mixbeaker'>" +
                      "<figcaption>Mixing Box</figcaption></figure></div>")
    }
    reactions.push("</div>")
    let beakersStr = beakers.join('')
    let reactionsStr = reactions.join('')
    if(tutorial){
        $("#tutorial_slide_grid").append(beakersStr + mixBox + reactionsStr);
        roundProps.tutorial = {
            numBeakerClicks: 0,
            beakersClicked: [],
        }
        for(var h = 1; h<=numBeakers; h++){
            drawTutorialScenario(roundProps, h, game)
        }
        for(var i = 1; i<=numReactions; i++){
            lighten("#cap_reaction" + i + (tutorial ? "tutorial": ""))
        }
        startTutorial(roundProps);
    }else if (train) {
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
    console.log("adding click function for id: " + id)
    $(id).click(function(event) {
        var event_id = event.target.id;
        if(game.testStage){
            if(!roundProps.selected_train_stim.includes(id)){
                lighten(id)
                empty(id)
                roundProps.selected_train_stim.push(id)
            }else {
                darken(id)
                fill(id[7], false)
                roundProps.selected_train_stim.splice(roundProps.selected_train_stim.indexOf(id), 1)
            }
            var img = "Graphics/Box_" + beakerStr(roundProps.selected_train_stim, game.numBeakers, false) + ".svg"
            console.log(img);
            $("#mix_box").attr("src", img);
        }
        console.log("Currently selected beakers: " + roundProps.selected_train_stim)
    })
}

function drawTutorialScenario(roundProps, i, game){
    var id = "#beaker" + i + "tutorial"
    $(id).click(function(event) {
        var event_id = event.target.id;
        roundProps.tutorial.numBeakerClicks++;
        if(!roundProps.tutorial.beakersClicked.includes(id)){
            lighten(id)
            empty(id)
            roundProps.tutorial.beakersClicked.push(id)
        }else {
            darken(id)
            fill(id[7], true)
            roundProps.tutorial.beakersClicked.splice(roundProps.tutorial.beakersClicked.indexOf(id), 1)
        }
        var img = "Graphics/Box_" + beakerStr(roundProps.tutorial.beakersClicked, game.numBeakers, true) + ".svg"
        console.log(img);
        $("#mix_boxtutorial").attr("src", img);
        console.log("Currently selected beakers: " + roundProps.tutorial.beakersClicked)
        if(roundProps.tutorial.beakersClicked.includes("#beaker1tutorial") &&
                roundProps.tutorial.beakersClicked.includes("#beaker2tutorial")  &&
                !roundProps.tutorial.beakersClicked.includes("#beaker3tutorial")){
            moveToMixBox(roundProps);
        }
    })
}

function startTutorial(roundProps){
    highlight("#beakerstutorial")
    lighten("#reactionstutorial")
    lighten("#mixBoxTutorial")
    $("#reactionInstruct").hide();
    $("#mixInstruct").hide();
}

function moveToMixBox(roundProps){
    $("#mixInstruct").show();
    unhighlight("#beakerstutorial")
    lighten("#beakerstutorial")
    highlight("#mixBoxTutorial")
    darken("#mixBoxTutorial")
    highlight("#tutorial_slide_test_button")
    $("#tutorial_slide_test_button").prop("disabled", false);
    $("#tutorial_slide_newtest_button").prop("disabled", true);
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
function fill(i, tutorial){
    var id='#beaker' + i + (tutorial ? "tutorial": "")
    var img = "Graphics/" + color(i-1) + "_Beaker.svg"
    $(id).attr("src", img)
}
function turnOn(i, tutorial){
    var id='#reaction' + i + (tutorial ? "tutorial": "")
    var img = "Graphics/Reaction"+ i + "On.svg"
    $(id).attr("src", img)
    var cap='#cap_reaction' + i + (tutorial ? "tutorial": "")
    $(cap).text(captions(i-1, true))
}
function turnOff(i, tutorial){
    var id='#reaction' + i + (tutorial ? "tutorial": "")
    var img = "Graphics/Reaction"+ i + "Off.svg"
    $(id).attr("src", img)
    var cap='#cap_reaction' + i + (tutorial ? "tutorial": "")
    $(cap).text(captions(i-1, false))
}

function turnNeutral(i, tutorial){
    var id='#reaction' + i + (tutorial ? "tutorial": "")
    var img = "Graphics/Reaction"+ i + "Off.svg"
    $(id).attr("src", img)
    var cap='#cap_reaction' + i + (tutorial ? "tutorial": "")
    $(cap).text(captions(i-1, false) + " / " + captions(i-1, true))
}

function turnReactionsOff(numReactions, numBeakers, tutorial){
    for(var i = 1; i<=numReactions; i++){
        lighten("#reaction" + i + (tutorial ? "tutorial": ""))
        lighten("#cap_reaction" + i + (tutorial ? "tutorial": ""))
        turnNeutral(i, tutorial)
    }
    for(var i = 1; i<=numBeakers; i++){
        darken("#beaker" + i + (tutorial ? "tutorial": ""))
        fill(i, tutorial)
    }
    $("#mix_box" + (tutorial ? "tutorial": "")).attr("src", 'Graphics/Box_000.svg')
}

  
function turnReactionsOn(beakersOn, reactionsDict, numBeakers, numReactions, tutorial) {
    var reactionsOn = [];
    var beakersKey = beakerStr(beakersOn, numBeakers, tutorial)
    for(var h = 0; h<reactionsDict[beakersKey].length; h++){
        var id = "#reaction" + (h+1) + (tutorial ? "tutorial": "")
        if(reactionsDict[beakersKey][h]){
            darken("#cap_reaction" + (h+1) + (tutorial ? "tutorial": ""))
            darken(id)
            turnOn(h+1, tutorial)
            reactionsOn.push(id)
        } else {
            turnOff(h+1, tutorial)
            darken("#cap_reaction" + (h+1) + (tutorial ? "tutorial": ""))
            darken(id)
        }
    }
}
  
function highlight(id) {
    $(id).css({"background-color":"yellow"});
}
  
function unhighlight(id) {
    $(id).css({"background-color":"transparent"});
}

//returns a color based off of the number of the object
function color(num){
    var colors = ['Red', 'Green', 'Blue', 'Yellow', 'Brown']
    return colors[num]
}

function captions(num, isOn){
    var onCaps = ['Glows', 'Hot', 'Conducts Electricity']
    var offCaps = ['Does not Glow', 'Cold', 'Does Not Conduct Electricity']
    return isOn? onCaps[num]:offCaps[num]
}
