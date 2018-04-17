var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var request = require("request");
var btoa = require("btoa");
var moment = require('moment');
var timezone = require('moment-timezone');

var favicon = require('serve-favicon');

var username = process.env.NBAUSERNAME;
var password = process.env.NBAPASSWORD;

app.use(favicon(__dirname + '/public/images/favicon.ico'));

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));


/**
 * Display the Home Page - which shows the games scheduled for the current day
 * and updated scores for those games
 *
 * Example GET Request to "mysportsfeeds" API:
 *  http://api.mysportsfeeds.com/api/feed/pull/nba/2017-2018-regular/daily_game_schedule.json?fordate=20180108
 *
 *  Date is: YearMonthDay
 */
app.get("/", function(req, res){

    var today = getDate();
    var currentSeason = getCurrentSeason();
    var yyyy = getYear();

    (function(callback) {
        'use strict';

        const httpTransport = require('https');
        const responseEncoding = 'utf8';
        const httpOptions = {
            hostname: 'api.mysportsfeeds.com',
            port: '443',
            path: '/api/feed/pull/nba/' + currentSeason + '/daily_game_schedule.json?fordate=' + today,
            method: 'GET',
            headers: {"Authorization":"Basic " + btoa(username + ":" + password)}
        };
        httpOptions.headers['User-Agent'] = 'node ' + process.version;

        const request = httpTransport.request(httpOptions, (res) => {
            let responseBufs = [];
            let responseStr = '';

            res.on('data', (chunk) => {
                if (Buffer.isBuffer(chunk)) {
                    responseBufs.push(chunk);
                }
                else {
                    responseStr = responseStr + chunk;
                }
            }).on('end', () => {
                responseStr = responseBufs.length > 0 ?
                    Buffer.concat(responseBufs).toString(responseEncoding) : responseStr;

                callback(null, res.statusCode, res.headers, responseStr);
            });

        })
        .setTimeout(0)
        .on('error', (error) => {
            callback(error);
        });
        request.write("")
        request.end();


    })((error, statusCode, headers, body) => {
        var data = JSON.parse(body);
        if(data.dailygameschedule.gameentry != undefined){

            var date = today.slice(0,4) + "-" + today.slice(4,6) + "-" + today.slice(6);
            var expandedDate = getExpandedDate(date);

            var misc = {
                today: today,
                expandedDate: expandedDate
            };

            //TODO: I am going to need one to include "misc" in 4
            res.render("home", {data: data, misc: misc});
        }else{
            // Try to render a playoff page if it exists - always checking for regular first so playoff if failed
            var pathName = '/api/feed/pull/nba/' + yyyy + '-playoff/daily_game_schedule.json?fordate=' + today;
            data = fetchData(req, res, "home.ejs", pathName, "today", today);
        }
    });
});


/**
 * Displays game information depending on the game ID that is passed as a parameter
 * The game id will be a combination of the date of the game and two teams that are playing in that game
 *
 * Example GET Request to "mysportsfeeds" API
 *  api.mysportsfeeds.com/api/feed/pull/nba/2017-2018-regular/game_boxscore.json?gameid=20180107-UTA-MIA&teamstats=W,L,PTS,PTSA,REB,AST,BS,STL,TOV,2PA,2PM,3PA,3PM,FTA,FTM,F&sort=stats.MIN.D
 */

