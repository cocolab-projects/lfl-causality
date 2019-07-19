//   Copyright (c) 2012 Sven "FuzzYspo0N" Bergström,
//                 2013 Robert XD Hawkins
//   Written by : http://underscorediscovery.com
//   Written for : http://buildnewgames.com/real-time-multiplayer/
//   Modified for collective behavior experiments on Amazon Mechanical Turk
//   MIT Licensed.

// ----------------
// GLOBAL VARIABLES
// ----------------
var globalGame = {},
    enterScoreReport = 0,
    timeout = 1000 * 60 * 15 // 15 minutes,
    timeoutIndex = 0,
    originalTitle = document.title,
    flashConnected = false;

// ----------------
// EVENT HANDLERS
// ---------------
// Procedure for creating a new player, upon joining a globalGame
var client_onjoingame = function(num_players, role) {
  console.log("Inside client_onjoingame");

  // Set player role
  globalGame.my_role = role;
  globalGame.get_player(globalGame.my_id).role = globalGame.my_role;

  // Create player
  _.map(_.range(num_players - 1), function(i){
    globalGame.players.unshift({id: null, player: new game_player(globalGame)});
  });

  // Set 15 minute timeout only for first player...
  if(num_players == 1) {
    this.timeoutID = setTimeout(function() {
      if(_.size(this.urlParams()) == 4) {
        this.submitted = true;
        window.opener.turk.submit(this.data, true);
        window.close();
     } else {
       console.log("would have submitted the following :");
       console.log(this.data);
     }
   }, timeout);
  }
};

// Procedure for handling updates from server.
// Note: data holds the server's copy of variables.
var client_onserverupdate_received = function(data){
    if(data.players) {
        _.map(_.zip(data.players, globalGame.players),function(z){
            z[1].id = z[0].id;
        });
    }

    console.log('UPDATE RECEIVED');
    console.log(data);

    // Copy game parameters to local globalGame
    globalGame.start_time = data.gs;
    globalGame.players_threshold = data.pt;
    globalGame.player_count = data.pc;
    globalGame.roundNum = data.roundNum;
    globalGame.numRounds = data.numRounds;
    globalGame.trialInfo = data.trialInfo;
    globalGame.isProd = data.isProd;
    globalGame.id = data.id;

    globalGame.boxConfig = data.boxConfig;
    globalGame.reactionQs = data.reactionQs;
    globalGame.beakerQs = data.beakerQs;
    globalGame.doTutorial = true;


    // update data object on first round, don't overwrite (FIXME)
    if(!_.has(globalGame, 'data')) {
        globalGame.data = data.dataObj;
    }
};

// Procedure for parsing messages from server.
var client_onMessage = function(data) {
  var commands = data.split('.');
  var command = commands[0];
  var subcommand = commands[1] || null;
  var commanddata = commands[2] || null;

  switch(command) {
    case 's': //server message
    switch(subcommand) {
      
      case 'end' : // Redirect to exit survey only if it is not the last round
        if(globalGame.roundNum < globalGame.numRounds || globalGame.numRounds === null) {
            $("#" + globalGame.currentSlide[globalGame.my_role]).addClass("hidden");
            clearProgressBar();
            onDisconnect();
            console.log("received end message...");
        }
        break;

      case 'alert' : // Not in database, so you can't play...
        alert('You did not enter an ID');
        window.location.replace('http://nodejs.org'); break;
      
      case 'join' : // Game join request
        var num_players = commanddata;
        client_onjoingame(num_players, commands[3]); break;
      
      case 'add_player' : // New player joined... Need to add them to our list.
        console.log("adding player" + commanddata);
        console.log("cancelling timeout");
        clearTimeout(globalGame.timeoutID);
        globalGame.players.push({id: commanddata, player: new game_player(globalGame)}); break;
    }
  }
};


