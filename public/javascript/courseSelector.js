////////// ////////// ////////// //////////
// Mark Deegan
// Sun Feb  2 2026
////////// ////////// ////////// //////////
// Course Selector Script
// Accompanies courseSelector.html
// and is used to set courses in SignalK from buttons
////////// ////////// ////////// //////////

import { Wednesday } from './wednesday.js';
import { renameExistingRoutes, createAllCourses } from '../utils/routeManagement.js';

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
// Initialize on page load
////////// ////////// ////////// //////////
window.addEventListener('load', () => {
    createCourseButtons();
    setTimeout(resizeButtonText, 50);
    
    // Check for courseNumber URL parameter
    checkURLCourseParameter();
    
    // Check for active course in SignalK and highlight it
    checkAndHighlightActiveCourse();
});

// Re-run on window resize
window.addEventListener('resize', resizeButtonText);

////////// ////////// ////////// //////////
// Function to check URL parameters for courseNumber
// If a valid courseNumber is provided in the URL,
// it will be validated and activated automatically
////////// ////////// ////////// //////////
function checkURLCourseParameter() {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const courseNumberParam = urlParams.get('courseNumber');
    
    if (!courseNumberParam) {
        console.log("No courseNumber parameter found in URL");
        return; // No parameter provided
    }
    
    console.log("Found courseNumber parameter:", courseNumberParam);
    
    // Validate that it's a 3-digit number
    if (!/^\d{3}$/.test(courseNumberParam)) {
        console.error("Invalid courseNumber parameter - must be 3 digits:", courseNumberParam);
        document.getElementById('infoLabel').textContent = "Invalid course number in URL: " + courseNumberParam + ". Must be a 3-digit number.";
        resizeInfoLabel();
        return;
    }
    
    // Check if this course exists in Wednesday courses
    const courseDetails = Wednesday.getCourseByNumber(courseNumberParam);
    
    if (!courseDetails) {
        console.error("Course not found in Wednesday courses:", courseNumberParam);
        document.getElementById('infoLabel').textContent = "Course " + courseNumberParam + " not found in course list";
        resizeInfoLabel();
        return;
    }
    
    console.log("Valid course found:", courseDetails);
    
    // Verify the course exists in SignalK and activate it
    validateAndActivateCourse(courseNumberParam, courseDetails);
}

////////// ////////// ////////// //////////
// Function to validate course exists in SignalK and activate it
////////// ////////// ////////// //////////
function validateAndActivateCourse(courseNumber, courseDetails) {
    console.log('Validating course in SignalK: ' + courseNumber);
    
    // Fetch all routes from SignalK to find the matching course
    const routesUrl = "/signalk/v2/api/resources/routes";
    var xhr = new XMLHttpRequest();
    xhr.open("GET", routesUrl);
    xhr.setRequestHeader("Content-Type", "application/json");
    
    xhr.onload = function() {
        if (xhr.status === 200) {
            var signalKRoutes = JSON.parse(xhr.responseText);
            
            // Find the route with matching course number
            const routeKey = getKeyForNamedRoute(signalKRoutes, courseNumber);
            
            if (routeKey) {
                console.log("Course found in SignalK, activating:", courseNumber);
                
                // Highlight the selected course button
                highlightCourseButton(courseNumber);
                
                // Set the course as active route in SignalK
                setCourse(courseNumber, courseDetails.waypoints);
            } else {
                console.error("Route not found in SignalK for course:", courseNumber);
                document.getElementById('infoLabel').textContent = "Error: Course " + courseNumber + " exists locally but not found in SignalK. Please check SignalK route configuration.";
                resizeInfoLabel();
            }
        } else {
            console.error("Error fetching routes from SignalK:", xhr.status);
            document.getElementById('infoLabel').textContent = "Error connecting to SignalK (status " + xhr.status + ")";
            resizeInfoLabel();
        }
    };
    
    xhr.onerror = function() {
        console.error("Network error when connecting to SignalK");
        document.getElementById('infoLabel').textContent = "Network error: Unable to connect to SignalK";
        resizeInfoLabel();
    };
    
    xhr.send();
}

////////// ////////// ////////// //////////
// Function to highlight the selected course button
////////// ////////// ////////// //////////
function highlightCourseButton(courseNumber) {
    // Find the button with matching course number
    const button = document.querySelector(`button[data-course-number="${courseNumber}"]`);
    
    if (button) {
        // Add a visual highlight to the button
        button.style.backgroundColor = '#4CAF50';
        button.style.border = '3px solid #2E7D32';
        
        // Scroll the button into view
        button.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        console.log("Course button highlighted:", courseNumber);
    }
}

