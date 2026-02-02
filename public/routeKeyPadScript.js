////////// ////////// ////////// //////////
// Copyright (c) 2026 Mark Deegan        //
////////// ////////// ////////// //////////
/**
 * @author Mark Deegan
 * @version 1.0
 */
// Mon Nov 10 22:46:00 GMT 2025
////////// ////////// ////////// //////////

////////// ////////// ////////// //////////
// Javascript exercise to explore the 
// creation of a page to set the active
// routes in SignalK
////////// ////////// ////////// //////////

var activeRouteNumber = 0;

////////// ////////// ////////// //////////
// Write a simple message
console.log("ActiveRouteNumber :"+ activeRouteNumber);
////////// ////////// ////////// //////////

////////// ////////// ////////// //////////
// function to respond to the onClick event
// establish the source of the onClick event
export function routeButtonFunction(source) {
  // tell us what source object fired the event
    // console.log(source);
  // identify the text of the source object
  // by examining the textContent of the button
  // var x = source.name;
  var x = source.textContent || source.innerText;
  var routeName = source.name;
  var waypoints = source.getAttribute("waypoints").slice(1);
  // for the moment we
  // don't really want an alert/confirmation dialog
  // maybe later
  // alert(x);
    // set the text of the "routeText" paragraph to 
    // the name of the source object
    document.getElementById("routeText").innerHTML = "Route: name="+routeName+" waypoints="+waypoints;
    // also display the selected route on the console
    activeRouteNumber = x;

  console.log("Overlay On");
  document.getElementById("overlay").style.display = "block";
  document.getElementById("overlayText").textContent = "Route: "+routeName+"-"+waypoints;
  setTimeout(overlayOff, 3000);

    console.log("Set Active Route: "+ routeName);
    console.log("Waypoints: "+ waypoints);
    console.log("Route Number: "+ routeName);
    console.log("-------------------------")

} // end definition of function for onCLick for buttons
////////// ////////// ////////// //////////

////////// ////////// ////////// //////////
// function to clear the active route in SignalK
// all we do for now is just say we have cleared it
// but in fact we haven't done anything
export function clearRoute() {
  // set the text of the "clear" paragraph
  // document.getElementById("clear").innerHTML = "Clear Route";
  
  activeRouteNumber = 0;
  document.getElementById("routeText").innerHTML="Setting route: "+ activeRouteNumber;
  
  // also display the same message on the console
  activeRouteNumber = 0;
  console.log("Overlay On");
  document.getElementById("overlay").style.display = "block";
  setTimeout(overlayOff, 3000);

  console.log("Clear Route");
  console.log("Active Route: "+ activeRouteNumber);
} // end definition of function to clear the active route
////////// ////////// ////////// //////////

// function overlayOn() {
//  document.getElementById("overlay").style.display = "block";
//  console.log("Overlay On");
// }

export function overlayOff() {
  document.getElementById("overlay").style.display = "none";
  console.log("Overlay Off");
}