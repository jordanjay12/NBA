var liveButton = document.getElementById("liveButton");

var oldHeaderContent = document.getElementById("titleHeader").textContent;

var intervalTimer;

/**
 * Change from displaying all schedules to all scores, or back depending on what is selected
 */
liveButton.addEventListener("click", function(){
    var titleHeader = document.getElementById("titleHeader");
    var buttons;
    if(this.textContent == "Live Scoreboard"){
        // Want to display all of the scores
        this.textContent = "Today's Schedule"; // this might not necessarily be today's schedule that we are viewing

        buttons = $(".displayScore");
        for(var i = 0; i < buttons.length; i++){
            buttons[i].click();
        }

        titleHeader.textContent = "Live Scores"

        // going to be sending the alert every 3 seconds

        // AJax call would be made here for the scoreboard
    }else if(this.textContent == "Today's Schedule"){
        this.textContent = "Live Scoreboard";
        // Want to hide all the scores

        buttons = $(".removeScore");
        for(var i = 0; i < buttons.length; i++){
            buttons[i].click();
        }
        titleHeader.textContent = oldHeaderContent;

        // go back to displaying the schedule of games for this day
        // This has already been created - we probably just hide it all when you click for the live scoreboard
    }
});


var data;

/**
 * Return a game object with the specified values
 */
function Game(id, homeTeam, awayTeam, startTime,  homeScore, awayScore, isCompleted, isInProgress, currentQuarter, timeRemaining, currentIntermission){
    this.id = id;
    this.homeTeam = homeTeam;
    this.awayTeam = awayTeam;
    this.homeScore = homeScore;
    this.awayScore = awayScore;
    this.startTime = startTime;
    this.isCompleted = isCompleted;
    this.isInProgress = isInProgress;
    this.currentQuarter = currentQuarter;
    this.timeRemaining = timeRemaining;
    this.currentIntermission = currentIntermission;
}

var allGames = [];
// then to create a new game: var x = new game() with the proper parameters

