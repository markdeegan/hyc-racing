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
    
    // Add a clear course button
    const clearCell = document.createElement('div');
    clearCell.className = 'grid-cell';
    const clearButton = document.createElement('button');
    clearButton.id = 'clearCourseButton';
    clearButton.className = 'clear-course-button';
    clearButton.disabled = true;
    clearButton.innerHTML = '<div class="course-number">CLEAR<br>COURSE</div>';
    clearButton.addEventListener('click', clearActiveRoute);
    clearCell.appendChild(clearButton);
    gridContainer.appendChild(clearCell);
    
    // Add a back button at the end
    const backCell = document.createElement('div');
    backCell.className = 'grid-cell';
    const backButton = document.createElement('button');
    backButton.className = 'back-button';
            const infoText = `Course ${courseNumber} set: ${waypointsList} (${course.length_nm} nm)`;
            setInfoDisplayState(true, infoText);
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
                
                // Highlight the selected button
                highlightCourseButton(courseNumber);
            } else {
                setInfoDisplayState(false, 'No Active Course');
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
        
        const infoText = `Course ${courseNumber}: ${waypointsList}`;
        setInfoDisplayState(true, infoText);
    } else {
        document.getElementById('infoLabel').textContent = "Course information not found: " + courseNumber;
        resizeInfoLabel();
    }
}

////////// ////////// ////////// //////////
// Function to resize info label text to fit
////////// ////////// ////////// //////////
function resizeInfoLabel() {
    startInfoMarquee();
}

////////// ////////// ////////// //////////
// Function to animate info label marquee
////////// ////////// ////////// //////////
let infoMarqueeAnimation = null;

function startInfoMarquee() {
    const infoDisplay = document.getElementById('infoDisplay');
    const infoLabel = document.getElementById('infoLabel');

    if (!infoDisplay || !infoLabel) return;

    const rawText = infoLabel.dataset.rawText || infoLabel.textContent;
    if (!rawText) return;

    if (infoMarqueeAnimation) {
        infoMarqueeAnimation.cancel();
        infoMarqueeAnimation = null;
    }

    infoLabel.innerHTML = '';
    const track = document.createElement('span');
    track.className = 'marquee-track';

    const text1 = document.createElement('span');
    text1.className = 'marquee-text';
    text1.textContent = rawText;

    const spacer = document.createElement('span');
    spacer.className = 'marquee-spacer';
    spacer.textContent = ' ';

    const text2 = document.createElement('span');
    text2.className = 'marquee-text';
    text2.textContent = rawText;

    track.appendChild(text1);
    track.appendChild(spacer);
    track.appendChild(text2);
    infoLabel.appendChild(track);

    requestAnimationFrame(() => {
        const containerWidth = infoDisplay.clientWidth;
        const textWidth = text1.scrollWidth + spacer.scrollWidth;
        if (textWidth <= containerWidth) {
            track.style.transform = 'translateX(0)';
            return;
        }

        const startX = 0;
        const endX = -textWidth;
        const distance = Math.abs(endX - startX);
        const speed = 80; // pixels per second
        const duration = (distance / speed) * 1000;

        infoMarqueeAnimation = track.animate(
            [
                { transform: `translateX(${startX}px)` },
                { transform: `translateX(${endX}px)` }
            ],
            {
                duration,
                iterations: Infinity,
                easing: 'linear',
                fill: 'forwards'
            }
        );
    });
}

////////// ////////// ////////// //////////
// Function to update info display state
////////// ////////// ////////// //////////
function setInfoDisplayState(isActiveCourse, text) {
    const infoDisplay = document.getElementById('infoDisplay');
    const infoLabel = document.getElementById('infoLabel');

    if (infoDisplay) {
        infoDisplay.classList.toggle('info-active', Boolean(isActiveCourse));
        infoDisplay.classList.toggle('info-inactive', !isActiveCourse);
    }

    if (infoLabel && typeof text === 'string') {
        infoLabel.dataset.rawText = text;
        resizeInfoLabel();
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
    
    // Subscribe to active route changes via WebSocket
    // This will automatically highlight the active course when connection is established
    subscribeToActiveRoute();
    
    // Check initial active route state for Clear Course button
    checkActiveRoute();
});

// Re-run on window resize
window.addEventListener('resize', () => {
    resizeButtonText();
    resizeInfoLabel();
});

////////// ////////// ////////// //////////
// WebSocket connection for real-time updates
////////// ////////// ////////// //////////
let signalKWebSocket = null;

