////////// ////////// ////////// //////////
// Copyright (c) 2026 Mark Deegan        //
////////// ////////// ////////// //////////
/**
 *  @author Mark Deegan
 *  @version 1.0
 */
// Route Management Module
// Functions for creating and managing routes in SignalK
////////// ////////// ////////// //////////

////////// ////////// ////////// //////////
// Function to rename existing routes in SignalK
// Renames routes from "001" to "HYC-Wed-001" format
////////// ////////// ////////// //////////
export function renameExistingRoutes(infoLabelCallback, resizeInfoLabelCallback) {
    infoLabelCallback("Renaming routes...");
    resizeInfoLabelCallback();
    
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
                                infoLabelCallback("Successfully renamed " + routesRenamed + " routes");
                            } else {
                                infoLabelCallback("Renamed " + routesRenamed + "/" + routesTotal + " routes. " + errors.length + " errors.");
                                console.error("Errors:", errors);
                            }
                            resizeInfoLabelCallback();
                        }
                    });
                }
            }
            
            if (routesTotal === 0) {
                infoLabelCallback("No routes found to rename");
                resizeInfoLabelCallback();
            }
        } else {
            console.error("Error fetching routes: " + xhr.status);
            infoLabelCallback("Error fetching routes from SignalK");
            resizeInfoLabelCallback();
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
// Function to create all courses in SignalK
// Reads courses from wednesday.js and creates routes
// Omits the first waypoint (Z - start line) from each route
////////// ////////// ////////// //////////
export function createAllCourses(validCourses, getKeyForNamedWaypointFunc, infoLabelCallback, resizeInfoLabelCallback) {
    infoLabelCallback("Creating courses...");
    resizeInfoLabelCallback();
    
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
                            const key = getKeyForNamedWaypointFunc(signalKWaypoints, cleanLetter);
                            
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
                                        infoLabelCallback("Successfully created " + coursesCreated + " courses in SignalK");
                                    } else {
                                        infoLabelCallback("Created " + coursesCreated + "/" + coursesTotal + " courses. " + errors.length + " errors.");
                                        console.error("Errors:", errors);
                                    }
                                    resizeInfoLabelCallback();
                                }
                            });
                        }
                    });
                } else {
                    console.error("Error fetching waypoints: " + xhr.status);
                    infoLabelCallback("Error fetching waypoints from SignalK");
                    resizeInfoLabelCallback();
                }
            };

            xhr.send();
        } else {
            console.error("Error fetching routes: " + routesXhr.status);
            infoLabelCallback("Error fetching routes from SignalK");
            resizeInfoLabelCallback();
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