/**
* Initial values of the scoreboard when the page is first loaded and a person clicks to view the score of one of the games
*
*/
function getScoreboard(date, season){

    //TODO: if this is a playoff game then I need to change the call of it
    // console.log("https://api.mysportsfeeds.com/v1.1/pull/nba/" + season + "/scoreboard.json?fordate=" + date);

    $.ajax
    ({
      type: "GET",
      url: "/ajax",
      dataType: 'json',
      async: false,
      data: {
          url: season + "/scoreboard.json?fordate=" + date
      },
      success: function (result){
        data = result;
        // console.log(data);
        var games = data.scoreboard.gameScore;
        for(var i = 0; i < games.length; i++){

            // awayAbbrev-homeAbbrev

            var currentGame = games[i];
            var id = currentGame.game.awayTeam.Abbreviation + "-" + currentGame.game.homeTeam.Abbreviation;
            var homeTeam = currentGame.game.homeTeam.City + " " + currentGame.game.homeTeam.Name;
            var awayTeam = currentGame.game.awayTeam.City + " " + currentGame.game.awayTeam.Name;
            var startTime = currentGame.game.time;
            var isInProgress = currentGame.isInProgress;
            var isCompleted = currentGame.isCompleted;
            var currentIntermission = currentGame.currentIntermission;
            var homeScore;
            var awayScore;
            if(isInProgress != "false" || isCompleted != "false" || currentIntermission){
                homeScore = currentGame.homeScore;
                awayScore = currentGame.awayScore;
            }
            var currentQuarter;
            var timeRemaining;
            if(isInProgress != "false" || currentIntermission){
                currentQuarter = currentGame.currentQuarter;
                timeRemaining = currentGame.currentQuarterSecondsRemaining;
            }
            var newGame = new Game(id, homeTeam, awayTeam, startTime, homeScore, awayScore, isCompleted, isInProgress, currentQuarter, timeRemaining, currentIntermission);
            allGames.push(newGame);
        }

        var buttons = document.getElementsByClassName("displayScore");
        for(var j = 0; j < buttons.length; j++){
            var currentButton = buttons[j];
            currentButton.addEventListener("click", function(){
                var id = this.id;
                var gameStats;

                // Retrieve information for this particular game
                for(var k = 0; k < allGames.length; k++){
                    if(this.id == allGames[k].id){
                        gameStats = allGames[k];
                    }
                }

                // this has the old data - I might need to store all of its children instead of the entire thing though
                var outerDiv = document.getElementById(this.id + "-outer");
                var scheduleContent = document.getElementById(this.id + "-inner");

                // the schedule content is the old stuff that I am keeping
                gameStats.scheduleContent = scheduleContent;
                while(outerDiv.firstChild){
                    // gameStats.scheduleContent.push(scheduleContent.firstChild);
                    outerDiv.removeChild(outerDiv.firstChild);
                }


                // now instead of using the thumbnail I only need the column divs
                var awayDiv = document.createElement("div");
                awayDiv.style.textAlign = "center";
                awayDiv.className="col-sm-5";

                // Title for the away team
                var awayTeamh2 = document.createElement("h2");
                var text = document.createTextNode(gameStats.awayTeam + " ")
                awayTeamh2.appendChild(text);
                awayTeamh2.style.textAlign = "center";
                awayDiv.appendChild(awayTeamh2);

                // Add the away image to the Away Column
                var awayImage = document.createElement("img");
                awayImage.src = "../images/" + gameStats.awayTeam.replace(/ /g, '') + ".png";
                awayImage.style.height = "100px";
                awayImage.style.width = "100px";
                awayImage.style.margin = "auto";
                awayImage.style.display = "inline-block";
                awayImage.style.marginTop = "-30px";
                awayImage.style.marginRight = "10px";

                awayDiv.appendChild(awayImage);

                // Create an empty Away Score div
                var awayScore = document.createElement("div");
                awayScore.classList.add("GamePageScores");
                awayScore.classList.add("GameScore");
                awayScore.id = gameStats.id + "-awayScore";
                awayScore.style.marginBottom = "15px";
                awayScore.style.display = "inline-block";
                awayDiv.appendChild(awayScore);

                // Creation of the middle column
                var middleDiv = document.createElement("div");
                middleDiv.className = "col-sm-2";
                middleDiv.style.textAlign = "center";

                // Creation of the "Home" div
                var homeDiv = document.createElement("div");
                homeDiv.className = "col-sm-5";
                homeDiv.style.textAlign = "center";

                // Title for the home team
                var homeTeamh2 = document.createElement("h2");
                text = document.createTextNode(gameStats.homeTeam);
                homeTeamh2.style.textAlign = "center";
                homeTeamh2.appendChild(text);
                homeDiv.appendChild(homeTeamh2);

                // Create an empty Home Score div

                var homeScore = document.createElement("div");
                homeScore.classList.add("GamePageScores")
                homeScore.classList.add("GameScore");
                homeScore.id = gameStats.id + "-homeScore";
                homeScore.style.marginBottom = "15px";
                homeScore.style.display = "inline-block";
                // homeScore.style.float = "right";

                homeDiv.appendChild(homeScore);

                var homeImage = document.createElement("img");
                homeImage.src = "../images/" + gameStats.homeTeam.replace(/ /g, '') + ".png";
                homeImage.style.height = "100px";
                homeImage.style.width = "100px";
                // homeImage.style.display = "block";
                homeImage.style.margin = "auto";
                homeImage.style.display = "inline-block";
                // homeImage.style.float = "right";
                homeImage.style.marginTop = "-30px";
                homeImage.style.marginLeft = "10px";

                homeDiv.appendChild(homeImage);

                // homeDiv.appendChild(homeImage);

                var h3;
                var startTime;
                var div;

                if(gameStats.isCompleted == "true" || gameStats.currentIntermission == 4){
                    // the game is over
                    div = document.createElement("div");
                    div.id = gameStats.id + "-div";


                    h3 = document.createElement("h3");
                    h3.id = gameStats.id + "-status";
                    text = document.createTextNode("Completed");

                    awayScore.innerHTML = gameStats.awayScore;
                    homeScore.innerHTML = gameStats.homeScore;

                    h3.appendChild(text);
                    h3.style.marginTop = "30px";

                    div.appendChild(h3);
                    middleDiv.appendChild(div);
                }else if(gameStats.currentIntermission && gameStats.currentIntermission == 1){
                    // In between the first and second quarter
                    div = document.createElement("div");
                    div.id = gameStats.id + "-div";

                    // In between the first and second quarter
                    awayScore.innerHTML = gameStats.awayScore;
                    homeScore.innerHTML = gameStats.homeScore;

                    h3 = document.createElement("h3");
                    text = document.createTextNode("Quarter: 2");
                    h3.id = gameStats.id + "-status";
                    h3.appendChild(text);
                    div.appendChild(h3);

                    h3 = document.createElement("h3");
                    text = document.createTextNode("12:00");
                    h3.id = gameStats.id + "-time";
                    h3.appendChild(text);
                    h3.style.marginTop = "30px";
                    div.appendChild(h3);
                    middleDiv.appendChild(div);
                }else if(gameStats.currentIntermission && gameStats.currentIntermission == 2){
                    // Half-Time
                    div = document.createElement("div");
                    div.id = gameStats.id + "-div";

                    awayScore.innerHTML = gameStats.awayScore;
                    homeScore.innerHTML = gameStats.homeScore;

                    h3 = document.createElement("h3");
                    text = document.createTextNode("Half-Time");
                    h3.id = gameStats.id + "-status";
                    h3.appendChild(text);
                    h3.style.marginTop = "30px";
                    div.appendChild(h3);

                    middleDiv.appendChild(h3);

                }else if(gameStats.currentIntermission && gameStats.currentIntermission == 3){
                    // In between the third and fourth quarter

                    div = document.createElement("div");
                    div.id = gameStats.id + "-div";

                    awayScore.innerHTML = gameStats.awayScore;
                    homeScore.innerHTML = gameStats.homeScore;

                    h3 = document.createElement("h3");
                    text = document.createTextNode("Quarter: 4");
                    h3.id = gameStats.id + "-status";
                    h3.appendChild(text);
                    div.appendChild(h3);

                    h3 = document.createElement("h3");
                    text = document.createTextNode("12:00");
                    h3.appendChild(text);
                    div.appendChild(h3);
                    middleDiv.appendChild(div);
                }else if(gameStats.isInProgress == "true" && gameStats.quarterSummary != "undefined"){

                    h3 = document.createElement("h3");

                    // check to see whether or not gameStats.timeRemaining exists or not, if it doesn't exist then it is likely the game is just starting
                    // because I think it would be caught by everything else by now

                    if(typeof gameStats.timeRemaining == "undefined" || gameStats.timeRemaining == undefined){
                        // Alternatively, I could have something like "Game Starting" - but this is working
                        div = document.createElement("div");
                        div.id = gameStats.id + "-div";

                        text = document.createTextNode("Quarter: 1");
                        h3.id = gameStats.id + "-status";
                        h3.appendChild(text);
                        div.appendChild(h3);

                        awayScore.innerHTML = "0";
                        homeScore.innerHTML = "0";

                        h3 = document.createElement("h3");
                        h3.style.marginTop = "0px";
                        text = document.createTextNode("12:00");
                        h3.appendChild(text);
                        div.appendChild(h3);
                        middleDiv.appendChild(div);
                    }else{
                        div = document.createElement("div");
                        div.id = gameStats.id + "-div";

                        var minutesRemaining = Math.floor(parseInt(gameStats.timeRemaining) / 60);
                        var secondsRemaining = parseInt(gameStats.timeRemaining) % 60;
                        text = document.createTextNode("Quarter: " + gameStats.currentQuarter);
                        h3.id = gameStats.id + "-status";
                        h3.appendChild(text);
                        div.appendChild(h3);

                        awayScore.innerHTML = gameStats.awayScore;
                        homeScore.innerHTML = gameStats.homeScore;

                        if(String(secondsRemaining).length == 1){
                            secondsRemaining =  "0" + String(secondsRemaining);
                        }
                        h3 = document.createElement("h3");
                        h3.style.marginTop = "0px";
                        text = document.createTextNode(minutesRemaining + ":" + secondsRemaining);

                        h3.appendChild(text);
                        div.appendChild(h3);
                        middleDiv.appendChild(div);
                    }

                }else if(gameStats.isInProgress == "true" && gameStats.quarterSummary == "null"){
                   // The game is about to start but no real is available yet

                    div = document.createElement("div");
                    div.id = gameStats.id + "-div";

                    h3 = document.createElement("h3");
                    h3.id = gameStats.id + "-status";
                    startTime = adjustStartTime(gameStats.startTime);
                    text = document.createTextNode(startTime);

                    awayScore.innerHTML = "0";
                    homeScore.innerHTML = "0";

                    h3.appendChild(text);
                    h3.style.marginTop = "30px";
                    div.appendChild(h3);
                    middleDiv.appendChild(div);
                }else{
                    // the game hasn't started yet
                    div = document.createElement("div");
                    div.id = gameStats.id + "-div";

                    h3 = document.createElement("h3");
                    h3.id = gameStats.id + "-status";
                    var startTime = adjustStartTime(gameStats.startTime);
                    text = document.createTextNode(startTime);

                    awayScore.innerHTML = "0";
                    homeScore.innerHTML = "0";

                    h3.appendChild(text);
                    h3.style.marginTop = "30px";
                    div.appendChild(h3);
                    middleDiv.appendChild(div);
                }


                var btn = document.createElement("div");
                btn.className = "btn btn-primary btn-lg removeScore";
                btn.id = gameStats.id + "-button";
                text = document.createTextNode("Hide");
                btn.style.width = "125px";
                btn.appendChild(text);

                btn.addEventListener("click", function(){

                    // remove all content related to boxscore data for that game
                    while(outerDiv.firstChild){
                        outerDiv.removeChild(outerDiv.firstChild);
                    }

                    // go back to displaying the schedule for that game

                    outerDiv.appendChild(gameStats.scheduleContent);
                })

                middleDiv.appendChild(btn);

                middleDiv.appendChild(document.createElement("br"));
                middleDiv.appendChild(document.createElement("br"));

                // Now create the button that will link to the boxscore for that game
                btn = document.createElement("a");
                btn.className = "btn btn-primary btn-lg";
                btn.role = "button";
                btn.style.width = "125px";
                btn.href = "/game/" + date + "-" +  gameStats.id;
                text = document.createTextNode("Show More");
                btn.appendChild(text);
                btn.style.marginBottom = "15px";

                middleDiv.appendChild(btn);

                // only add all of the inner divs once they are done for ordering purposes
                outerDiv.appendChild(awayDiv);
                outerDiv.appendChild(middleDiv);
                outerDiv.appendChild(homeDiv);

            })
        }
      }
    });
}

