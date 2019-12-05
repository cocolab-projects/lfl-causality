//   Copyright (c) 2012 Sven "FuzzYspo0N" Bergström,
//                 2013 Robert XD Hawkins
//   Written by : http://underscorediscovery.com
//   Written for : http://buildnewgames.com/real-time-multiplayer/
//   Modified for collective behavior experiments on Amazon Mechanical Turk
//   MIT Licensed.

// ----------------
// GLOBAL VARIABLES
// ----------------
var fullTest = true;

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
    globalGame.questions = data.questions;
    globalGame.config = data.config;
    globalGame.configCode = data.configType;
    globalGame.ruleTypes = data.ruleTypes;
    globalGame.totalPoints = data.totalPoints
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
            element : event.target.id,
        }
        var clickJSON = _.toPairs(encodeData(click)).join('.');
        globalGame.socket.send("logClicks.Complete." + clickJSON);
    });

    // Initial setup -- draw the waiting room.
    //drawWaitingRoom("Waiting for another player to join the game ...", globalGame);
    //globalGame.socket.send("enterSlide.wait_room_slide.")
    globalGame.socket.send("newRoundUpdate.");


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
        globalGame.socket.send("enterSlide.train_chemicals_tutorial.");
        globalGame.currentPage = "train_chemicals_tutorial"
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
            "110": [true],
            "001": [false],
        }
        if((globalGame.roundProps.tutorial.beakersClicked.includes("#beaker3tutorial") &&
                globalGame.roundProps.tutorial.beakersClicked.length === 1) ||
            (globalGame.roundProps.tutorial.beakersClicked.length === 2 &&
                globalGame.roundProps.tutorial.beakersClicked.includes("#beaker2tutorial") &&
                globalGame.roundProps.tutorial.beakersClicked.includes("#beaker1tutorial"))){
            turnReactionsOn(globalGame.roundProps.tutorial.beakersClicked, configDict,
                         3, globalGame.numReactions, true);

            $("#tutorial_slide_test_button").prop("disabled", true);
            $("#train_chemicals_slide_continue_button").show();
            $("#reactionInstruct").show();
            unhighlight("#tutorial_slide_test_button")
            unhighlight("#mixBoxTutorial")
            unhighlight("#beakerstutorial")
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
        highlight("#tutorial_slide_test_button")
        highlight("#mixBoxTutorial")
        highlight("#beakerstutorial")
        darken("#mixBoxTutorial")
        darken("#beakerstutorial")
        lighten('#reactionstutorial')
        $('#beakerInstruct').text("Try running a mixture with just bluease")
        $('#mixInstruct').hide();
        $('#reactionInstruct').hide();
        globalGame.testStage = true;
        $("#tutorial_slide_test_button").prop("disabled", false)
        $("#tutorial_slide_newtest_button").prop("disabled", true)
        turnReactionsOff(globalGame.numReactions, 3, true)
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
        if(!globalGame.roundProps.tutorialFirst.reactionsClicked.includes("#cap_reaction1question") &&
                globalGame.roundProps.tutorialFirst.reactionsInteractedWith.includes("#cap_reaction1question")){
            globalGame.currentPage = "second_question_slide"
            clearFirstQuestion();
            drawSecondQuestion(globalGame)
            globalGame.roundProps[globalGame.my_role]['times']['tutorial']['first_question']['end'] = new Date();
            globalGame.roundProps[globalGame.my_role]['times']['tutorial']['second_question']['start'] = new Date();
        } else if(!globalGame.roundProps.tutorialFirst.reactionsInteractedWith.includes("#cap_reaction1question")){
            alert("You must predict the presence/absence of the reaction")
        } else{
            alert("That is not the right answer. Hint: in the tutorial, bluease did not glow")
        }


    });
    $("#second_question_slide_continue_button").click(function(){
        if(globalGame.roundProps.tutorialSecond.beakersClicked.includes("#beaker1question") &&
            globalGame.roundProps.tutorialSecond.beakersClicked.includes("#beaker2question") &&
                globalGame.roundProps.tutorialSecond.beakersClicked.length === 2 ){
            globalGame.currentPage = "train_instructions_slide"
            clearSecondQuestion();
            drawTrainInstructions(globalGame)
            globalGame.roundProps[globalGame.my_role]['times']['tutorial']['second_question']['end'] = new Date();
        } else {
            alert("That is not the right answer. Hint: in the tutorial, redase and yellowase glowed")
        }
    });

    $("#train_instructions_slide_continue_button").click(function() {
        clearTrainInstructions();
        globalGame.roundProps[globalGame.my_role]['clicks'] = {
            training : [],
            testing : [],
        }
        if (globalGame.my_role === "explorer") {
            globalGame.currentPage = "train_chemicals_slide"
            drawProgressBar(globalGame.roundNum, globalGame.numRounds, 3, 8);
            globalGame.socket.send("enterSlide.train_chemicals_slide.");
            drawTrainBox(globalGame);
            globalGame.roundProps.reactionsOnPrev = [];
            $("#train_chemicals_slide_continue_button").show();
            $("#train_chemicals_slide_newtest_button").prop("disabled", true);
            $("#train_chemicals_slide_continue_button").prop("disabled", false);
            $("#train_chemicals_slide_test_button").prop("disabled", false);
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
    $("#train_chemicals_slide_test_button").click(function(){
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
            $("#train_chemicals_slide_test_button").prop("disabled", true);
            $("#train_chemicals_slide_newtest_button").prop("disabled", false);
            $("#train_chemicals_slide_continue_button").show();
            globalGame.testStage = false;
        }
    });

    $("#train_chemicals_slide_newtest_button").click(function(){
        globalGame.roundProps.combosTried[globalGame.roundProps.combosTried.length - 1]['learnTime'] = new Date()
        globalGame.roundProps.selected_train_stim = []
        $("#train_chemicals_slide_test_button").prop("disabled", false);
        $("#train_chemicals_slide_newtest_button").prop("disabled", true);
        $("#train_chemicals_slide_continue_button").show();
        turnReactionsOff(globalGame.numReactions, globalGame.numBeakers, false)
        globalGame.testStage = true;
        var clickRecord = {
            config: "",
            clicks: []
        }
        globalGame.roundProps['explorer']['clicks']['training'].push(clickRecord)
    });

    $("#train_chemicals_slide_continue_button").click(function(){
        // End Time
        if(fullTest && globalGame.roundProps.numTests < globalGame.numReqTests){
            alert("You need to run at least " + globalGame.numReqTests + " experiments before you can advance")
        } else {
            globalGame.roundProps[globalGame.my_role]['times']['train']['end'] = new Date();
            globalGame.roundProps[globalGame.my_role]['duration']['train'] = (
                globalGame.roundProps[globalGame.my_role]['times']['train']['end'] -
                globalGame.roundProps[globalGame.my_role]['times']['train']['start']
            ) / 1000.0;
            globalGame.currentPage = "chat_instructions_slide"
            clearTrainChemicals();
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
        var continueFromChat = confirm("Are you sure you want to continue to the test?")
        globalGame.roundProps[globalGame.my_role]['times']['chat']['end'] = new Date();
        globalGame.roundProps[globalGame.my_role]['duration']['chat'] = (
            globalGame.roundProps[globalGame.my_role]['times']['chat']['end'] -
            globalGame.roundProps[globalGame.my_role]['times']['chat']['start']
        ) / 1000.0;
        if(continueFromChat){
            var message = {
                text: $("#chatbox").val().replace(/,/g, " -").replace(/\./g, "*").replace(/\n/g, "|"),
                time: globalGame.roundProps[globalGame.my_role]['duration']['chat'],
            }
            var messageJSON = _.toPairs(encodeData(message)).join('.');
            globalGame.socket.send("chatMessage." + messageJSON);
            drawProgressBar(globalGame.roundNum, globalGame.numRounds, 6, 8);
            globalGame.socket.send("proceedToTestInstructions.");
            globalGame.currentPage = "test_instructions_slide"
        }
    });

    $("#test_instructions_slide_continue_button").click(function(){
        clearTestInstructions();
        drawProgressBar(globalGame.roundNum, globalGame.numRounds, 7, 8);
        globalGame.socket.send("enterSlide.test_chemicals_slide.");
        globalGame.roundProps[globalGame.my_role]['testResults'] = {
            beakerQs: {},
            reactionQs: {},
            reactionsInteractedWith : {},
        }
        // Start Time
        globalGame.roundProps[globalGame.my_role]['times']['test']['start'] = new Date();
        globalGame.roundProps[globalGame.my_role]['times']['test']['trials'] = []
        globalGame.roundProps[globalGame.my_role]['currentQuestion'] = globalGame.questions[globalGame.testNum]
        drawTestChemicals(globalGame, globalGame.roundProps[globalGame.my_role]['currentQuestion'],
                          globalGame.roundProps[globalGame.my_role]['currentQuestion']['type'] !== 'beaker',
                          globalGame.roundProps[globalGame.my_role]['currentQuestion']['config'], globalGame.testNum);
        globalGame.roundProps[globalGame.my_role]['times']['test']['trials'].push({
                                            config : globalGame.roundProps[globalGame.my_role]['currentQuestion']['config'],
                                            type : globalGame.roundProps[globalGame.my_role]['currentQuestion']['type'],
                                            start : new Date(),
                                        })
        globalGame.currentPage = "test_slide_num_" + globalGame.testNum
        globalGame.testNum++;
    });

    $("#test_chemicals_slide_continue_button").click(function() {
        if(fullTest && (globalGame.roundProps[globalGame.my_role]['currentQuestion']['type'] === 'reaction') &&
                globalGame.roundProps[globalGame.my_role]['testResults']
                ['reactionQs'][globalGame.roundProps[globalGame.my_role]['currentQuestion']['config']].length === 0){
            alert("You must add at least one chemical")
        } else if(fullTest && globalGame.roundProps[globalGame.my_role]['currentQuestion']['type'] === 'beaker' &&
                    globalGame.roundProps[globalGame.my_role]['testResults']
                    ['reactionsInteractedWith'][globalGame.roundProps[globalGame.my_role]['currentQuestion']['config']].length !== globalGame.numReactions){
                alert("You must predict the presence/absence of each reaction")
            } else if(globalGame.testNum < globalGame.questions.length){
                globalGame.roundProps[globalGame.my_role]['currentQuestion'] = globalGame.questions[globalGame.testNum]
                drawTestChemicals(globalGame, globalGame.roundProps[globalGame.my_role]['currentQuestion'],
                                  globalGame.roundProps[globalGame.my_role]['currentQuestion']['type'] !== 'beaker',
                                  globalGame.roundProps[globalGame.my_role]['currentQuestion']['config'], globalGame.testNum);
                globalGame.roundProps[globalGame.my_role]['times']['test']['trials'].push({
                                                    config : globalGame.roundProps[globalGame.my_role]['currentQuestion']['config'],
                                                    type : globalGame.roundProps[globalGame.my_role]['currentQuestion']['type'],
                                                    start : new Date(),
                                                })
                globalGame.currentPage = "test_slide_num_" + globalGame.testNum
                globalGame.testNum++;
            } else {
                endRound();
            }
    });

    $("#round_score_report_continue_button").click(function(){
        clearRoundScoreReport();
        //globalGame.socket.send("enterSlide.wait_room_slide.");
        globalGame.socket.send("newRoundUpdate.");
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
            confusion: $("#confusion").val(),
            fairprice: $("#fairprice").val(),
            strategy: $("#strategy").val(),
            totalBonus:globalGame.totalScore * globalGame.bonusAmt * .01,
        };
        if(Object.keys(globalGame.urlParams()).length !== 0){
            subjData.workerId = globalGame.urlParams().workerId;
            subjData.assignmentId = globalGame.urlParams().assignmentId;
            subjData.hitId = globalGame.urlParams().hitId;
        }
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
    });

    // Both players are now in the chatroom, so they may send messages
    // the waiting message is therefore now hidden
    globalGame.socket.on("enterChatRoom", function(data){
        console.log("enterChatRoom")
        flashConnected = true;

        $("#chatbox").removeAttr("disabled");
    
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

        if(globalGame.my_role === "explorer") {
            $("#chat_room_slide_continue_button").prop("disabled", false);
            // Start Time
            globalGame.roundProps[globalGame.my_role]['times']['chat']['start'] = new Date();
        }
    });

    globalGame.socket.on('exitChatRoom', function(data) {
        // End Time
        globalGame.testNum = 0;
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
        if(enterScoreReport % 1 == 0){ //hacky way to handle error thrown when only one player finishes the test
            globalGame.socket.send("enterSlide.round_score_report_slide.");
            var my_role = globalGame.my_role;
            var partner_role = my_role === "explorer" ? "student" : "explorer"
            for(var i=0; i<1; i++){
                var score_role, role_index;
                if(i==0){
                    score_role="your";
                    role_index=my_role;
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
        $("#total_score").html(data + " out of " + globalGame.numRounds*globalGame.numPointsPerRound);
        $("#total_bonus").html("\$" + (data * globalGame.bonusAmt * .01));
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
    for(var i = 0; i < (globalGame.questions.length); i++){
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
    var configForCSV = JSON.stringify(globalGame.config).replace(/,/g, "%")
    var roundSummary = {
        hits: 0,
        misses: 0,
        score: 0,
        rules : globalGame.ruleTypes.join("/"),
        configCode : globalGame.configCode,
        config : configForCSV,
    }
    if(Object.keys(globalGame.urlParams()).length !== 0){
        roundSummary.workerId = globalGame.urlParams().workerId;
        roundSummary.assignmentId = globalGame.urlParams().assignmentId;
        roundSummary.hitId = globalGame.urlParams().hitId;
    }

    for(var i = 0; i < globalGame.questions.length; i++){
        var question = globalGame.questions[i];
        var true_answers = question['a']
        if(question['type'] === "beaker"){
            var turker_answer = reactionStr(globalGame.roundProps[globalGame.my_role]['testResults']['beakerQs'][question.config],
                                            globalGame.numReactions, false, false, false);
            var isRight = (turker_answer === true_answers)
        }else {
            var turker_answer = beakerStr(globalGame.roundProps[globalGame.my_role]['testResults']['reactionQs'][question.config],
                                          globalGame.numBeakers, false, false, false);
            var turker_answer_short = turker_answer === "Not Possible" ? "Not Possible" : turker_answer
            if(true_answers.includes("Not Possible") && !question.config.includes("1")){
                    true_answers = ["00000"]
            }
            var isRight = true_answers.includes(turker_answer_short)
        }
        isRight ? roundSummary.hits++ : roundSummary.misses++;
        roundSelections.push({
            "fixed" : question.type,
            "config" : question.config,
            "turker_answer": turker_answer,
            "true_answers": true_answers,
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
        globalGame.socket.send("logCompleteTimes.Complete." + roundTimesJSON);
    }
    var roundSimpleTimesJSON = _.toPairs(encodeData(roundSimpleTimes)).join('.');
    globalGame.socket.send("logSimpleTimes.Complete." + roundSimpleTimesJSON);
    var roundSelectionsObj= {
        "trials": roundSelections,
    }
    globalGame.socket.emit("multipleTrialResponses", roundSelectionsObj);

    var roundSummaryJSON = _.toPairs(encodeData(roundSummary)).join('.');
    globalGame.socket.send("logScores.TestChemicals." + roundSummaryJSON);
    globalGame.socket.send("sendingTestScores." + roundSummaryJSON);

    // Enter wait room until other user has completed quiz/test
    clearTestChemicals();
    globalGame.socket.send("enterSlide.wait_room_slide.")
    drawProgressBar(globalGame.roundNum, globalGame.numRounds, 8, 8);
    globalGame.currentPage = "results_slide"
}
