var teams = document.getElementsByClassName("teams");

for(var i = 0; i < teams.length; i++){
    var currentTeam = teams[i];
    
    currentTeam.addEventListener("mouseover", function(){
       this.style.background = "#eee"; 
    });
    
    currentTeam.addEventListener("mouseout", function(){
       this.style.background = "none"; 
    });
}