/**
 * Display the current records of the teams that are playing
 *
 */
function getTeamRecords(season){
    console.log("Trying to retrieve team records for: " + season + "/overall_team_standings.json?teamstats=W,L");
    $.ajax({
        type: "GET",
        url: "/ajax",
        dataType: 'json',
        async: false,
        data: {
            url: season + "/overall_team_standings.json?teamstats=W,L"
        },
        success: function (result){

            console.log(result);
            var teamRecords = document.getElementsByClassName("teamRecords");

            var teams = result.overallteamstandings.teamstandingsentry;

            for(var i = 0; i < teamRecords.length; i++){
                var currentTeam = teamRecords[i];
                var currentId = currentTeam.id;

                for(var j = 0; j < teams.length; j++){
                    var foundTeam = teams[j];
                    if(foundTeam.team.ID == currentId){
                        var wins = foundTeam.stats.Wins["#text"];
                        var losses = foundTeam.stats.Losses["#text"];

                        if(parseInt(wins) > parseInt(losses)){
                            // The Team has more wins than losses
                            currentTeam.innerHTML = "<span style='color: green;'>" + wins + "</span> - " + losses;
                        }else if(parseInt(wins) < parseInt(losses)){
                            // The team has more losses than wins
                            currentTeam.innerHTML = wins + " - " + "<span style='color: red;'>" + losses + "</span>";
                        }else{
                            currentTeam.innerHTML = wins + " - " + losses;
                        }
                        break;
                    }
                }

            }

        }
    });
}

