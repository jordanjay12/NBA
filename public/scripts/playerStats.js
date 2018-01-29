var data;

var url = window.location.href;
var lastIndex = url.lastIndexOf("/");
url = url.substring(lastIndex + 1);


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

$.ajax
({
  type: "GET",
  url: "/ajax",
  dataType: 'json',
  async: false,
  data: {
      url: currentSeason + "/active_players.json?player=" + url
  },
  success: function (result){
   data = result;
   var playerPicture = document.getElementById("playerPicture");
   playerPicture.src = data.activeplayers.playerentry[0].player.officialImageSrc;
   document.getElementById("playerPicture").style.display = "block";
  }
});