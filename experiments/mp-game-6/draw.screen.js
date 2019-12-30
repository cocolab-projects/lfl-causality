// -------
// DRAWING
// -------
var drawProgressBar = function(roundNum, numRounds, slideNum, numSlides) {
    // Change Progress Value
    $("#progress_bar").css( "width", ((roundNum * 1.0 * numSlides + slideNum) / (numRounds * numSlides)) * 100 + "%");
    
    // Make Visible
    $("#progress_component").removeClass("hidden");
}

var drawWaitingRoom = function(message, game) {
    // First clear all values and make visible
    $("#wait_room_header").empty();
    $("#wait_room_slide").removeClass("hidden");
    game.currentSlide[game.my_role] = "wait_room_slide";

    // Set blinking message
    $("#wait_room_header").append(message);  
    setInterval(function() {
        $("#wait_room_header").fadeOut(1000);
        $("#wait_room_header").fadeIn(1000);
    }, 2000);
};

var drawRoundNumber = function(roundNum, game) {
    // Draw progress bar
    drawProgressBar(roundNum, game.numRounds, 1, 8);
    // Set text & enable beaker
    $("#round_slide_header").empty();
    $("#round_slide_header").html("<br> <br>")
    $("#round_slide_header").append(
        "Entering Round " + "<b>" + parseInt(roundNum + 1) + "</b>" + " of " + game.numRounds +
        "<br> <br>" +
        "Press Continue to begin the round."
    );
    $("#round_slide_continue_button").prop("disabled", false);

    // Make visible
    game.currentSlide[game.my_role] = "round_slide";    
    $("#round_slide").removeClass("hidden");
};

var drawTutorialInstructions = function(game) {
    // Set instructions text
    if (game.my_role === "explorer") {
        $("#tutorial_instructions_slide_header").html(
            `
                <br><br>
                <h3>Instructions</h3>
                <br>
                <p>
                    You are an explorer working for <strong>ChemCo</strong>, a chemical corporation. On an alien planet, you have
                    discovered several beakers of alien chemicals. <strong>ChemCo wants to know more about these chemicals to see
                    if they can create any new substances with useful properties from them.</strong>
                    <br><br>
                    Your goal is to understand what new chemicals can be created by mixing the chemicals. After you are done
                    exploring, you will teach a student about the properties you have discovered. You and your partner
                    will then be <strong>tested on your understanding of the properties of mixtures of chemicals.</strong>
                    <br><br>
                    <br><br>
                    You will first enter a tutorial of the interface. <strong>Pay attention</strong>
                    during the tutorial, because you will be tested on your knowledge at the end.
                    <br><br>
                    <br><br>
                </p>
            `
        );
    } else {
        $("#tutorial_instructions_slide_header").html(
            `
                <br><br>
                <h3>Instructions</h3>
                <br>
                <p>
                    You are the 'student', and you are a chemist working for <strong>ChemCo</strong>.
                    <br><br>
                    You will enter in a page with a description of chemicals and their reactions, which was written
                    by an explorer who experimented with chemicals.
                    Pay close attention, as <strong>you will be tested on your understanding of the chemicals</strong>.
                    <br><br>
                    Press Continue to start.
                    <br><br>
                </p>
            `
        )
    }
    // Make visible
    game.currentSlide[game.my_role] = "tutorial_instructions_slide";
    $("#tutorial_instructions_slide_continue_button").prop("disabled", false);
    $("#tutorial_instructions_slide").removeClass("hidden");
};

var drawQuestionInstructions = function(game) {
    // Set instructions text
    $("#question_instructions_slide_header").html(
            `
            <br><br>
            <h3>Instructions</h3>
            <br>
            <p>
                You will now see samples of questions you may be asked in the assessment. These are just some types of
                questions you may be asked.
                <br>
                <br>
                When answering these questions, use the information you learned in the tutorial.
                <br>
                <br>
                Press Continue to start the questions.
                <br><br>
            </p>
            `
    );
    // Make visible
    game.currentSlide[game.my_role] = "question_instructions_slide";
    $("#question_instructions_slide_continue_button").prop("disabled", false);
    $("#question_instructions_slide").removeClass("hidden");
};