/**
 * Set the interval timer - for the games that are currently displaying live scores
 * I need to update the scores of the game - I need some way of determining whether or not a game is displaying live content
 *
 * I could trying using the displayScore class, but I don't think that is going to work
 *
 */
function startInterval(date, season){
    intervalTimer = setInterval(function(){


        // Clear the allGames list - this will be re-populated once the below AJax call is successful
        allGames = [];

        $.ajax
        ({
        type: "GET",
            url: "/ajax",
            dataType: 'json',
            async: false,
            data: {
                url: season + "/scoreboard.json?fordate=" + date
            },
            success: function (result){
                // so this is successfully returning stuff now - now I need to parse it
                populateAllGames(result);

                // only get the games that are currently displaying their scores
                // I should probably include something about last updated...
                var buttons = document.getElementsByClassName("removeScore");

                for(var i = 0; i < buttons.length; i++){
                    var currentButton = buttons[i];

                    var gameId = currentButton.id.slice(0, currentButton.id.lastIndexOf("-"));
                    var gameStats;
                    // find the corresponding game's data
                    // what happens if the game hasn't started yet, I need to be able to find this - that is probably why it is still using the most recent game that has started

                    for(var j = 0; j < allGames.length; j++){
                        if(allGames[j].id == gameId){
                            gameStats = allGames[j];
                            break;
                        }
                    }

                    // Check to see if the game is over
                    var tempAwayScore = document.getElementById(gameId + "-awayScore");
                    var tempHomeScore = document.getElementById(gameId + "-homeScore");

                    // check to see if the game status div has "Completed" or not
                    var gameStatus = document.getElementById(gameId + "-status");

                    // just write a bunch of different functions, and hopefully one of them will catch
                    if(gameStats.isCompleted == "true" && gameStats.currentIntermission == "4"){
                        // NOTE: This case didn't actually catch at the end of the game
                        var gameStatus = document.getElementById(gameId + "-div");
                        gameStatus.innerHTML = updateTimeRemaining(gameStats);

                        tempAwayScore.innerHTML = gameStats.awayScore;
                        tempHomeScore.innerHTML = gameStats.homeScore;
                    }else if(gameStats.isCompleted == "true" && !gameStatus.innerHTML.toLowerCase().includes("completed")){
                        // the game is completed, but still needs to be updated - for some reason this still isn't catching
                        // TODO: More testing will need to be performed to catch this, since it is currently not catching
                        var gameStatus = document.getElementById(gameId + "-div");
                        gameStatus.innerHTML = updateTimeRemaining(gameStats);

                        tempAwayScore.innerHTML = gameStats.awayScore;
                        tempHomeScore.innerHTML = gameStats.homeScore;
                    }else if(gameStats.isCompleted == "true" || tempAwayScore.innerHTML != gameStats.awayScore || tempHomeScore.innerHTML != gameStats.homeScore){
                        // NOTE: THIS IS THE CASE THAT ACTUALLY CAUGHT THE END OF THE GAME
                        var gameStatus = document.getElementById(gameId + "-div");
                        gameStatus.innerHTML = updateTimeRemaining(gameStats);

                        tempAwayScore.innerHTML = gameStats.awayScore;
                        tempHomeScore.innerHTML = gameStats.homeScore;

                    }else if(gameStats.isInProgress == "true" || typeof gameStats.timeRemaining != "undefined"){
                        // then the game is in progress -- only update the game if the game is in progress
                        var awayScoreDiv = document.getElementById(gameId + "-awayScore");
                        var homeScoreDiv = document.getElementById(gameId + "-homeScore");
                        var gameStatus = document.getElementById(gameId + "-div");

                        var oldAwayScore = awayScoreDiv.innerHTML;
                        var oldHomeScore = homeScoreDiv.innerHTML;

                        if(oldAwayScore != gameStats.awayScore || oldHomeScore != gameStats.homeScore){
                            gameStatus.innerHTML = updateTimeRemaining(gameStats);
                            awayScoreDiv.innerHTML = gameStats.awayScore;
                            homeScoreDiv.innerHTML = gameStats.homeScore;

                            // NOTE: The fade in and fade out was causing some unexpected behavior when the wrong scores would be entered into the game

                            // $("#" + gameId + "-awayScore").fadeOut(1000,function(){
                            //     $(this).html(gameStats.awayScore).fadeIn(2000);
                            // });

                            // $("#" + gameId + "-homeScore").fadeOut(1000,function(){
                            //     $(this).html(gameStats.homeScore).fadeIn(2000);
                            // });
                        }else{
                            // console.log("There is nothing to change for: " + gameId);
                        }

                        //TODO: Check to see if the game is complete, if the game is complete then I will need to update everything

                    }else{
                        // console.log("The game is not in progress - nothing to change");
                    }



                }
            }

        });



    }, 60000);
}

