////////// ////////// ////////// //////////
// Copyright (c) 2026 Mark Deegana       //
////////// ////////// ////////// //////////
// Mark Deegan
/** 
 *  @author Mark Deegan
 *  @version 1.0 
 */
// Thu Jan 15 18:08:28 GMT 2026
// js for keypad input
// page at: https://markdeegan.github.io/signalkplugin/swdev/courseSelectorKeyPad.html
////////// ////////// ////////// //////////

import { Wednesday } from "./javascript/wednesday.js";

const keypadButtons = ["0","1","2","3","4","5","6","7","8","9","clear","enter"];
// an array of arrays for different levels of active keypad buttons
// initialy, only buttons 0-5, clear and enter are active
// once any button is pressed, then only even numbers, clear and enter are active
// once two buttons are pressed, then only 1-4, clear and enter are active
// for reference, see the Wednesday race card:
// https://markdeegan.github.io/signalkplugin/swdev/js/wednesday.json
// 
const levelActiveKeypadButtons = [
    ["0","1","2","3","4","5"],
    ["0","2","4","6","8","clear"],   
    ["1","2","3","4","clear"],
    ["clear","enter"],
    ["0","2","4","clear"]
];

// create variable to track current level
// this starts at level 0, and increments with each button press
// max value is 2 (3 buttons pressed)
// at which point all buttons are disabled except clear and enter
// I may automatically select and activate the chosen course 
// after 3 digits have been entered, withoyut needing to press enter
var currentLevel = 0; // start at level 0

// create variable to hold chosen course number
// this is built up as buttons are pressed
// and is used when enter button is pressed to identify the chosen course
var chosenCourseNumber=""; // variable to hold chosen course number

////////// ////////// ////////// //////////
// SignalK Integration Functions
// These functions are used to set the active route in SignalK
////////// ////////// ////////// //////////

////////// ////////// ////////// //////////
// Function to set the course as active route in SignalK
// given the course number
// Activates the matching course/route in SignalK
////////// ////////// ////////// //////////
function setCourse(courseNumber, waypoints) {
    console.log('Setting course: ' + courseNumber, waypoints);
    
    // First, fetch all routes from SignalK to find the matching course
    const routesUrl = "/signalk/v2/api/resources/routes";
    var xhr = new XMLHttpRequest();
    xhr.open("GET", routesUrl);
    xhr.setRequestHeader("Content-Type", "application/json");
    
    xhr.onload = function() {
        if (xhr.status === 200) {
            var signalKRoutes = JSON.parse(xhr.responseText);
            
            // Find the route with matching course number
            // Routes in SignalK should have a name or identifier matching the course number
            const routeKey = getKeyForNamedRoute(signalKRoutes, courseNumber);
            
            if (routeKey) {
                // Activate the route in SignalK
                setActiveRoute(routeKey);
                // Show success message
                alert("Course " + courseNumber + " activated: " + waypoints.join(' → '));
            } else {
                console.error("Route not found for course: " + courseNumber);
                alert("Error: Route " + courseNumber + " not found in SignalK");
            }
        } else {
            console.error("Error fetching routes: " + xhr.status);
            alert("Error fetching routes from SignalK");
        }
    };
    
    xhr.send();
}

////////// ////////// ////////// //////////
// Helper function to find route key by course number
// Looks for route name matching the course number
// Routes are expected to be named "hyc-Wednesday-XXX"
////////// ////////// ////////// //////////
function getKeyForNamedRoute(routes, courseNumber) {
    // Primary match: look for "hyc-Wednesday-XXX" format
    const expectedName = "hyc-Wednesday-" + courseNumber;
    
    for (const [key, value] of Object.entries(routes)) {
        // Check if route name matches expected format
        if (value.name === expectedName) {
            return key;
        }
    }
    
    // Fallback: try other formats for backward compatibility
    for (const [key, value] of Object.entries(routes)) {
        if (value.name === courseNumber || 
            value.name === parseInt(courseNumber).toString() ||
            value.name === 'Course ' + courseNumber ||
            value.name === courseNumber.replace(/^0+/, '') ||
            value.name === 'HYC-Wed-' + courseNumber) {
            return key;
        }
    }
    return null;
}

////////// ////////// ////////// //////////
// Function to set active route in SignalK
////////// ////////// ////////// //////////
function setActiveRoute(routeHref) {
    const url = "/signalk/v2/api/vessels/self/navigation/course/activeRoute";
    var data = {
        href: "/resources/routes/" + routeHref
    };
    console.log('Setting active route:', data);
    var xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(data));
}
////////// ////////// ////////// //////////

////////// ////////// ////////// //////////
// function called on page load
// this is jQuery syntax
// and it needs the jQuery library to be loaded first
// see the html file for this js code
///////// ////////// ////////// //////////

// Wait for both DOM and jQuery to be ready
if (typeof window !== 'undefined') {
    window.addEventListener('load', function() {
        console.log("Page loaded, jQuery available:", typeof $ !== 'undefined');
        initializeKeypad();
    });
}