var drawFirstQuestion = function(game) {
    /// Clear previous
    $("#question_instructions_slide_header").empty();

    // Draw chemicals
    $("#first_question_slide_header").html(
        `
            <p class="label_prompt">
                Question 1: Click on labels to indicate if a reaction will or will not occur.
                You need to set a value (either present or absent) to the reaction.
            </p>
        `
    );
    drawTutorialBox(game.numBeakers, game.numReactions, true, game.roundProps, game, false);
    // Make visible
    game.currentSlide[game.my_role] = "first_question_slide";
    $("#first_question_slide_continue_button").prop("disabled", false);
    $("#first_question_slide").removeClass("hidden");
};

var drawSecondQuestion = function(game) {
    // Set instructions text
    /// Clear previous
    $("#first_question_slide_header").empty();
    $("#first_question_slide_grid").empty();

    // Draw chemicals
    $("#second_question_slide_header").html(
        `
            <p class="label_prompt">
                Question 2: Click on chemicals once to add them, and again to remove them.
            </p>
        `
    );
    drawTutorialBox(game.numBeakers, game.numReactions, true, game.roundProps, game, true);
    // Make visible
    game.currentSlide[game.my_role] = "second_question_slide";
    $("#second_question_slide_continue_button").prop("disabled", false);
    $("#second_question_slide").removeClass("hidden");
};


var drawTrainInstructions = function(game) {
    // Set instructions text and enable beaker
    if (game.my_role === "explorer") {
        $("#train_instructions_slide_header").html(
                    `
                    <br><br>
                    <h3>Instructions</h3>
                    <br>
                    <p>
                    You are an explorer working for <strong>ChemCo</strong>, a chemical corporation. On an alien planet, you have
                    discovered several beakers of alien chemicals.
                    <strong>ChemCo wants to know more about these chemicals to see
                    if they can create any new substances with useful properties from them.</strong>
                    <br><br>
                    Try out <strong>different combinations</strong> to learn what properties the chemicals have.
                    You can explore as long as you want, and you should <strong>explore until you
                    completely understand the reactions caused by different combinations of chemicals</strong>.
                    <br><br>
                    When you are done exploring you will give a written explanation how the chemicals work,
                    so that another person can read your description and know what mixtures of chemicals produce
                    reactions, <strong>without having to experiment themselves.</strong>
                    Your bonus will depend on how well another MTurker can use your description alone to answer
                    questions about the chemicals.
                    <br><br>
                    You will then be tested on your understanding through a series of questions.
                    <br><br>
                    </p>
                    `
                    );
    } else {
        $("#train_instructions_slide_header").html(
                    `
                    <br><br>
                    <h3>Instructions</h3>
                    <br>
                    <p>
                    You are the 'student', and you are a chemist working for <strong>ChemCo</strong>.
                    <br><br>
                    You will enter in a page with a description of chemicals and their reactions, which was written
                    by an explorer who experimented with chemicals.
                    Pay close attention, as <strong>you will be tested on your understanding of the chemicals</strong>.
                    <br><br>
                    Press Continue to start.
                    <br><br>
                    </p>
                    `
                    )
    }



    // Make visible
    game.currentSlide[game.my_role] = "train_instructions_slide";
    $("#train_instructions_slide_continue_button").prop("disabled", false);
    $("#train_instructions_slide").removeClass("hidden");
};

