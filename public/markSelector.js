function resizeButtonText() {
    const buttons = document.querySelectorAll('button');
    
    buttons.forEach(button => {
        const name = button.querySelector('.name');
        if (!name) return;
        
        // Start with a reasonable size
        let fontSize = 50;
        name.style.fontSize = fontSize + 'px';
        
        // Reduce font size until text fits within button width (accounting for padding)
        const maxWidth = button.clientWidth - 15;
        
        while (name.scrollWidth > maxWidth && fontSize > 5) {
            fontSize -= 0.5;
            name.style.fontSize = fontSize + 'px';
        }
    });
}

function setMark(letter) {
    console.log(letter);
    
    // Get waypoints from resources provider
    const url = "/signalk/v2/api/resources/waypoints";
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onload = function() {
        if (xhr.status === 200) {
            var waypoints = JSON.parse(xhr.responseText);
            const key = getKeyForNamedWaypoint(waypoints, letter);
            if (key) {
                setDestinationFromHREF(key);
            } else {
                console.error("Waypoint not found for letter: " + letter);
            }
        } else {
            console.error("Error fetching waypoints: " + xhr.status);
        }
    };
    xhr.send();
}

function getKeyForNamedWaypoint(obj, waypointName) {
    for (const [key, value] of Object.entries(obj)) {
        if (value.name === waypointName) {
            return key;
        }
    }
    return null; // Return null if no matching waypoint is found
}

function setDestinationFromHREF(href) {
    const url = "/signalk/v2/api/vessels/self/navigation/course/destination";
    var data = {
        href: "/resources/waypoints/" + href
    };
    console.log(data);
    var xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(data));
}

function updateWaypointsFromWednesday() {
    console.log("Updating waypoints from Wednesday data...");
    
    // Import Wednesday marks data
    import('./wednesday.js').then(module => {
        const wednesdayMarks = module.Wednesday.marks;
        
        // Get all current waypoints from SignalK
        const url = "/signalk/v2/api/resources/waypoints";
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onload = function() {
            if (xhr.status === 200) {
                var signalkWaypoints = JSON.parse(xhr.responseText);
                
                // Get all button names from the grid
                const buttons = document.querySelectorAll('.grid-container button');
                let updateCount = 0;
                let processedCount = 0;
                const totalButtons = buttons.length;
                
                buttons.forEach(button => {
                    // Get the waypoint name from button
                    const letterElement = button.querySelector('.letter');
                    const waypointName = letterElement ? letterElement.textContent : button.querySelector('.name').textContent;
                    
                    // Skip the updateWaypoints button itself
                    if (waypointName === 'updateWaypoints') {
                        processedCount++;
                        return;
                    }
                    
                    // Find matching mark in wednesday.js data
                    const wednesdayMark = wednesdayMarks.find(mark => mark.shortName === waypointName || mark.longName === waypointName);
                    
                    if (wednesdayMark) {
                        // Find matching waypoint in SignalK
                        const signalkKey = getKeyForNamedWaypoint(signalkWaypoints, waypointName);
                        
                        if (signalkKey) {
                            // Update the waypoint position
                            const updateUrl = "/signalk/v2/api/resources/waypoints/" + signalkKey;
                            const position = {
                                latitude: parseFloat(wednesdayMark.lat),
                                longitude: parseFloat(wednesdayMark.lon)
                            };
                            
                            var updateXhr = new XMLHttpRequest();
                            updateXhr.open("PUT", updateUrl);
                            updateXhr.setRequestHeader("Content-Type", "application/json");
                            updateXhr.onload = function() {
                                processedCount++;
                                if (updateXhr.status === 200) {
                                    updateCount++;
                                    console.log("Updated waypoint: " + waypointName + " to lat: " + position.latitude + ", lon: " + position.longitude);
                                } else {
                                    console.error("Failed to update waypoint: " + waypointName + " - Status: " + updateXhr.status);
                                }
                                
                                // Log completion when all updates are done
                                if (processedCount === totalButtons) {
                                    console.log("Waypoint update complete. Updated " + updateCount + " waypoints.");
                                    alert("Updated " + updateCount + " waypoints from Wednesday data.");
                                }
                            };
                            
                            // Get existing waypoint data and merge with new position
                            var getXhr = new XMLHttpRequest();
                            getXhr.open("GET", updateUrl);
                            getXhr.setRequestHeader("Content-Type", "application/json");
                            getXhr.onload = function() {
                                if (getXhr.status === 200) {
                                    var existingWaypoint = JSON.parse(getXhr.responseText);
                                    existingWaypoint.position = position;
                                    updateXhr.send(JSON.stringify(existingWaypoint));
                                } else {
                                    console.error("Failed to get existing waypoint data for: " + waypointName);
                                    processedCount++;
                                }
                            };
                            getXhr.send();
                        } else {
                            console.log("Waypoint not found in SignalK: " + waypointName);
                            processedCount++;
                        }
                    } else {
                        console.log("No Wednesday data found for: " + waypointName);
                        processedCount++;
                    }
                });
                
                // Handle case where no async updates were started
                if (processedCount === totalButtons) {
                    console.log("No waypoints needed updating.");
                }
            } else {
                console.error("Error fetching waypoints from SignalK: " + xhr.status);
            }
        };
        xhr.send();
    }).catch(error => {
        console.error("Error importing Wednesday data:", error);
    });
}

function setupButtonClickHandlers() {
    const buttons = document.querySelectorAll('button');
    
    buttons.forEach(button => {
        const letterElement = button.querySelector('.letter');
        const letter = letterElement ? letterElement.textContent : button.querySelector('.name').textContent;
        
        // Check if this is the updateWaypoints button
        if (button.id === 'updateWaypoints') {
            button.addEventListener('click', () => {
                updateWaypointsFromWednesday();
            });
        } else {
            button.addEventListener('click', () => {
                setMark(letter);
            });
        }
    });
}

// Run on page load with a slight delay to ensure layout is complete
window.addEventListener('load', () => {
    setTimeout(resizeButtonText, 50);
    setupButtonClickHandlers();
});

// Re-run on window resize
window.addEventListener('resize', resizeButtonText);