////////// ////////// ////////// //////////
// Function to check for active course in SignalK
// and highlight the corresponding button
////////// ////////// ////////// //////////
function checkAndHighlightActiveCourse() {
    console.log('Checking for active course in SignalK');
    
    // Try v2 API first, then fall back to v1 if needed
    fetchActiveRoute("/signalk/v2/api/vessels/self/navigation/course/activeRoute");
}

////////// ////////// ////////// //////////
// Function to fetch active route from SignalK
////////// ////////// ////////// //////////
function fetchActiveRoute(apiUrl) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", apiUrl);
    xhr.setRequestHeader("Content-Type", "application/json");
    
    xhr.onload = function() {
        if (xhr.status === 200) {
            var activeRouteData = JSON.parse(xhr.responseText);
            
            // Handle v2 API response format
            if (activeRouteData && activeRouteData.value && activeRouteData.value.href) {
                const routeHref = activeRouteData.value.href;
                console.log('Active route found (v2):', routeHref);
                
                // Extract the route key from href
                const routeKey = routeHref.replace('/resources/routes/', '');
                fetchRouteNameAndHighlight(routeKey);
            } 
            // Handle v1 API response format
            else if (activeRouteData && activeRouteData.href) {
                const routeHref = activeRouteData.href;
                console.log('Active route found (v1):', routeHref);
                
                const routeKey = routeHref.replace('/resources/routes/', '');
                fetchRouteNameAndHighlight(routeKey);
            } 
            else {
                console.log('No active route found in SignalK (empty response)');
            }
        } else if (xhr.status === 404) {
            // 404 simply means no active route is set - this is normal
            console.log('No active route currently set in SignalK');
        } else {
            console.log("Unexpected response when fetching active route:", xhr.status);
        }
    };
    
    xhr.onerror = function() {
        console.log("Could not connect to SignalK to check active route");
    };
    
    xhr.send();
}

////////// ////////// ////////// //////////
// Function to fetch route name and highlight button
////////// ////////// ////////// //////////
function fetchRouteNameAndHighlight(routeKey) {
    const routesUrl = "/signalk/v2/api/resources/routes";
    var xhr = new XMLHttpRequest();
    xhr.open("GET", routesUrl);
    xhr.setRequestHeader("Content-Type", "application/json");
    
    xhr.onload = function() {
        if (xhr.status === 200) {
            var signalKRoutes = JSON.parse(xhr.responseText);
            
            // Find the route with the matching key
            const route = signalKRoutes[routeKey];
            
            if (route && route.name) {
                console.log('Active route name:', route.name);
                
                // Extract course number from route name
                const courseNumber = extractCourseNumber(route.name);
                
                if (courseNumber) {
                    console.log('Extracted course number:', courseNumber);
                    
                    // Check if this course exists in our course list
                    const courseDetails = Wednesday.getCourseByNumber(courseNumber);
                    
                    if (courseDetails) {
                        // Highlight the button
                        highlightCourseButton(courseNumber);
                        
                        // Update the info label
                        document.getElementById('infoLabel').textContent = `Active course: ${courseNumber}`;
                        resizeInfoLabel();
                    } else {
                        console.log('Active course not found in course list:', courseNumber);
                    }
                } else {
                    console.log('Could not extract course number from route name:', route.name);
                }
            }
        } else {
            console.error("Error fetching routes:", xhr.status);
        }
    };
    
    xhr.send();
}

////////// ////////// ////////// //////////
// Function to extract course number from route name
// Handles various naming formats:
// - "hyc-Wednesday-241" -> "241"
// - "HYC-Wed-241" -> "241"
// - "241" -> "241"
// - "Course 241" -> "241"
////////// ////////// ////////// //////////
function extractCourseNumber(routeName) {
    // Try to match "hyc-Wednesday-XXX" format
    let match = routeName.match(/hyc-Wednesday-(\d{3})/i);
    if (match) return match[1];
    
    // Try to match "HYC-Wed-XXX" format
    match = routeName.match(/HYC-Wed-(\d{3})/i);
    if (match) return match[1];
    
    // Try to match "Course XXX" format
    match = routeName.match(/Course\s+(\d{3})/i);
    if (match) return match[1];
    
    // Try to match just a 3-digit number
    match = routeName.match(/^(\d{3})$/);
    if (match) return match[1];
    
    // Try to match any 3-digit number in the name
    match = routeName.match(/(\d{3})/);
    if (match) return match[1];
    
    return null;
}
