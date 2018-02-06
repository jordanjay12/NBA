// converts the value of the select tags with numbers corresponding to which column they belong to
var legend = {
    wins: 2,
    ppg: 4,
    apg: 5,
    rpg: 6,
    spg: 7,
    bpg: 8,
    tpg: 9
}

// takes an index for which row of the table we should be sorting by
function sort(stat, tableName){
    // I should be able to go through the rows, grab an element from each of them and then compare it with another
    var table = document.getElementById(tableName);
    var switching = true;
    var rows, x, y;
    var index = legend[stat];
    var shouldSwitch;
    while(switching){
        switching = false;
        rows = table.getElementsByTagName("tr");
        // loop through all the table rows except for the first one which is just the headers
        for(var i=1; i < rows.length-1; i++){
            shouldSwitch = false;
            x = rows[i].getElementsByTagName("td")[index];
            y = rows[i + 1].getElementsByTagName("td")[index];
          // check if the two rows should switch place:
          // need to first convert these to numbers because for strings "99" is greater than "100" because it compares the 9 and the 1 I guess
          if (parseFloat(x.innerHTML) < parseFloat(y.innerHTML)) {
            //if so, mark as a switch and break the loop:
            shouldSwitch= true;
            break;
          }
        }
        if (shouldSwitch) {
          /*If a switch has been marked, make the switch
          and mark that a switch has been done:*/
          rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
          switching = true;
        }                    
    }
    
    // Re-Rank all of the rows after switching which column the table is ordered by
    rows = table.getElementsByTagName("tr");
    for(var i = 1; i < rows.length; i++){
        rows[i].getElementsByTagName("td")[0].innerHTML = i;
    }
    
    // setting the row header back to its default style
    var allHeaders = table.getElementsByTagName("th");
    for(var i = 0; i < allHeaders.length; i++){
        allHeaders[i].style.color = "black";
        allHeaders[i].style.backgroundColor = "white";
    }
    
    // setting the selected header to a different color to distinguish it
    var headElement = rows[0].getElementsByTagName("th")[index];
    headElement.style.color = "red";
    headElement.style.backgroundColor = "yellow";
    // document.getElementById("orderedBy").textContent = "Ordered By: " + headElement.textContent;
}

/*
* Sort the table depending on what has been selected from the drop-down menu - NO LONGER USED - more than 1 table now
*/

// Select on one of the elements of the select box changes the ordering of the table
// document.getElementById("selectBox").addEventListener("change", function(){
//     sort(this.value);
// })

// Adding click events to each of the column headers - allows us to sort them on click
function addHeaderClick(){
  var allHeaders = document.getElementsByClassName("header");
    for(var i = 0; i < allHeaders.length; i++){
      allHeaders[i].addEventListener("click", function(){
      // alert("the value of this.name is: " + this.classList[this.classList.length -1]);
      var parentNode = this.parentNode.parentNode.id;
      if(parentNode == "" || parentNode == null){
        parentNode = this.parentNode.parentNode.parentNode.id;
      }
      sort(this.classList[this.classList.length -1], parentNode);
    })
  }
}

addHeaderClick();

function addRowHover(){
  // var rows = document.getElementsByTagName("tr");
  var rows = document.getElementsByClassName("teamRow");
  for(var i = 0; i < rows.length; i++){
    
    // add mouseover event - add yellow highlight
    rows[i].addEventListener("mouseover", function(){
      // if(this.childNodes[0].tagName != "TH" && this.childNodes[0].tagName != undefined){
        this.style.fontWeight = "bold";
        this.classList.add("rowHover");
      // }
    })
    
    // add mouse out event - remove yellow highlight - back to default
    rows[i].addEventListener("mouseout", function(){
      // if(this.childNodes[0].tagName != "TH" && this.childNodes[0].tagName != undefined){
        this.style.fontWeight = "normal";
        this.classList.remove("rowHover");
      // }
    })
  }
}

addRowHover();

            
var overallButton = document.getElementById("showOverall");
overallButton.addEventListener("click", function(){
  var overallDiv = document.getElementById("overallStandings");
  var conferenceDiv = document.getElementById("conferenceStandings");
  var divisionDiv = document.getElementById("divisionStandings");
  
  conferenceDiv.style.display = "none";
  divisionDiv.style.display = "none";
  overallDiv.style.display = "block";
    
});

var conferenceButton = document.getElementById("showConference");

var date = new Date();
var month = date.getMonth() + 1;
var year = date.getFullYear();

var currentSeason;