//TODO: Remove the callback function and use the one at the bottom of the file
app.get("/game/:id", function(req, res){

        var game = req.params.id;

        var year = game.slice(0,4);
        var month = game.slice(4,6);
        var day = game.slice(6,8);

        var currentSeason;
        if(parseInt(month) >= 9){
            // combination of current year and next year
            var nextYear = parseInt(year) + 1;
            currentSeason = year + "-" + nextYear + "-regular";
        }else{
            // combination of previous year and current year
            var prevYear = parseInt(year) - 1;
            currentSeason = prevYear + "-" + year + "-regular";
        }

        // TODO: potentially try and figure out a way to see if it is a playoff game or not at the beginning so I only need to perform one request for it, not two
    (function(callback) {
        'use strict';

        const httpTransport = require('https');
        const responseEncoding = 'utf8';
        const httpOptions = {
            hostname: 'api.mysportsfeeds.com',
            port: '443',
            path: '/api/feed/pull/nba/' + currentSeason + '/game_boxscore.json?gameid=' + game + '&teamstats=W,L,PTS,PTSA,REB,AST,BS,STL,TOV,2PA,2PM,3PA,3PM,FTA,FTM,F&sort=stats.MIN.D',
            method: 'GET',
            headers: {"Authorization":"Basic " + btoa(username + ":" + password)}
        };
        httpOptions.headers['User-Agent'] = 'node ' + process.version;

        const request = httpTransport.request(httpOptions, (res) => {
            let responseBufs = [];
            let responseStr = '';

            res.on('data', (chunk) => {
                if (Buffer.isBuffer(chunk)) {
                    responseBufs.push(chunk);
                }
                else {
                    responseStr = responseStr + chunk;
                }
            }).on('end', () => {
                responseStr = responseBufs.length > 0 ?
                    Buffer.concat(responseBufs).toString(responseEncoding) : responseStr;
                callback(null, res.statusCode, res.headers, responseStr);
            });
        })
        .setTimeout(0)
        .on('error', (error) => {
            callback(error);
        });
        request.write("")
        request.end();
    })((error, statusCode, headers, body) => {
        if(body == null || body == undefined || body == ""){
            // No Regular Season game information was returned
            // Fetch information for Playoff game if possible
            var pathName = '/api/feed/pull/nba/' + year + '-playoff/game_boxscore.json?gameid=' + game;
            fetchData(req, res, "game.ejs", pathName, "game", game);
        }else{
            // Display Regular season game
            var data = JSON.parse(body);
            //TODO: Add data to say that it is a regular season game
            res.render("game", {data: data, gameString: game});
        }
    });
});

/**
 * Display the game schedule for a specified date through the date selector in the navbar.
 *
 * This method is only used for the "Date Selector" (Calendar widget), the tomorrow and yesterday buttons use
 * "/schedule/:id" below
 *
 * Example GET Request to "mysportsfeeds" API:
 *  api.mysportsfeeds.com/api/feed/pull/nba/2017-2018-regular/daily_game_schedule.json?fordate=20180101
 */
app.get("/schedule", function(req,res){

    var inputDate = req.query.date;
    var year = inputDate.slice(0,4);
    var month = inputDate.slice(5,7);
    var day = inputDate.slice(8);
    var requestDate = year+month+day;

    var currentSeason;

    if(parseInt(month) >= 9){
        // then want to use the year that was specified in the input
        var nextYear = parseInt(year) + 1;
        currentSeason = year + "-" + nextYear + "-regular";
    }else{
        // then we want to use the year before and along with the current year
        var previousYear = parseInt(year) - 1;
        currentSeason = previousYear + "-" + year + "-regular";
    }

    (function(callback) {
        'use strict';

        const httpTransport = require('https');
        const responseEncoding = 'utf8';
        const httpOptions = {
            hostname: 'api.mysportsfeeds.com',
            port: '443',
            path: '/api/feed/pull/nba/' + currentSeason +'/daily_game_schedule.json?fordate=' + requestDate,
            method: 'GET',
            headers: {"Authorization":"Basic " + btoa(username + ":" + password)}
        };
        httpOptions.headers['User-Agent'] = 'node ' + process.version;

        const request = httpTransport.request(httpOptions, (res) => {
            let responseBufs = [];
            let responseStr = '';

            res.on('data', (chunk) => {
                if (Buffer.isBuffer(chunk)) {
                    responseBufs.push(chunk);
                }
                else {
                    responseStr = responseStr + chunk;
                }
            }).on('end', () => {
                responseStr = responseBufs.length > 0 ?
                    Buffer.concat(responseBufs).toString(responseEncoding) : responseStr;

                callback(null, res.statusCode, res.headers, responseStr);
            });

        })
        .setTimeout(0)
        .on('error', (error) => {
            callback(error);
        });
        request.write("");
        request.end();


    })((error, statusCode, headers, body) => {
        var data = JSON.parse(body);
        // res.render("home", {data: data, today: requestDate});
        if(data.dailygameschedule.gameentry != undefined){
            // then it is okay to render the page - the daily game schedule is defined

            var date = requestDate.slice(0,4) + "-" + requestDate.slice(4,6) + "-" + requestDate.slice(6);
            var expandedDate = getExpandedDate(date);

            var misc = {
                today: requestDate,
                expandedDate: expandedDate
            };

            res.render("home", {data: data, misc: misc, today: requestDate});
        }else{
            // The daily game schedule is not defined - try for a playoff game
            var pathName = '/api/feed/pull/nba/' + year + '-playoff/daily_game_schedule.json?fordate=' + requestDate;
            data = fetchData(req, res, "home.ejs", pathName, "today", requestDate);
        }
    });
});


