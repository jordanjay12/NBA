/*************************************************************
 * Global Variables
 * 
 * For keeping track of the ongoing intervals and "clearing" them once the game is over
 * 
 ************************************************************/

/**
 * Responsible for Adjusting all of the team and player tables displayed on the page
 * Once the game is completed, this interval will be "cleared".
 * 
 */
var boxScoreTimer;


/**
 * Responsible for adjusting the two Main Scores and the current progress of the game (time remaining / status of the game)
 * Once the game is completed, this interval will be "cleared" as well.
 * 
 */
var gameStatusTimer;


/**
 * Retrieve the progress of the current game
 * Display whether or not the game is in progress or completed
 * Will not be called if the game hasn't started yet
 * 
 */
function getGameProgress(date, awayTeamName, homeTeamName, awayTeamCity, homeTeamCity){
    //TODO: Need to determine if the game is a playoff game or not for the "currentSeason"
    // I guess what we could do is on failure of the Ajax call we could try for the Playoff game instead
    // Since we know that the date, awayTeam and homeTeam do exist
    var year = date.slice(0,4);
    var month = date.slice(5,7);
    var day = date.slice(8,10);
    
    // Determine the years that should be used for the "Current Season"
    var currentSeason;
    if(parseInt(month) >= 9){
      var nextYear = parseInt(year) + 1;
      currentSeason = year + "-" + nextYear + "-regular";
    }else{
      var prevYear = parseInt(year) - 1;
      currentSeason = prevYear + "-" + year + "-regular";
    }
    
    var updatedDate = year + "" + month + "" + day;
//   gameProgress.innerHTML = "Whatever was returned from the Ajax call";
    $.ajax({
      type: "GET",
      url: "/ajax",
      dataType: 'json',
      async: false,
      data: {
          url: currentSeason + "/scoreboard.json?fordate=" + updatedDate
      },
      success: function (data){
        // TODO: Need to check for failure - in that case we need to retieve info for a playoff game instead.
        var games = data.scoreboard.gameScore;
        var currentGame;
        for(var i = 0; i < games.length; i++){
            var tempGame = games[i];
            if(tempGame.game.awayTeam.Name == awayTeamName && tempGame.game.homeTeam.Name == homeTeamName){
                currentGame = tempGame;
            }
        }
        var isCompleted = currentGame.isCompleted;
        var isInProgress = currentGame.isInProgress;
        var currentIntermission = currentGame.currentIntermission;
        
        var gameProgress = document.getElementById("gameProgress");
        if(isCompleted != "false"){
            // The game is over
            gameProgress.innerHTML = "Final";
        }else if(currentIntermission == 1){
            // in between first and second quarter
            gameProgress.innerHTML = "Quarter: 2 - 12:00";
        }else if(currentIntermission == 2){
            // Half Time
            gameProgress.innerHTML = "Halftime";   
        }else if(currentIntermission == 3){
            // In between third and fourth quarter
            gameProgress.innerHTML = "Quarter: 4 - 12:00";
        }else if(currentIntermission == 4){
            // The game has been completed, but that returned data still has isCompleted as "false"
            gameProgress.innerHTML = "Finished";
        }else if(isInProgress){
            // The game is still in progress
            
            var currentQuarter = currentGame.currentQuarter;
            var timeRemaining = currentGame.currentQuarterSecondsRemaining;
            
            var minutesRemaining = Math.floor(parseInt(timeRemaining) / 60);
            var secondsRemaining = parseInt(timeRemaining) % 60;
            
            if(secondsRemaining.toString().length <= 1){
                secondsRemaining = "0" + secondsRemaining.toString();
            }
            
            if(String(secondsRemaining).length ==1){
                secondsRemaining = String(secondsRemaining) + "0";
            }
            // gameProgress.innerHTML = "Quarter: " + currentQuarter + " - " + minutesRemaining + ":" + secondsRemaining;
            gameProgress.innerHTML = "<span style='color: green;'>Q" + currentQuarter + "</span> <span style='color: red'>" + minutesRemaining + ":" + secondsRemaining + "</span>"; 
        }
        
        // The game isn't over yet, periodically retrieve the updated BoxScore and Game Status through Ajax Calls
        if(isCompleted == "false"){
            startInterval(updatedDate, currentSeason, awayTeamName, homeTeamName, awayTeamCity, homeTeamCity);
        }
        
      }
    });
  
};

/**
 * Update the box score of the current game - Retrieve updated information every: 3 Minutes
 * 
 * TODO: Need to figure out how to get this to start stepping, and when it should stop stepping...
 * 
 */
