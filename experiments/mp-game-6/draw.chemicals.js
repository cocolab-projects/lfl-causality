// --------------------------------------------------------------------
// draw.chemicals.js
// Author: Clara MacAvoy
// Date: July 2019
// Goal: Helper functions utilized in drawing chemicals for
//       multiplayer game 6.
// --------------------------------------------------------------------
function drawBox(numBeakers, numReactions, train, roundProps, game, beakersManip, config, questionObj) {
    var clickRecord = {
        config: train ? "" : config,
        clicks: []
    }
    if(!train){
        clickRecord.type = beakersManip ? "cap_reaction" : "beaker"
    }
    roundProps[game.my_role]['clicks'][train? 'training' : 'testing'].push(clickRecord)
    var reactions = ["<div id='reactions"+ (!train ? "test": "") + "'>"]
    var beakers = ["<div id='beakers"+ (!train ? "test": "") + "'>"]
    for(var i = 1; i<=numReactions; i++){
        if(train || !beakersManip || config[i-1] !== 'x'){
            reactions.push("<figure><img id='reaction" + i + (train ? "": "test") +
                           "'src = 'Graphics/Reaction"+i+"Off.svg' "+
                           "alt = 'Reaction"+i+"' class = 'reaction'><figcaption id='cap_reaction" + i +
                            (train? "": "test") + "Off' class = 'caption" +
                           "'>"+ reaction(i-1, false) + "</figcaption><figcaption id='cap_reaction" + i +
                           (train? "": "test") + "On' class = 'caption" +
                          "'>" + reaction(i-1, true) + "</figcaption></figure>");
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
        $("#train_chemicals_slide_grid").append(beakersStr + reactionsStr);
        for(var h = 1; h<=numBeakers; h++){
            drawTrainingScenario(roundProps, h, game)
        }
        for(var i = 1; i<=numReactions; i++){
            lightenCompletely("#cap_reaction" + i)
        }
    } else {
        let questionStr = questionObj['q1'];
        let instruct = questionObj['q2'];
        //roundProps.[game.my_role]testSelections[config] = [];
        if(beakersManip){
            $("#test_chemicals_slide_grid").append(questionStr + reactionsStr + instruct + beakersStr);
            drawNotPossibleButton(roundProps, game.my_role, config, false);
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
            $("#test_chemicals_slide_grid").append(questionStr + beakersStr + instruct + reactionsStr);
            $('#test_chemicals_slide_notPossible_button').hide();
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
                       ", then the reactions that occur in the mixture will be displayed here. Try using the <strong>New Test</strong> Button to " +
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
                            (question? "question": "tutorial") + "Off' class = 'caption" +
                           "'>"+ reaction(i-1, false) + "</figcaption><figcaption id='cap_reaction" + i +
                           (question? "question": "tutorial") + "On' class = 'caption"+
                          "'>" + reaction(i-1, true) + "</figcaption></figure>");
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
                "<p id='questionInstruct'class='question'>Click on a possible mixture ChemCo could use. If there is no possible " +
                "mixture, then click 'This Outcome is not Possible'</p>" +
                "</div>"
        questionStr = "<div>" +
                "<p id='questionSecond'class='question'>ChemCo wants to find a chemical that "+
                "Glows and Conducts Electricity. It doesn't care about any other reactions that occur.</p>" +
                "</div>"
    }else if (question && !beakersManip){
        instruct = "<div>" +
                "<p id='questionInstruct'class='question'>Click on the measurements that ChemCo should expect to see.</p>" +
                "</div>"
        questionStr = "<div>" +
                "<p id='questionFirst'class='question'>ChemCo will mix the following chemicals: Bluease. </p>" +
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
            lightenCompletely("#cap_reaction" + i + "tutorial")
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
        drawNotPossibleButton(roundProps, game.my_role, "", true);
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
            lightenCompletely("#cap_reaction" + i + "question")
        }
    }
}
  
function drawTrainingScenario(roundProps, i, game){
    var id = "#beaker" + i
    $(id).addClass("clickable");
    $(id).click(function(event) {
        var event_id = event.target.id;
        roundProps[game.my_role]['clicks']['training']
                [roundProps[game.my_role]['clicks']['training'].length - 1]['clicks'].push(id)
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
            $("#mix_box").attr("src", img);
        }
    })
}

