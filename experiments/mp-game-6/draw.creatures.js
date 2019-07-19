// --------------------------------------------------------------------
// draw.creatures.js
// Author: Sahil Chopra
// Date: December 21, 2018
// Goal: Helper functions utilized in drawing creatures for 
//       multiplayer game 6.
// --------------------------------------------------------------------
function drawBox(numBeakers, numReactions, train, roundProps, game, beakersManip, config, questionObj) {
    console.log("drawBox: " + config)
    var reactions = ["<div id='reactions"+ (!train ? "test": "") + "'>"]
    var beakers = ["<div id='beakers"+ (!train ? "test": "") + "'>"]
    for(var i = 1; i<=numReactions; i++){
        if(train || !beakersManip || config[i-1] !== 'x'){
            reactions.push("<figure><img id='reaction" + i + (train ? "": "test") +
                           "'src = 'Graphics/Reaction"+i+"Off.svg' "+
                           "alt = 'Reaction"+i+"' class = 'reaction'><figcaption id='cap_reaction" + i +
                            (train? "": "test") + "Off' class = 'caption" + ((i===3)?"long":"") +
                           "'>"+ captions(i-1, false) + "</figcaption><figcaption id='cap_reaction" + i +
                           (train? "": "test") + "On' class = 'caption" + ((i===3)?"long":"") +
                          "'>" + captions(i-1, true) + "</figcaption></figure>");
        }
    } 
    if(train || beakersManip){
        for(var j = 1; j<=numBeakers; j++){
                beakers.push("<figure><img id='beaker" + j + (!train ? "test": "") + "'src = 'Graphics/"+
                             color(j-1) + "_Beaker.svg' alt = '"+ color(j-1) +
                             " Beaker' class = 'beaker'><figcaption>"+ color(j-1) + "ase</figcaption></figure>");
        }
        beakers.push("<figure><img id='mix_box"+ (!train ? "test": "") + "'src = 'Graphics/Box_000.svg' alt = 'Mix Box' class = 'mixbeaker'>" +
                     "<figcaption>Mixing Box</figcaption></figure></div>")
    } else {
        beakers.push("<figure><img id='mix_box"+ (!train ? "test": "") + "'src = 'Graphics/Box_"+ config +
                     ".svg' alt = 'Mix Box' class = 'mixbeaker'></figure></div>")
    }
    reactions.push("</div>")
    let beakersStr = beakers.join('')
    let reactionsStr = reactions.join('')
    if (train) {
        $("#train_creatures_slide_grid").append(beakersStr + reactionsStr);
        for(var h = 1; h<=numBeakers; h++){
            drawTrainingScenario(roundProps, h, game)
        }
        for(var i = 1; i<=numReactions; i++){
            lighten("#cap_reaction" + i)
        }
    } else {
        let questionStr = questionObj['q1'];
        let instruct = questionObj['q2'];
        //roundProps.[game.my_role]testSelections[config] = [];
        if(beakersManip){
            $("#test_creatures_slide_grid").append(questionStr + reactionsStr + instruct + beakersStr);
            $('#test_creatures_slide_notPossible_button').show();
            roundProps[game.my_role]['testResults']['reactionQs'][config] = []
            for(var i = 1; i<=numBeakers; i++){
                drawTestingScenario(roundProps, i, beakersManip, config, game.my_role, numBeakers)
            }
            for(var i = 1; i<=numReactions; i++){
                if(config[i-1] !== 'x'){
                    (config[i-1] === '1') ? turnOn(i, false, false, false, true) : turnOff(i, false, false, false, true)
                }
            }
        }else{
            $("#test_creatures_slide_grid").append(questionStr + beakersStr + instruct + reactionsStr);
            $('#test_creatures_slide_notPossible_button').hide();
            roundProps[game.my_role]['testResults']['beakerQs'][config] = []
            roundProps[game.my_role]['testResults']['reactionsInteractedWith'][config] = []
            for(var i = 1; i<=numReactions; i++){
                drawTestingScenario(roundProps, i, beakersManip, config, game.my_role)
            }
        }
    }
}

