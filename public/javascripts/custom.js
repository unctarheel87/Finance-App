/* global d3 */



var numbers = [95, 120, 54, 75];



d3.select("#chart")
  .selectAll(".bar")
   .data(numbers)
   .style("height", function(d){ 
    return d + "px"; 
   })
   .style("margin-top", function(d) { 
    return (100 - d) + "px"; 
 
  });