/**
 * Change the status of each of the ongoing games
 *
 * Returns an innerHTML string that will be placed in the element
 */
function updateTimeRemaining(gameStats){
    var gameId = '<h3 id="' + gameStats.id + '-status" class="gameStatusx">';
    var gameTime = '<h3 id="' + gameStats.id + '-time" class="gameTime">';
    var string = "";
    if(gameStats.isCompleted == "true" || gameStats.currentIntermission == 4){
        // the game is over
        string = gameId + "Completed</h3>";
        return string;

    }else if(gameStats.currentIntermission && gameStats.currentIntermission == 1){
        // In between the first and second quarter

        string = gameId + "Quarter: 2</h3>";
        string += gameTime + "12:00</h3>";
        return string;

    }else if(gameStats.currentIntermission && gameStats.currentIntermission == 2){
        // Half-Time

        string = gameId + "Half-Time</h3>";
        return string;


    }else if(gameStats.currentIntermission && gameStats.currentIntermission == 3){
        // In between the third and fourth quarter

        string = gameId + "Quarter: 4</h3>";
        string += gameTime + "12:00</h3>";
        return string;

    }else if(gameStats.isInProgress == "true" && gameStats.quarterSummary != "undefined"){


        // check to see whether or not gameStats.timeRemaining exists or not, if it doesn't exist then it is likely the game is just starting
        // because I think it would be caught by everything else by now

        if(typeof gameStats.timeRemaining == "undefined" || gameStats.timeRemaining == undefined){
            // Alternatively, I could have something like "Game Starting" - but this is working

            string = gameId + "Quarter: 1</h3>";
            string += gameTime + "12:00</h3>";
            return string;

        }else{

            var minutesRemaining = Math.floor(parseInt(gameStats.timeRemaining) / 60);
            var secondsRemaining = parseInt(gameStats.timeRemaining) % 60;

            if(String(secondsRemaining).length == 1){
                secondsRemaining =  "0" + String(secondsRemaining);
            }

            string = gameId + "Quarter: " + gameStats.currentQuarter + "</h3>";
            string += gameTime + minutesRemaining + ":" + secondsRemaining + "</h3>";
            return string;

        }

    }else if(gameStats.isInProgress == "true" && gameStats.quarterSummary == "null"){
       // The game is about to start but no real information is available yet

        string = gameId + adjustStartTime(gameStats.startTime) + "</h3>";
        return string;

    }else{
        // the game hasn't started yet


        string = gameId + adjustStartTime(gameStats.startTime) + "</h3>";
        return string;

    }
}