if(parseInt(month) >= 9){
  // current season is <currentYear>-<nextYear>
  var nextYear = parseInt(year) + 1;
  currentSeason = year + "-" + nextYear + "-regular";
}else{
  // current season is <prevYear>-<currentYear>
  var prevYear = parseInt(year) - 1;
  currentSeason = prevYear + "-" + year + "-regular";
}



conferenceButton.addEventListener("click", function(){
    var overallDiv = document.getElementById("overallStandings");
    var conferenceDiv = document.getElementById("conferenceStandings");
    var divisionDiv = document.getElementById("divisionStandings");
    
    divisionDiv.style.display = "none";
    overallDiv.style.display = "none";
    conferenceDiv.style.display = "block";
    
    if(!document.getElementById("conferenceStandings").children.length > 0){
    var data;
  
    $.ajax({
      type: "GET",
      url: "/ajax",
      dataType: 'json',
      async: false,
      data: {
        url: currentSeason + "/conference_team_standings.json?teamstats=W,L,PTS,PTSA,PTS/G,AST/G,REB/G,STL/G,BS/G,TOV/G"
      },
      success: function (result){
        data = result;
        // alert(data.conferenceteamstandings.conference[0]['@name']);
        // document.getElementById("overallStandingsTable").style.display = "none";
        // document.getElementById("conferenceStandingsTable").style.display = "block";
        
        //TODO: need to do a check to see if we have already displayed the table before - simply check if the table has any child elements
        //TODO: otherwise we will just be appending the same thing on to it...
          
          //TODO: add a for loop that goes through the number of conferences, and then for each it does this
          for(var index = 0; index < data.conferenceteamstandings.conference.length; index++){
          var h3 = document.createElement("h3");
          var titleText = document.createTextNode(data.conferenceteamstandings.conference[index]['@name'] + " Conference"); // will be changed once we start including the other conference as well
          h3.appendChild(titleText);
          document.getElementById("conferenceStandings").appendChild(h3);
          
          
          var table = document.createElement("table");
          table.id = data.conferenceteamstandings.conference[index]["@name"] + "ConferenceStandingsTable";
          table.classList.add("standingsTable");
          
          createHeadRow(table);
         
          var conferenceTeams = data.conferenceteamstandings.conference[index].teamentry;
          for(var i = 0; i < data.conferenceteamstandings.conference[index].teamentry.length; i++){
            var currentTeam = conferenceTeams[i];
            addContentRows(currentTeam, table);
          }
          document.getElementById("conferenceStandings").appendChild(table);
          
          }
          
          // spacing at the very bottom of the page
          var br = document.createElement("br");
          document.getElementById("conferenceStandings").appendChild(br);
          
          addHeaderClick();
          addRowHover();
          
        }
        
        // do we need to have it all done in here
  });
  } // end if - checking to see if the table has already been completed or not
});


/*
* Displaying Division Standings
*
*/
var divisionButton = document.getElementById("showDivision");
divisionButton.addEventListener("click", function(){
  var data;
  // make the other tables invisible
  document.getElementById("overallStandings").style.display = "none";
  document.getElementById("conferenceStandings").style.display = "none";
  // display the Division Standings Table
  var div = document.getElementById("divisionStandings");
  div.style.display = "block";  
  if(!document.getElementById("divisionStandings").children.length > 0){

  $.ajax({
        type: "GET",
        url: "/ajax",
        dataType: 'json',
        async: false,
        data: {
          url: currentSeason + "/division_team_standings.json?teamstats=W,L,PTS,PTSA,PTS/G,AST/G,REB/G,STL/G,BS/G,TOV/G"
        },
        success: function (result){
          data = result;
          var divisions = data.divisionteamstandings.division;
          
          for(var index = 0; index < data.divisionteamstandings.division.length; index++){
            var h3 = document.createElement("h3");
            var text = document.createTextNode(divisions[index]["@name"]);
            // var text = document.createTextNode(divisions[0].teamentry[0].team.City);
            h3.appendChild(text);
            div.appendChild(h3);
            
            var table = document.createElement("table");
            table.id = divisions[index]["@name"] + "DivisionStandingsTable";
            table.classList.add("standingsTable");
            createHeadRow(table);
            
            var divisionTeams = data.divisionteamstandings.division[index].teamentry;
            for(var i = 0; i < data.divisionteamstandings.division[index].teamentry.length; i++){
              var currentTeam = divisionTeams[i];
              addContentRows(currentTeam, table);
            }
            div.appendChild(table);
          }
          
          // spacing at the very bottom of the page
          var br = document.createElement("br");
          document.getElementById("divisionStandings").appendChild(br);
          
          addHeaderClick();
          addRowHover();

        } // End of success function
  }) // end of Ajax call
  }
});