function startInterval(date, currentSeason, awayTeamName, homeTeamName, awayTeamCity, homeTeamCity){
    var lastUpdated;
    boxScoreTimer = setInterval(function(){
    
    // check to see if something has been updated on the page - if nothing has been updated then terminate the interval
    
    // This is an example of an Ajax call that is being made for retrieving the boxscore data
    // api.mysportsfeeds.com/api/feed/pull/nba/2017-2018-regular/game_boxscore.json?gameid=20171228-DET-ORL&teamstats=W,L,PTS,PTSA,REB,AST,BS,STL,TOV,2PA,2PM,3PA,3PM,FTA,FTM,F&sort=stats.MIN.D
    
    // Once I retrieve all of the data, I need to figure out a way to populate the tables again...
    var currentGame = date + "-" + awayTeamCity + "-" + homeTeamCity;
    $.ajax({
      type: "GET",
      url: "/ajax",
      dataType: 'json',
      async: false,
      data: {
          url: currentSeason + "/game_boxscore.json?gameid=" + currentGame + "&teamstats=W,L,PTS,PTSA,REB,AST,BS,STL,TOV,2PA,2PM,3PA,3PM,FTA,FTM,F&sort=stats.MIN.D"
      },
      success: function (data){
        // Only update the game if a change has been made to the lastUpdatedOn method
        if(lastUpdated == undefined || lastUpdated == null || lastUpdated != data.gameboxscore.lastUpdatedOn){
            
            lastUpdated = data.gameboxscore.lastUpdatedOn;
            
            var game = data.gameboxscore.game;
            
            // Will need to go through and update the scores on the page
            var quarter = data.gameboxscore.quarterSummary;
            
            var awayTeam = data.gameboxscore.awayTeam.awayPlayers.playerEntry;
            var homeTeam = data.gameboxscore.homeTeam.homePlayers.playerEntry;
            var awayTeamStats = data.gameboxscore.awayTeam.awayTeamStats;
            var homeTeamStats = data.gameboxscore.homeTeam.homeTeamStats;
            var quarters = data.gameboxscore.quarterSummary.quarter;
            
            var quarterSummary = document.getElementById("quarterSummaryTable");
    
            var headerRow = quarterSummary.rows[0].cells;
            var awayRow = quarterSummary.rows[1].cells;
            var homeRow = quarterSummary.rows[2].cells;
            // By Default the length of the headerRow is 6
            // if the length of this row is still 6, and then length of quarters > 4 - then I will need to add another column
            // the rest below should still take care of itself
            
            // This will only be called at the start of each new overtime - create a new column for the overtime
            // The default score values of 0 will be overwritten with any data that is returned
            if(headerRow.length - quarters.length < 2){
                
                // Go through all of the rows - and individually add a new column
                for(var i = 0; i < quarterSummary.rows.length; i++){
                    var text;
                    if(i==0){
                        // creater the header for the overtime
                        var OTNumber = quarters.length - 4;
                        
                        // quarterSummary.rows[i].insertCell(quarterSummary.rows[i].cells.length-1).appendChild(header);
                        quarterSummary.rows[i].insertCell(headerRow.length-1).outerHTML = "<th style='border: 0; padding-left: 3px; padding-right: 3px; width: 50px'>OT" + OTNumber + "</th>";
                    }else if(i ==1){
                        // Set the overtime score for the away team
                        text = document.createTextNode("0")
                        quarterSummary.rows[i].insertCell(awayRow.length-1).appendChild(text);
                    }else{
                        // Set the overtime score for the home team
                        text = document.createTextNode("0");
                        quarterSummary.rows[i].insertCell(homeRow.length-1).appendChild(text);
                    }
                }
            }
            
    
            for(var i = 0; i < quarters.length; i++){
                awayRow[i+1].innerHTML = quarters[i].awayScore;
                // awayRow[i+1].innerHTML = i;
                homeRow[i+1].innerHTML = quarters[i].homeScore;
                // homeRow[i+1].innerHTML = i;
            }
            
            
            // Zeroes have already been set, so I don't need to bother checking for quarters that haven't occurred yet, just the ones in progress / have been updated
            
            // Set New Team Totals: Totals is going to always be at length -1
            awayRow[awayRow.length -1].innerHTML = "<strong id='awayQuarterTotal'>" + quarter.quarterTotals.awayScore + "</strong>";
            homeRow[homeRow.length -1].innerHTML = "<strong id='homeQuarterTotal'>" + quarter.quarterTotals.homeScore + "</strong>";
            
            // Set the main Home and Away Score Totals
            // Update the Away Score
            $("#awayScore").fadeOut(1000,function(){
                $(this).html(quarter.quarterTotals.awayScore).fadeIn(2000);  
            });
                    
            // Update the Home Score
            $("#homeScore").fadeOut(1000,function(){
                $(this).html(quarter.quarterTotals.homeScore).fadeIn(2000);
            });
            
            // When doing the Team Stats, it will probably be easier to first push the stats in an array,
            // Then go through that array and copy them over in the correct cells 1:1
            // Order that team stats should be pushed into their respective arrays: Rebounds, Assists, Blocks, Steals, Turnovers, Fouls, 2PM/2PA, 3PM/3PA, FTM/FTA
            
            var awayArr = populateTeamStatArray(awayTeamStats);
            var homeArr = populateTeamStatArray(homeTeamStats);
            
            var awayTeamStatsRow = document.getElementById("awayTeamStatsRow").cells;
            var homeTeamStatsRow = document.getElementById("homeTeamStatsRow").cells;
            
            for(var j=0; j < awayTeamStatsRow.length; j++){
                awayTeamStatsRow[j].innerHTML = awayArr[j];
                homeTeamStatsRow[j].innerHTML = homeArr[j];
            }
            
            // Now I need to populate the home and away player stats - but there are two potential problems
            // 1. If players don't have any play time yet, then they aren't included in the table - need to add a new row for them
            // 2. Currently the table is sorted based on the amount of Minutes that the player has played
            
            // Keep track of where we should be inserting the new player
            var count = 1;
            
            awayTeam.forEach(function(player){
                // Go through all of the away Player Rows and Match Ids
                var awayPlayersTable = document.getElementById("awayPlayerStatsTable");
                var playerFound = false;
                for(var i=0; i < awayPlayersTable.rows.length; i++){
                    var currentRow = awayPlayersTable.rows[i];
                    if(player.player.ID == currentRow.id){
                        playerFound = true;
                        updatePlayerStatArray(currentRow, player);
                        break;
                    }
                }
                
                // This is the first time the player is getting into the game create a new row for it
                // This row should be inserted according to the order that the player is returned in the retrieved data
                // Since the retrieved data is already sorted by Play Time
                if(playerFound == false){
                    // I guess what I will have to simulate is trying to add a row somewhere in the middle and at the very end as well
                    insertPlayer(awayPlayersTable, count, player);
                }
                count++;
            });
            
            // Keep track of where we should be inserting the new player
            count = 1;
            // I also need to include a count just in case this is a new Player that needs to be added
            homeTeam.forEach(function(player){
                var homePlayersTable = document.getElementById("homePlayerStatsTable");
                var playerFound = false;
                for(var i=0; i < homePlayersTable.rows.length; i++){
                    var currentRow = homePlayersTable.rows[i];
                    if(player.player.ID == currentRow.id){
                        playerFound = true;
                        updatePlayerStatArray(currentRow, player);
                        break;
                    }
                }
                
                if(playerFound == false){
                    // Need to create a new row for this player
                    insertPlayer(homePlayersTable, count, player);
                }
                count++;
            });
                
        } // End of LastUpdatedOn Check
        
      },
      error: function(){
        // If there is an error trying to retrieve the information for a regular season game - try to retrieve it for a playoff game
        // TODO: I need to figure out how I am going to start stepping with either Regular Season or Playoff
        // I think the only thing that will need to be changed here is the value of currentSeason - then the next Ajax call should retrieve from playoff
    }
    });
    
    // getUpdatedGameStatus(date, awayTeamName, homeTeamName);
    
    }, 60000); // End of setInterval function
    
    getUpdatedGameStatus(date, currentSeason, awayTeamName, homeTeamName);
}