/**
 * Take the data that was returned from the Ajax call and populate the "allGames" list
 * the "allGames" list is a global variable
 *
 * Parameter: data - the Json object that was returned from the Ajax call
 */
function populateAllGames(data){
    var games = data.scoreboard.gameScore;
    for(var i = 0; i < games.length; i++){

        // awayAbbrev-homeAbbrev

        var currentGame = games[i];
        var id = currentGame.game.awayTeam.Abbreviation + "-" + currentGame.game.homeTeam.Abbreviation;
        var homeTeam = currentGame.game.homeTeam.City + " " + currentGame.game.homeTeam.Name;
        var awayTeam = currentGame.game.awayTeam.City + " " + currentGame.game.awayTeam.Name;
        var startTime = currentGame.game.time;
        var isInProgress = currentGame.isInProgress;
        var isCompleted = currentGame.isCompleted;
        var currentIntermission = currentGame.currentIntermission;
        var homeScore;
        var awayScore;
        // if(isInProgress != "false" || isCompleted != "false" || currentIntermission){
            homeScore = currentGame.homeScore;
            awayScore = currentGame.awayScore;
        // }
        var currentQuarter;
        var timeRemaining;
        // if(isInProgress != "false" || currentIntermission){
            currentQuarter = currentGame.currentQuarter;
            timeRemaining = currentGame.currentQuarterSecondsRemaining;
        // }

        // for testing purposes only, remove after
        // var newGame = new Game(id, homeTeam, awayTeam, startTime, 111, 111, isCompleted, isInProgress, currentQuarter, timeRemaining, currentIntermission);
        var newGame = new Game(id, homeTeam, awayTeam, startTime, homeScore, awayScore, isCompleted, isInProgress, currentQuarter, timeRemaining, currentIntermission);
        allGames.push(newGame);
    }
}