function createHeadRow(table){
 var header = document.createElement("tr");
  var th = document.createElement("th");
  var headerText = document.createTextNode("Ranking");
  th.appendChild(headerText);
  header.appendChild(th);
  
  // Need to follow the following pattern for making the header row of the table
  // consider placing the entire thing in another function once done
  
  th = document.createElement("th");
  headerText= document.createTextNode("Team Name");
  th.style.width = "175px";
  th.appendChild(headerText)
  header.appendChild(th);
  
  th = document.createElement("th");
  th.classList.add('header');
  th.classList.add("wins");
  headerText = document.createTextNode("Wins");
  th.appendChild(headerText)
  header.appendChild(th);
  
  th = document.createElement("th");
  headerText = document.createTextNode("Losses");
  th.appendChild(headerText);
  header.appendChild(th);

  th = document.createElement("th");
  th.classList.add("header");
  th.classList.add("ppg");
  headerText = document.createTextNode("Points per Game");
  th.appendChild(headerText);
  header.appendChild(th);
  
  th = document.createElement("th");
  th.classList.add("header");
  th.classList.add("apg");
  headerText = document.createTextNode("Assists per Game");
  th.appendChild(headerText);
  header.appendChild(th);
  
  th = document.createElement("th");
  th.classList.add("header");
  th.classList.add("rpg");
  headerText = document.createTextNode("Rebounds per Game");
  th.appendChild(headerText);
  header.appendChild(th);
  
  th = document.createElement("th");
  th.classList.add("header");
  th.classList.add("spg");
  headerText = document.createTextNode("Steals per Game");
  th.appendChild(headerText);
  header.appendChild(th);
  
  th = document.createElement("th");
  th.classList.add("header");
  th.classList.add("bpg");
  headerText = document.createTextNode("Blocks per Game");
  th.appendChild(headerText);
  header.appendChild(th);
  
  th = document.createElement("th");
  th.classList.add("header");
  th.classList.add("tpg");
  headerText = document.createTextNode("Turnovers per Game");
  th.appendChild(headerText);
  header.appendChild(th);
  table.appendChild(header);
  
  // Header is now complete - now fill in all the rows for each of the teams in the conference  
}

function addContentRows(currentTeam, table){
  var content;
  var td;
  var tr;
  var anchor;
  
  tr = document.createElement("tr");
  tr.classList.add("teamRow");
  
  td = document.createElement("td");
  content = document.createTextNode(currentTeam.rank);
  td.appendChild(content);
  tr.appendChild(td);
  
  // Create the anchor that will re-direct the user back to that specific team
  td = document.createElement("td");
  content = document.createTextNode(currentTeam.team.City + " " + currentTeam.team.Name);
  anchor = document.createElement("a");
  anchor.href = formattedTeam(currentTeam.team.City, currentTeam.team.Name);
  anchor.appendChild(content);
  td.appendChild(anchor);
  tr.appendChild(td);
  
  td = document.createElement("td");
  content = document.createTextNode(currentTeam.stats.Wins['#text']);
  td.appendChild(content);
  tr.appendChild(td);
  
  td = document.createElement("td");
  content = document.createTextNode(currentTeam.stats.Losses['#text']);
  td.appendChild(content);
  tr.appendChild(td);
  
  td = document.createElement("td");
  content = document.createTextNode(currentTeam.stats.PtsPerGame['#text']);
  td.appendChild(content);
  tr.appendChild(td);
  
  td = document.createElement("td");
  content = document.createTextNode(currentTeam.stats.AstPerGame['#text']);
  td.appendChild(content);
  tr.appendChild(td);
  
  td = document.createElement("td");
  content = document.createTextNode(currentTeam.stats.RebPerGame['#text']);
  td.appendChild(content);
  tr.appendChild(td);
  
  td = document.createElement("td");
  content = document.createTextNode(currentTeam.stats.StlPerGame['#text']);
  td.appendChild(content);
  tr.appendChild(td);
  
  td = document.createElement("td");
  content = document.createTextNode(currentTeam.stats.BlkPerGame['#text']);
  td.appendChild(content);
  tr.appendChild(td);
  
  td = document.createElement("td");
  content = document.createTextNode(currentTeam.stats.TovPerGame['#text']);
  td.appendChild(content);
  tr.appendChild(td);
  
  table.appendChild(tr);
}

function formattedTeam(teamCity, teamName){
  while(teamCity.includes(" ") || teamName.includes(" ")){
      teamCity = teamCity.replace(" ", "");
      teamName = teamName.replace(" ", "");
  }
  
  return "/teamStats/" + teamCity + "-" + teamName;
}