/**
 * For the Yesterday and Tomorrow buttons found in the NavBar
 * if the RequestDate is one of the two strings "tomorrow" or "yesterday", then respond appropriately
 * otherwise, it could be the actual date itself
 *
 *
 * Date id should be in the format: YearMonthDay ex. 20180101 for January 1st, 2018
 *
 * Example GET Request to "mysportsfeeds" API:
 *  api.mysportsfeeds.com/api/feed/pull/nba/2017-2018-regular/daily_game_schedule.json?fordate=20180109
 */
app.get("/schedule/:id", function(req, res){
    var requestDate = req.params.id;
    // check to see what the id is = if it is "tomorrow" or "yesterday"
    // then the tomorrow or yesterday button has been pressed from a non "home.ejs" page

    if(requestDate && requestDate == "tomorrow"){
        // get tomorrow's date through moment.js
        requestDate = getDate("tomorrow");
    }else if(requestDate && requestDate == "yesterday"){
        // get yesterday's date through moment.js
        requestDate = getDate("yesterday");
    }

    var currentSeason = getCurrentSeason(requestDate);

    var year = requestDate.slice(0,4);

    (function(callback) {
    'use strict';

    const httpTransport = require('https');
    const responseEncoding = 'utf8';
    const httpOptions = {
        hostname: 'api.mysportsfeeds.com',
        port: '443',
        path: '/api/feed/pull/nba/' + currentSeason +'/daily_game_schedule.json?fordate=' + requestDate,
        method: 'GET',
        headers: {"Authorization":"Basic " + btoa(username + ":" + password)}
    };
    httpOptions.headers['User-Agent'] = 'node ' + process.version;

    const request = httpTransport.request(httpOptions, (res) => {
        let responseBufs = [];
        let responseStr = '';

        res.on('data', (chunk) => {
            if (Buffer.isBuffer(chunk)) {
                responseBufs.push(chunk);
            }
            else {
                responseStr = responseStr + chunk;
            }
        }).on('end', () => {
            responseStr = responseBufs.length > 0 ?
                Buffer.concat(responseBufs).toString(responseEncoding) : responseStr;

            callback(null, res.statusCode, res.headers, responseStr);
        });

    })
    .setTimeout(0)
    .on('error', (error) => {
        callback(error);
    });
    request.write("")
    request.end();


    })((error, statusCode, headers, body) => {
        var data = JSON.parse(body);
        // res.render("home", {data: data, today: requestDate});
        if(data.dailygameschedule.gameentry != undefined){
            // then it is okay to render the page - the daily game schedule is defined

            var date = requestDate.slice(0,4) + "-" + requestDate.slice(4,6) + "-" + requestDate.slice(6);
            var expandedDate = getExpandedDate(date);

            var misc = {
                today: requestDate,
                expandedDate: expandedDate
            };

            res.render("home", {data: data, misc: misc, today: requestDate});

        }else{
            // The daily game schedule is not defined - try for a playoff game
            var pathName = '/api/feed/pull/nba/' + year + '-playoff/daily_game_schedule.json?fordate=' + requestDate;
            data = fetchData(req, res, "home.ejs", pathName, "today", requestDate);
    }
    });
});

/**
 * Display overall team standings, conference team standings, and division team standings.
 * Each of the standings tables is also sortable by the columns that are presented to the user
 *
 * Example GET Request to "mysportsfeeds" API
 *  api.mysportsfeeds.com/v1.1/pull/nba/2017-2018-regular/overall_team_standings.json?teamstats=W,L,PTS/G,AST/G,REB/G,STL/G,BS/G,TOV/G
 */
app.get("/standings", function(req, res){
    var currentSeason = getCurrentSeason();
    var pathName = "/v1.1/pull/nba/" + currentSeason + "/overall_team_standings.json?teamstats=W,L,PTS/G,AST/G,REB/G,STL/G,BS/G,TOV/G";
    fetchData(req, res, "standings.ejs", pathName);
});


