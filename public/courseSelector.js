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
    // and the test route 000
    const validCourses = courses.filter(course => {
        return course.number !== "000" && !course.waypoints.some(wp => wp === "1" || wp === "2" || wp === "3");
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
    
    // Add a createCourses button
    const createCoursesCell = document.createElement('div');
    createCoursesCell.className = 'grid-cell';
    const createCoursesButton = document.createElement('button');
    createCoursesButton.className = 'back-button';
    createCoursesButton.innerHTML = '<div class="course-number">CREATE COURSES</div>';
    createCoursesButton.addEventListener('click', () => {
        createAllCourses();
    });
    createCoursesCell.appendChild(createCoursesButton);
    gridContainer.appendChild(createCoursesCell);
    
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
                displayCourseInfo(courseNumber, waypoints);
            } else {
                console.error("Route not found for course: " + courseNumber);
                document.getElementById('infoLabel').textContent = "Error: Route " + courseNumber + " not found in SignalK";
                resizeInfoLabel();
            }
        } else {
            console.error("Error fetching routes: " + xhr.status);
            document.getElementById('infoLabel').textContent = "Error fetching routes";
            resizeInfoLabel();
        }
    };
    
    xhr.send();
}

////////// ////////// ////////// //////////
// Helper function to find route key by course number
// Looks for route name matching the course number
////////// ////////// ////////// //////////
function getKeyForNamedRoute(routes, courseNumber) {
    for (const [key, value] of Object.entries(routes)) {
        // Check if route name matches course number
        // Try exact match or with/without leading zeros
        if (value.name === courseNumber || 
            value.name === parseInt(courseNumber).toString() ||
            value.name === 'Course ' + courseNumber ||
            value.name === courseNumber.replace(/^0+/, '')) {
            return key;
        }
    }
    return null;
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
// Function to create all courses in SignalK
// Reads courses from wednesday.js and creates routes
// Omits the first waypoint (Z - start line) from each route
////////// ////////// ////////// //////////
function createAllCourses() {
    document.getElementById('infoLabel').textContent = "Creating courses...";
    resizeInfoLabel();
    
    // Get all valid courses (same filter as display)
    const courses = Wednesday.courses;
    const validCourses = courses.filter(course => {
        return course.number !== "000" && !course.waypoints.some(wp => wp === "1" || wp === "2" || wp === "3");
    });
    
    // First, fetch all waypoints from SignalK
    const url = "/signalk/v2/api/resources/waypoints";
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.setRequestHeader("Content-Type", "application/json");
    
    xhr.onload = function() {
        if (xhr.status === 200) {
            var signalKWaypoints = JSON.parse(xhr.responseText);
            
            let coursesCreated = 0;
            let coursesTotal = validCourses.length;
            let errors = [];
            
            // Create each course
            validCourses.forEach((course, index) => {
                // Remove the first waypoint (Z - start line) from the course
                const routeWaypoints = course.waypoints.slice(1);
                
                // Build the route data
                const routePoints = [];
                let allWaypointsFound = true;
                
                for (let waypointLetter of routeWaypoints) {
                    // Remove asterisk if present (indicates starboard rounding)
                    const cleanLetter = waypointLetter.replace('*', '');
                    const key = getKeyForNamedWaypoint(signalKWaypoints, cleanLetter);
                    
                    if (key) {
                        routePoints.push({
                            href: "/resources/waypoints/" + key,
                            position: signalKWaypoints[key].position
                        });
                    } else {
                        console.error("Waypoint not found for course " + course.number + ": " + cleanLetter);
                        allWaypointsFound = false;
                        errors.push("Course " + course.number + ": waypoint " + cleanLetter + " not found");
                        break;
                    }
                }
                
                if (allWaypointsFound) {
                    // Create the route in SignalK
                    createRouteInSignalK(course.number, routePoints, (success) => {
                        if (success) {
                            coursesCreated++;
                        } else {
                            errors.push("Failed to create course " + course.number);
                        }
                        
                        // Update status after each course
                        if (coursesCreated + errors.length === coursesTotal) {
                            // All courses processed
                            if (errors.length === 0) {
                                document.getElementById('infoLabel').textContent = 
                                    "Successfully created " + coursesCreated + " courses in SignalK";
                            } else {
                                document.getElementById('infoLabel').textContent = 
                                    "Created " + coursesCreated + "/" + coursesTotal + " courses. " + errors.length + " errors.";
                                console.error("Errors:", errors);
                            }
                            resizeInfoLabel();
                        }
                    });
                }
            });
        } else {
            console.error("Error fetching waypoints: " + xhr.status);
            document.getElementById('infoLabel').textContent = "Error fetching waypoints from SignalK";
            resizeInfoLabel();
        }
    };
    
    xhr.send();
}

////////// ////////// ////////// //////////
// Function to create a single route in SignalK
////////// ////////// ////////// //////////
function createRouteInSignalK(courseNumber, routePoints, callback) {
    // Generate a UUID for the route
    const routeId = 'course-' + courseNumber;
    
    const routeData = {
        name: courseNumber,
        description: "Course " + courseNumber,
        feature: {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: routePoints.map(pt => [pt.position.longitude, pt.position.latitude])
            },
            properties: {}
        },
        points: routePoints.map((pt, idx) => ({
            href: pt.href,
            type: "waypoint",
            position: pt.position
        }))
    };
    
    const url = "/signalk/v2/api/resources/routes/" + routeId;
    var xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", "application/json");
    
    xhr.onload = function() {
        if (xhr.status === 200 || xhr.status === 201) {
            console.log("Created course " + courseNumber);
            callback(true);
        } else {
            console.error("Error creating course " + courseNumber + ": " + xhr.status);
            callback(false);
        }
    };
    
    xhr.onerror = function() {
        console.error("Network error creating course " + courseNumber);
        callback(false);
    };
    
    xhr.send(JSON.stringify(routeData));
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