/**
 * Set the "Tomorrow" button in the header to : "Day Month Year"
 * Also adjust the href that the button redirects to - /schedule/<tomorrowDate>
 *
 * Parameter:
 * date: the current date of the day being displayed - this can be any date,
 *       depending on which page the viewer is viewing
 *
 */
function setHeaderNextDate(date){
    var currentDate = moment(date);
    currentDate.add(1, "day");

    var year = currentDate.get("year");
    var month = parseInt(currentDate.get("month")) + 1;
    var day = currentDate.get("date");

    // check to see if the month or the date only has a length of 1
    if(month.toString().length == 1){
        month = "0" + month;
    }
    if(day.toString().length == 1){
        day = "0" + day;
    }

    var tomorrowDate = year + "" + month + "" + day;

    var tomorrowButton = document.getElementById("nextDayButton");
    // tomorrowButton.innerHTML = tomorrowDate;
    // check if this date is tomorrow's date if it's not then change the title

    var dateDay = currentDate.format('dddd');
    var dateMonth = currentDate.format('MMMM');
    var dateNumber = currentDate.format('Do');


    tomorrowButton.innerHTML = dateDay + " " + dateMonth + " " + dateNumber;

    tomorrowButton.href = "/schedule/" + tomorrowDate;

}


/**
 * Set the "Yesterday" button in the navbar to display: "Day Month Year"
 *
 * Also adjust the href the button directs to - /schedule/<yesterdayDate>
 *
 * Parameter:
 * date: the current date of the day being displayed - this can be any date,
 *       depending on which page the viewer is viewing
 */