var customSetup = function(globalGame) {
    // customSetup is automatically triggered by window.on_load()
    // in the shared clientBase.js code

    // Initial setup -- draw the waiting room.
    drawWaitingRoom("Waiting for another player to join the game ...", globalGame);
    globalGame.socket.send("enterSlide.wait_room_slide.")

    // --------------
    // Click Handlers
    // --------------

    $("#round_slide_continue_button").click(function(){
        clearRoundNumber();
        drawProgressBar(globalGame.roundNum, globalGame.numRounds, 2, 8);
        globalGame.socket.send("enterSlide.tutorial_instructions_slide.");
        if(globalGame.roundNum === 0 && globalGame.doTutorial){
            drawTutorialInstructions(globalGame);
        }
        else{
            drawTrainInstructions(globalGame);
        }

    });

    $("#tutorial_instructions_slide_continue_button").click(function() {
        clearTutorialInstructions();
        drawProgressBar(globalGame.roundNum, globalGame.numRounds, 3, 8);
        globalGame.socket.send("enterSlide.train_creatures_tutorial.");
        drawTutorial(globalGame);
        $("#tutorial_slide_continue_button").show();
        $("#tutorial_slide_continue_button").prop("disabled", true);
        // Start Time
        globalGame.roundProps[globalGame.my_role]['times']['tutorial'] = {
            interface : {
                first : {},
                second : {},
            },
            first_question : {},
            second_question : {},
        }
        globalGame.roundProps[globalGame.my_role]['times']['tutorial']['interface']['first']['start'] = new Date();
    });

    $("#tutorial_slide_test_button").click(function(){
        configDict = {
            "110": [true, false, true],
            "001": [true, true, false],
        }
        if((globalGame.roundProps.tutorial.beakersClicked.includes("#beaker3tutorial") &&
                !globalGame.roundProps.tutorial.beakersClicked.includes("#beaker2tutorial") &&
                !globalGame.roundProps.tutorial.beakersClicked.includes("#beaker1tutorial")) ||
            (!globalGame.roundProps.tutorial.beakersClicked.includes("#beaker3tutorial") &&
                globalGame.roundProps.tutorial.beakersClicked.includes("#beaker2tutorial") &&
                globalGame.roundProps.tutorial.beakersClicked.includes("#beaker1tutorial"))){
            turnReactionsOn(globalGame.roundProps.tutorial.beakersClicked, configDict,
                         globalGame.numBeakers, globalGame.numReactions, true);

            $("#tutorial_slide_test_button").prop("disabled", true);
            $("#train_creatures_slide_continue_button").show();
            $("#reactionInstruct").show();
            unhighlight("#tutorial_slide_test_button")
            unhighlight("#mixBoxTutorial")
            highlight("#reactionstutorial")
            darken("#reactionstutorial")
            lighten("#mixBoxTutorial")
            globalGame.testStage = false;
            if(globalGame.roundProps.tutorial.beakersClicked.includes("#beaker3tutorial") &&
                    !globalGame.roundProps.tutorial.beakersClicked.includes("#beaker2tutorial") &&
                    !globalGame.roundProps.tutorial.beakersClicked.includes("#beaker1tutorial")){
                $('#reactionInstruct').text("These are the properties of bluease. You can now continue to the next part of the " +
                                            "tutorial by pressing the continue button")
                $("#tutorial_slide_continue_button").show();
                $("#tutorial_slide_continue_button").prop("disabled", false)
                highlight("#tutorial_slide_continue_button")
            } else {
                highlight("#tutorial_slide_newtest_button")
                $("#tutorial_slide_newtest_button").prop("disabled", false);
            }
        }else{
            alert("Check that you selected the right chemicals.")
        }



    });

    $("#tutorial_slide_newtest_button").click(function(){
        globalGame.roundProps[globalGame.my_role]['times']['tutorial']['interface']['first']['end'] = new Date();
        globalGame.roundProps[globalGame.my_role]['times']['tutorial']['interface']['second']['start'] = new Date();
        unhighlight("#tutorial_slide_newtest_button")
        unhighlight("#reactionstutorial")
        darken("#mixBoxTutorial")
        darken("#beakerstutorial")
        lighten('#reactionstutorial')
        $('#beakerInstruct').text("Try running a mixture with just bluease")
        $('#mixInstruct').text("Currently, the mixing box contains only bluease. Scroll down and click " +
                                  "the 'mix' button to see what happens.")
        globalGame.testStage = true;
        $("#tutorial_slide_test_button").prop("disabled", false)
        $("#tutorial_slide_newtest_button").prop("disabled", true)
        turnReactionsOff(globalGame.numReactions, globalGame.numBeakers, true)
        globalGame.roundProps.tutorial.beakersClicked = []
    });

    $("#tutorial_slide_continue_button").click(function(){
        globalGame.roundProps[globalGame.my_role]['times']['tutorial']['interface']['second']['end'] = new Date();
        clearTutorial();
        drawQuestionInstructions(globalGame)
    });

    $("#question_instructions_slide_continue_button").click(function(){
        globalGame.roundProps[globalGame.my_role]['times']['tutorial']['first_question']['start'] = new Date();
        clearQuestionInstructions();
        drawFirstQuestion(globalGame)
    });
    $("#first_question_slide_continue_button").click(function(){
        if(globalGame.roundProps.tutorialFirst.reactionsClicked.includes("#reaction1question") &&
            globalGame.roundProps.tutorialFirst.reactionsClicked.includes("#reaction2question") &&
                !globalGame.roundProps.tutorialFirst.reactionsClicked.includes("#reaction3question") &&
                globalGame.roundProps.tutorialFirst.reactionsInteractedWith.includes("#reaction3question")){
            clearFirstQuestion();
            drawSecondQuestion(globalGame)
            globalGame.roundProps[globalGame.my_role]['times']['tutorial']['first_question']['end'] = new Date();
            globalGame.roundProps[globalGame.my_role]['times']['tutorial']['second_question']['start'] = new Date();
        } else if(!globalGame.roundProps.tutorialFirst.reactionsInteractedWith.includes("#reaction3question")){
            alert("You must set all the measurements to a value.")
        } else{
            alert("That is not the right answer. Hint: in the tutorial, bluease glowed and bubbled.")
        }


    });
    $("#second_question_slide_continue_button").click(function(){
        if(globalGame.roundProps.tutorialSecond.beakersClicked.includes("#beaker1question") &&
            globalGame.roundProps.tutorialSecond.beakersClicked.includes("#beaker2question") &&
                !globalGame.roundProps.tutorialSecond.beakersClicked.includes("#beaker3question") ){
            clearSecondQuestion();
            drawTrainInstructions(globalGame)
            globalGame.roundProps[globalGame.my_role]['times']['tutorial']['second_question']['end'] = new Date();
        } else {
            alert("That is not the right answer. Hint: in the tutorial, redase and yellowase glowed and conducted electricity.")
        }
    });

    $("#second_question_slide_notPossible_button").click(function(){
        alert("This button is for if there is no combination of chemicals that will create the needed measurements. However, "+
              "in this tutorial we saw that redase and yellowase glowed and conducted electricity.")
    });

    $("#train_instructions_slide_continue_button").click(function() {
        console.log("is clicked")
        clearTrainInstructions();
        if (globalGame.my_role === "explorer") {
            drawProgressBar(globalGame.roundNum, globalGame.numRounds, 3, 8);
            globalGame.socket.send("enterSlide.train_creatures_slide.");
            drawTrainBox(globalGame);
            console.log("current boxConfig: " + globalGame.boxConfig);
            globalGame.roundProps.reactionsOnPrev = [];
            $("#train_creatures_slide_continue_button").show();
            $("#train_creatures_slide_newtest_button").prop("disabled", true);
            $("#train_creatures_slide_continue_button").prop("disabled", false);
            $("#train_creatures_slide_test_button").prop("disabled", false);
            globalGame.roundProps.numTests = 0;
            globalGame.testStage = true;
            globalGame.roundProps.combosTried = []
            // Start Time
            globalGame.roundProps[globalGame.my_role]['times']['train']['start'] = new Date();
        } else {
            globalGame.socket.send("enterSlide.chat_room_slide.");
            drawProgressBar(globalGame.roundNum, globalGame.numRounds, 5, 8);
            globalGame.socket.send("enterChatRoom.");
            drawChatRoom(globalGame);
        }
    });
    $("#train_creatures_slide_test_button").click(function(){
        if(globalGame.roundProps.selected_train_stim.length === 0){
            alert("You must add at least one chemical");
        }else {
            var holderObject = {}
            holderObject['config'] = beakerStr(globalGame.roundProps.selected_train_stim,
                                               globalGame.numBeakers, false)
            globalGame.roundProps.combosTried.push(holderObject)
            globalGame.roundProps.combosTried[globalGame.roundProps.combosTried.length - 1]['testTime'] = new Date();
            globalGame.roundProps.numTests++
            turnReactionsOn(globalGame.roundProps.selected_train_stim, globalGame.boxConfig,
                         globalGame.numBeakers, globalGame.numReactions, false);
            console.log("The following reactions have been turned on:" + globalGame.roundProps.reactionsOnPrev)
            globalGame.roundProps.previousSelection = globalGame.roundProps.selected_train_stim;
            $("#train_creatures_slide_test_button").prop("disabled", true);
            $("#train_creatures_slide_newtest_button").prop("disabled", false);
            $("#train_creatures_slide_continue_button").show();
            globalGame.testStage = false;
        }
    });

    $("#train_creatures_slide_newtest_button").click(function(){
        globalGame.roundProps.combosTried[globalGame.roundProps.combosTried.length - 1]['learnTime'] = new Date()
        globalGame.roundProps.selected_train_stim = []
        $("#train_creatures_slide_test_button").prop("disabled", false);
        $("#train_creatures_slide_newtest_button").prop("disabled", true);
        $("#train_creatures_slide_continue_button").show();
        turnReactionsOff(globalGame.numReactions, globalGame.numBeakers, false)
        globalGame.testStage = true;
    });

    $("#train_creatures_slide_continue_button").click(function(){
        // End Time
        if(globalGame.roundProps.numTests < globalGame.numReqTests){
            alert("You need to keep experimenting")
        } else {
            globalGame.roundProps[globalGame.my_role]['times']['train']['end'] = new Date();
            globalGame.roundProps[globalGame.my_role]['duration']['train'] = (
                globalGame.roundProps[globalGame.my_role]['times']['train']['end'] -
                globalGame.roundProps[globalGame.my_role]['times']['train']['start']
            ) / 1000.0;

            clearTrainCreatures();
            drawProgressBar(globalGame.roundNum, globalGame.numRounds, 4, 8);
            globalGame.socket.send("enterSlide.chat_instructions_slide.");
            drawExplorerChatInstructions(globalGame);
        }
    });

    $("#chat_instructions_slide_continue_button").click(function(){
        clearExplorerChatInstructions();
        drawProgressBar(globalGame.roundNum, globalGame.numRounds, 5, 8);
        globalGame.socket.send("enterSlide.chat_room_slide.");
        globalGame.socket.send("enterChatRoom.");
        drawChatRoom(globalGame);

        // Start Time
        globalGame.roundProps[globalGame.my_role]['times']['chat']['start'] = new Date();
    });

    $("#chat_room_slide_continue_button").click(function(){
        drawProgressBar(globalGame.roundNum, globalGame.numRounds, 6, 8);
        globalGame.socket.send("proceedToTestInstructions.");
    });

    $("#test_instructions_slide_continue_button").click(function(){
        clearTestInstructions();
        drawProgressBar(globalGame.roundNum, globalGame.numRounds, 7, 8);
        globalGame.socket.send("enterSlide.test_creatures_slide.");
        globalGame.roundProps[globalGame.my_role]['testResults'] = {
            beakerQs: {},
            reactionQs: {},
            reactionsInteractedWith : {},
        }
        if(globalGame.testNum < globalGame.bqKeys.length){
            drawTestCreatures(globalGame, globalGame.beakerQs[globalGame.bqKeys[globalGame.testNum]], false,
                              globalGame.bqKeys[globalGame.testNum], globalGame.testNum);
        } else {
            drawTestCreatures(globalGame, globalGame.reactionQs[globalGame.rqKeys
                                                                [globalGame.testNum - globalGame.bqKeys.length]], true,
                              globalGame.rqKeys[globalGame.testNum - globalGame.bqKeys.length], globalGame.testNum);
        }
        // Start Time
        globalGame.roundProps[globalGame.my_role]['times']['test']['start'] = new Date();
        globalGame.testNum++;
    });

    $("#test_creatures_slide_notPossible_button").click(function(){
        //If there are still more questions, keep asking
        var isSure = confirm("Are you sure there are no possible answers? Click OK if you are sure.")
        if(isSure){
            if(globalGame.testNum <= globalGame.bqKeys.length){
                globalGame.roundProps[globalGame.my_role]['testResults']['beakerQs'][globalGame.bqKeys[globalGame.testNum - 1]] =
                        ['Not Possible']
            } else {
                globalGame.roundProps[globalGame.my_role]['testResults']['reactionQs']
                        [globalGame.rqKeys[globalGame.testNum - globalGame.bqKeys.length - 1]] = ['Not Possible']
            }
            if(globalGame.testNum < (globalGame.bqKeys.length + globalGame.rqKeys.length)){
                if(globalGame.testNum < globalGame.bqKeys.length){
                    drawTestCreatures(globalGame, globalGame.beakerQs[globalGame.bqKeys[globalGame.testNum]], false,
                                      globalGame.bqKeys[globalGame.testNum], globalGame.testNum);
                } else {
                    drawTestCreatures(globalGame, globalGame.reactionQs[globalGame.rqKeys
                                                                        [globalGame.testNum - globalGame.bqKeys.length]], true,
                                      globalGame.rqKeys[globalGame.testNum - globalGame.bqKeys.length], globalGame.testNum);
                }
                globalGame.testNum++;
            } else {
                // End Time
                globalGame.roundProps[globalGame.my_role]['times']['test']['end'] = new Date();
                globalGame.roundProps[globalGame.my_role]['duration']['test'] = (
                            globalGame.roundProps[globalGame.my_role]['times']['test']['end'] -
                            globalGame.roundProps[globalGame.my_role]['times']['test']['start']
                            ) / 1000.0;

                // Summary of of times
                roundTimes = {
                    'train': -1,
                    'test': globalGame.roundProps[globalGame.my_role]['duration']['test'],
                    'chat': globalGame.roundProps[globalGame.my_role]['duration']['chat'],
                };

                if (globalGame.my_role === "explorer") {
                    roundTimes.train = globalGame.roundProps[globalGame.my_role]['duration']['train'];
                }

                // Measure performance & log selections
                var roundSelections = [];
                var roundSummary = {
                    hits: 0,
                    misses: 0,
                    score: 0,
                }
                for(var config in globalGame.roundProps[globalGame.my_role]['testResults']['beakerQs']){
                    var turker_answer = globalGame.roundProps[globalGame.my_role]['testResults']['beakerQs'][config];
                    var answer = globalGame.beakerQs[config]['a']
                    var isRight = true;
                    for(var i = 0; i < answer.length; i++){
                        if(answer[i] && !turker_answer.includes("#reaction" + (i+1) + "test")) isRight = false;
                        if(!answer[i] && turker_answer.includes("#reaction" + (i+1) + "test")) isRight = false;
                    }
                    isRight ? roundSummary.hits++ : roundSummary.misses++;
                }
                for(var config in globalGame.roundProps[globalGame.my_role]['testResults']['reactionQs']){
                    var turker_answer = beakerStr(globalGame.roundProps[globalGame.my_role]['testResults']['reactionQs'][config],
                                                  globalGame.numBeakers, false, false, false);
                    var possible_answers = globalGame.reactionQs[config]['a']
                    var isRight = possible_answers.includes(turker_answer)
                    isRight ? roundSummary.hits++ : roundSummary.misses++;
                }

                //        for (var i = 0; i < globalGame.trialInfo.test.length; i++) {
                //            var stim = globalGame.trialInfo.test[i];
                //            var true_label = stim.belongs_to_concept;
                //            var turker_label = globalGame.roundProps.selected_test_stim.includes("#test_cell_" + i);
                //            var is_correct = (turker_label === true_label);

                //            // Track turker's choice
                //            roundSelections.push({
                //                "stim_num" : i,
                //                "turker_label": turker_label,
                //                "true_label": true_label,
                //                "is_correct": is_correct,
                //            });

                //            // Update round summary
                //            if (turker_label === false && true_label === false) {
                //                roundSummary.correct_rejections++;
                //            } else if (turker_label === false && true_label === true){
                //                roundSummary.misses++;
                //            } else if (turker_label === true && true_label === false) {
                //                roundSummary.false_alarms++;
                //            } else {
                //                roundSummary.hits++;
                //            }
                //        }
                var playerScore = roundSummary.hits;
                roundSummary.score = playerScore > 0 ? playerScore : 0;

                // local copy of scores
                globalGame.roundSelections.push(roundSelections);
                globalGame.roundSummaries.push(roundSummary);

                // Transmit performance info to server
                var roundTimesJSON = _.toPairs(encodeData(roundTimes)).join('.');
                globalGame.socket.send("logTimes.Complete." + roundTimesJSON);
                console.log(roundTimesJSON);

                var roundSelectionsObj= {
                    "trials": roundSelections,
                }
                globalGame.socket.emit("multipleTrialResponses", roundSelectionsObj);

                var roundSummaryJSON = _.toPairs(encodeData(roundSummary)).join('.');
                globalGame.socket.send("logScores.TestCreatures." + roundSummaryJSON);
                globalGame.socket.send("sendingTestScores." + roundSummaryJSON);

                // Enter wait room until other user has completed quiz/test
                clearTestCreatures();
                globalGame.socket.send("enterSlide.wait_room_slide.")
                drawProgressBar(globalGame.roundNum, globalGame.numRounds, 8, 8);
                drawWaitingRoom("Waiting for the your partner to catch up ...", globalGame);
            }
        }
    });

    $("#test_creatures_slide_continue_button").click(function() {
        if((globalGame.testNum > globalGame.bqKeys.length) && globalGame.roundProps[globalGame.my_role]['testResults']
                ['reactionQs'][globalGame.rqKeys[globalGame.testNum - 1 - globalGame.bqKeys.length]].length === 0){
            alert("You must add at least one chemical")
        } else if(globalGame.testNum < (globalGame.bqKeys.length + globalGame.rqKeys.length)){
            if(globalGame.testNum <= globalGame.bqKeys.length &&
                    globalGame.roundProps[globalGame.my_role]['testResults']
                    ['reactionsInteractedWith'][globalGame.bqKeys[globalGame.testNum - 1]].length !== globalGame.numReactions){
                alert("You must set all the measurements to a value.")
            } else {
                if(globalGame.testNum < globalGame.bqKeys.length){
                    drawTestCreatures(globalGame, globalGame.beakerQs[globalGame.bqKeys[globalGame.testNum]], false,
                                      globalGame.bqKeys[globalGame.testNum], globalGame.testNum);
                } else {
                    drawTestCreatures(globalGame, globalGame.reactionQs[globalGame.rqKeys
                                                                        [globalGame.testNum - globalGame.bqKeys.length]], true,
                                      globalGame.rqKeys[globalGame.testNum - globalGame.bqKeys.length], globalGame.testNum);
                }
                globalGame.testNum++;
            }
        } else {
            // End Time
            globalGame.roundProps[globalGame.my_role]['times']['test']['end'] = new Date();
            globalGame.roundProps[globalGame.my_role]['duration']['test'] = (
                        globalGame.roundProps[globalGame.my_role]['times']['test']['end'] -
                        globalGame.roundProps[globalGame.my_role]['times']['test']['start']
                        ) / 1000.0;

            // Summary of of times
            roundTimes = {
                'train': -1,
                'test': globalGame.roundProps[globalGame.my_role]['duration']['test'],
                'chat': globalGame.roundProps[globalGame.my_role]['duration']['chat'],
            };

            if (globalGame.my_role === "explorer") {
                roundTimes.train = globalGame.roundProps[globalGame.my_role]['duration']['train'];
            }

            // Measure performance & log selections
            var roundSelections = [];
            var roundSummary = {
                hits: 0,
                misses: 0,
                score: 0,
            }
            for(var config in globalGame.roundProps[globalGame.my_role]['testResults']['beakerQs']){
                var turker_answer = globalGame.roundProps[globalGame.my_role]['testResults']['beakerQs'][config];
                var answer = globalGame.beakerQs[config]['a']
                var isRight = true;
                for(var i = 0; i < answer.length; i++){
                    if(answer[i] && !turker_answer.includes("#reaction" + (i+1) + "test")) isRight = false;
                    if(!answer[i] && turker_answer.includes("#reaction" + (i+1) + "test")) isRight = false;
                }
                isRight ? roundSummary.hits++ : roundSummary.misses++;
            }
            for(var config in globalGame.roundProps[globalGame.my_role]['testResults']['reactionQs']){
                var turker_answer = beakerStr(globalGame.roundProps[globalGame.my_role]['testResults']['reactionQs'][config],
                                              globalGame.numBeakers, false, false, false);
                var possible_answers = globalGame.reactionQs[config]['a']
                var isRight = possible_answers.includes(turker_answer)
                isRight ? roundSummary.hits++ : roundSummary.misses++;
            }

            //        for (var i = 0; i < globalGame.trialInfo.test.length; i++) {
            //            var stim = globalGame.trialInfo.test[i];
            //            var true_label = stim.belongs_to_concept;
            //            var turker_label = globalGame.roundProps.selected_test_stim.includes("#test_cell_" + i);
            //            var is_correct = (turker_label === true_label);

            //            // Track turker's choice
            //            roundSelections.push({
            //                "stim_num" : i,
            //                "turker_label": turker_label,
            //                "true_label": true_label,
            //                "is_correct": is_correct,
            //            });

            //            // Update round summary
            //            if (turker_label === false && true_label === false) {
            //                roundSummary.correct_rejections++;
            //            } else if (turker_label === false && true_label === true){
            //                roundSummary.misses++;
            //            } else if (turker_label === true && true_label === false) {
            //                roundSummary.false_alarms++;
            //            } else {
            //                roundSummary.hits++;
            //            }
            //        }
            var playerScore = roundSummary.hits;
            roundSummary.score = playerScore > 0 ? playerScore : 0;

            // local copy of scores
            globalGame.roundSelections.push(roundSelections);
            globalGame.roundSummaries.push(roundSummary);

            // Transmit performance info to server
            var roundTimesJSON = _.toPairs(encodeData(roundTimes)).join('.');
            globalGame.socket.send("logTimes.Complete." + roundTimesJSON);
            console.log(roundTimesJSON);

            var roundSelectionsObj= {
                "trials": roundSelections,
            }
            globalGame.socket.emit("multipleTrialResponses", roundSelectionsObj);

            var roundSummaryJSON = _.toPairs(encodeData(roundSummary)).join('.');
            globalGame.socket.send("logScores.TestCreatures." + roundSummaryJSON);
            globalGame.socket.send("sendingTestScores." + roundSummaryJSON);

            // Enter wait room until other user has completed quiz/test
            clearTestCreatures();
            globalGame.socket.send("enterSlide.wait_room_slide.")
            drawProgressBar(globalGame.roundNum, globalGame.numRounds, 8, 8);
            drawWaitingRoom("Waiting for the your partner to catch up ...", globalGame);
        }
    });

    $("#round_score_report_continue_button").click(function(){
        clearRoundScoreReport();
        globalGame.socket.send("enterSlide.wait_room_slide.");
        globalGame.socket.send("newRoundUpdate.");
        drawWaitingRoom("Waiting for your partner to catch up", globalGame);
    });

    $("#total_score_report_continue_button").click(function(){
        clearTotalScoreReport();
        globalGame.socket.send("enterSlide.subj_info");
        drawSubjInfo();
    });

    $("#subj_info_button").click(function(){
        // Submit info
        var subjData = {
            nativeEnglish : $("#nativeEnglish").val(),
            enjoyment : $("#enjoyment").val(),
            assess : $('#assess').val(),
            age : $("#age").val(),
            gender : $("#gender").val(),
            education : $("#education").val(),
            comments : $("#comments").val(),
            problems: $("#problems").val(),
            fairprice: $("#fairprice").val(),
            strategy: $("#strategy").val(),
            humanPartner: $("#human").val(),
            likePartner: $("#likePartner").val()
        };
        globalGame.socket.send("logSubjInfo.subjInfo." + _.toPairs(encodeData(subjData)).join('.'));

        // Move to thanks slide
        onDisconnect();
        globalGame.socket.send("enterSlide.thanks");
        clearSubjInfo();
        drawThanks(globalGame);

        var finalData = {
            "game_id": globalGame.id,
            "role": globalGame.my_role,
            "round_selections": globalGame.roundSelections,
            "subject_information" : subjData,
            "time_in_minutes" : (Date.now() - globalGame.startTime)/60000,
            "round_summaries": globalGame.roundSummaries,
            "bonus": globalGame.totalScore * globalGame.bonusAmt,
        }

        if(_.size(globalGame.urlParams()) == 4) {
            window.opener.turk.submit(finalData, true);
            window.close();
        } else {
            console.log("would have submitted the following :")
            console.log(finalData);
        }
        
    });

    // ---------------
    // Socket Handlers
    // ---------------

    globalGame.socket.on('newRoundUpdate', function(data){
        clearWaitingRoom();
        globalGame.socket.send("enterSlide.round_slide.") 
        drawRoundNumber(data, globalGame);

        // local
        globalGame.roundProps = {
            selected_train_stim: [],
            selected_test_stim: [],
            explorer: {
                "duration": {},
                "times": {
                    "train": {},
                    "test": {},
                    "chat": {},
                },
            },
            student: {
                "duration": {},
                "times": {
                    "train": {},
                    "test": {},
                    "chat": {},
                },
            }
        };
    });

    // One player has not yet made it to the chatroom, so sending messages is impossible
    globalGame.socket.on('chatWait', function(data){
        $('#chatbox').attr("disabled", "disabled");

        // Pretty Animation (Fade In / Out)
        globalGame.blinking_wait = setInterval(function() {
            $("#chat_room_slide_status").fadeOut(1000);
            $("#chat_room_slide_status").fadeIn(1000);
        });
        $("#chat_room_slide_status").show();
    });

    // Both players are now in the chatroom, so they may send messages
    // the waiting message is therefore now hidden
    globalGame.socket.on("enterChatRoom", function(data){
        console.log("enterChatRoom")
        flashConnected = true;

        $("#chatbox").removeAttr("disabled");
        $("#chat_room_slide_status").show();
        $("#chat_room_slide_status").html("<div id='chat_room_slide_status'><p style='color:green;'>Chatroom has connected with your partner!  <br>You may begin messaging!</p></div>");
    
        newMsg = "Connected!"
        function step() {
            document.title = (document.title == originalTitle) ? newMsg : originalTitle;
            if (flashConnected === true) {
                timeoutIndex = setTimeout(step, 500);
            } else {
                document.title = originalTitle;
            }
        };
        step();

        if(globalGame.my_role === "student") {
            $("#chat_room_slide_continue_button").prop("disabled", false);
            // Start Time
            globalGame.roundProps[globalGame.my_role]['times']['chat']['start'] = new Date();
        }
    });

    globalGame.socket.on('exitChatRoom', function(data) {
        // End Time
        globalGame.roundProps[globalGame.my_role]['times']['chat']['end'] = new Date();
        globalGame.roundProps[globalGame.my_role]['duration']['chat'] = (
            globalGame.roundProps[globalGame.my_role]['times']['chat']['end'] -
            globalGame.roundProps[globalGame.my_role]['times']['chat']['start']
        ) / 1000.0;
        globalGame.testNum = 0;
        globalGame.rqKeys = Object.keys(globalGame.reactionQs);
        globalGame.bqKeys = Object.keys(globalGame.beakerQs);
        flashConnected = false;
        clearChatRoom();
        globalGame.socket.send("enterSlide.test_instructions_slide.")  
        drawTestInstructions(globalGame);
    });

    // Creates the score reports for the players
    globalGame.socket.on('sendingTestScores', function(data){
        enterScoreReport++;
        // only works when both players have reached this, then it generates scores for both players
        if(enterScoreReport % 2 == 0){ //hacky way to handle error thrown when only one player finishes the test
            globalGame.socket.send("enterSlide.round_score_report_slide.");
            var my_role = globalGame.my_role;
            var partner_role = my_role === "explorer" ? "student" : "explorer"
            for(var i=0; i<2; i++){
                var score_role, role_index;
                if(i==0){
                    score_role="your";
                    role_index=my_role;
                } else if(i==1){
                    score_role="other";
                    role_index=partner_role;
                }

                var hits = Number(data[role_index][globalGame.roundNum].hits);
                var misses = Number(data[role_index][globalGame.roundNum].misses);
                var playerScore =  hits;
                var positiveScore = playerScore;
                $('#'+score_role+'_score').html(positiveScore);
                $('#'+score_role+'_hits').html("Correctly selected: " + hits+ " out of " + (hits + misses));
                $('#'+score_role+'_falseAlarms').html("Selected incorrectly: " + misses + " out of "+ (hits + misses));
                $('#'+score_role+'_score').html("Round score: " + positiveScore);
            }

            clearWaitingRoom();
            drawRoundScoreReport(globalGame);
        }
    });

    globalGame.socket.on('totalScoreUpdate', function(data){
        clearWaitingRoom();
        globalGame.totalScore = data;
        globalGame.socket.send("enterSlide.total_score_report_slide.");
        $("#total_score").html(data);
        drawTotalScoreReport(globalGame);
    });
};

function encodeData(dataObj){
    var isNumeric = function(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    // Encode real numbers  
    return _.mapValues(dataObj, function(val, key) {
        if (isNumeric(val)) {
            if (Number.isInteger(val)) {
                return val.toString();
            } else {
                return val.toString().replace(".", "&");
            }
        } else {
            return val;
        }
    });
  }