/**
 * Retrieve information about the game starting lineup
 * game start time, game start location.
 * 
 * Note: This is only called if the game hasn't started yet
 * 
 */
function getGameInfo(gameId, regularSeason){
    
    var fetchSeason;
    if(regularSeason){
        // Search for regular season Game starters
        var year = gameId.slice(0,4);
        var month = gameId.slice(4,6);
        var day = gameId.slice(6,8);
        
        if(parseInt(month) >= 9){
            // this year and next year
            var nextYear = parseInt(year) + 1;
            fetchSeason = year + "-" + nextYear + "-regular";
        }else{
            // previous year and this year
            var prevYear = parseInt(year) - 1;
            fetchSeason = prevYear + "-" + year + "-regular";
        }
    }else{
        // Search for playoff game starters - always going to be just the current year (Since month will always be after April/May)
        fetchSeason = year + "-playoff";
    }
    
    $.ajax
    ({
        type: "GET",
        url: "/ajax",
        dataType: 'json',
        async: false,
        data: {
            url: fetchSeason + "/game_startinglineup.json?gameid=" + gameId
        },
        success: function (result){
            var game = result.gamestartinglineup.game;
            var date = game.date;
            var time = adjustStartTime(game.time);
            var awayTeamCity = game.awayTeam.City;
            var awayTeamName = game.awayTeam.Name;
            
            var homeTeamCity = game.homeTeam.City;
            var homeTeamName = game.homeTeam.Name;
            
            var location = game.location;
            
            var lineups = result.gamestartinglineup.teamLineup;
            
            var expectedAwayStarters = lineups[0].expected;
            var actualAwayStarters = lineups[0].actual;
            
            var expectedHomeStarters = lineups[1].expected;
            var actualHomeStarters = lineups[1].actual;
            
            if(actualAwayStarters != null){
            //TODO: display actual away starters - however it was found the most of the time there is no actual data available from the API
            
            }else if(expectedAwayStarters != null){
            //TODO: display expected away starters - however it was found that most of the timethere is no actual data available from the API
            }
            
            
            if(actualHomeStarters != null){
            // display actual home starters   
            // TODO: Same as above
            }else if(expectedHomeStarters != null){
            // display expected home starters
            // TODO: Same as above
            }
            
            if(fetchSeason.includes("playoff")){
                // Displaying the starting line up for a playoff game
                var h2 = document.createElement("h2");
                h2.style.textAlign = "center";
                var text = document.createTextNode("Playoff Matchup");
                h2.appendCHild(text);
                
                document.getElementsByClassName("jumbotron")[0].appendChild(h2);
            }else{
                var h2 = document.createElement("h2");
                h2.style.textAlign = "center";
                var text = document.createTextNode("Regular Season Matchup");
                h2.appendChild(text);
                
                document.getElementsByClassName("jumbotron")[0].appendChild(h2);
            }

            var text;
            var h2;
            var h4;
            var br;
            
            var row = document.createElement("div");
            row.classList.add("row");
            
            // Create the Away Div
            var awayCol = document.createElement("div");
            awayCol.classList.add("col-sm-4");
            h4 = document.createElement("h4");
            h4.style.textAlign = "center";
            h4.style.marginBottom = "0px";
            text = document.createTextNode("Away Team");
            h4.appendChild(text);
            awayCol.appendChild(h4);
            
            h2 = document.createElement("h2");
            h2.style.textAlign = "center";
            h2.style.marginTop = "5px";
            text = document.createTextNode(awayTeamCity + " " + awayTeamName);
            h2.appendChild(text);
            awayCol.appendChild(h2);
            
            // Away Team Logo that when clicked links to the team page
            var awayImg = document.createElement("img");
            awayImg.classList.add("teamLogo");
            var anchor = document.createElement("a");
            var tempAwayCity = awayTeamCity.replace(/ /g, '');
            var tempAwayName = awayTeamName.replace(/ /g, '');
            anchor.href = "/teamStats/" + tempAwayCity + "-" + tempAwayName;
            var image = (awayTeamCity + awayTeamName).replace(/ /g, '');
            awayImg.src = "../images/" + image + ".png";
            
            anchor.appendChild(awayImg);
            awayCol.appendChild(anchor);
            
            
            // Create middle column - Date, Start time, and Location
            var midCol = document.createElement("div");
            midCol.classList.add("col-sm-4");
            midCol.style.textAlign = "center";
            
            h4 = document.createElement("h4");
            text = document.createTextNode("Date");
            h4.appendChild(text);
            midCol.appendChild(h4);
            
            h2 = document.createElement("h2");
            text = document.createTextNode(date);
            h2.style.marginTop = "0px";
            h2.appendChild(text);
            midCol.appendChild(h2);
            
            br = document.createElement("hr");
            midCol.appendChild(br);
            
            // Set Start Time
            h4 = document.createElement("h4");
            text = document.createTextNode("Start Time");
            h4.appendChild(text);
            midCol.appendChild(h4);
            
            h2 = document.createElement("h2");
            text = document.createTextNode(time);
            h2.style.marginTop = "0px";
            h2.appendChild(text);
            midCol.appendChild(h2);
            
            br = document.createElement("br");
            midCol.appendChild(br);
            
            // Set Game Location
            h4 = document.createElement("h4");
            text = document.createTextNode("Location");
            h4.appendChild(text);
            midCol.appendChild(h4);
            
            h2 = document.createElement("h2");
            text = document.createTextNode(location);
            h2.style.marginTop = "0px";
            h2.appendChild(text);
            midCol.appendChild(h2);
            
            // Create the Home Div
            var homeCol = document.createElement("div");
            homeCol.classList.add("col-sm-4");
            h4 = document.createElement("h4");
            text = document.createTextNode("Home Team");
            h4.style.textAlign = "center";
            h4.style.marginBottom = "0px";
            h4.appendChild(text);
            homeCol.appendChild(h4);
            
            h2 = document.createElement("h2");
            h2.style.marginTop = "5px";
            h2.style.textAlign = "center";
            text = document.createTextNode(homeTeamCity + " " + homeTeamName);
            h2.appendChild(text);
            homeCol.appendChild(h2);
            
            // Home Team Logo that when clicked links to the home team page
            var homeImg = document.createElement("img");
            homeImg.classList.add("teamLogo");
            anchor = document.createElement("a");
            var tempHomeCity = homeTeamCity.replace(/ /g, '');
            var tempHomeName = homeTeamName.replace(/ /g, '');
            anchor.href = "/teamStats/" + tempHomeCity + "-" + tempHomeName;
            image = (homeTeamCity + homeTeamName).replace(/ /g, '');
            homeImg.src = "../images/" + image + ".png";
            anchor.appendChild(homeImg);
            homeCol.appendChild(anchor);
            
            
            row.appendChild(awayCol);
            row.appendChild(midCol);
            row.appendChild(homeCol);
            
            var jumbotron = document.getElementById("jumbotron");
            jumbotron.appendChild(row);
            
            // TODO: Retrieve team record information - and any other information that would be useful ex. Points, Rebs, Assists, Points Allowed, everything
            
            var homeURL = homeTeamCity.replace(/ /g, '') + "-" + homeTeamName.replace(/ /g, '');
            var awayURL = awayTeamCity.replace(/ /g, '') + "-" + awayTeamName.replace(/ /g, '');
            getTeamInfo(fetchSeason, homeURL, awayURL);
        },
        error: function(){
            // what should happen if there is an error retrieving information - try and retrieve from playoff game
            // TODO: Test the error functionality is actually working once the playoffs start
            getGameInfo(gameId, false);
        }
    });
}