function setHeaderPrevDate(date){
    var currentDate = moment(date);
    currentDate.subtract(1, "day");
    var year = currentDate.get("year");
    var month = parseInt(currentDate.get("month")) +1;
    var day = currentDate.get("date");

    // Check to see if the month and day have a length of 1
    if(month.toString().length ==1){
        month = "0" + month;
    }

    if(day.toString().length == 1){
        day = "0" + day;
    }


    var yesterdayDate = year + "" + month + "" + day;
    var yesterdayButton = document.getElementById("prevDayButton");

    // we can get the different formats from moment js - format
    var dateDay = currentDate.format('dddd');
    var dateMonth = currentDate.format('MMMM');
    var dateNumber = currentDate.format('Do');

    yesterdayButton.innerHTML = dateDay + " " + dateMonth + " " + dateNumber;
    yesterdayButton.href = "/schedule/" + yesterdayDate;

}

/**
 * Times returned in the Ajax call are Eastern Standard Time - convert to Pacific Standard Time
 *
 * TODO: Eventually convert the time according to the user's timezone - currently this is just displaying Western Standard Time
 *
 */
function adjustStartTime(startTime){
   var hour;
   if(startTime.endsWith("PM") && !startTime.startsWith("12")){
       // then I want to replace everything before the :
       hour = parseInt(startTime.substring(0, startTime.indexOf(":")));
       var beforeMod = hour + 12 -3;
       hour = (hour + 12 - 3) % 12;
       if(hour == 0){
           hour = 12;
       }
       if(beforeMod < 12){
          startTime = hour.toString() + startTime.substring(startTime.indexOf(":"), startTime.length - 2) + "AM";
       }else{
           startTime = hour.toString() + startTime.substring(startTime.indexOf(":"));
       }
   }
   return startTime;
}

/**
 * Set the two navigation buttons found within the Jumbotron for viewing the
 * day before and day after, for the day that is currently displayed on the page
 *
 * Parameter:
 * date: the current date of the day being displayed - this can be any date,
 *       depending on which page the viewer is viewing
 */
function setJumbotronButtons(date){
    setJumbotronPrevButton(date);
    setJumbotronNextButton(date);
}
/*
* Set the href for the anchor tag found within the left button of the jumbotron
* Styling is also set here for hover effects.
*/
function setJumbotronPrevButton(date){
    var currentDate = moment(date);
    currentDate.subtract(1, "day");
    var year = currentDate.get("year");
    var month = parseInt(currentDate.get("month")) +1;
    var day = currentDate.get("date");

    if(month.toString().length ==1){
        month = "0" + month;
    }

    if(day.toString().length ==1){
        day = "0" + day;
    }

    var yesterdayDate = year + "" + month + "" + day;

    var yesterdayButton = document.getElementById("jumbotronLeftButton");
    yesterdayButton.href = "/schedule/" + yesterdayDate;

    // Add hover shadow - left

    var largeLeftButton = document.getElementById("largeLeftButton");

    largeLeftButton.addEventListener("mouseover", function(){
        this.classList.add("prevButtonHover");
    });

    largeLeftButton.addEventListener("mouseout", function(){
       this.classList.remove("prevButtonHover");
    });
}

/**
* Set the href of the anchor tag found within the right button of the jumbotron
* Styling is also set here for hover effects
*
*/
function setJumbotronNextButton(date){
    var currentDate = moment(date);
    currentDate.add(1, "day");
    var year = currentDate.get("year");
    var month = parseInt(currentDate.get("month")) +1;
    var day = currentDate.get("date");

    if(month.toString().length ==1){
        month = "0" + month;
    }

    if(day.toString().length ==1){
        day = "0" + day;
    }

    var tomorrowDate = year + "" + month + "" + day;
    var tomorrowButton = document.getElementById("jumbotronRightButton");

    tomorrowButton.href = "/schedule/" + tomorrowDate;

    // Add hover shadow - right

    var largeRightButton = document.getElementById("largeRightButton");

    largeRightButton.addEventListener("mouseover", function(){
       this.classList.add("nextButtonHover");
    });

    largeRightButton.addEventListener("mouseout", function(){
       this.classList.remove("nextButtonHover");
    });
}