function drawTutorialScenario(roundProps, i, game, beakersManip, question){
    var id = "#" + (beakersManip ? "beaker" : "cap_reaction") + i + (question? "question":"tutorial");
    if(question && !beakersManip){
        var offId = id + "Off";
        var onId = id + "On";
        roundProps.tutorialFirst.reactionsInteractedWith.push(id)
        $(offId).addClass("clickable");
        $(onId).addClass("clickable");
        $(offId).click(function(event){
            darken(id)
            turnOff(i, false, true, true, false);
            if(roundProps.tutorialFirst.reactionsClicked.includes(id)){
                roundProps.tutorialFirst.reactionsClicked.splice(roundProps.tutorialFirst.reactionsClicked.indexOf(id), 1)
            }
        })
        $(onId).click(function(event){
            darken(id)
            turnOn(i, false, true, true, false);
            if(!roundProps.tutorialFirst.reactionsClicked.includes(id)){
                roundProps.tutorialFirst.reactionsClicked.push(id)
            }
        })
    }
    $(id).addClass("clickable");
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
            $("#mix_boxtutorial").attr("src", img);
            if(roundProps.tutorial.beakersClicked.includes("#beaker1tutorial") &&
                    roundProps.tutorial.beakersClicked.includes("#beaker2tutorial")  &&
                    !roundProps.tutorial.beakersClicked.includes("#beaker3tutorial")){
                moveToMixBox(roundProps);
            }
        } else if(beakersManip){
            if(roundProps.tutorialSecond.beakersClicked.includes("Not Possible")){
                roundProps.tutorialSecond.beakersClicked = [];
                lightenCompletely("#notPossibleBoxtutorial")
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
            $("#mix_boxquestion").attr("src", img);
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
    if(beakers){
        var id = "#beaker" + i + "test"
        $(id).addClass("clickable");
        $(id).click(function(event) {
            roundProps[role]['clicks']['testing']
                    [roundProps[role]['clicks']['testing'].length - 1]['clicks'].push(id)
            if(!roundProps[role]['testResults']['reactionQs'][config].includes(id)){
                lighten(id)
                empty(id)
                roundProps[role]['testResults']['reactionQs'][config].push(id)
                if(roundProps[role]['testResults']['reactionQs'][config].includes("Not Possible")){
                    roundProps[role]['testResults']['reactionQs'][config].
                    splice(roundProps[role]['testResults']['reactionQs'][config].indexOf("Not Possible"), 1);
                    lightenCompletely("#notPossibleBox")
                }
            }else {
                darken(id)
                fill(id[7], false, false, false)
                roundProps[role]['testResults']['reactionQs'][config].splice(roundProps[role]['testResults']['reactionQs'][config].indexOf(id), 1)
            }
            var img = "Graphics/Box_" + beakerStr(roundProps[role]['testResults']['reactionQs'][config], numBeakers, false, false, false)
                    + ".svg"
            $("#mix_boxtest").attr("src", img);
        })
    }else{
        var id = "#reaction" + i + "test"
        var offId = "#cap_reaction" + i + "testOff";
        var onId = "#cap_reaction" + i + "testOn";
        $(offId).addClass("clickable");
        $(onId).addClass("clickable");
        $(offId).click(function(event){
            turnOff(i, false, false, false, false);
            if(!roundProps[role]['testResults']['reactionsInteractedWith'][config].includes(id)){
                roundProps[role]['testResults']['reactionsInteractedWith'][config].push(id)
            }
            roundProps[role]['clicks']['testing']
                    [roundProps[role]['clicks']['testing'].length - 1]['clicks'].push(offId)
            if(roundProps[role]['testResults']['beakerQs'][config].includes(id)){
                roundProps[role]['testResults']['beakerQs'][config].splice(roundProps[role]['testResults']['beakerQs'][config].indexOf(id), 1)
            }
        })
        $(onId).click(function(event){
            turnOn(i, false, false, false, false);
            if(!roundProps[role]['testResults']['reactionsInteractedWith'][config].includes(id)){
                roundProps[role]['testResults']['reactionsInteractedWith'][config].push(id)
            }
            roundProps[role]['clicks']['testing']
                    [roundProps[role]['clicks']['testing'].length - 1]['clicks'].push(offId)
            if(!roundProps[role]['testResults']['beakerQs'][config].includes(id)){
                roundProps[role]['testResults']['beakerQs'][config].push(id)
            }
        })
    }
}

function drawNotPossibleButton(roundProps, role, config, tutorial){
    var id = "notPossibleBox" + (tutorial ? "tutorial" : "");
    var notPossible = "<figure><figcaption id='" + id + "' class='notPossible'>" +
            "This Outcome is Not Possible</figcaption></figure>";
    if(tutorial){
        $("#second_question_slide_grid").append(notPossible)
        $("#" + id).click(function(){
            if(roundProps.tutorialSecond.beakersClicked.includes("Not Possible")){
                roundProps.tutorialSecond.beakersClicked = [];
                lighten("#" + id)
            }else{
                roundProps.tutorialSecond.beakersClicked = ["Not Possible"];
                darken("#" + id)
                fillAllBeakers(false, 3);
            }
        });
    }else{
        $("#test_chemicals_slide_grid").append(notPossible)
        $("#" + id).click(function(){
            if(roundProps[role]['testResults']['reactionQs'][config].includes("Not Possible")){
                roundProps[role]['testResults']['reactionQs'][config] = [];
                lighten("#notPossibleBox")
            }else{
                roundProps[role]['testResults']['reactionQs'][config] = ["Not Possible"];
                darken("#notPossibleBox")
                fillAllBeakers(true, 3);
            }
            roundProps[role]['clicks']['testing']
                    [roundProps[role]['clicks']['testing'].length - 1]['clicks'].push("Not Possible");
        });
    }


}
  
function darken(id) {
    $(id).css({"opacity":1.0});
}
function lighten(id){
    $(id).css({"opacity":0.75});
}
function lightenCompletely(id){
    $(id).css({"opacity":0.5});
}
function empty(id){
    $(id).attr("src", "Graphics/Empty_Beaker.svg");
}
function fill(i, tutorial, question, train){
    var id='#beaker' + i + (tutorial ? "tutorial": "") + (question? "question": "") + (train ? "": "test")
    var img = "Graphics/" + color(i-1) + "_Beaker.svg"
    $(id).attr("src", img)
    darken(id)
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
        lightenCompletely(capOff)
    }
}
function turnOff(i, tutorial, question, train, hideCaptions){
    var id='#reaction' + i + (tutorial ? "tutorial": "") + (question ? "question": "") + (train ? "" : "test")
    var img = "Graphics/Reaction"+ i + "Off.svg"
    $(id).attr("src", img)
    var cap='#cap_reaction' + i + (tutorial ? "tutorial": "") + (question ? "question": "") + (train ? "" : "test") + "Off"
    var capOn = '#cap_reaction' + i + (tutorial ? "tutorial": "") + (question ? "question": "") + (train ? "" : "test") + "On"
    if(hideCaptions){
        lighten(id)
        darken(cap)
        $(capOn).hide()
    }else{
        lighten(id)
        darken(cap)
        lightenCompletely(capOn)
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
    lightenCompletely(capOn)
    lightenCompletely(capOff)
}

function turnReactionsOff(numReactions, numBeakers, tutorial){
    for(var i = 1; i<=numReactions; i++){
        lightenCompletely("#reaction" + i + (tutorial ? "tutorial": ""))
        lightenCompletely("#cap_reaction" + i + (tutorial ? "tutorial": ""))
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
            turnOn(h+1, tutorial, false, true, false)
            reactionsOn.push(id)
        } else {
            turnOff(h+1, tutorial, false, true, false)
        }
    }
}
  
function highlight(id) {
    $(id).css({"background-color":"yellow"});
}
  
function unhighlight(id) {
    $(id).css({"background-color":"transparent"});
}

function fillAllBeakers(test, numBeakers){
    for(var i = 1; i <= numBeakers; i++){
        fill(i, false, !test, !test)
    }
    var img = "Graphics/Box_000.svg"
    var id = "#mix_box" + (test? "test": "question")
    $(id).attr("src", img);
}
