//   Copyright (c) 2012 Sven "FuzzYspo0N" Bergström,
//                 2013 Robert XD Hawkins
//   Written by : http://underscorediscovery.com
//   Written for : http://buildnewgames.com/real-time-multiplayer/
//   Modified for collective behavior experiments on Amazon Mechanical Turk
//   MIT Licensed.

// ----------------
// GLOBAL VARIABLES
// ----------------
var fullTest = false;

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
    globalGame.config = data.config;
    globalGame.ruleTypes = data.ruleTypes;
    globalGame.doTutorial = false;
    globalGame.currentPage = "PreRound" + globalGame.roundNum + "_slide"


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
    $(document).on('mousedown', function (event) {
        var click = {
            x : event.screenX,
            y : event.screenY,
            page : globalGame.currentPage,
        }
        var clickJSON = _.toPairs(encodeData(click)).join('.');
        globalGame.socket.send("logClicks.Complete." + clickJSON);
    });

    // Initial setup -- draw the waiting room.
    drawWaitingRoom("Waiting for another player to join the game ...", globalGame);
    globalGame.socket.send("enterSlide.wait_room_slide.")

    // --------------
    // Click Handlers
    // --------------

    $("#round_slide_continue_button").click(function(){
        globalGame.currentPage = "tutorial_instructions_slide"
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
        globalGame.currentPage = "train_creatures_tutorial"
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
        globalGame.currentPage = "question_instructions_slide"
        clearTutorial();
        drawQuestionInstructions(globalGame)
    });

    $("#question_instructions_slide_continue_button").click(function(){
        globalGame.roundProps[globalGame.my_role]['times']['tutorial']['first_question']['start'] = new Date();
        globalGame.currentPage = "first_question_slide"
        clearQuestionInstructions();
        drawFirstQuestion(globalGame)
    });
    $("#first_question_slide_continue_button").click(function(){
        if(globalGame.roundProps.tutorialFirst.reactionsClicked.includes("#reaction1question") &&
            globalGame.roundProps.tutorialFirst.reactionsClicked.includes("#reaction2question") &&
                !globalGame.roundProps.tutorialFirst.reactionsClicked.includes("#reaction3question") &&
                globalGame.roundProps.tutorialFirst.reactionsInteractedWith.includes("#reaction3question")){
            globalGame.currentPage = "second_question_slide"
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
            globalGame.currentPage = "train_instructions_slide"
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
        clearTrainInstructions();
        globalGame.roundProps[globalGame.my_role]['clicks'] = {
            training : [],
            testing : [],
        }
        if (globalGame.my_role === "explorer") {
            globalGame.currentPage = "train_creatures_slide"
            drawProgressBar(globalGame.roundNum, globalGame.numRounds, 3, 8);
            globalGame.socket.send("enterSlide.train_creatures_slide.");
            drawTrainBox(globalGame);
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
            globalGame.currentPage = "chat_room_slide"
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
            var holderObject = {
                config : beakerStr(globalGame.roundProps.selected_train_stim,
                                   globalGame.numBeakers, false, false, true),
                testTime: new Date()
            }
            globalGame.roundProps.combosTried.push(holderObject)
            globalGame.roundProps['explorer']['clicks']['training']
                    [globalGame.roundProps['explorer']['clicks']['training'].length - 1]['config'] =
                                beakerStr(globalGame.roundProps.selected_train_stim,
                                          globalGame.numBeakers, false, false, true)
            globalGame.roundProps.numTests++
            turnReactionsOn(globalGame.roundProps.selected_train_stim, globalGame.boxConfig,
                         globalGame.numBeakers, globalGame.numReactions, false);
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
        var clickRecord = {
            config: "",
            clicks: []
        }
        globalGame.roundProps['explorer']['clicks']['training'].push(clickRecord)
    });

    $("#train_creatures_slide_continue_button").click(function(){
        // End Time
        if(fullTest && globalGame.roundProps.numTests < globalGame.numReqTests){
            alert("You need to keep experimenting")
        } else {
            globalGame.roundProps[globalGame.my_role]['times']['train']['end'] = new Date();
            globalGame.roundProps[globalGame.my_role]['duration']['train'] = (
                globalGame.roundProps[globalGame.my_role]['times']['train']['end'] -
                globalGame.roundProps[globalGame.my_role]['times']['train']['start']
            ) / 1000.0;
            globalGame.currentPage = "chat_instructions_slide"
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
        globalGame.currentPage = "chat_room_slide"
        // Start Time
        globalGame.roundProps[globalGame.my_role]['times']['chat']['start'] = new Date();
    });

    $("#chat_room_slide_continue_button").click(function(){
        drawProgressBar(globalGame.roundNum, globalGame.numRounds, 6, 8);
        globalGame.socket.send("proceedToTestInstructions.");
        globalGame.currentPage = "test_instructions_slide"
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
        // Start Time
        globalGame.roundProps[globalGame.my_role]['times']['test']['start'] = new Date();
        globalGame.roundProps[globalGame.my_role]['times']['test']['trials'] = []
        if(globalGame.testNum < globalGame.bqKeys.length){
            drawTestCreatures(globalGame, globalGame.beakerQs[globalGame.bqKeys[globalGame.testNum]], false,
                              globalGame.bqKeys[globalGame.testNum], globalGame.testNum);
            globalGame.roundProps[globalGame.my_role]['times']
                    ['test']['trials'].push({
                                                config : globalGame.bqKeys[globalGame.testNum],
                                                type : "beaker",
                                                start : new Date(),
                                            })
        } else {
            drawTestCreatures(globalGame, globalGame.reactionQs[globalGame.rqKeys
                                                                [globalGame.testNum - globalGame.bqKeys.length]], true,
                              globalGame.rqKeys[globalGame.testNum - globalGame.bqKeys.length], globalGame.testNum);
            globalGame.roundProps[globalGame.my_role]['times']
                    ['test']['trials'].push({
                                                config : globalGame.rqKeys[globalGame.testNum - globalGame.bqKeys.length],
                                                type: "reaction",
                                                start : new Date(),
                                            })
        }
        globalGame.currentPage = "test_slide_num_" + globalGame.testNum
        globalGame.testNum++;
    });

    $("#test_creatures_slide_notPossible_button").click(function(){
        //If there are still more questions, keep asking
        var isSure = confirm("Are you sure there are no possible answers? Click OK if you are sure.")
        globalGame.roundProps[globalGame.my_role]['clicks']['testing']
                [globalGame.roundProps[globalGame.my_role]['clicks']['testing'].length - 1]['clicks'].push("Not Possible: " + isSure)
        if(isSure){
            globalGame.roundProps[globalGame.my_role]['testResults']['reactionQs']
                    [globalGame.rqKeys[globalGame.testNum - globalGame.bqKeys.length - 1]] = ['Not Possible']
            globalGame.roundProps[globalGame.my_role]['times']['test']['trials']
                    [globalGame.testNum - 1]['end'] = new Date()
            globalGame.roundProps[globalGame.my_role]['times']['test']['trials']
                    [globalGame.testNum - 1]['duration'] =
                    (globalGame.roundProps[globalGame.my_role]['times']['test']['trials'][globalGame.testNum - 1]['end'] -
                    globalGame.roundProps[globalGame.my_role]['times']['test']['trials']
                    [globalGame.testNum - 1]['start']) / 1000
            globalGame.currentPage = "test_slide_num_" + globalGame.testNum
            if(globalGame.testNum < (globalGame.bqKeys.length + globalGame.rqKeys.length)){
                drawTestCreatures(globalGame, globalGame.reactionQs[globalGame.rqKeys
                                                                    [globalGame.testNum - globalGame.bqKeys.length]], true,
                                  globalGame.rqKeys[globalGame.testNum - globalGame.bqKeys.length], globalGame.testNum);
                globalGame.roundProps[globalGame.my_role]['times']
                        ['test']['trials'].push({
                                                    config : globalGame.rqKeys[globalGame.testNum - globalGame.bqKeys.length],
                                                    type: "reaction",
                                                    start : new Date(),
                                                });
                globalGame.testNum++;
            } else {
                endRound();
            }
        }
    });

    $("#test_creatures_slide_continue_button").click(function() {
        if(fullTest && (globalGame.testNum > globalGame.bqKeys.length) && globalGame.roundProps[globalGame.my_role]['testResults']
                ['reactionQs'][globalGame.rqKeys[globalGame.testNum - 1 - globalGame.bqKeys.length]].length === 0){
            alert("You must add at least one chemical")
        } else if(globalGame.testNum < (globalGame.bqKeys.length + globalGame.rqKeys.length)){
            if(fullTest && globalGame.testNum <= globalGame.bqKeys.length &&
                    globalGame.roundProps[globalGame.my_role]['testResults']
                    ['reactionsInteractedWith'][globalGame.bqKeys[globalGame.testNum - 1]].length !== globalGame.numReactions){
                alert("You must set all the measurements to a value.")
            } else {
                globalGame.roundProps[globalGame.my_role]['times']['test']['trials']
                        [globalGame.testNum - 1]['end'] = new Date()
                globalGame.roundProps[globalGame.my_role]['times']['test']['trials']
                        [globalGame.testNum - 1]['duration'] =
                        (globalGame.roundProps[globalGame.my_role]['times']['test']['trials'][globalGame.testNum - 1]['end'] -
                        globalGame.roundProps[globalGame.my_role]['times']['test']['trials']
                        [globalGame.testNum - 1]['start']) / 1000
                if(globalGame.testNum < globalGame.bqKeys.length){
                    drawTestCreatures(globalGame, globalGame.beakerQs[globalGame.bqKeys[globalGame.testNum]], false,
                                      globalGame.bqKeys[globalGame.testNum], globalGame.testNum);
                    globalGame.roundProps[globalGame.my_role]['times']
                            ['test']['trials'].push({
                                                        config : globalGame.bqKeys[globalGame.testNum],
                                                        type : "beaker",
                                                        start : new Date(),
                                                    })
                } else {
                    drawTestCreatures(globalGame, globalGame.reactionQs[globalGame.rqKeys
                                                                        [globalGame.testNum - globalGame.bqKeys.length]], true,
                                      globalGame.rqKeys[globalGame.testNum - globalGame.bqKeys.length], globalGame.testNum);
                    globalGame.roundProps[globalGame.my_role]['times']
                            ['test']['trials'].push({
                                                        config : globalGame.rqKeys[globalGame.testNum - globalGame.bqKeys.length],
                                                        type: "reaction",
                                                        start : new Date(),
                                                    })
                }
                globalGame.currentPage = "test_slide_num_" + globalGame.testNum
                globalGame.testNum++;
            }
        } else {
            endRound();
        }
    });

    $("#round_score_report_continue_button").click(function(){
        clearRoundScoreReport();
        globalGame.socket.send("enterSlide.wait_room_slide.");
        globalGame.socket.send("newRoundUpdate.");
        drawWaitingRoom("Waiting for your partner to catch up", globalGame);
    });

    $("#total_score_report_continue_button").click(function(){
        globalGame.currentPage = "subj_info_slide"
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
            chemistry : $("#chemistry").val(),
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
        globalGame.currentPage = "test_instructions_slide"
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
    return _.mapValues(dataObj, function(val) {
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

function endRound(){
    // End Time
    globalGame.roundProps[globalGame.my_role]['times']['test']['trials']
            [globalGame.testNum - 1]['end'] = new Date()
    globalGame.roundProps[globalGame.my_role]['times']['test']['trials']
            [globalGame.testNum - 1]['duration'] =
            (globalGame.roundProps[globalGame.my_role]['times']['test']['trials'][globalGame.testNum - 1]['end'] -
            globalGame.roundProps[globalGame.my_role]['times']['test']['trials']
            [globalGame.testNum - 1]['start']) / 1000
    globalGame.roundProps[globalGame.my_role]['times']['test']['end'] = new Date();
    globalGame.roundProps[globalGame.my_role]['duration']['test'] = (
                globalGame.roundProps[globalGame.my_role]['times']['test']['end'] -
                globalGame.roundProps[globalGame.my_role]['times']['test']['start']
                ) / 1000.0;

    // Summary of of times
    var roundSimpleTimes = {
        'Total Train Time': -1,
        'Total Test Time': globalGame.roundProps[globalGame.my_role]['duration']['test'],
        'chat': globalGame.roundProps[globalGame.my_role]['duration']['chat'],
    };
    var roundTimes = [];
    for(var i = 0; i < (globalGame.bqKeys.length + globalGame.rqKeys.length); i++){
        var trial = globalGame.roundProps[globalGame.my_role]['times']['test']['trials'][i];
        roundTimes.push ({
                             type : trial.type + "question",
                             config : trial.config,
                             duration : trial.duration,
                         })
    }
    if (globalGame.my_role === "explorer") {
        roundSimpleTimes['Total Train Time'] = globalGame.roundProps[globalGame.my_role]['duration']['train'];
        for(var i = 0; i < (globalGame.roundProps.combosTried.length); i++){
            var combo = globalGame.roundProps.combosTried[i];
            roundTimes.push ({
                                 type : "test",
                                 config : combo.config,
                                 duration : (combo.learnTime - combo.testTime)/1000,
                             })
        }
    }
    // Measure performance & log selections
    var roundSelections = [];
    var configForCSV = globalGame.config
    var roundSummary = {
        hits: 0,
        misses: 0,
        score: 0,
        rules : globalGame.ruleTypes.join("/"),
        config : "\"" + configForCSV + "\""
    }
    console.log("rules: " + roundSummary.rules)
    for(var config in globalGame.roundProps[globalGame.my_role]['testResults']['beakerQs']){
        var turker_answer = reactionStr(globalGame.roundProps[globalGame.my_role]['testResults']['beakerQs'][config],
                                        globalGame.numReactions, false, false, false);
        var answer = globalGame.beakerQs[config]['a']
        var isRight = (turker_answer === answer)
        isRight ? roundSummary.hits++ : roundSummary.misses++;
        roundSelections.push({
            "fixed" : "beakers",
            "config" : config,
            "turker_answer": turker_answer,
            "true_answer": answer,
            "is_correct": isRight,
            });
    }
    for(var config in globalGame.roundProps[globalGame.my_role]['testResults']['reactionQs']){
        var turker_answer = beakerStr(globalGame.roundProps[globalGame.my_role]['testResults']['reactionQs'][config],
                                      globalGame.numBeakers, false, false, false);
        var possible_answers = globalGame.reactionQs[config]['a']
        var isRight = possible_answers.includes(turker_answer)
        isRight ? roundSummary.hits++ : roundSummary.misses++;
        roundSelections.push({
            "fixed" : "reactions",
            "config" : config,
            "turker_answer": turker_answer,
            "true_answers": possible_answers,
            "is_correct": isRight,
            });
    }
    var playerScore = roundSummary.hits;
    roundSummary.score = playerScore > 0 ? playerScore : 0;

    // local copy of scores
    globalGame.roundSelections.push(roundSelections);
    globalGame.roundSummaries.push(roundSummary);

    // Transmit performance info to server
    for(var i = 0; i < roundTimes.length; i++){
        var roundTimesJSON = _.toPairs(encodeData(roundTimes[i])).join('.');
        console.log(roundTimesJSON)
        globalGame.socket.send("logCompleteTimes.Complete." + roundTimesJSON);
    }
    var roundSimpleTimesJSON = _.toPairs(encodeData(roundSimpleTimes)).join('.');
    globalGame.socket.send("logSimpleTimes.Complete." + roundSimpleTimesJSON);
    var roundSelectionsObj= {
        "trials": roundSelections,
    }
    globalGame.socket.emit("multipleTrialResponses", roundSelectionsObj);

    var roundSummaryJSON = _.toPairs(encodeData(roundSummary)).join('.');
    console.log(roundSummaryJSON)
    globalGame.socket.send("logScores.TestCreatures." + roundSummaryJSON);
    globalGame.socket.send("sendingTestScores." + roundSummaryJSON);

    // Enter wait room until other user has completed quiz/test
    clearTestCreatures();
    globalGame.socket.send("enterSlide.wait_room_slide.")
    drawProgressBar(globalGame.roundNum, globalGame.numRounds, 8, 8);
    drawWaitingRoom("Waiting for the your partner to catch up ...", globalGame);
    globalGame.currentPage = "results_slide"
}