/**
* Return back to the list of games for this date.
* Note: it is not necessariy the current date as users may be viewing a game on a future day
*/
function setBackButton(date){
    var backButton = document.getElementById("backButton").href = "/schedule/" + date.slice(0, 8);
}

/**
 * Adjust the game start time from EST to PST
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
 * Retrieve informaiton on the two teams that are playing
 * This is only displayed before the game has started to display the overall statistics of the two teams
 * 
 */
function getTeamInfo(fetchSeason, homeURL, awayURL){

    
    var awayCol = document.getElementById("leftColumn");
    var midCol = document.getElementById("middleColumn");
    var homeCol = document.getElementById("rightColumn");
    
    // console.log("https://api.mysportsfeeds.com/v1.1/pull/nba/" + fetchSeason + "/overall_team_standings.json?teamstats=W,L,PTS/G,PTSA/G,AST/G,REB/G,BS/G,STL/G,TOV/G&team=" + homeURL + "," + awayURL);
    
    $.ajax({
        type: "GET",
        url: "/ajax",
        dataType: 'json',
        async: false,
        data: {
            url: fetchSeason + "/overall_team_standings.json?teamstats=W,L,PTS/G,PTSA/G,AST/G,REB/G,BS/G,STL/G,TOV/G&team=" + homeURL + "," + awayURL
        },
        success: function (data){
            // Ajax call always returns in alphabetical order - determine entry corresponds to which team
            var awayTeam;
            var homeTeam;
            
            var teams = data.overallteamstandings.teamstandingsentry;
            for(var i = 0; i < teams.length; i++){
                // search by team name since there are duplicate teams in the same city - ex. LAL & LAC
                if(homeURL.includes(teams[i].team.Name.replace(/ /g, ''))){
                    homeTeam = teams[i];
                }else if(awayURL.includes(teams[i].team.Name.replace(/ /g, ''))){
                    awayTeam = teams[i];   
                }
            }
            
            var homeStats = homeTeam.stats;
            var awayStats = awayTeam.stats;
            
            // Home wins and losses
            var homeWins = homeStats.Wins['#text'];
            var homeLosses = homeStats.Losses['#text'];
            
            // Away wins and losses
            var awayWins = awayStats.Wins['#text'];
            var awayLosses = awayStats.Losses['#text'];
            
            // Home and Away Points
            var homePts = homeStats.PtsPerGame['#text'];
            var awayPts = awayStats.PtsPerGame['#text'];
            
            // Home and Away Assists
            var homeAst = homeStats.AstPerGame['#text'];
            var awayAst = awayStats.AstPerGame['#text'];
            
            // Home and Away Rebounds
            var homeReb = homeStats.RebPerGame['#text'];
            var awayReb = awayStats.RebPerGame['#text'];
            
            // Home and Away Blocks
            var homeBlocks = homeStats.BlkPerGame['#text'];
            var awayBlocks = awayStats.BlkPerGame['#text'];
            
            // Home and Away Steals
            var homeSteals = homeStats.StlPerGame['#text'];
            var awaySteals = awayStats.StlPerGame['#text'];
            
            // Home and Away Points Allowed
            var homePtsAllowed = homeStats.PtsAgainstPerGame['#text'];
            var awayPtsAllowed = awayStats.PtsAgainstPerGame['#text'];
            
            // Home and Away Turnovers
            var homeTov = homeStats.TovPerGame['#text'];
            var awayTov = awayStats.TovPerGame['#text'];
            
            var h2;
            var text;
            
            // Team Records
            createElement("h2", awayWins + "-" + awayLosses, awayCol);
            createElement("h2", "Record", midCol);
            createElement("h2", homeWins + "-" + homeLosses, homeCol);
            
            // PPG For home and away team
            createElement("h2", awayPts, awayCol);
            createElement("h2", "Points Per game", midCol);
            createElement("h2", homePts, homeCol);
            
            // APG for Home and Away team
            createElement("h2", awayAst, awayCol);
            createElement("h2", "Assists Per Game", midCol);
            createElement("h2", homeAst, homeCol);
            
            // RPG for home and away team
            createElement("h2", awayReb, awayCol);
            createElement("h2", "Rebounds Per Game", midCol);
            createElement("h2", homeReb, homeCol);
            
            // SPG for home and away team
            createElement("h2", awaySteals, awayCol);
            createElement("h2", "Steals Per Game", midCol);
            createElement("h2", homeSteals, homeCol);
            
            // BPG for home and away team
            createElement("h2", awayBlocks, awayCol);
            createElement("h2", "Blocks Per Game", midCol);
            createElement("h2", homeBlocks, homeCol);
            
            createElement("h2", awayPtsAllowed, awayCol);
            createElement("h2", "Points Allowed Per Game", midCol);
            createElement("h2", homePtsAllowed, homeCol);
            
            createElement("h2", awayTov, awayCol);
            createElement("h2", "Turnovers Per Game", midCol);
            createElement("h2", homeTov, homeCol);
            
        }
    });
}