////////// ////////// ////////// //////////
// Function to subscribe to active route changes via WebSocket
////////// ////////// ////////// //////////
function subscribeToActiveRoute() {
    // Determine WebSocket URL (ws:// or wss:// based on current page protocol)
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/signalk/v1/stream?subscribe=none`;
    
    console.log('Connecting to SignalK WebSocket:', wsUrl);
    
    try {
        signalKWebSocket = new WebSocket(wsUrl);
        
        signalKWebSocket.onopen = function() {
            console.log('WebSocket connected to SignalK');
            
            // Subscribe to active route updates
            const subscription = {
                context: 'vessels.self',
                subscribe: [
                    {
                        path: 'navigation.course.activeRoute',
                        period: 1000  // Update every second if changes
                    }
                ]
            };
            
            signalKWebSocket.send(JSON.stringify(subscription));
            console.log('Subscribed to navigation.course.activeRoute');
        };
        
        signalKWebSocket.onmessage = function(event) {
            try {
                const data = JSON.parse(event.data);
                handleSignalKUpdate(data);
            } catch (e) {
                console.log('Error parsing WebSocket message:', e);
            }
        };
        
        signalKWebSocket.onerror = function(error) {
            console.log('WebSocket error:', error);
        };
        
        signalKWebSocket.onclose = function() {
            console.log('WebSocket connection closed, reconnecting in 5 seconds...');
            // Attempt to reconnect after 5 seconds
            setTimeout(subscribeToActiveRoute, 5000);
        };
        
    } catch (e) {
        console.log('Failed to create WebSocket connection:', e);
    }
}

////////// ////////// ////////// //////////
// Function to handle SignalK updates from WebSocket
////////// ////////// ////////// //////////
function handleSignalKUpdate(data) {
    // Check if this is an update to the active route
    if (data.updates) {
        data.updates.forEach(update => {
            if (update.values) {
                update.values.forEach(value => {
                    if (value.path === 'navigation.course.activeRoute') {
                        console.log('Active route changed:', value.value);
                        handleActiveRouteChange(value.value);
                    }
                });
            }
        });
    }
}

////////// ////////// ////////// //////////
// Function to handle active route changes
////////// ////////// ////////// //////////
function handleActiveRouteChange(activeRouteValue) {
    if (activeRouteValue && activeRouteValue.href) {
        const routeHref = activeRouteValue.href;
        console.log('New active route href:', routeHref);
        
        // Extract the route key from href
        const routeKey = routeHref.replace('/resources/routes/', '');
        
        // Fetch the route details and highlight
        fetchRouteNameAndHighlight(routeKey);
        
        // Enable the clear course button
        updateClearCourseButton(true);

        // Ensure info display shows active state
        setInfoDisplayState(true);
    } else {
        // Active route was cleared
        console.log('Active route cleared');
        
        // Remove all highlights
        const allButtons = document.querySelectorAll('button[data-course-number]');
        allButtons.forEach(btn => {
            btn.style.backgroundColor = '';
            btn.style.border = '';
        });
        
        // Update info label
        setInfoDisplayState(false, 'No Active Course');
        
        // Disable the clear course button
        updateClearCourseButton(false);
    }
}

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
    // First, remove highlight from all buttons
    const allButtons = document.querySelectorAll('button[data-course-number]');
    allButtons.forEach(btn => {
        btn.style.backgroundColor = '';
        btn.style.border = '';
    });
    
    // Find the button with matching course number
    const button = document.querySelector(`button[data-course-number="${courseNumber}"]`);
    
    if (button) {
        // Add a visual highlight to the button
        button.style.backgroundColor = '#4CAF50';
        button.style.border = '3px solid #2E7D32';
        
        // Scroll the button into view
        button.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        console.log("Course button highlighted:", courseNumber);
    } else {
        console.log("Button not found for course number:", courseNumber);
    }
}

////////// ////////// ////////// //////////
// Function to fetch route name and highlight button
////////// ////////// ////////// //////////
function fetchRouteNameAndHighlight(routeKey) {
    console.log('Fetching route details for key:', routeKey);
    
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
                        console.log('Course found in Wednesday courses, highlighting button');
                        // Highlight the button
                        highlightCourseButton(courseNumber);
                        
                        // Update the info label
                        setInfoDisplayState(true, `Active course: ${courseNumber}`);
                    } else {
                        console.log('Active course number not found in course list:', courseNumber);
                    }
                } else {
                    console.log('Could not extract course number from route name:', route.name);
                }
            } else {
                console.log('Route not found for key:', routeKey);
            }
        } else {
            console.log("Error fetching routes:", xhr.status);
        }
    };
    
    xhr.send();
}

////////// ////////// ////////// //////////
// Function to extract course number from route name
// Handles various naming formats:
// - "hyc-Wednesday-241" -> "241"
// - "HYC-Wed-021" -> "021"
// - "241" -> "241"
// - "Course 241" -> "241"
////////// ////////// ////////// //////////
function extractCourseNumber(routeName) {
    console.log('Attempting to extract course number from:', routeName);
    
    // Try to match "hyc-Wednesday-XXX" format (case insensitive)
    let match = routeName.match(/hyc-wednesday-(\d{3})/i);
    if (match) {
        console.log('Matched hyc-Wednesday pattern:', match[1]);
        return match[1];
    }
    
    // Try to match "HYC-Wed-XXX" format (case insensitive)
    match = routeName.match(/hyc-wed-(\d{3})/i);
    if (match) {
        console.log('Matched HYC-Wed pattern:', match[1]);
        return match[1];
    }
    
    // Try to match "Course XXX" format
    match = routeName.match(/course\s+(\d{3})/i);
    if (match) {
        console.log('Matched Course pattern:', match[1]);
        return match[1];
    }
    
    // Try to match just a 3-digit number
    match = routeName.match(/^(\d{3})$/);
    if (match) {
        console.log('Matched exact 3-digit pattern:', match[1]);
        return match[1];
    }
    
    // Try to match any 3-digit number in the name
    match = routeName.match(/(\d{3})/);
    if (match) {
        console.log('Matched any 3-digit pattern:', match[1]);
        return match[1];
    }
    
    console.log('No course number pattern matched');
    return null;
}

////////// ////////// ////////// //////////
// Function to update Clear Course button state
////////// ////////// ////////// //////////
function updateClearCourseButton(hasActiveRoute) {
    const clearButton = document.getElementById('clearCourseButton');
    if (clearButton) {
        clearButton.disabled = !hasActiveRoute;
        console.log('Clear Course button', hasActiveRoute ? 'enabled' : 'disabled');
    }
}

////////// ////////// ////////// //////////
// Function to clear the active route in SignalK
////////// ////////// ////////// //////////
function clearActiveRoute() {
    console.log('Clearing active route...');
    
    const url = "/signalk/v2/api/vessels/self/navigation/course";
    var xhr = new XMLHttpRequest();
    xhr.open("DELETE", url);
    xhr.setRequestHeader("Accept", "application/json");
    
    xhr.onload = function() {
        if (xhr.status === 200 || xhr.status === 204) {
            console.log('Active route cleared successfully');
            
            // Update UI
            setInfoDisplayState(false, 'No Active Course');
            
            // Remove all button highlights
            const allButtons = document.querySelectorAll('button[data-course-number]');
            allButtons.forEach(btn => {
                btn.style.backgroundColor = '';
                btn.style.border = '';
            });
            
            // Disable the clear button
            updateClearCourseButton(false);
        } else {
            console.error('Error clearing active route:', xhr.status, xhr.responseText);
            document.getElementById('infoLabel').textContent = 'Error clearing course';
            resizeInfoLabel();
        }
    };
    
    xhr.onerror = function() {
        console.error('Network error when clearing active route');
        document.getElementById('infoLabel').textContent = 'Network error: Unable to clear course';
        resizeInfoLabel();
    };
    
    xhr.send();
}

////////// ////////// ////////// //////////
// Function to check if there is an active route
////////// ////////// ////////// //////////
function checkActiveRoute() {
    const url = "/signalk/v2/api/vessels/self/navigation/course/activeRoute";
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.setRequestHeader("Content-Type", "application/json");
    
    xhr.onload = function() {
        if (xhr.status === 200) {
            try {
                const activeRoute = JSON.parse(xhr.responseText);
                const hasActiveRoute = activeRoute && activeRoute.href;
                updateClearCourseButton(hasActiveRoute);
                
                if (hasActiveRoute) {
                    console.log('Active route found on load:', activeRoute.href);
                    setInfoDisplayState(true);
                } else {
                    console.log('No active route on load');
                    setInfoDisplayState(false, 'No Active Course');
                }
            } catch (e) {
                console.log('Error parsing active route response:', e);
                updateClearCourseButton(false);
            }
        } else if (xhr.status === 404) {
            // No active route
            console.log('No active route (404)');
            updateClearCourseButton(false);
            setInfoDisplayState(false, 'No Active Course');
        } else {
            console.log('Error checking active route:', xhr.status);
            updateClearCourseButton(false);
        }
    };
    
    xhr.onerror = function() {
        console.log('Network error when checking active route');
        updateClearCourseButton(false);
    };
    
    xhr.send();
}
