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
    
    // Add a rename routes button
    const renameRoutesCell = document.createElement('div');
    renameRoutesCell.className = 'grid-cell';
    const renameRoutesButton = document.createElement('button');
    renameRoutesButton.className = 'back-button';
    renameRoutesButton.innerHTML = '<div class="course-number">RENAME ROUTES</div>';
    renameRoutesButton.addEventListener('click', () => {
        renameExistingRoutes();
    });
    renameRoutesCell.appendChild(renameRoutesButton);
    gridContainer.appendChild(renameRoutesCell);
    
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
    
    // First, fetch existing routes to use as a template
    const routesUrl = "/signalk/v2/api/resources/routes";
    var routesXhr = new XMLHttpRequest();
    routesXhr.open("GET", routesUrl);
    routesXhr.setRequestHeader("Content-Type", "application/json");
    
    routesXhr.onload = function() {
        if (routesXhr.status === 200) {
            var existingRoutes = JSON.parse(routesXhr.responseText);
            
            // Find a sample route (001, 002, or 003) to use as template
            let templateRoute = null;
            for (const [key, value] of Object.entries(existingRoutes)) {
                if (value.name === "001" || value.name === "002" || value.name === "003") {
                    templateRoute = value;
                    console.log("Using route template:", value.name, templateRoute);
                    break;
                }
            }
            
            // Now fetch waypoints
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
                            
                            if (key && signalKWaypoints[key]) {
                                const waypoint = signalKWaypoints[key];
                                
                                routePoints.push({
                                    href: "/resources/waypoints/" + key,
                                    waypoint: waypoint,
                                    key: key
                                });
                            } else {
                                console.error("Waypoint not found for course " + course.number + ": " + cleanLetter);
                                allWaypointsFound = false;
                                errors.push("Course " + course.number + ": waypoint " + cleanLetter + " not found");
                                break;
                            }
                        }
                        
                        if (allWaypointsFound) {
                            // Create the route in SignalK using template
                            createRouteInSignalK(course.number, routePoints, templateRoute, (success) => {
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
            
// Function to rename existing routes in SignalK
// Renames routes from "001" to "HYC-Wed-001" format
////////// ////////// ////////// //////////
function renameExistingRoutes() {
    document.getElementById('infoLabel').textContent = "Renaming routes...";
    resizeInfoLabel();
    
    // Fetch all existing routes from SignalK
    const routesUrl = "/signalk/v2/api/resources/routes";
    var xhr = new XMLHttpRequest();
    xhr.open("GET", routesUrl);
    xhr.setRequestHeader("Content-Type", "application/json");
    
    xhr.onload = function() {
        if (xhr.status === 200) {
            var existingRoutes = JSON.parse(xhr.responseText);
            
            let routesRenamed = 0;
            let routesTotal = 0;
            let errors = [];
            
            // Find routes that need renaming (numeric names like "001", "002", etc.)
            for (const [key, route] of Object.entries(existingRoutes)) {
                // Check if route name is a 3-digit number
                if (route.name && /^\d{3}$/.test(route.name)) {
                    routesTotal++;
                    
                    // Create new name with HYC-Wed- prefix
                    const newName = "HYC-Wed-" + route.name;
                    
                    // Update the route
                    updateRouteName(key, route, newName, (success) => {
                        if (success) {
                            routesRenamed++;
                            console.log("Renamed route " + route.name + " to " + newName);
                        } else {
                            errors.push("Failed to rename route " + route.name);
                        }
                        
                        // Update status after processing each route
                        if (routesRenamed + errors.length === routesTotal) {
                            // All routes processed
                            if (errors.length === 0) {
                                document.getElementById('infoLabel').textContent = 
                                    "Successfully renamed " + routesRenamed + " routes";
                            } else {
                                document.getElementById('infoLabel').textContent = 
                                    "Renamed " + routesRenamed + "/" + routesTotal + " routes. " + errors.length + " errors.";
                                console.error("Errors:", errors);
                            }
                            resizeInfoLabel();
                        }
                    });
                }
            }
            
            if (routesTotal === 0) {
                document.getElementById('infoLabel').textContent = "No routes found to rename";
                resizeInfoLabel();
            }
        } else {
            console.error("Error fetching routes: " + xhr.status);
            document.getElementById('infoLabel').textContent = "Error fetching routes from SignalK";
            resizeInfoLabel();
        }
    };
    
    xhr.send();
}

////////// ////////// ////////// //////////
// Function to update a route's name in SignalK
////////// ////////// ////////// //////////
function updateRouteName(routeId, route, newName, callback) {
    // Create updated route with new name
    const updatedRoute = JSON.parse(JSON.stringify(route));
    updatedRoute.name = newName;
    
    const url = "/signalk/v2/api/resources/routes/" + routeId;
    var xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", "application/json");
    
    xhr.onload = function() {
        if (xhr.status === 200 || xhr.status === 201) {
            callback(true);
        } else {
            console.error("Error renaming route " + route.name + ": " + xhr.status);
            console.error("Response:", xhr.responseText);
            callback(false);
        }
    };
    
    xhr.onerror = function() {
        console.error("Network error renaming route " + route.name);
        callback(false);
    };
    
    xhr.send(JSON.stringify(updatedRoute));
}

////////// ////////// ////////// //////////
            xhr.send();
        } else {
            console.error("Error fetching routes: " + routesXhr.status);
            document.getElementById('infoLabel').textContent = "Error fetching routes from SignalK";
            resizeInfoLabel();
        }
    };
    
    routesXhr.send();
}

////////// ////////// ////////// //////////
// Function to create a single route in SignalK
// Uses template route structure if provided
////////// ////////// ////////// //////////
function createRouteInSignalK(courseNumber, routePoints, templateRoute, callback) {
    // Generate a proper UUID for the route
    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    
    const routeId = generateUUID();
    
    // Build coordinates array from waypoints
    const coordinates = [];
    for (let pt of routePoints) {
        if (!pt.waypoint) {
            console.error("Missing waypoint in route point for course " + courseNumber);
            callback(false);
            return;
        }
        
        // Get position - it might be in different places
        let lon, lat;
        
        // Check if position is in feature.geometry.coordinates (GeoJSON format)
        if (pt.waypoint.feature && pt.waypoint.feature.geometry && pt.waypoint.feature.geometry.coordinates) {
            const coords = pt.waypoint.feature.geometry.coordinates;
            lon = coords[0];
            lat = coords[1];
        }
        // Check if position is nested in position property
        else if (pt.waypoint.position) {
            const pos = pt.waypoint.position;
            lon = pos.longitude !== undefined ? pos.longitude : pos.lon;
            lat = pos.latitude !== undefined ? pos.latitude : pos.lat;
        }
        // Check if lat/lon are directly on the waypoint
        else if (pt.waypoint.latitude !== undefined || pt.waypoint.lat !== undefined) {
            lon = pt.waypoint.longitude !== undefined ? pt.waypoint.longitude : pt.waypoint.lon;
            lat = pt.waypoint.latitude !== undefined ? pt.waypoint.latitude : pt.waypoint.lat;
        }
        else {
            console.error("Missing position in waypoint for course " + courseNumber, pt.waypoint);
            callback(false);
            return;
        }
        
        if (lon === undefined || lat === undefined) {
            console.error("Invalid position data for course " + courseNumber + ", waypoint:", pt.waypoint);
            callback(false);
            return;
        }
        coordinates.push([lon, lat]);
    }
    
    // Build route data using template structure if available
    let routeData;
    if (templateRoute) {
        // Use template structure - copy all properties from template
        routeData = JSON.parse(JSON.stringify(templateRoute));
        routeData.name = courseNumber;
        routeData.description = "Course " + courseNumber;
        routeData.feature.geometry.coordinates = coordinates;
        routeData.points = routePoints.map(pt => ({
            href: pt.href
        }));
    } else {
        // Fallback to basic structure
        routeData = {
            name: courseNumber,
            description: "Course " + courseNumber,
            feature: {
                type: "Feature",
                geometry: {
                    type: "LineString",
                    coordinates: coordinates
                },
                properties: {}
            },
            points: routePoints.map(pt => ({
                href: pt.href,
                type: "waypoint"
            }))
        };
    }
    
    const url = "/signalk/v2/api/resources/routes/" + routeId;
    
    console.log("Sending route data for course " + courseNumber + ":", JSON.stringify(routeData, null, 2));
    
    var xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", "application/json");
    
    xhr.onload = function() {
        if (xhr.status === 200 || xhr.status === 201) {
            console.log("Created course " + courseNumber);
            callback(true);
        } else {
            console.error("Error creating course " + courseNumber + ": " + xhr.status);
            console.error("Response:", xhr.responseText);
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
