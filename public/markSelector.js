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
        
        console.log("=== Marks Information ===");
        marks.forEach(mark => {
            console.log("Short Name: " + mark.shortName + ", Shape: " + mark.shape + ", Colour: " + mark.colour);
        });
        console.log("=== End of Marks ===");
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
                button.style.backgroundColor = mark.colour;
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
