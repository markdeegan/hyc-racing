////////// ////////// ////////// //////////
// Mark Deegan
// Mon Feb  2 01:29:27 GMT 2026
////////// ////////// ////////// //////////
// Mark Selector Script
// Accompanies index.html
// and is used to set waypoints in SignalK from buttons
////////// ////////// ////////// //////////
function resizeButtonText() {
    // function to resize text in buttons to fit within button width
    // get all buttons based on their class or tag
    const buttons = document.querySelectorAll('button');
    
    // For each button, adjust the font size of the 
    // .name span
    buttons.forEach(button => {
        // get the name span from the button
        const name = button.querySelector('.name');
        // if there is no name span, skip this
        if (!name) return;
        
        // Start with a reasonable size
        let fontSize = 50;
        // set the font size to 50px
        name.style.fontSize = fontSize + 'px';
        
        // Reduce font size until text fits within button width (accounting for padding)
        const maxWidth = button.clientWidth - 15;
        
        // Reduce font size until it fits
        // as long as the scrollWidth is greater than maxWidth
        // keep reducing font size
        while (name.scrollWidth > maxWidth && fontSize > 5) {
            fontSize -= 0.5;
            name.style.fontSize = fontSize + 'px';
        } // end while
    }); // end forEach
} // end resizeButtonText
////////// ////////// ////////// //////////