function initializeKeypad() {
$(document).ready(
    function () 
    { // define the ready function
        console.log("Document ready, initializing keypad");
        ////////// ////////// ////////// //////////
        // activate buttons for level 0
        activateKeypadButtons(0); // activate buttons for level 0
        field(""); // clear the course number label

        ////////// ////////// ////////// //////////
        // get input field
        const input_value = $("#courseNumber");
        
        ////////// ////////// ////////// //////////
        //disable input from typing
        $("#courseNumber").keypress(function () {
            return false;
        });
        // end disable input from typing
        ////////// ////////// ////////// //////////
    
        ////////// ////////// ////////// //////////
        // on click of any button with class digit
        $(".digit").click(function () {
            // when a digit button is clicked (note not all buttons are digit class)
            // get the value of the button clicked
            let value = $(this).val();
            // selections beginning with 4 or 5 at level 0
            // are converted to 40x or 50x respectively
            // There are only courses 401-404 and 501-504

            console.log("Button: "+value+" pressed at level "+currentLevel);
            if(currentLevel==0) // if this is the first button pressed
            {
                ////////// ////////// ////////// ////////// 
                // if the button pressed was 0,2 or 2
                // then this can be followed by 0,2,4,6 or 8
                // or clear, but not yet enter
                if ((value==0)||(value==1)||(value==2))
                {  
                    // indicate that only one digit has been entered 
                    currentLevel=1; // set current level to 1
                    chosenCourseNumber=value; // set chosen course number
                    // activate buttons for level 1: 0,2,4,6,8,clear
                    activateKeypadButtons(1); 
                    // call field function to display the input value
                    field(chosenCourseNumber); // call field function to display the input value
                } // end of if for button 0,1 or 2 pressed at level 0
                ////////// ////////// ////////// ////////// 

                ////////// ////////// ////////// ////////// 
                // if the button pressed was 3
                // then this can only be followed by 0,2,4 or clear
                else if (value==3)
                {
                    // indicate that only one digit has been entered
                    currentLevel=1; // set current level to 1
                    chosenCourseNumber="3"; // set chosen course number to 3
                    // disable all buttons except 0,2,4 or clear
                    activateKeypadButtons(4);
                    // call field function to display the input value
                    field(chosenCourseNumber);
                } // end of if for button 3 pressed at level 0
                ////////// ////////// ////////// ////////// 

                ////////// ////////// ////////// ////////// 
                // if the button pressed was 4 or 5
                // then this is converted to 40 or 50 respectively
                // and the level is set to 2
                else if((value==4)||(value==5))
                {
                    // convert to 40 or 50 by adding a 0 after the 4 or 5
                    value=value+"0"; // convert to 40 or 50
                    // set current level to 2
                    currentLevel=2;
                    // set chosen course number to 40 or 50
                    chosenCourseNumber=value;
                    // activate buttons for level 2: 1,2,3,4,clear
                    activateKeypadButtons(2);
                    // call field function to display the input value
                    field(chosenCourseNumber);
                } // end of if for button 4 or pressed at level 0
                ////////// ////////// ////////// ////////// 
                console.log("Incremented current level to: " + currentLevel);
                console.log("Current course number so far: " + $("#courseNumber").val());
            } // end of if for current level 0 (0,1,2) (3) or (4,5) pressed
            ////////// ////////// ////////// ////////// 

            ////////// ////////// ////////// ////////// 
            // for all other follow-on levels 1,2,3
            else if (currentLevel <= 3)
            {
                // increment current level by 1
                currentLevel += 1;
                // append value to chosen course number
                chosenCourseNumber= chosenCourseNumber + value;
                    console.log("Incremented current level to: " + currentLevel);
                    console.log("Current course number so far: " + chosenCourseNumber);
                // activate the appropriate buttons for this level
                activateKeypadButtons(currentLevel);
                // set the input field to empty string
                field(chosenCourseNumber); // call field function to display the input value
            } 
            ////////// ////////// ////////// ////////// 

            ////////// ////////// ////////// ////////// 
            // if current level is 4 (or more)
            // we shold never reach this code, as all digit buttons 
            // should have been disabled on reaching level 3
            // this is really just a safety catch and a legacy
            // of earlier code versions
            else 
            { // if current level is 4 (or more)
                console.log("Maximum digits entered, no further input allowed");
                console.log("Current course number so far: " + chosenCourseNumber);
                console.log("Course number selected: " + chosenCourseNumber);
            }
            return; // end of click function
        });
        // end definition of click digit button function
        ////////// ////////// ////////// //////////
    
        ////////// ////////// ////////// //////////
        // function to add value (next entered digit) to input field
        function field(value) {
            let defaultFontSize = $("#courseNumber").fontSize;

            // set the value of the display field
            // if value is empty string, clear both fields
            // but add instructions to course number field
            if(value=="")
            { // if empty string
                let 
                $("#courseNumber").fontSize="10px";
                $("#courseNumber").val("Enter 3-digit Course");
                $("#waypoints").html("");
                return;
            } // end of if for empty string
            else
            { // if not empty string
                // set course number field to value provided
                $("#courseNumber").val(value);
                // if we are at 3 digits, retrieve waypoints
                // from Wednesday class and display in waypoints field 
                if (value.length >= 3) {
                    const course = Wednesday.getCourseByNumber(value);
                    const waypoints = course.waypoints;
                    
                    // Build HTML with highlighted waypoints
                    // waypoints in lowercase and ending with * are highlighted in red
                    let waypointsHTML = waypoints.map(waypoint => {
                        // Check if waypoint is lowercase and ends with *
                        if (waypoint.endsWith('*')) {
                            waypoint = waypoint.slice(0, -1); // Remove the *
                            return `<span style="text-decoration: underline; color: green;">${waypoint}</span>`;
                        }
                        return waypoint;
                    }).join(" ");
                    
                    // Use html() instead of val() to render HTML
                    $("#waypoints").html(waypointsHTML);
                } // end of if for 3 digits entered
                else 
                { // if less than 3 digits entered
                    $("#waypoints").html("");
                } // end of else for less than 3 digits entered
            } // end of else for not empty string
        }   
        // end definition of function field
        ////////// ////////// ////////// //////////

        ////////// ////////// ////////// //////////
        // clear button function to clear the input field
        $("#clear").click(function () {
            // reset current level to 0
            currentLevel = 0; // reset current level to 0
            chosenCourseNumber=""; // reset chosen course number
            // activate buttons for level 0
            activateKeypadButtons(0);
            // set the input field to empty string
            field(""); // clear the course number label
        });
        // end definition of click clear button function
        ////////// ////////// ////////// //////////
    
        ////////// ////////// ////////// //////////
        // enter button function to indicate the entered course number
        $("#enter").click(function () {
            // log entered course number
            console.log("Entered course number: " + chosenCourseNumber);
            
            // Get the course details from Wednesday class
            const courseDetails = Wednesday.getCourseByNumber(chosenCourseNumber);
            console.log(courseDetails);
            
            if (courseDetails) {
                // Set the course as active route in SignalK
                setCourse(chosenCourseNumber, courseDetails.waypoints);
            } else {
                console.error("Course not found: " + chosenCourseNumber);
                alert("Course " + chosenCourseNumber + " not found");
            }
            
            // clear input field after enter
            currentLevel = 0; // reset current level to 0
            chosenCourseNumber=""; // reset chosen course number
            // activate buttons for level 0
            activateKeypadButtons(0);
            // set the input field to empty string
            field(""); // clear the course number label
        });
        // end definition of click enter button function
        ////////// ////////// ////////// //////////

        
        ////////// ////////// ////////// //////////
        // function to activate keypad buttons for a given level
        // this function enables/disables buttons based on the current level
        // level 0: buttons 0-5 active
        // level 1: buttons 0,2,4,6,8,clear active
        // level 2: buttons 1,2,3,4,clear active
        // level 3: buttons clear, enter active
        // level 4: buttons 0,2,4,clear active (for 3xxx courses)
        function activateKeypadButtons(level) {
            // first disable all buttons
            // iterates through all keypad buttons
            for (var i = 0; i < keypadButtons.length; i++) {
                // disable each button
                $("#"+keypadButtons[i]).addClass("disabledbtn");
                // remove pinButton class to disable styling
                $("#"+keypadButtons[i]).removeClass("pinButton");
                // disable the button
                $("#"+keypadButtons[i]).prop("disabled", true);
                // also disable the input field
                // this is mostly redundant as it is readonly anyway
                $("#courseNumber").prop("disabled", true); 
            } // end for loop through all keypad buttons
            ////////// ////////// ////////// //////////

            ////////// ////////// ////////// //////////
            // now enable the buttons for this level
            // get the array of buttons to activate for this level
            var buttonsToActivate = levelActiveKeypadButtons[level];
            // iterate through the buttons to activate
            for (var j = 0; j < buttonsToActivate.length; j++) {
                // remove disabledbtn class to enable button
                $("#"+buttonsToActivate[j]).removeClass("disabledbtn");
                // add pinButton class to enable styling
                $("#"+buttonsToActivate[j]).addClass("pinButton");
                // enable the button
                $("#"+buttonsToActivate[j]).prop("disabled", false);
            } // end for loop through buttons to activate
            ////////// ////////// ////////// //////////

            ////////// ////////// ////////// //////////
            console.log("Activated keypad buttons for level "+level+": "+buttonsToActivate);
            if (level == 3) {
                console.log("Maximum digits entered, only clear and enter buttons active");
                console.log("Course number selected: " + chosenCourseNumber); 
            }
            ////////// ////////// ////////// //////////
        }
        // end definition of function activateKeypadButtons
        ////////// ////////// ////////// //////////

        ////////// ////////// ////////// //////////
        function courseNumberToWaypoints(courseNumber) {
            // function to map course number to waypoints
            // this is a placeholder function
            // actual implementation would depend on the course data structure
            console.log("Mapping course number " + courseNumber + " to waypoints");
            // return an array of waypoints for the given course number
            return []; // placeholder return value
        }
        // end definition of function courseNumberToWaypoints
        ////////// ////////// ////////// //////////

    } // end definition of ready function
); // end of document ready function
} // end of initializeKeypad function
////////// ////////// ////////// //////////
////////// ////////// ////////// //////////