var drawTutorial = function(game) {
    // Clear previous
    $("#train_chemicals_slide_header").empty();
    $("#train_chemicals_slide_grid").empty();

    // Draw chemicals
    $("#tutorial_slide_header").html(
        `
            <p class="label_prompt">
                This is a tutorial of the game interface. Click on different components to learn
                about how they are used. Once you understand how the interface works, click the continue button.
            </p>
        `
    );
    drawTutorialBox(game.numBeakers, game.numReactions, false, game.roundProps, game);

    // Make visible
    game.currentSlide[game.my_role] = "tutorial_slide";
    $("#tutorial_slide_continue_button").prop("disabled", false);
    $("#tutorial_slide").removeClass("hidden");
};

var drawTrainBox = function(game) {
    // Clear previous
    $("#train_chemicals_slide_header").empty();
    $("#train_chemicals_slide_grid").empty();

    // Draw chemicals
    $("#train_chemicals_slide_header").html(
        `
            <p class="label_prompt">
                Click on beakers to add them to the mixture, and click again to remove them from the test.
                Click <strong>Mix</strong> to test the mixture, and <strong>New Test</strong> to start again after each different combination.
                Study the results carefully. <strong>Press continue only once you fully understand the chemicals. </strong>
                <br><br>
                <strong>There is at least one mixture which causes the reaction to occur.</strong>
            </p>
        `
    );
    drawBox(game.numBeakers, game.numReactions, true, game.roundProps, game);

    // Make visible
    game.currentSlide[game.my_role] = "train_chemicals_slide";
    $("#train_chemicals_slide_continue_button").prop("disabled", true);
    $("#train_chemicals_slide").removeClass("hidden");
};

var drawExplorerChatInstructions = function(game) {
    // Set instructions
    var instructions = 
    `
        <br>
        <br>
        On the next page, you will be asked to describe how the chemicals produce reactions.
        <br><br>
        <strong>Please be detailed and clear in your description!</strong> Another MTurker will receive your
        explanation and will be tested on their ability to produce the reactions from the chemicals.
        <strong>The student will not get a chance to experiment the way you did, and instead will be
        immediately tested on their understanding.</strong>
        Your bonus will be partially dependent on their performance.
        <br>
        <br>
    `;
    $("#chat_instructions_slide_header").html(instructions);

    // Make visible
    game.currentSlide[game.my_role] = "chat_instructions_slide";        
    $("#chat_instructions_slide_continue_button").prop("disabled", false);
    $("#chat_instructions_slide").removeClass("hidden");
}

var drawChatRoom = function(game) {
    var message;
    switch(game.roundNum) {
    case 0:
        message = game.teacher.first.replace(/\*/g, ".").replace(/\|/g, "<br>").replace(/ \-/g, ",");
        break;
    case 1:
        message = game.teacher.second.replace(/\*/g, ".").replace(/\|/g, "<br>").replace(/ \-/g, ",");
        break;
    case 2:
        message = game.teacher.third.replace(/\*/g, ".").replace(/\|/g, "<br>").replace(/ \-/g, ",");
        break;
    }
    var description = `
            <br>
            ` + message + `
            <br> <br>
        `;
    $("#teacher_description").html(description);
    // Default disabled
    $("#chat_room_slide_continue_button").prop("disabled", false);

    // Make button visible
    $("#chatCont").show();
    $("#chat_room_slide").removeClass("hidden");
    game.currentSlide[game.my_role] = "chat_room_slide";            
};

var drawTestInstructions = function(game) {
    var instructions = `
        <br><br>
        <h3>Quiz</h3>
        <br>
        You will now be tested on your understanding of chemicals you just read about. Press continue to start.
        <br> <br>
    `;
    $("#test_instructions_slide_header").html(instructions);
    $("#test_instructions_slide_continue_button").prop("disabled", false);
    $("#test_instructions_slide").removeClass("hidden");
    game.currentSlide[game.my_role] = "test_instructions_slide";                
};