/**
 * Create an HTML element of the specified type, append text to it,
 * before appending it to the given parent.
 * 
 * Parameters:
 * element: the new HTML element to be created
 * text: the "TextContent" to be placed in the newly created HTML element
 * parent: the already existing HTML element that "element" should be appended to
 */
function createElement(element, text, parent){
    var element = document.createElement(element);
    element.style.textAlign = "center";
    var text = document.createTextNode(text);
    element.appendChild(text);
    parent.appendChild(element);
}

/**
 * Populate the Array of Team stats
 * 
 * Parameters:
 * arr: Either the away or home array that will be populated
 * teamStats: the JSON object to retrieve the stats from
 */
function populateTeamStatArray(teamStats){
    var arr = [];
    
    arr.push(teamStats.Reb['#text']);
    arr.push(teamStats.Ast['#text']);
    arr.push(teamStats.Blk['#text']);
    arr.push(teamStats.Stl['#text']);
    arr.push(teamStats.Tov['#text']);
    arr.push(teamStats.Fouls['#text']);
    arr.push(teamStats.Fg2PtMade['#text'] + "/" + teamStats.Fg2PtAtt['#text']);
    arr.push(teamStats.Fg3PtMade['#text'] + "/" + teamStats.Fg3PtAtt['#text']);
    arr.push(teamStats.FtMade['#text'] + "/" + teamStats.FtAtt['#text']);
    
    return arr;
}

