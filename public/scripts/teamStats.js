
// for some reason the function doesn't seem to be wanting to take no "teamstats", and it won't take only team...
// I was unable to get plus minus per game for the team which would be nice to display as well

function getTeamStats(teamName){
    var data;
    var index = teamName.indexOf("-");
    var city = teamName.slice(0, index);
    var name = teamName.slice(index +1);
    
    // check for the current season - just needs to be approximate - only need the month and the year
    var date = new Date();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();
    var currentSeason;
    if(parseInt(month) >= 9){
        var nextYear = parseInt(year) + 1;
        currentSeason = year + "-" + nextYear + "-regular";
    }else{
        var prevYear = parseInt(year) - 1;
        currentSeason = prevYear + "-" + year + "-regular";
    }
    
    var currentTeam;

    $.ajax
        ({
        type: "GET", 
        url: "/ajax",
        // url: "https://api.mysportsfeeds.com/v1.1/pull/nba/2016-2017-regular/overall_team_standings.json?teamstats=W,L,PTS/G,PTSA/G,AST/G,REB/G,STL/G,BS/G,TOV/G,2PA/G,2PM/G,3PA/G,3PM/G,FGA/G,FGM/G,FTA/G,FTM/G,OREB/G,DREB/G,F/G,FD/G&team=" + teamName,
        // url: "https://api.mysportsfeeds.com/v1.1/pull/nba/2016-2017-regular/overall_team_standings.json?team=" + teamName,
        dataType: 'json',
        async: false,
        data: {
            url: currentSeason + "/overall_team_standings.json?"
        },
        success: function (result){
            var data = result;
            var teams = data.overallteamstandings.teamstandingsentry;
            for(var i = 0; i < teams.length; i++){
                if(teams[i].team.City == city && teams[i].team.Name == name){
                    currentTeam = teams[i];
                    break;
                }
            }
            
            var teamDiv = document.getElementById("teamDiv");
            
            var stats = currentTeam.stats;
            var wins = stats.Wins['#text'];
            document.getElementById("winSpan").innerHTML += wins;
            
            var losses = stats.Losses['#text'];
            document.getElementById("lossSpan").innerHTML += losses;
            
            var numWins = parseInt(wins);
            var numLosses = parseInt(losses);
            
            if(numWins > numLosses){
                document.getElementById("winSpan").style.color = "green";
            }else if(numWins < numLosses){
                document.getElementById("lossSpan").style.color = "red";
            }
            
            var gamesPlayed = stats.GamesPlayed['#text'];
            document.getElementById("GamesPlayed").innerHTML += " <strong>" + gamesPlayed + "</strong>";

            // Scoring
            var ppg = stats.PtsPerGame['#text'];
            document.getElementById("PPG").innerHTML += " <strong>" + ppg + "</strong>";
            
            var apg = stats.AstPerGame['#text'];
            document.getElementById("APG").innerHTML += " <strong>" + apg + "</strong>";            
            
            // Rebounding
            var rpg = stats.RebPerGame['#text'];
            document.getElementById("RPG").innerHTML += " <strong>" + rpg + "</strong>";
            
            var orpg = stats.OffRebPerGame['#text'];
            var drpg = stats.DefRebPerGame['#text'];
            
            // Defense
            var spg = stats.StlPerGame['#text'];
            document.getElementById("SPG").innerHTML += " <strong>" + spg + "</strong>";
            
            var bpg = stats.BlkPerGame['#text'];
            document.getElementById("BPG").innerHTML += " <strong>" + bpg + "</strong>";
            
            var tovpg = stats.TovPerGame['#text'];
            document.getElementById("ToPG").innerHTML += " <strong>" + tovpg + "</strong>";
            
            createScoringTable(stats);
            
            createReboundingTable(stats);
            
            createAstToVTable(stats);
            
            createDefenseTable(stats);
            
            createMiscTable(stats);
            
        }
    });   
}