var drawTestChemicals = function(game, question, beakers, config, questionNum) {
    // Clear previous
    $("#test_chemicals_slide_header").empty();
    $("#test_chemicals_slide_grid").empty();
    var instructions = `
            <p class="label_prompt">
            Question: ${questionNum + 1}
            </p>
        `


   $("#test_chemicals_slide_header").html(instructions);

   drawBox(game.numBeakers, game.numReactions, false, game.roundProps, game, beakers, config, question);
   
    // Make visible
    $("#test_chemicals_slide_continue_button").prop("disabled", false);
    $("#test_chemicals_slide").removeClass("hidden");
    game.currentSlide[game.my_role] = "test_chemicals_slide";
};

var drawRoundScoreReport = function(game) {
    $("#round_score_report_continue_button").prop("disabled", false);
    $("#round_score_report_slide").removeClass("hidden");
    game.currentSlide[game.my_role] = "round_score_report_slide";        
};

var drawTotalScoreReport = function(game) {
    $("#total_score_report_continue_button").prop("disabled", false);
    $("#total_score_report_slide").removeClass("hidden");
    game.currentSlide[game.my_role] = "total_score_report_slide";            
};

var drawSubjInfo = function(game) {
    $("#subj_info").removeClass("hidden");
};

var drawThanks = function(game) {
    $("#thanks").removeClass("hidden");
    game.currentSlide[game.my_role] = "thanks";    
}

// -------
// CLEAR
// -------
var clearProgressBar =  function(game) {
    $("#progress_component").addClass("hidden");
}

var clearWaitingRoom = function() {
    $("#wait_room_slide").addClass("hidden");
};

var clearRoundNumber = function() {
    $("#round_slide").addClass("hidden");
    $("#round_slide_continue_button").prop("disabled", true);
};

var clearTrainInstructions = function() {
    $("#train_instructions_slide").addClass("hidden");
    $("#train_instructions_slide_continue_button").prop("disabled", true);
};

var clearTutorialInstructions = function() {
    $("#tutorial_instructions_slide").addClass("hidden");
    $("#tutorial_instructions_slide_continue_button").prop("disabled", true);
};
var clearTutorial = function(){
    $("#tutorial_slide").addClass("hidden");
    $("#tutorial_slide_continue_button").prop("disabled", true);
}
var clearQuestionInstructions = function(){
    $("#question_instructions_slide").addClass("hidden");
    $("#question_instructions_slide_continue_button").prop("disabled", true);
}
var clearFirstQuestion = function(){
    $("#first_question_slide").addClass("hidden");
    $("#first_question_slide_continue_button").prop("disabled", true);
}
var clearSecondQuestion = function(){
    $("#second_question_slide").addClass("hidden");
    $("#second_question_slide_continue_button").prop("disabled", true);
}
var clearQuestionsInstructions = function(){
    $("#question_instructions_slide").addClass("hidden");
    $("#question_instructions_slide_continue_button").prop("disabled", true);
}
var clearTrainChemicals = function() {
    $("#train_chemicals_slide").addClass("hidden");
    $("#train_chemicals_slide_continue_button").prop("disabled", true);
};

var clearExplorerChatInstructions = function() {
    $("#chat_instructions_slide").addClass("hidden");    
    $("#chat_instructions_slide_continue_button").prop("disabled", true);
};

var clearChatRoom = function() {
    $("#chat_room_slide").addClass("hidden");
    $("#chat_room_slide_continue_button").prop("disabled", true);
};

var clearTestInstructions = function() {
    $("#test_instructions_slide").addClass("hidden");
    $("#test_instructions_slide_continue_button").prop("disabled", true);
};

var clearTestChemicals = function() {
    $("#test_chemicals_slide").addClass("hidden");
    $("#test_chemicals_slide_continue_button").prop("disabled", true);
};

var clearRoundScoreReport = function() {
    $("#round_score_report_slide").addClass("hidden");
    $("#round_score_report_continue_button").prop("disabled", true);
};

var clearTotalScoreReport = function() {
    $("#total_score_report_slide").addClass("hidden");
    $("#total_score_report_continue_button").prop("disabled", true);
};

var clearSubjInfo = function() {
    $("#subj_info").addClass("hidden");
};
