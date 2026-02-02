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

function displayMarksInfo() {
    console.log("Reading marks from Wednesday data...");
    
    // Import Wednesday marks data
    import('./wednesday.js').then(module => {
        const marks = module.Wednesday.marks;
        
        // Get waypoints from SignalK
        const url = "/signalk/v2/api/resources/waypoints";
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onload = function() {
            if (xhr.status === 200) {
                var waypoints = JSON.parse(xhr.responseText);
                
                console.log("=== Marks Information and Updates ===");
                let updateCount = 0;
                let totalMarks = marks.length;
                let processedMarks = 0;
                
                marks.forEach(mark => {
                    console.log("Short Name: " + mark.shortName + ", Shape: " + mark.shape + ", Colour: " + mark.colour);
                    
                    // Find matching waypoint in SignalK
                    const waypointKey = getKeyForNamedWaypoint(waypoints, mark.shortName);
                    
                    if (waypointKey) {
                        console.log("  - Found waypoint href: " + waypointKey);
                        
                        // Prepare updated waypoint data
                        const updateUrl = "/signalk/v2/api/resources/waypoints/" + waypointKey;
                        
                        // Get existing waypoint data first
                        var getXhr = new XMLHttpRequest();
                        getXhr.open("GET", updateUrl);
                        getXhr.setRequestHeader("Content-Type", "application/json");
                        getXhr.onload = function() {
                            if (getXhr.status === 200) {
                                var waypointData = JSON.parse(getXhr.responseText);
                                
                                // Update the position with data from wednesday.js
                                waypointData.position = {
                                    latitude: parseFloat(mark.lat),
                                    longitude: parseFloat(mark.lon)
                                };
                                
                                console.log("  - Updating to lat: " + mark.lat + ", lon: " + mark.lon);
                                
                                // Send PUT request to update waypoint
                                var putXhr = new XMLHttpRequest();
                                putXhr.open("PUT", updateUrl);
                                putXhr.setRequestHeader("Content-Type", "application/json");
                                putXhr.onload = function() {
                                    processedMarks++;
                                    if (putXhr.status === 200 || putXhr.status === 204) {
                                        updateCount++;
                                        console.log("  - Successfully updated waypoint");
                                    } else {
                                        console.error("  - Failed to update. Status: " + putXhr.status + ", Response: " + putXhr.responseText);
                                    }
                                    
                                    if (processedMarks === totalMarks) {
                                        console.log("=== Update Complete: " + updateCount + " of " + totalMarks + " waypoints updated ===");
                                    }
                                };
                                putXhr.onerror = function() {
                                    processedMarks++;
                                    console.error("  - Network error during update");
                                };
                                putXhr.send(JSON.stringify(waypointData));
                            } else {
                                processedMarks++;
                                console.error("  - Failed to get waypoint data. Status: " + getXhr.status);
                            }
                        };
                        getXhr.onerror = function() {
                            processedMarks++;
                            console.error("  - Network error getting waypoint");
                        };
                        getXhr.send();
                    } else {
                        processedMarks++;
                        console.log("  - No matching waypoint found in SignalK");
                    }
                });
                
                console.log("=== Processing " + totalMarks + " marks ===");
            } else {
                console.error("Error fetching waypoints from SignalK: " + xhr.status);
            }
        };
        xhr.onerror = function() {
            console.error("Network error fetching waypoints");
        };
        xhr.send();
    }).catch(error => {
        console.error("Error importing Wednesday data:", error);
    });
}

function applyMarkColors() {
    // Import Wednesday marks data and apply colors to buttons
    import('./wednesday.js').then(module => {
        const marks = module.Wednesday.marks;
        const buttons = document.querySelectorAll('button');
        
        buttons.forEach(button => {
            // Skip updateWaypoints button
            if (button.id === 'updateWaypoints') {
                return;
            }
            
            // Get the mark name from the button
            const letterElement = button.querySelector('.letter');
            const markName = letterElement ? letterElement.textContent : button.querySelector('.name').textContent;
            
            // Find the matching mark in wednesday.js data
            const mark = marks.find(m => m.shortName === markName || m.longName === markName);
            
            if (mark && mark.colour) {
                // Change black to white for better visibility
                const color = mark.colour === 'black' ? 'white' : mark.colour;
                button.style.backgroundColor = color;
            }
        });
    }).catch(error => {
        console.error("Error importing Wednesday data for colors:", error);
    });
}

function setupButtonClickHandlers() {
    const buttons = document.querySelectorAll('button');
    
    buttons.forEach(button => {
        // Handle updateWaypoints button separately
        if (button.id === 'updateWaypoints') {
            button.addEventListener('click', () => {
                displayMarksInfo();
            });
            return;
        }
        
        const letterElement = button.querySelector('.letter');
        const letter = letterElement ? letterElement.textContent : button.querySelector('.name').textContent;
        
        button.addEventListener('click', () => {
            setMark(letter);
        });
    });
}

// Run on page load with a slight delay to ensure layout is complete
window.addEventListener('load', () => {
    setTimeout(resizeButtonText, 50);
    setupButtonClickHandlers();
    applyMarkColors();
});

// Re-run on window resize
window.addEventListener('resize', resizeButtonText);