function drawTutorialBox(numBeakers, numReactions, question, roundProps, game, beakersManip){
    var reactions = ["<div id='reactions" + (question ? "question": "tutorial") + "'>"]
    var beakers = ["<div id='beakers"+ (question ? "question": "tutorial") + "'>"]
    if(!question){
        reactions.push("<p id='reactionInstruct'class='instruct'>After you press the mix button" +
                       ", then the properties measured in that mixture will be displayed here. Try using the <strong>New Test</strong> Button to " +
                       " start a new mixture</p>");
        beakers.push("<figure id='beakerInstruct'class='instruct'>These are beakers of chemicals. You can click once to add them" +
                     " to the mixture, and then click again to remove them. Try adding <strong>'redase'</strong> and "+
                     "<strong>'yellowase'</strong>.</figure>")
    }if(beakersManip || !question){
        for(var j = 1; j<=numBeakers; j++){
            beakers.push("<figure><img id='beaker" + j + (question ? "question": "tutorial") + "'src = 'Graphics/"+
                         color(j-1) + "_Beaker.svg' alt = '"+ color(j-1) +
                         " Beaker' class = 'beaker'><figcaption>"+ color(j-1) + "ase</figcaption></figure>")
        }
    }

    for(var i = 1; i<=numReactions; i++){
        if(i !==2 || !beakersManip || !question){
            reactions.push("<figure><img id='reaction" + i + (question ? "question": "tutorial") +
                           "'src = 'Graphics/Reaction"+i+"Off.svg' "+
                           "alt = 'Reaction"+i+"' class = 'reaction'><figcaption id='cap_reaction" + i +
                            (question? "question": "tutorial") + "Off' class = 'caption" + ((i===3)?"long":"") +
                           "'>"+ captions(i-1, false) + "</figcaption><figcaption id='cap_reaction" + i +
                           (question? "question": "tutorial") + "On' class = 'caption" + ((i===3)?"long":"") +
                          "'>" + captions(i-1, true) + "</figcaption></figure>");
        }
    }
    let mixBox;
    if (!question){
        beakers.push("</div>")
        mixBox = "<div id='mixBoxTutorial'> " +
                "<p id='mixInstruct'class='instruct'>This is the mixing box. " +
                "Chemicals you have added appear in the box. Now that you have added the 'redase' and 'yellowase' " +
                "to the mixture, scroll down and click the <strong>'mix'</strong> button to see what happens. </p>" +
                "<figure><img id='mix_boxtutorial'src = 'Graphics/Box_000.svg' alt = 'Mix Box' class = 'mixbeaker'>" +
                "<figcaption>Mixing Box</figcaption></figure></div>"
    }
    else {
        beakers.push("<figure><img id='mix_boxquestion" + "'src = 'Graphics/Box_000.svg' alt = 'Mix Box' class = 'mixbeaker'>" +
                      (beakersManip ? "<figcaption>Mixing Box</figcaption>" : "") + "</figure></div>");
    }
    let questionStr;
    let instruct;
    if(question && beakersManip){
        instruct = "<div>" +
                "<p id='questionInstruct'class='question'>Click on a possible mixture ChemCo could use.</p>" +
                "</div>"
        questionStr = "<div>" +
                "<p id='questionSecond'class='question'>ChemCo wants to find a chemical that does the following: "+
                "Glows, Conducts Electricity. It doesn't care about any other properties.</p>" +
                "</div>"
    }else if (question && !beakersManip){
        instruct = "<div>" +
                "<p id='questionInstruct'class='question'>Click on the measurements that ChemCo should expect to see.</p>" +
                "</div>"
        questionStr = "<div>" +
                "<p id='questionFirst'class='question'>ChemCo has mixed the following chemicals: Bluease. </p>" +
                "</div>"
    }

    reactions.push("</div>")
    let beakersStr = beakers.join('')
    let reactionsStr = reactions.join('')
    if(!question){
        $("#tutorial_slide_grid").append(beakersStr + mixBox + reactionsStr);
        roundProps.tutorial = {
            numBeakerClicks: 0,
            beakersClicked: [],
        }
        for(var h = 1; h<=numBeakers; h++){
            drawTutorialScenario(roundProps, h, game, true, question)
        }
        for(var i = 1; i<=numReactions; i++){
            lighten("#cap_reaction" + i + "tutorial")
        }
        startTutorial(roundProps);
    }else if (beakersManip) {
        $("#second_question_slide_grid").append(questionStr + reactionsStr + instruct + beakersStr);
        roundProps.tutorialSecond = {
            beakersClicked: [],
        }
        for(var h = 1; h<=numBeakers; h++){
            drawTutorialScenario(roundProps, h, game, beakersManip, question)
        }
        for(var i = 1; i<=numReactions; i++){
            if(i !== 2){
                darken("#cap_reaction" + i + "question");
                turnOn(i, false, true, true, true);
            }
        }
    } else {
        $("#first_question_slide_grid").append(questionStr + beakersStr + instruct + reactionsStr);
        $("#mix_boxquestion").attr("src", "Graphics/Box_001.svg");
        roundProps.tutorialFirst = {
            reactionsClicked: [],
            reactionsInteractedWith: []
        }
        for(var i = 1; i<=numReactions; i++){
            drawTutorialScenario(roundProps, i, game, beakersManip, question);
        }
        for(var i = 1; i<=numBeakers; i++){
            lighten("#cap_reaction" + i + "question")
        }
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
                fill(id[7], false, false, true)
                roundProps.selected_train_stim.splice(roundProps.selected_train_stim.indexOf(id), 1)
            }
            var img = "Graphics/Box_" + beakerStr(roundProps.selected_train_stim, game.numBeakers, false, false, true) + ".svg"
            console.log(img);
            $("#mix_box").attr("src", img);
        }
        console.log("Currently selected beakers: " + roundProps.selected_train_stim)
    })
}