/**
 * Display player stats for a selected player
 *
 * Example GET Request to "mysportsfeeds" API
 *  api.mysportsfeeds.com/v1.1/pull/nba/2017-2018-regular/cumulative_player_stats.json?playerstats=&player=LeBron-James&season-name=2016-2017-regular
 */
app.get("/playerStats/:playerId", function(req, res){
    var currentSeason = getCurrentSeason();
    var pathName = "/v1.1/pull/nba/" + currentSeason +"/cumulative_player_stats.json?playerstats=&player=" + req.params.playerId + "&season-name=2016-2017-regular";
    fetchData(req, res, "playerStats.ejs", pathName, "season", currentSeason);
});


/**
 * Display a list of all available players in the league
 * Need some way for people to find the players that they are looking for.
 *
 * Example GET Request to "mysportsfeeds" API
 *  api.mysportsfeeds.com/v1.1/pull/nba/2017-2018-regular/active_players.json
 */
app.get("/players", function(req, res){
    var currentSeason = getCurrentSeason();
    var pathName = "/v1.1/pull/nba/" + currentSeason +"/active_players.json";
    fetchData(req, res, "players.ejs", pathName);
});


/**
 * Display all the teams in the league - potentiall give different listings according to conference/division but probably not necessary since already in standings page
 * This page should then link to a specific page for each time displaying information about that team
 *
 * Example GET Request to "mysportsfeeds" API
 *  api.mysportsfeeds.com/v1.1/pull/nba/2017-2018-regular/conference_team_standings.json?teamstats=W,L,PTS,PTSA&sort=team.city
 */
app.get("/teams", function(req, res){
    var currentSeason = getCurrentSeason();
    var pathName = "/v1.1/pull/nba/" + currentSeason +"/conference_team_standings.json?teamstats=W,L,PTS,PTSA&sort=team.city";
    fetchData(req, res, "teams.ejs", pathName);
});

/**
 * Display information about a specific team - this includes information about the roster and stats for the team itself
 *
 * Example GET Request to "mysportsfeeds" API
 *  api.mysportsfeeds.com/v1.1/pull/nba/2017-2018-regular/roster_players.json?fordate=20171102&team=Toronto-Raptors
 */
app.get("/teamStats/:teamId", function(req, res){
    var currentSeason = getCurrentSeason();
    var pathName = "/v1.1/pull/nba/" + currentSeason + "/roster_players.json?fordate=20171102&team=" + req.params.teamId;
    fetchData(req, res, "teamStats.ejs", pathName, req.params.teamId);
});

/**
 * Display league leaders for a particular category, default category will be points
 *
 * Example GET Request to "mysportsfeeds" API
 *  api.mysportsfeeds.com/v1.1/pull/nba/2017-2018-regular/cumulative_player_stats.json?sort=stats.PTS/G.D
 */
app.get("/leagueLeaders", function(req, res){
    var currentSeason = getCurrentSeason();
    var pathName = "/v1.1/pull/nba/"+ currentSeason +"/cumulative_player_stats.json?sort=stats.PTS/G.D";
    fetchData(req, res, "leagueLeaders.ejs", pathName);
});

/**
 * Ajax call made to this server to return the JSON retrieved from the mysportsfeed API
 * All client side Ajax calls are made here so that username and password don't need to be stored client-side
 *
 * This will handle all Ajax calls, regardless of the type of information being retrieved from the MySportsFeed API
 *
 * If username and password could be stored client-side without being accessible by the end user, then this functionality
 * would not need to be used.
 *
 * ex. Ajax call:
        $.ajax({
            type: "GET",
            url: "/ajax",
            dataType: 'json',
            async: false,
            data: {
                url: currentSeason + "/scoreboard.json?fordate=" + date
            },
            success: function (data){}

        });
 * Note: the "url" in data can be retrieved from "req.query.url"
 */