/**
 * Takes in a specifc row and a player and updates the row
 * Go through each of the individual td elements and update
 * 
 * Currently the ordering in the tables is: Name, Points, Rebounds, Assists, Blocks, Steals, Turnovers, Fouls, +/-, MIN
 * Note: No need to update the Player Name - it is already matching
 * 
 * Parameters:
 * row: The HTML Table Row that should be updated
 * player: The JSON returned object containing the updated "player" data
 */
function updatePlayerStatArray(row, player){
    // Start at index 1 for "Points"
    var arr = createPlayerStatArray(player);
    var cells = row.cells;
    for(var i = 1; i < cells.length; i++){
        cells[i].innerHTML = arr[i-1];
    }
}

/**
 * Return an array of Player Parsed Stats that matches the order:
 * Points, Rebounds, Assists, Blocks, Steals, Turnovers, Fouls, +/-, MIN
 * 
 * Any additional columns that are added to the table will also need to be included here as well.
 * 
 * Parameters:
 * player: The JSON returned object containing the updated "player" data
 */
function createPlayerStatArray(player){
    var arr = [];
    
    arr.push(player.stats.Pts['#text']);
    arr.push(player.stats.Reb['#text']);
    arr.push(player.stats.Ast['#text']);
    arr.push(player.stats.Blk['#text']);
    arr.push(player.stats.Stl['#text']);
    arr.push(player.stats.Tov['#text']);
    arr.push(player.stats.Fouls['#text']);
    arr.push(player.stats.PlusMinus['#text']);
    arr.push(Math.floor(player.stats.MinSeconds['#text']/60));
    
    return arr;
}

/**
 * Insert a Player into either the Away or Home Players' Table.
 * This will occur when the player first enters the game.
 * A new row is created for the player
 * 
 * Ordering should be: Name, Points, Rebounds, Assists, Blocks, Steals, Turnovers, Fouls, +/-, MIN
 * 
 * Parameters:
 * table: The HTML table to insert the new row into
 * count: the location within the "table" to insert the new row into
 * player: The JSON object containing the data to populate the new row with
 */