function drawTutorialScenario(roundProps, i, game, beakersManip, question){
    var id = "#" + (beakersManip ? "beaker" : "reaction") + i + (question? "question":"tutorial");
    console.log(id)
    $(id).click(function(event) {
        if(!question){
            roundProps.tutorial.numBeakerClicks++;
            if(!roundProps.tutorial.beakersClicked.includes(id)){
                lighten(id)
                empty(id)
                roundProps.tutorial.beakersClicked.push(id)
            }else {
                darken(id)
                fill(id[7], true, false, true)
                roundProps.tutorial.beakersClicked.splice(roundProps.tutorial.beakersClicked.indexOf(id), 1)
            }
            var img = "Graphics/Box_" + beakerStr(roundProps.tutorial.beakersClicked, game.numBeakers, true, false, true) + ".svg"
            console.log(img);
            $("#mix_boxtutorial").attr("src", img);
            console.log("Currently selected beakers: " + roundProps.tutorial.beakersClicked)
            if(roundProps.tutorial.beakersClicked.includes("#beaker1tutorial") &&
                    roundProps.tutorial.beakersClicked.includes("#beaker2tutorial")  &&
                    !roundProps.tutorial.beakersClicked.includes("#beaker3tutorial")){
                moveToMixBox(roundProps);
            }
        } else if(beakersManip){
            if(roundProps.tutorialSecond.beakersClicked.includes("#NoneOfTheAboveTutorial")){
                roundProps.tutorialSecond.beakersClicked = [];
                unhighlight("#NoneOfTheAboveTutorial")
            }
            if(!roundProps.tutorialSecond.beakersClicked.includes(id)){
                lighten(id)
                empty(id)
                roundProps.tutorialSecond.beakersClicked.push(id)
            }else {
                darken(id)
                fill(i, false, true, true)
                roundProps.tutorialSecond.beakersClicked.splice(roundProps.tutorialSecond.beakersClicked.indexOf(id), 1)
            }
            var img = "Graphics/Box_" + beakerStr(roundProps.tutorialSecond.beakersClicked, game.numBeakers, false, true, true) + ".svg"
            console.log(img)
            $("#mix_boxquestion").attr("src", img);
        } else {
            roundProps.tutorialFirst.reactionsInteractedWith.push(id)
            if(!roundProps.tutorialFirst.reactionsClicked.includes(id)){
                darken(id)
                turnOn(i, false, true, true, false);
                roundProps.tutorialFirst.reactionsClicked.push(id)
            }else {
                darken(id)
                turnOff(i, false, true, true, false);
                roundProps.tutorialFirst.reactionsClicked.splice(roundProps.tutorialFirst.reactionsClicked.indexOf(id), 1)
            }
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

function drawTestingScenario(roundProps, i, beakers, config, role, numBeakers){
    //globalGame.roundProps[globalGame.my_role]['testResults']['beakerQs'][config];
    if(beakers){
        var id = "#beaker" + i + "test"
        console.log("creating a test for reactions: " + beakers)
        $(id).click(function(event) {
            if(!roundProps[role]['testResults']['reactionQs'][config].includes(id)){
                lighten(id)
                empty(id)
                roundProps[role]['testResults']['reactionQs'][config].push(id)
            }else {
                darken(id)
                fill(id[7], false, false, false)
                roundProps[role]['testResults']['reactionQs'][config].splice(roundProps[role]['testResults']['reactionQs'][config].indexOf(id), 1)
            }
            var img = "Graphics/Box_" + beakerStr(roundProps[role]['testResults']['reactionQs'][config], numBeakers, false, false, false)
                    + ".svg"
            console.log(img);
            $("#mix_boxtest").attr("src", img);
            console.log("Currently selected beakers: " + roundProps[role]['testResults']['reactionQs'][config])
        })
    }else{
        console.log("creating a test for beakers: " + beakers)
        var id = "#reaction" + i + "test"
        $(id).click(function(event) {
            var event_id = event.target.id;
            if(!roundProps[role]['testResults']['reactionsInteractedWith'][config].includes(id)){
                roundProps[role]['testResults']['reactionsInteractedWith'][config].push(id)
            }
            if(!roundProps[role]['testResults']['beakerQs'][config].includes(id)){
                turnOn(i, false, false, false, false)
                roundProps[role]['testResults']['beakerQs'][config].push(id)
            }else {
                turnOff(i, false, false, false, false)
                roundProps[role]['testResults']['beakerQs'][config].splice(roundProps[role]['testResults']['beakerQs'][config].indexOf(id), 1)
            }
            console.log("Currently selected reactions: " + roundProps[role]['testResults']['beakerQs'][config])
        })
    }
}
  
function darken(id) {
    $(id).css({"opacity":1.0});
}
function lighten(id){
    $(id).css({"opacity":0.3});
}
function empty(id){
    $(id).attr("src", "Graphics/Empty_Beaker.svg");
}
function fill(i, tutorial, question, train){
    var id='#beaker' + i + (tutorial ? "tutorial": "") + (question? "question": "") + (train ? "": "test")
    var img = "Graphics/" + color(i-1) + "_Beaker.svg"
    $(id).attr("src", img)
}
function turnOn(i, tutorial, question, train, hideCaptions){
    var id='#reaction' + i + (tutorial ? "tutorial": "") + (question ? "question": "") + (train ? "" : "test")
    var img = "Graphics/Reaction"+ i + "On.svg"
    $(id).attr("src", img)
    var cap='#cap_reaction' + i + (tutorial ? "tutorial": "") + (question ? "question": "") + (train ? "" : "test") + "On"
    var capOff = '#cap_reaction' + i + (tutorial ? "tutorial": "") + (question ? "question": "") + (train ? "" : "test") + "Off"
    if(hideCaptions){
        darken(id)
        darken(cap)
        $(capOff).hide()
    }else{
        darken(id)
        darken(cap)
        lighten(capOff)
    }
}
function turnOff(i, tutorial, question, train, hideCaptions){
    var id='#reaction' + i + (tutorial ? "tutorial": "") + (question ? "question": "") + (train ? "" : "test")
    var img = "Graphics/Reaction"+ i + "Off.svg"
    $(id).attr("src", img)
    var cap='#cap_reaction' + i + (tutorial ? "tutorial": "") + (question ? "question": "") + (train ? "" : "test") + "Off"
    var capOn = '#cap_reaction' + i + (tutorial ? "tutorial": "") + (question ? "question": "") + (train ? "" : "test") + "On"
    if(hideCaptions){
        darken(id)
        darken(cap)
        $(capOn).hide()
    }else{
        darken(id)
        darken(cap)
        lighten(capOn)
    }
}

function turnNeutral(i, tutorial){
    var id='#reaction' + i + (tutorial ? "tutorial": "")
    var img = "Graphics/Reaction"+ i + "Off.svg"
    $(id).attr("src", img)
    var capOn='#cap_reaction' + i + (tutorial ? "tutorial": "") + "On"
    var capOff='#cap_reaction' + i + (tutorial ? "tutorial": "") + "Off"
    $(capOff).show();
    $(capOn).show();
    lighten(capOn)
    lighten(capOff)
}

function turnReactionsOff(numReactions, numBeakers, tutorial){
    for(var i = 1; i<=numReactions; i++){
        lighten("#reaction" + i + (tutorial ? "tutorial": ""))
        lighten("#cap_reaction" + i + (tutorial ? "tutorial": ""))
        turnNeutral(i, tutorial)
    }
    for(var i = 1; i<=numBeakers; i++){
        darken("#beaker" + i + (tutorial ? "tutorial": ""))
        fill(i, tutorial, false, true)
    }
    $("#mix_box" + (tutorial ? "tutorial": "")).attr("src", 'Graphics/Box_000.svg')
}

  
function turnReactionsOn(beakersOn, reactionsDict, numBeakers, numReactions, tutorial) {
    var reactionsOn = [];
    var beakersKey = beakerStr(beakersOn, numBeakers, tutorial, false, true)
    for(var h = 0; h<reactionsDict[beakersKey].length; h++){
        var id = "#reaction" + (h+1) + (tutorial ? "tutorial": "")
        if(reactionsDict[beakersKey][h]){
            darken("#cap_reaction" + (h+1) + (tutorial ? "tutorial": ""))
            darken(id)
            turnOn(h+1, tutorial, false, true, true)
            reactionsOn.push(id)
        } else {
            turnOff(h+1, tutorial, false, true, true)
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