app.get("/ajax", function(req, res){
    (function(callback) {
    'use strict';
    const httpTransport = require('https');
    const responseEncoding = 'utf8';
    const httpOptions = {
        hostname: 'api.mysportsfeeds.com',
        port: '443',
        path: "/v1.1/pull/nba/" + req.query.url,
        method: 'GET',
        headers: {"Authorization":"Basic " + btoa(username + ":" + password)}
    };
    httpOptions.headers['User-Agent'] = 'node ' + process.version;

    const request = httpTransport.request(httpOptions, (res) => {
        let responseBufs = [];
        let responseStr = '';

        res.on('data', (chunk) => {
            if (Buffer.isBuffer(chunk)) {
                responseBufs.push(chunk);
            }
            else {
                responseStr = responseStr + chunk;
            }
        }).on('end', () => {
            responseStr = responseBufs.length > 0 ?
                Buffer.concat(responseBufs).toString(responseEncoding) : responseStr;

            callback(null, res.statusCode, res.headers, responseStr);
        });

    })
    .setTimeout(0)
    .on('error', (error) => {
        callback(error);
    });
    request.write("");
    request.end();


    })((error, statusCode, headers, body) => {
        var test = body;
        // console.log("The value of test is: " + test);
        if(test == "undefined" || test == undefined || test == ""){
          var stringURL = req.query.url;
          var newURL = stringURL.substring(stringURL.indexOf("-") + 1).replace("regular", "playoff");

          failedAjax(req, res, newURL);

        }else{
          var data = JSON.parse(body);
          res.json(data);
        }
    });
})

/**
* Called when an Ajax call to this server fails (since that method is performing a get request and we still want to be able to send stuff back)
*/
function failedAjax(req, res, pathExtension){
  (function(callback) {
  'use strict';

  const httpTransport = require('https');
  const responseEncoding = 'utf8';
  const httpOptions = {
      hostname: 'api.mysportsfeeds.com',
      port: '443',
      path: "/v1.1/pull/nba/" + pathExtension,
      method: 'GET',
      headers: {"Authorization":"Basic " + btoa(username + ":" + password)}
  };
  httpOptions.headers['User-Agent'] = 'node ' + process.version;

  const request = httpTransport.request(httpOptions, (res) => {
      let responseBufs = [];
      let responseStr = '';

      res.on('data', (chunk) => {
          if (Buffer.isBuffer(chunk)) {
              responseBufs.push(chunk);
          }
          else {
              responseStr = responseStr + chunk;
          }
      }).on('end', () => {
          responseStr = responseBufs.length > 0 ?
              Buffer.concat(responseBufs).toString(responseEncoding) : responseStr;

          callback(null, res.statusCode, res.headers, responseStr);
      });

  })
  .setTimeout(0)
  .on('error', (error) => {
      callback(error);
  });
  request.write("");
  request.end();


  })((error, statusCode, headers, body) => {
        var data = JSON.parse(body);
        res.json(data);
  });
}


/**
 * Returns Today's date to be used for displaying the schedule/scores for that date
 *
 * Parameters:
 * option: can either be the strings "tomorrow" or "yesterday" - to get those dates
 */
function getDate(option){
    var today = timezone().tz("America/Vancouver").format('L');

    // In the event that we want the day to switch even later
    // var today = timezone().tz("Pacific/Honolulu").format('L');

    var mm = today.slice(0,2);
    var dd = today.slice(3,5);
    var yyyy = today.slice(6);

    today = yyyy+''+mm+''+dd;

    // create a moment for the tomorrow and yesterday function
    var date = moment(yyyy + "-" + mm + "-" + dd);

    if(option && option == "tomorrow"){
        // return the date for tomorrow's games
        date.add(1, "d");
        yyyy = date.get("year");
        mm = parseInt(date.get("month")) + 1;
        dd = date.date();


        // check to see if the month or the day only has a length of 1 - if so add a '0' before it
        if(mm.toString().length == 1){
            mm = "0" + mm;
        }
        if(dd.toString().length == 1){
            dd = "0" + dd;
        }

        today = yyyy + "" + mm + "" + dd;
    }else if(option && option == "yesterday"){
        // return the date for yesterday's games
        date.subtract(1, "d");
        yyyy = date.get("year");
        mm = parseInt(date.get("month")) + 1;
        dd = date.date();

        // check to see if the month or the day only has a length of 1 - if so add a '0' before it
        if(mm.toString().length == 1){
            mm = "0" + mm;
        }
        if(dd.toString().length == 1){
            dd = "0" + dd;
        }

        today = yyyy + "" + mm + "" + dd;
    }
    return today;

}

/**
 * Determine which years/seasons requests should be made for
 * Will always return a regular season, individual methods are responsible for checking for playoffs
 */