function insertPlayer(table, count, player){
    var row = table.insertRow(count);
    row.id = player.player.ID;
    
    // I need 10 cells here to Complete the table
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    var cell4 = row.insertCell(3);
    var cell5 = row.insertCell(4);
    var cell6 = row.insertCell(5);
    var cell7 = row.insertCell(6);
    var cell8 = row.insertCell(7);
    var cell9 = row.insertCell(8);
    var cell10 = row.insertCell(9);
    
    // Modify the Player Name so that it can be linked to
    var firstName = player.player.FirstName;
    var lastName = player.player.LastName;
    while(firstName.includes(".") || firstName.includes("-") || firstName.includes(" ")){
        firstName = firstName.replace(".", "");
        firstName = firstName.replace("-", "");
        firstName = firstName.replace(" ", "");
    }
    while(lastName.includes(".") || lastName.includes("-") || lastName.includes(" ")){
        lastName = lastName.replace(".", "");
        lastName = lastName.replace("-", "");
        lastName = lastName.replace(" ", "");
    }
    
    cell1.innerHTML = "<a href='/playerStats/" + firstName + "-" + lastName +"'>" + firstName + " " + lastName + "</a>";
    cell2.innerHTML = player.stats.Pts['#text'];
    cell3.innerHTML = player.stats.Reb['#text'];
    cell4.innerHTML = player.stats.Ast['#text'];
    cell5.innerHTML = player.stats.Blk['#text'];
    cell6.innerHTML = player.stats.Stl['#text'];
    cell7.innerHTML = player.stats.Tov['#text'];
    cell8.innerHTML = player.stats.Fouls['#text'];
    cell9.innerHTML = player.stats.PlusMinus['#text'];
    cell10.innerHTML = Math.floor(player.stats.MinSeconds['#text']/60);
    
}

/**
 * Retrieve the time remaining in the game.
 * If the game is over tell the "intervalTimer" to stop stepping
 * 
 * Any errors that are found within the "getGameProgress" method in terms of between quarters
 * will also need to apply here as well.
 */