// Responsible for generating the table containing advanced scoring stats
// If the table doesn't look good, then alternatively I could do another list here as well
function createScoringTable(stats){
    
        
    // 2 point field goals
    var fg2PtAtt = stats.Fg2PtAttPerGame['#text'];
    var fg2PtMake = stats.Fg2PtMadePerGame['#text'];
    var fg2PtPct = stats.Fg2PtPct['#text'];

    // 3 point field goals
    var fg3PtAtt = stats.Fg3PtAttPerGame['#text'];
    var fg3PtMake = stats.Fg3PtMadePerGame['#text'];
    var fg3PtPct = stats.Fg3PtPct['#text'];
    var total3Made = stats.Fg3PtMade['#text'];
    var total3Att = stats.Fg3PtAtt['#text'];

    // Overall Field goals - boths 2's and 3's
    var overallFgAtt = stats.FgAttPerGame['#text'];
    var overallFgMade = stats.FgMadePerGame['#text'];
    var overallFgPct = stats.FgPct['#text'];
    
    // Free throws
    var ftAtt = stats.FtAttPerGame['#text'];
    var ftMade = stats.FtMadePerGame['#text'];
    var ftPct = stats.FtPct['#text'];
    
    // var parentDiv = document.getElementById("advancedTeamStats");
    var parentDiv = document.getElementById("middleColumn");
    
    var textContent;
    // var h2 = document.createElement("h2");
    // var textContent = document.createTextNode("Advanced Stats");
    // h2.style.marginTop = "0px";
    // h2.appendChild(textContent);
    // parentDiv.appendChild(h2);
    
    var h3 = document.createElement("h3");
    textContent = document.createTextNode("Scoring");
    h3.style.marginTop = "0px";
    h3.appendChild(textContent);
    parentDiv.appendChild(h3);
    
    var table = document.createElement("table");
    var tr = document.createElement("tr");
    var th = document.createElement("th");
    var td;

    // Overall Attempts, Makes and Percentage    
    textContent = document.createTextNode("FG Att / G")
    th.appendChild(textContent);
    tr.appendChild(th);
    
    th = document.createElement("th");
    textContent = document.createTextNode("FG Make / G")
    th.appendChild(textContent);
    tr.appendChild(th);
    
    th = document.createElement("th");
    textContent = document.createTextNode("Overall FG %")
    th.appendChild(textContent);
    tr.appendChild(th);
    
    table.appendChild(tr);
    
    tr = document.createElement("tr");
    
    td = document.createElement("td");
    textContent = document.createTextNode(overallFgAtt);
    td.appendChild(textContent);
    tr.appendChild(td);
    
    td = document.createElement("td");
    textContent = document.createTextNode(overallFgMade);
    td.appendChild(textContent);
    tr.appendChild(td);
    
    td = document.createElement("td");
    textContent = document.createTextNode(overallFgPct);
    td.appendChild(textContent);
    tr.appendChild(td);
    
    table.appendChild(tr);
    
    parentDiv.appendChild(table); // FIN: overall FG Attempts, Makes and Percentage
    parentDiv.appendChild(document.createElement("br"));

    // Creation of the 2 Point Table

    table = document.createElement("table");
    tr = document.createElement("tr");
    
    // 2 Point Attempts, Makes and Percentage
    th = document.createElement("th");
    textContent = document.createTextNode("2Pt Att / G")
    th.appendChild(textContent);
    tr.appendChild(th);
    
    th = document.createElement("th");
    textContent = document.createTextNode("2Pt Make / G")
    th.appendChild(textContent);
    tr.appendChild(th);
    
    th = document.createElement("th");
    textContent = document.createTextNode("2Pt %")
    th.appendChild(textContent);
    tr.appendChild(th);
    
    table.append(tr);
    
    tr = document.createElement("tr");
    
    // 2 Point Attempts, Makes and Percentage
    td = document.createElement("td");
    textContent = document.createTextNode(fg2PtAtt);
    td.appendChild(textContent);
    tr.appendChild(td);
    
    td = document.createElement("td");
    textContent = document.createTextNode(fg2PtMake);
    td.appendChild(textContent);
    tr.appendChild(td);
    
    td = document.createElement("td");
    textContent = document.createTextNode(fg2PtPct);
    td.appendChild(textContent);
    tr.appendChild(td);  
    
    table.appendChild(tr);
    parentDiv.appendChild(table); // FIN: 2 Point Attempts, Makes and Percentage
    parentDiv.appendChild(document.createElement("br"));
    
    // Creation of the 3 Point Table
    table = document.createElement("table");
    tr = document.createElement("tr");
    
    // 3 Point Attempts, Makes, and Percentage
    th = document.createElement("th");
    textContent = document.createTextNode("3Pt Att / G")
    th.appendChild(textContent);
    tr.appendChild(th);
    
    th = document.createElement("th");
    textContent = document.createTextNode("3Pt Make / G")
    th.appendChild(textContent);
    tr.appendChild(th);
    
    th = document.createElement("th");
    textContent = document.createTextNode("3Pt %")
    th.appendChild(textContent);
    tr.appendChild(th);

    th = document.createElement("th");
    textContent = document.createTextNode("Total 3Pt Made")
    th.appendChild(textContent);
    tr.appendChild(th);
    
    table.appendChild(tr);
    
    tr = document.createElement("tr");
    
    // 3 Point Attempts, Makes and Percentage
    td = document.createElement("td");
    textContent = document.createTextNode(fg3PtAtt);
    td.appendChild(textContent);
    tr.appendChild(td);
    
    td = document.createElement("td");
    textContent = document.createTextNode(fg3PtMake);
    td.appendChild(textContent);
    tr.appendChild(td);
    
    td = document.createElement("td");
    textContent = document.createTextNode(fg3PtPct);
    td.appendChild(textContent);
    tr.appendChild(td);
    
    td = document.createElement("td");
    textContent = document.createTextNode(total3Made);
    td.appendChild(textContent);
    tr.appendChild(td);
    
    table.appendChild(tr);
    parentDiv.appendChild(table); //FIN: 3 Point Attempts, Makes per Game, Overall Makes and Percentage
    parentDiv.appendChild(document.createElement("br"));
    
    // Creation of the Free Throw Table
    table = document.createElement("table");
    tr = document.createElement("tr");
    
    th = document.createElement("th");
    textContent = document.createTextNode("FT Att / G")
    th.appendChild(textContent);
    tr.appendChild(th);
    
    th = document.createElement("th");
    textContent = document.createTextNode("FT Make / G")
    th.appendChild(textContent);
    tr.appendChild(th);
    
    th = document.createElement("th");
    textContent = document.createTextNode("FT %")
    th.appendChild(textContent);
    tr.appendChild(th);

    table.appendChild(tr); // Add the row of headers (th's)
    
    tr = document.createElement("tr");
    
    // Free Throw Attempts, Makes, and Percentage
    td = document.createElement("td");
    textContent = document.createTextNode(ftAtt);
    td.appendChild(textContent);
    tr.appendChild(td);
    
    td = document.createElement("td");
    textContent = document.createTextNode(ftMade);
    td.appendChild(textContent);
    tr.appendChild(td);
    
    td = document.createElement("td");
    textContent = document.createTextNode(ftPct);
    td.appendChild(textContent);
    tr.appendChild(td); 
    
    
    table.appendChild(tr); // add the row of stats (td's)
    
    parentDiv.appendChild(table); // FIN: Free Throw Attempts, Makes and Percentage
    
}

