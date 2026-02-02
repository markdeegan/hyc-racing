////////// ////////// ////////// //////////
// Mark Deegan
// Sun Feb  2 2026
////////// ////////// ////////// //////////
// Course Selector Script
// Accompanies courseSelector.html
// and is used to set courses in SignalK from buttons
////////// ////////// ////////// //////////

import { Wednesday } from './wednesday.js';

////////// ////////// ////////// //////////
// Function to dynamically create course buttons
// from the wednesday.js courses data
////////// ////////// ////////// //////////
function createCourseButtons() {
    const gridContainer = document.getElementById('courseGrid');
    const courses = Wednesday.courses;
    
    // Filter out placeholder courses (those with waypoints containing "1", "2", "3")
    const validCourses = courses.filter(course => {
        return !course.waypoints.some(wp => wp === "1" || wp === "2" || wp === "3");
    });
    
    // Create a button for each valid course
    validCourses.forEach(course => {
        const gridCell = document.createElement('div');
        gridCell.className = 'grid-cell';
        
        const button = document.createElement('button');
        button.setAttribute('data-course-number', course.number);
        
        // Create course number display
        const courseNumber = document.createElement('div');
        courseNumber.className = 'course-number';
        courseNumber.textContent = course.number;
        
        // Create waypoints display
        const waypoints = document.createElement('div');
        waypoints.className = 'course-waypoints';
        waypoints.textContent = course.waypoints.join(' → ');
        
        // Create length display
        const length = document.createElement('div');
        length.className = 'course-length';
        length.textContent = course.length_nm + ' nm';
        
        button.appendChild(courseNumber);
        button.appendChild(waypoints);
        button.appendChild(length);
        
        // Add click handler
        button.addEventListener('click', () => {
            setCourse(course.number, course.waypoints);
        });
        
        gridCell.appendChild(button);
        gridContainer.appendChild(gridCell);
    });
    
    // Add a back button at the end
    const backCell = document.createElement('div');
    backCell.className = 'grid-cell';
    const backButton = document.createElement('button');
    backButton.className = 'back-button';
    backButton.onclick = () => window.location.href = 'index.html';
    backButton.innerHTML = '<div class="course-number">BACK</div>';
    backCell.appendChild(backButton);
    gridContainer.appendChild(backCell);
}

////////// ////////// ////////// //////////
// Function to resize button text to fit
////////// ////////// ////////// //////////
function resizeButtonText() {
    const buttons = document.querySelectorAll('button');
    
    buttons.forEach(button => {
        const waypointsElement = button.querySelector('.course-waypoints');
        if (!waypointsElement) return;
        
        // Start with default size
        let fontSize = 30; // vh units
        waypointsElement.style.fontSize = fontSize + 'px';
        
        // Reduce font size until text fits
        const maxWidth = button.clientWidth - 10;
        
        while (waypointsElement.scrollWidth > maxWidth && fontSize > 5) {
            fontSize -= 0.5;
            waypointsElement.style.fontSize = fontSize + 'px';
        }
    });
}

////////// ////////// ////////// //////////
// Function to set the course as route in SignalK
// given the course number
// Creates a route from the waypoints in the course
////////// ////////// ////////// //////////
function setCourse(courseNumber, waypoints) {
    console.log('Setting course: ' + courseNumber, waypoints);
    
    // Fetch all waypoints from SignalK
    const url = "/signalk/v2/api/resources/waypoints";
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.setRequestHeader("Content-Type", "application/json");
    
    xhr.onload = function() {
        if (xhr.status === 200) {
            var signalKWaypoints = JSON.parse(xhr.responseText);
            
            // Build route from course waypoints
            const routeWaypoints = [];
            let allWaypointsFound = true;
            
            // Process each waypoint in the course
            for (let waypointLetter of waypoints) {
                // Remove asterisk if present (indicates starboard rounding)
                const cleanLetter = waypointLetter.replace('*', '');
                const key = getKeyForNamedWaypoint(signalKWaypoints, cleanLetter);
                
                if (key) {
                    routeWaypoints.push({
                        href: "/resources/waypoints/" + key,
                        position: signalKWaypoints[key].position
                    });
                } else {
                    console.error("Waypoint not found: " + cleanLetter);
                    allWaypointsFound = false;
                    break;
                }
            }
            
            if (allWaypointsFound) {
                // Set the first waypoint as destination
                if (routeWaypoints.length > 0) {
                    setDestinationFromHREF(routeWaypoints[0].href.replace('/resources/waypoints/', ''));
                    displayCourseInfo(courseNumber, waypoints);
                }
            } else {
                document.getElementById('infoLabel').textContent = "Error: Not all waypoints found for course " + courseNumber;
                resizeInfoLabel();
            }
        } else {
            console.error("Error fetching waypoints: " + xhr.status);
            document.getElementById('infoLabel').textContent = "Error fetching waypoints";
            resizeInfoLabel();
        }
    };
    
    xhr.send();
}

////////// ////////// ////////// //////////
// Helper function to find waypoint key by name
////////// ////////// ////////// //////////
function getKeyForNamedWaypoint(obj, waypointName) {
    for (const [key, value] of Object.entries(obj)) {
        if (value.name === waypointName) {
            return key;
        }
    }
    return null;
}

////////// ////////// ////////// //////////
// Function to set destination in SignalK
////////// ////////// ////////// //////////
function setDestinationFromHREF(href) {
    const url = "/signalk/v2/api/vessels/self/navigation/course/destination";
    var data = {
        href: "/resources/waypoints/" + href
    };
    console.log('Setting destination:', data);
    var xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(data));
}

////////// ////////// ////////// //////////
// Function to display course information
////////// ////////// ////////// //////////
function displayCourseInfo(courseNumber, waypoints) {
    const course = Wednesday.courses.find(c => c.number === courseNumber);
    
    if (course) {
        const waypointsList = waypoints.map(wp => {
            // Show asterisk for starboard marks
            return wp;
        }).join(' → ');
        
        const infoText = `Course ${courseNumber} set: ${waypointsList} (${course.length_nm} nm)`;
        document.getElementById('infoLabel').textContent = infoText;
        resizeInfoLabel();
    } else {
        document.getElementById('infoLabel').textContent = "Course information not found: " + courseNumber;
        resizeInfoLabel();
    }
}

////////// ////////// ////////// //////////
// Function to resize info label text to fit
////////// ////////// ////////// //////////
function resizeInfoLabel() {
    const infoLabel = document.getElementById('infoLabel');
    if (!infoLabel || !infoLabel.textContent) return;
    
    let fontSize = 200;
    const containerWidth = infoLabel.clientWidth - 40;
    
    infoLabel.style.fontSize = fontSize + 'px';
    infoLabel.style.whiteSpace = 'nowrap';
    
    while (infoLabel.scrollWidth > containerWidth && fontSize > 5) {
        fontSize -= 1;
        infoLabel.style.fontSize = fontSize + 'px';
    }
}

////////// ////////// ////////// //////////
// Initialize on page load
////////// ////////// ////////// //////////
window.addEventListener('load', () => {
    createCourseButtons();
    setTimeout(resizeButtonText, 50);
});

// Re-run on window resize
window.addEventListener('resize', resizeButtonText);