function getUpdatedGameStatus(date, currentSeason, awayTeamName, homeTeamName){
    var lastUpdatedGameStatus;
    // console.log("https://api.mysportsfeeds.com/v1.1/pull/nba/" + currentSeason + "/scoreboard.json?fordate=" + date);
    
    gameStatusTimer = setInterval(function(){
    
    $.ajax({
      type: "GET",
      url: "/ajax",
      dataType: 'json',
      async: false,
      data: {
          url: currentSeason + "/scoreboard.json?fordate=" + date
      },
      success: function (data){
        // lastUpdatedGameStatus = data.scoreboard.lastUpdatedOn;
        
        if(lastUpdatedGameStatus == null || lastUpdatedGameStatus == undefined || data.scoreboard.lastUpdatedOn != lastUpdatedGameStatus){
            lastUpdatedGameStatus = data.scoreboard.lastUpdatedOn;
            // TODO: Need to check for failure - in that case we need to retieve info for a playoff game instead.
            var games = data.scoreboard.gameScore;
            var currentGame;
            for(var i = 0; i < games.length; i++){
                var tempGame = games[i];
                if(tempGame.game.awayTeam.Name == awayTeamName && tempGame.game.homeTeam.Name == homeTeamName){
                    currentGame = tempGame;
                }
            }

            var isCompleted = currentGame.isCompleted;
            var isInProgress = currentGame.isInProgress;
            var currentIntermission = currentGame.currentIntermission;
            var quarterSummary = currentGame.quarterSummary;
            
            var gameProgress = document.getElementById("gameProgress");
            if(isCompleted != "false"){
                // The game is over
                gameProgress.innerHTML = "Finished";

                var awayQuarterTotal = document.getElementById("awayQuarterTotal").innerHTML;
                var homeQuarterTotal = document.getElementById("homeQuarterTotal").innerHTML;
                
                // TODO: Testing will need to be performed on this to see if it is working as intended.
                // Maybe just have it automatically set here 
                var currentAwayScore = parseInt(awayQuarterTotal) >= parseInt(currentGame.awayScore) ? parseInt(awayQuarterTotal) : currentGame.awayScore;
                var currentHomeScore = parseInt(homeQuarterTotal) >= parseInt(currentGame.homeScore) ? parseInt(homeQuarterTotal) : currentGame.homeScore;
                
                // Update the Away Score
                $("#awayScore").fadeOut(1000,function(){
                    $(this).html(currentAwayScore).fadeIn(2000);  
                });
                        
                // Update the Home Score
                $("#homeScore").fadeOut(1000,function(){
                    $(this).html(currentHomeScore).fadeIn(2000);
                });
                
                // Stop both of the ongoing interval timers
                clearInterval(boxScoreTimer);
                clearInterval(gameStatusTimer);
            }else if(quarterSummary == "null" || quarterSummary == undefined || quarterSummary == null || quarterSummary == "undefined"){
                gameProgress.innerHTML= "Starting";   
            }
            else if(currentIntermission == 1){
                // in between first and second quarter
                gameProgress.innerHTML = '<span style="color: green">Q2</span> <span style="color:red">12:00</span>';
            }else if(currentIntermission == 2){
                // Half Time
                gameProgress.innerHTML = "Halftime";   
            }else if(currentIntermission == 3){
                // In between third and fourth quarter
                gameProgress.innerHTML = '<span style="color: green">Q4</span> <span style="color:red">12:00</span>';
            }else if(currentIntermission == 4){
                // The game has been completed, but that returned data still has isCompleted as "false"
                gameProgress.innerHTML = "Finished";

                // just in case we need to catch the end of the game here as well.
                var awayQuarterTotal = document.getElementById("awayQuarterTotal").innerHTML;
                var homeQuarterTotal = document.getElementById("homeQuarterTotal").innerHTML;
                
                // TODO: Testing will need to be performed on this to see if it is working as intended.
                // Maybe just have it automatically set here 
                var currentAwayScore = parseInt(awayQuarterTotal) >= parseInt(currentGame.awayScore) ? parseInt(awayQuarterTotal) : currentGame.awayScore;
                var currentHomeScore = parseInt(homeQuarterTotal) >= parseInt(currentGame.homeScore) ? parseInt(homeQuarterTotal) : currentGame.homeScore;
                
                // Update the Away Score
                $("#awayScore").fadeOut(1000,function(){
                    $(this).html(currentAwayScore).fadeIn(2000);  
                });
                        
                // Update the Home Score
                $("#homeScore").fadeOut(1000,function(){
                    $(this).html(currentHomeScore).fadeIn(2000);
                });
            }else if(isInProgress){
                // The game is still in progress
                
                // Here I also need to set the score of the game as well
                
                var currentQuarter = currentGame.currentQuarter;
                var timeRemaining = currentGame.currentQuarterSecondsRemaining;
                
                if(currentQuarter == null || currentQuarter == undefined || currentQuarter == "null" || currentQuarter == "undefined"){
                    // then the game is just starting
                }
                
                var minutesRemaining = Math.floor(parseInt(timeRemaining) / 60);
                var secondsRemaining = parseInt(timeRemaining) % 60;
                
                if(String(secondsRemaining).length ==1){
                    secondsRemaining = "0" + String(secondsRemaining);
                }
                
                // Update the Game Progress - this should be two spans, one for the quarter, the other for the time remaining the quarter
                $("#gameProgress").fadeOut(1000, function(){
                //   $(this).html("Quarter: " + currentQuarter + " - " + minutesRemaining + ":" + secondsRemaining).fadeIn(2000);
                   $(this).html('<span style="color: green">Q' + currentQuarter + '</span> <span style="color:red">' + minutesRemaining + ":" + secondsRemaining + '</span>').fadeIn(2000);
                });
                
                // Check to see which score is greater the one returned from the current Ajax call
                // or the score displayed in the totals box
                
                var awayQuarterTotal = document.getElementById("awayQuarterTotal").innerHTML;
                var homeQuarterTotal = document.getElementById("homeQuarterTotal").innerHTML;
                
                // TODO: Testing will need to be performed on this to see if it is working as intended.
                var currentAwayScore = parseInt(awayQuarterTotal) >= currentGame.awayScore ? parseInt(awayQuarterTotal) : currentGame.awayScore;
                var currentHomeScore = parseInt(homeQuarterTotal) >= currentGame.homeScore ? parseInt(homeQuarterTotal) : currentGame.homeScore;
                
                // Update the Away Score
                $("#awayScore").fadeOut(1000,function(){
                    $(this).html(currentAwayScore).fadeIn(2000);  
                });
                        
                // Update the Home Score
                $("#homeScore").fadeOut(1000,function(){
                    $(this).html(currentHomeScore).fadeIn(2000);
                });
                
                
                // gameProgress.innerHTML = "Quarter: " + currentQuarter + " - " + minutesRemaining + ":" + secondsRemaining;
            }
        }
      }
    });
    
    }, 60000); //End of start interval
    
}

function addPlayerStatsHover(){
    
    var awayTableRows = document.getElementById("awayPlayerStatsTable").rows;
    var homeTableRows = document.getElementById("homePlayerStatsTable").rows;
    
    for(var i=1; i < awayTableRows.length; i++){
        
        var currentRow = awayTableRows[i];
        currentRow.addEventListener("mouseover", function(){
            this.style.fontWeight = "bold";
            this.classList.add("rowHover");
        });
        
        currentRow.addEventListener("mouseout", function(){
           this.style.fontWeight = "normal";
           this.classList.remove("rowHover");
        });
    }
    
    for(var i=1; i < homeTableRows.length; i++){
        var currentRow = homeTableRows[i];
        currentRow.addEventListener("mouseover", function(){
           this.style.fontWeight = "bold";
           this.classList.add("rowHover");
        });
        
        currentRow.addEventListener("mouseout", function(){
           this.style.fontWeight = "normal";
           this.classList.remove("rowHover");
        });
    }
    
}