////////// ////////// ////////// //////////
// Function to set the mark as destination
// given the letter (shortName) of the mark
// Fetches waypoints from SignalK resources
// and sets the destination accordingly
// based on the letter provided by the button
// matching that of the waypoint name
// and then setting the destination using its href
////////// ////////// ////////// ////////// 
function setMark(letter) {
    // Debug log the letter received as a parametert
    console.log(letter);
    
    // Get all waypoints from resources provider
    const url = "/signalk/v2/api/resources/waypoints";
    // set up XMLHttpRequest to fetch waypoints
    var xhr = new XMLHttpRequest();
    // open GET request
    xhr.open("GET", url);
    // set content type
    xhr.setRequestHeader("Content-Type", "application/json");
    // onload function to process response
    xhr.onload = function() {
        if (xhr.status === 200) {
            var waypoints = JSON.parse(xhr.responseText);
            const key = getKeyForNamedWaypoint(waypoints, letter);
            if (key) {
                setDestinationFromHREF(key);
                displayMarkInfo(letter);
                highlightMarkButton(letter);
            } else {
                console.error("Waypoint not found for letter: " + letter);
                document.getElementById('infoLabel').textContent = "Waypoint not found: " + letter;
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

function displayMarkInfo(markName) {
    // Import Wednesday marks data to get mark details
    import('./wednesday.js').then(module => {
        const marks = module.Wednesday.marks;
        
        // Find the mark by shortName or longName
        const mark = marks.find(m => m.shortName === markName || m.longName === markName);
        
        if (mark) {
            // Capitalize first letter of colour
            const colour = mark.colour.charAt(0).toUpperCase() + mark.colour.slice(1);
            
            const infoText = mark.longName + " (" + mark.shortName + ") - " + colour;
            document.getElementById('infoLabel').textContent = infoText;
            resizeInfoLabel();
        } else {
            document.getElementById('infoLabel').textContent = "Mark information not found for: " + markName;
            resizeInfoLabel();
        }
    }).catch(error => {
        console.error("Error loading mark information:", error);
        document.getElementById('infoLabel').textContent = "Error loading mark information";
        resizeInfoLabel();
    });
}

function resizeInfoLabel() {
    const infoLabel = document.getElementById('infoLabel');
    if (!infoLabel || !infoLabel.textContent) return;
    
    // Always start fresh with a large font size
    let fontSize = 200;
    const containerWidth = infoLabel.clientWidth - 40; // Account for padding
    
    infoLabel.style.fontSize = fontSize + 'px';
    infoLabel.style.whiteSpace = 'nowrap';
    
    // Reduce font size until text fits within container width
    while (infoLabel.scrollWidth > containerWidth && fontSize > 5) {
        fontSize -= 1;
        infoLabel.style.fontSize = fontSize + 'px';
    }
    
    console.log('Final font size: ' + fontSize + 'px, scrollWidth: ' + infoLabel.scrollWidth + ', containerWidth: ' + containerWidth);
}

function applyMarkColors() {
    // Import Wednesday marks data and apply colors to buttons
    import('./wednesday.js').then(module => {
        const marks = module.Wednesday.marks;
        const buttons = document.querySelectorAll('button');
        
        buttons.forEach(button => {
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

function getKeyForFinishWaypoint(waypoints) {
    for (const [key, value] of Object.entries(waypoints)) {
        if (value.name === "F" || value.description === "F-FINISH") {
            return key;
        }
    }
    return null;
}

function updateFinishLocation() {
    console.log("Starting update of FINISH location...");
    // Get current boat position
    const positionUrl = "/signalk/v1/api/vessels/self/navigation/position";
    var xhr1 = new XMLHttpRequest();
    xhr1.open("GET", positionUrl);
    xhr1.setRequestHeader("Content-Type", "application/json");
    xhr1.onload = function() {
        console.log("Position response status:", xhr1.status);
        if (xhr1.status === 200) {
            var position = JSON.parse(xhr1.responseText);
            console.log("Position data:", position);
            if (position && position.value && position.value.latitude && position.value.longitude) {
                const latitude = position.value.latitude;
                const longitude = position.value.longitude;
                console.log("Boat position:", latitude, longitude);
                
                // Get all waypoints to find the F-Finish waypoint
                const waypointsUrl = "/signalk/v2/api/resources/waypoints";
                var xhr2 = new XMLHttpRequest();
                xhr2.open("GET", waypointsUrl);
                xhr2.setRequestHeader("Content-Type", "application/json");
                xhr2.onload = function() {
                    console.log("Waypoints response status:", xhr2.status);
                    if (xhr2.status === 200) {
                        var waypoints = JSON.parse(xhr2.responseText);
                        console.log("All waypoints:", waypoints);
                        const key = getKeyForFinishWaypoint(waypoints);
                        console.log("Found FINISH waypoint key:", key);
                        if (key) {
                            // Update the waypoint location
                            const updateUrl = "/signalk/v2/api/resources/waypoints/" + key;
                            const updatedWaypoint = {
                                ...waypoints[key],
                                position: {
                                    latitude: latitude,
                                    longitude: longitude
                                }
                            };
                            
                            console.log("Updating waypoint at:", updateUrl);
                            console.log("Updated waypoint data:", updatedWaypoint);
                            
                            var xhr3 = new XMLHttpRequest();
                            xhr3.open("PUT", updateUrl);
                            xhr3.setRequestHeader("Content-Type", "application/json");
                            xhr3.onload = function() {
                                console.log("Update response status:", xhr3.status);
                                console.log("Update response:", xhr3.responseText);
                                if (xhr3.status === 200 || xhr3.status === 204) {
                                    document.getElementById('infoLabel').textContent = "FINISH location updated";
                                    resizeInfoLabel();
                                } else {
                                    console.error("Error updating waypoint: " + xhr3.status);
                                    document.getElementById('infoLabel').textContent = "Error updating FINISH location";
                                    resizeInfoLabel();
                                }
                            };
                            xhr3.send(JSON.stringify(updatedWaypoint));
                        } else {
                            console.error("F-Finish waypoint not found");
                            document.getElementById('infoLabel').textContent = "F-Finish waypoint not found";
                            resizeInfoLabel();
                        }
                    } else {
                        console.error("Error fetching waypoints: " + xhr2.status);
                        document.getElementById('infoLabel').textContent = "Error fetching waypoints";
                        resizeInfoLabel();
                    }
                };
                xhr2.send();
            } else {
                console.error("Invalid position data");
                document.getElementById('infoLabel').textContent = "Invalid position data";
                resizeInfoLabel();
            }
        } else {
            console.error("Error fetching position: " + xhr1.status);
            document.getElementById('infoLabel').textContent = "Error fetching position";
            resizeInfoLabel();
        }
    };
    xhr1.send();
}

function setupButtonClickHandlers() {
    // Create Clear Waypoint button
    const clearCell = document.getElementById('clearWaypointCell');
    if (clearCell) {
        const clearButton = document.createElement('button');
        clearButton.id = 'clearWaypointButton';
        clearButton.className = 'clear-waypoint-button';
        clearButton.disabled = true;
        clearButton.innerHTML = '<span class="name">CLEAR<br>WAYPOINT</span>';
        clearButton.addEventListener('click', clearWaypoint);
        clearCell.appendChild(clearButton);
    }
    
    // Set up Back button handler
    const backButton = document.querySelector('.back-button');
    if (backButton) {
        backButton.addEventListener('click', () => window.location.href = 'index.html');
    }
    
    const buttons = document.querySelectorAll('button');
    
    buttons.forEach(button => {
        const letterElement = button.querySelector('.letter');
        const letter = letterElement ? letterElement.textContent : button.querySelector('.name').textContent;
        
        // Special handling for F-Finish button
        if (letter === 'F') {
            let pressTimer = null;
            let isLongPress = false;
            
            const startPress = () => {
                isLongPress = false;
                pressTimer = setTimeout(() => {
                    isLongPress = true;
                    updateFinishLocation();
                }, 2000); // 2 seconds
            };
            
            const cancelPress = () => {
                if (pressTimer) {
                    clearTimeout(pressTimer);
                    pressTimer = null;
                }
            };
            
            const handleRelease = () => {
                cancelPress();
                if (!isLongPress) {
                    // Normal click - set as destination
                    setMark(letter);
                }
            };
            
            // Mouse events
            button.addEventListener('mousedown', startPress);
            button.addEventListener('mouseup', handleRelease);
            button.addEventListener('mouseleave', cancelPress);
            
            // Touch events for mobile
            button.addEventListener('touchstart', (e) => {
                e.preventDefault();
                startPress();
            });
            button.addEventListener('touchend', (e) => {
                e.preventDefault();
                handleRelease();
            });
            button.addEventListener('touchcancel', cancelPress);
        } else {
            // Normal button handling for all other buttons
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
    applyMarkColors();
    checkActiveWaypoint();
    subscribeToActiveWaypoint();
});

// Re-run on window resize
window.addEventListener('resize', resizeButtonText);

////////// ////////// ////////// //////////
// Function to update Clear Waypoint button state
////////// ////////// ////////// //////////
function updateClearWaypointButton(hasActiveWaypoint) {
    const clearButton = document.getElementById('clearWaypointButton');
    if (clearButton) {
        clearButton.disabled = !hasActiveWaypoint;
        console.log('Clear Waypoint button', hasActiveWaypoint ? 'enabled' : 'disabled');
    }
}

////////// ////////// ////////// //////////
// Function to clear the active waypoint in SignalK
////////// ////////// ////////// //////////
function clearWaypoint() {
    console.log('Clearing active waypoint...');
    
    const url = "/signalk/v2/api/vessels/self/navigation/course";
    var xhr = new XMLHttpRequest();
    xhr.open("DELETE", url);
    xhr.setRequestHeader("Accept", "application/json");
    
    xhr.onload = function() {
        if (xhr.status === 200 || xhr.status === 204) {
            console.log('Active waypoint cleared successfully');
            
            // Update UI
            document.getElementById('infoLabel').textContent = 'Waypoint cleared';
            resizeInfoLabel();
            
            // Remove all button highlights
            removeAllMarkHighlights();
            
            // Disable the clear button
            updateClearWaypointButton(false);
        } else {
            console.error('Error clearing active waypoint:', xhr.status, xhr.responseText);
            document.getElementById('infoLabel').textContent = 'Error clearing waypoint';
            resizeInfoLabel();
        }
    };
    
    xhr.onerror = function() {
        console.error('Network error when clearing active waypoint');
        document.getElementById('infoLabel').textContent = 'Network error: Unable to clear waypoint';
        resizeInfoLabel();
    };
    
    xhr.send();
}

////////// ////////// ////////// //////////
// Function to check if there is an active waypoint
////////// ////////// ////////// //////////
function checkActiveWaypoint() {
    const url = "/signalk/v2/api/vessels/self/navigation/course/destination";
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.setRequestHeader("Content-Type", "application/json");
    
    xhr.onload = function() {
        if (xhr.status === 200) {
            try {
                const destination = JSON.parse(xhr.responseText);
                const hasActiveWaypoint = destination && destination.href;
                updateClearWaypointButton(hasActiveWaypoint);
                
                if (hasActiveWaypoint) {
                    console.log('Active waypoint found on load:', destination.href);
                } else {
                    console.log('No active waypoint on load');
                }
            } catch (e) {
                console.log('Error parsing destination response:', e);
                updateClearWaypointButton(false);
            }
        } else if (xhr.status === 404) {
            // No active waypoint
            console.log('No active waypoint (404)');
            updateClearWaypointButton(false);
        } else {
            console.log('Error checking active waypoint:', xhr.status);
            updateClearWaypointButton(false);
        }
    };
    
    xhr.onerror = function() {
        console.log('Network error when checking active waypoint');
        updateClearWaypointButton(false);
    };
    
    xhr.send();
}

////////// ////////// ////////// //////////
// WebSocket connection for real-time updates
////////// ////////// ////////// //////////
let signalKWebSocket = null;

////////// ////////// ////////// //////////
// Function to subscribe to active waypoint changes via WebSocket
////////// ////////// ////////// //////////
function subscribeToActiveWaypoint() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/signalk/v1/stream?subscribe=none`;
    
    console.log('Connecting to SignalK WebSocket:', wsUrl);
    
    try {
        signalKWebSocket = new WebSocket(wsUrl);
        
        signalKWebSocket.onopen = function() {
            console.log('WebSocket connected to SignalK');
            
            const subscription = {
                context: 'vessels.self',
                subscribe: [
                    {
                        path: 'navigation.course.destination',
                        period: 1000
                    }
                ]
            };
            
            signalKWebSocket.send(JSON.stringify(subscription));
            console.log('Subscribed to navigation.course.destination');
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
            setTimeout(subscribeToActiveWaypoint, 5000);
        };
        
    } catch (e) {
        console.log('Failed to create WebSocket connection:', e);
    }
}

////////// ////////// ////////// //////////
// Function to handle SignalK updates from WebSocket
////////// ////////// ////////// //////////
function handleSignalKUpdate(data) {
    if (data.updates) {
        data.updates.forEach(update => {
            if (update.values) {
                update.values.forEach(value => {
                    if (value.path === 'navigation.course.destination') {
                        console.log('Active waypoint changed:', value.value);
                        handleActiveWaypointChange(value.value);
                    }
                });
            }
        });
    }
}

////////// ////////// ////////// //////////
// Function to handle active waypoint changes
////////// ////////// ////////// //////////
function handleActiveWaypointChange(destinationValue) {
    if (destinationValue && destinationValue.href) {
        console.log('New active waypoint href:', destinationValue.href);
        updateClearWaypointButton(true);
        
        // Try to extract and highlight the mark from the href
        fetchWaypointAndHighlight(destinationValue.href);
    } else {
        console.log('Active waypoint cleared');
        updateClearWaypointButton(false);
        removeAllMarkHighlights();
    }
}

////////// ////////// ////////// //////////
// Function to highlight the selected mark button
////////// ////////// ////////// //////////
function highlightMarkButton(markLetter) {
    // First, remove highlight from all buttons
    removeAllMarkHighlights();
    
    // Find the button with matching letter
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        const letterElement = button.querySelector('.letter');
        const letter = letterElement ? letterElement.textContent : null;
        
        if (letter === markLetter) {
            // Add a visual highlight to the button
            button.style.border = '5px solid #2E7D32';
            button.style.boxShadow = '0 0 20px rgba(46, 125, 50, 0.8)';
            
            console.log('Mark button highlighted:', markLetter);
        }
    });
}

////////// ////////// ////////// //////////
// Function to remove all mark highlights
////////// ////////// ////////// //////////
function removeAllMarkHighlights() {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.style.border = '';
        button.style.boxShadow = '';
    });
}

////////// ////////// ////////// //////////
// Function to fetch waypoint details and highlight the corresponding mark
////////// ////////// ////////// //////////
function fetchWaypointAndHighlight(waypointHref) {
    const waypointKey = waypointHref.replace('/resources/waypoints/', '');
    const url = "/signalk/v2/api/resources/waypoints";
    
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.setRequestHeader("Content-Type", "application/json");
    
    xhr.onload = function() {
        if (xhr.status === 200) {
            var waypoints = JSON.parse(xhr.responseText);
            const waypoint = waypoints[waypointKey];
            
            if (waypoint && waypoint.name) {
                console.log('Active waypoint name:', waypoint.name);
                highlightMarkButton(waypoint.name);
            }
        }
    };
    
    xhr.send();
}