// Create table for advanced rebounding stats
//TODO: What may be easier is just to store all the data in arrays, and then loop through them instead of having to copy over the code over and over again
function createReboundingTable(stats){
    
    var totalDefReb = stats.DefReb['#text'];
    var totalOffReb = stats.OffReb['#text'];
    var orpg = stats.OffRebPerGame['#text'];
    var drpg = stats.DefRebPerGame['#text'];
    
    
    var parentDiv = document.getElementById("advancedTeamStats");
    
    var h3 = document.createElement("h3");
    var textContent = document.createTextNode("Rebounding");
    h3.style.marginTop = "0px";
    h3.appendChild(textContent);
    
    parentDiv.appendChild(h3);
    
    var table = document.createElement("table");
    var tr = document.createElement("tr");
    var th = document.createElement("th");
    var td;
    
    // Create header row for rebounding stats (th's)
    
    
    th = document.createElement("th");
    textContent = document.createTextNode("Total Def Rebounds");
    th.appendChild(textContent);
    tr.appendChild(th);
    
    th = document.createElement("th");
    textContent = document.createTextNode("Def Reb / G");
    th.appendChild(textContent);
    tr.appendChild(th);
    
    th = document.createElement("th");
    textContent = document.createTextNode("Total Off Rebounds");
    th.appendChild(textContent);
    tr.appendChild(th);
    
    th = document.createElement("th");
    textContent = document.createTextNode("Off Reb / G");
    th.appendChild(textContent);
    tr.appendChild(th);
    
    table.appendChild(tr);
    
    // Add data for Rebounding stats (tr's)
    tr = document.createElement("tr");
    
    td = document.createElement("td");
    textContent = document.createTextNode(totalDefReb);
    td.appendChild(textContent);
    tr.appendChild(td);
    
    td = document.createElement("td");
    textContent = document.createTextNode(drpg);
    td.appendChild(textContent);
    tr.appendChild(td);
    
    td = document.createElement("td");
    textContent = document.createTextNode(totalOffReb);
    td.appendChild(textContent);
    tr.appendChild(td);
    
    td = document.createElement("td");
    textContent = document.createTextNode(orpg);
    td.appendChild(textContent);
    tr.appendChild(td);
    
    table.appendChild(tr); // Finished Rebounding stats row - append to table
    
    parentDiv.appendChild(table); // append Table to div
}

