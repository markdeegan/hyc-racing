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
    // Get current boat position
    const positionUrl = "/signalk/v2/api/vessels/self/navigation/position/value";
    var xhr1 = new XMLHttpRequest();
    xhr1.open("GET", positionUrl);
    xhr1.setRequestHeader("Content-Type", "application/json");
    xhr1.onload = function() {
        if (xhr1.status === 200) {
            var position = JSON.parse(xhr1.responseText);
            if (position && position.latitude && position.longitude) {
                const latitude = position.latitude;
                const longitude = position.longitude;
                
                // Get all waypoints to find the F-Finish waypoint
                const waypointsUrl = "/signalk/v2/api/resources/waypoints";
                var xhr2 = new XMLHttpRequest();
                xhr2.open("GET", waypointsUrl);
                xhr2.setRequestHeader("Content-Type", "application/json");
                xhr2.onload = function() {
                    if (xhr2.status === 200) {
                        var waypoints = JSON.parse(xhr2.responseText);
                        const key = getKeyForFinishWaypoint(waypoints);
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
                            
                            var xhr3 = new XMLHttpRequest();
                            xhr3.open("PUT", updateUrl);
                            xhr3.setRequestHeader("Content-Type", "application/json");
                            xhr3.onload = function() {
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
});

// Re-run on window resize
window.addEventListener('resize', resizeButtonText);
