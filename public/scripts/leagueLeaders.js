
var dropDown = document.getElementById("categorySelect");
if(dropDown){
    dropDown.addEventListener("change", function(){
    // Here I would need to do a search for each of them depending on which of the drop downs the user has selected
    var selectedValue = this.value;
    
    var table = document.getElementById("displayTable");
    
    document.getElementById("header" + selectedValue).scrollIntoView(true);
    // this would remove all the rows from the table
    // probably want to be storing this somewhere just in case that we need it again later
    // table.getElementsByTagName("tbody")[0].innerHTML = table.rows[0].innerHTML;
    });

}

// Adding visual indicator of which column it is being sorted by

var headers = document.getElementsByClassName("header");

for(var i=0; i < headers.length; i++){

    headers[i].addEventListener("click", function(){
        for(var j = 0; j < headers.length; j++){
            headers[j].style.color = "black";
        }
        this.style.color="red";
    })
}

var rows = document.getElementsByClassName("contentRows");

// when hover over change to bold font
// for(var i = 0; i < rows.length; i++){
//     rows[i].addEventListener("mouseover", function(){
//         this.style.fontWeight = "bold";
//         // console.log(this.rowIndex);
//         var trIndex = this.rowIndex;
//         $("table.dataTable").each(function(index) {
//             $(this).find("tr:eq("+trIndex+")").each(function(index) {
//                 console.log($(this).find("td"))
//                 // $(this).find("td").addClass("hover");
//                 // $(this).find("td").addClass("bold");
//                 // $(this).find("td").style.fontWeight = "bold";
//                 var tds = $(this).find("td");
//                 tds[0].style.fontWeight = "bold";
//                 tds[1].style.fontWeight = "bold";
//                 console.log(tds[0]);
//              });
//         });        
//     });
    
//     rows[i].addEventListener("mouseout", function(){
//       this.style.fontWeight = "normal";
//         var trIndex = this.rowIndex;
//         $("table.dataTable").each(function(index) {
//             $(this).find("tr:eq("+trIndex+")").each(function(index) {
//                 console.log($(this).find("td"))
//                 // $(this).find("td").addClass("hover");
//                 // $(this).find("td").addClass("bold");
//                 // $(this).find("td").style.fontWeight = "bold";
//                 var tds = $(this).find("td");
//                 tds[0].style.fontWeight = "normal";
//                 tds[1].style.fontWeight = "normal";
//                 // console.log(tds[0]);
//              });
//         });        

//     });
// }

$(document).on({
    
    // Moused over a row - highlight it for the user
    mouseenter: function () {
        var trIndex = $(this).index()+1;
        // Make sure we aren't hovering over the header row
        if($(this)[0].className != ""){
            rows[trIndex - 1].style.fontWeight = "bold";
            $("table.dataTable").each(function(index) {
                $(this).find("tr:eq("+trIndex+")").each(function(index) {
                    var tds = $(this).find("td");
                    tds[0].style.fontWeight = "bold";
                    tds[1].style.fontWeight = "bold";
                });
            });
        }
    },
    
    // Left a row - set font-size back to normal
    mouseleave: function () {
        var trIndex = $(this).index()+1;
        // Make sure we aren't hovering over the header row
        if($(this)[0].className != ""){
            rows[trIndex - 1].style.fontWeight = "normal";
            $("table.dataTable").each(function(index) {
                $(this).find("tr:eq("+trIndex+")").each(function(index) {
                    var tds = $(this).find("td");
                    tds[0].style.fontWeight = "normal";
                    tds[1].style.fontWeight = "normal";
                }); 
            });
        }
    }
}, ".dataTables_wrapper tr");



// when hover out change back to regular font