// Create table for displaying assist turnover ratio
function createAstToVTable(stats){
    var parentDiv = document.getElementById("middleColumn");
    
    // Already have Assists and Turnovers, just need the ratio here
    var li;
    
    var h3 = document.createElement("h3");
    var textContent = document.createTextNode("Assist to Turnover Ratio");
    h3.appendChild(textContent);
    
    parentDiv.appendChild(h3);
    
    var apg = stats.AstPerGame['#text'];
    var tovpg = stats.TovPerGame['#text'];
    var ratio = (apg/tovpg).toFixed(1);
    
    li = document.createElement("li");
    li.classList.add("list-group-item");
    var strong = document.createElement("strong");
    textContent = document.createTextNode("Assist to Turnover Ratio " + ratio);
    strong.appendChild(textContent);
    li.appendChild(strong);
    
    parentDiv.appendChild(li);
    
    // <%=(stats.Ast['#text'] /stats.Tov['#text']).toFixed(1)%>
    
}

// create table for displaying defensive statistics - blocks and steals
//TODO: figure out if there are any more defensive statistics that could be included in this
function createDefenseTable(stats){
    
    var parentDiv = document.getElementById("advancedTeamStats");
    
    var li;
    var h3 = document.createElement("h3");
    var textContent = document.createTextNode("Defense");
    h3.appendChild(textContent);
    
    parentDiv.appendChild(h3);
    
    var pointsAllowed = stats.PtsAgainstPerGame['#text'];
    
    li = document.createElement("li");
    li.classList.add("list-group-item");
    var strong = document.createElement("strong");
    textContent = document.createTextNode("Points Allowed: " + pointsAllowed);
    strong.appendChild(textContent);
    li.appendChild(strong);
    parentDiv.appendChild(li);
    
    
}

// Create table for Misc stats ex. Plus Minus
function createMiscTable(stats){

    var foulsPerGame = stats.FoulsPerGame['#text'];
    var foulsDrawnPerGame = stats.FoulsDrawnPerGame['#text'];
    var totalTechFouls = stats.FoulTech['#text'];
    var techFoulsPerGame = stats.FoulTechPerGame['#text'];
    var overallPlusMinus = stats.PlusMinus['#text'];
    var plusMinus = stats.PlusMinusPerGame['#text'];

    var parentDiv = document.getElementById("advancedTeamStats");
    
    var strong;
    var li;
    var h3 = document.createElement("h3");
    var textContent = document.createTextNode("Miscellaneous");
    h3.appendChild(textContent);
    
    parentDiv.appendChild(h3);
    
    li = document.createElement("li");
    li.classList.add("list-group-item");
    strong = document.createElement("strong");
    textContent = document.createTextNode("Fouls per Game: " + foulsPerGame);
    strong.appendChild(textContent);
    li.appendChild(strong);
    parentDiv.appendChild(li);

    li = document.createElement("li");
    li.classList.add("list-group-item");
    strong = document.createElement("strong");
    textContent = document.createTextNode("Fouls Drawn per Game: " + foulsDrawnPerGame);
    strong.appendChild(textContent);
    li.appendChild(strong);
    parentDiv.appendChild(li);
    
    li = document.createElement("li");
    li.classList.add("list-group-item");
    strong = document.createElement("strong");
    textContent = document.createTextNode("Technical Fouls per Game: " + techFoulsPerGame);
    strong.appendChild(textContent);
    li.appendChild(strong);
    parentDiv.appendChild(li);    
    
    li = document.createElement("li");
    li.classList.add("list-group-item");
    strong = document.createElement("strong");
    textContent = document.createTextNode("Overall Plus Minus: " + overallPlusMinus);
    strong.appendChild(textContent);
    li.appendChild(strong);
    parentDiv.appendChild(li);
    
    li = document.createElement("li");
    li.classList.add("list-group-item");
    strong = document.createElement("strong");
    textContent = document.createTextNode("Plus Minus per Game: " + plusMinus);
    strong.appendChild(textContent);
    li.appendChild(strong);
    parentDiv.appendChild(li);

}