function getCurrentSeason(date){
    var mm, yyyy, dd;

    if(!date){
        // No date was set, use the current date
        var today = timezone().tz("America/Vancouver").format("L");
        mm = today.slice(0,2);
        dd = today.slice(3,5);
        yyyy = today.slice(6);
    }else{
        // Date was passed as a parameter use it to determine the current season
        yyyy = date.slice(0,4);
        mm = date.slice(4,6);
        dd = date.slice(6);
    }

    var currentSeason;

    if(parseInt(mm) >= 9){
        // September is a safe bet for start of new season - usually starts around mid to late October
        var nextYear = parseInt(yyyy) + 1;
        currentSeason = yyyy + "-" + nextYear + "-regular";
    }else{
        // then we are looking back at the previous year - either in progress or offseason
        var prevYear = parseInt(yyyy) -1;
        currentSeason = prevYear + "-" + yyyy + "-regular";
    }
    return currentSeason;
}


/**
 * Return the current year - used for playoffs
 */
function getYear(){
    var today = timezone().tz("America/Vancouver").format("L");
    var yyyy = today.slice(6);

    return yyyy;
}

/**
 * Takes in a date String: Year-Month-Day
 * ex. 2017-12-09
 *
 * Returns DAY MONTH DATE YEAR - string
 * ex. Saturday December 9th 2017
 */
function getExpandedDate(date){
    var currentDate = moment(date);

    var year = currentDate.get("year");

    var dateDay = currentDate.format('dddd');
    var dateMonth = currentDate.format('MMMM');
    var dateNumber = currentDate.format('Do');

    var finalDate = dateDay + " "+ dateMonth + " " + dateNumber + " " + year;
    return finalDate;
}

/**
 * Retrieve the specified information and redirect the user to the proper page
 *
 * Param: req
 * Param: res
 * Param: ejsFile - name of view that we want to re-direct the user to
 * Param: pathName - url of the data that we want to retrieve
 */
function fetchData(req, res, ejsFile, pathName, option, option2){
    (function(callback) {
    'use strict';
    const httpTransport = require('https');
    const responseEncoding = 'utf8';
    const httpOptions = {
        hostname: 'api.mysportsfeeds.com',
        port: '443',
        path: pathName,
        method: 'GET',
        headers: {"Authorization":"Basic " + btoa(username + ":" + password)}
    };
    httpOptions.headers['User-Agent'] = 'node ' + process.version;

    const request = httpTransport.request(httpOptions, (res) => {
        let responseBufs = [];
        let responseStr = '';

        res.on('data', (chunk) => {
            if (Buffer.isBuffer(chunk)) {
                responseBufs.push(chunk);
            }
            else {
                responseStr = responseStr + chunk;
            }
        }).on('end', () => {
            responseStr = responseBufs.length > 0 ?
                Buffer.concat(responseBufs).toString(responseEncoding) : responseStr;

            callback(null, res.statusCode, res.headers, responseStr);
        });

    })
    .setTimeout(0)
    .on('error', (error) => {
        callback(error);
    });
    request.write("");
    request.end();

    })((error, statusCode, headers, body) => {
        if(body == null || body == undefined || body == ""){
            // console.log("Nothing was returned after searching for a playoff game");
            // this is catching for all playoff games
            if(option != "undefined" && option != undefined && option != null && option == "game"){
                // Going to a specific game - but there is no information to display for it yet
                res.render(ejsFile, {gameString: option2});

            }else{
                if(option == "today"){
                    var responseDate = getExpandedDate(option2);
                    res.render(ejsFile, {option: option, today: responseDate});

                }else{
                    res.render(ejsFile, {option: option});
                }
            }
        }else{
            var data = JSON.parse(body);
            if(option == "today"){
                var playoffGame = true;
                var responseDate = getExpandedDate(option2);
                var misc = {
                  today: option2,
                  expandedDate: responseDate
                }

                res.render(ejsFile, {data: data, today: responseDate, playoff: playoffGame, misc: misc});
                return data;
            }else if(option != undefined && option != null && option == "season"){
                // Return option2, which will be the name of the season
                res.render(ejsFile, {data: data, option: option2});
            }else if(option != undefined){
                res.render(ejsFile, {data: data, option : option, playoff: true});
            }else{
                res.render(ejsFile, {data: data});
            }
        }

    });
}

app.listen(process.env.PORT, function(){
   console.log("NBA server has started");
});
