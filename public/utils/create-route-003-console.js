// Paste this into the browser console to create route HYC-Wed-003
// This will create the route based on wednesday.js course 003 data

(async function createRoute003() {
  // Course 003 waypoints from wednesday.js (minus first Z waypoint)
  const courseNumber = "003";
  const waypointsNeeded = ["P", "W", "P", "W", "C", "P", "C"];
  
  // Generate UUID
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  
  console.log('Creating route HYC-Wed-003...\n');
  
  try {
    // 1. Fetch waypoints to get IDs
    console.log('Fetching waypoints from SignalK...');
    const waypointsResponse = await fetch('/signalk/v2/api/resources/waypoints');
    const waypoints = await waypointsResponse.json();
    
    // 2. Fetch existing routes to use as template
    console.log('Fetching routes for template...');
    const routesResponse = await fetch('/signalk/v2/api/resources/routes');
    const routes = await routesResponse.json();
    
    // Find a template route (001 or 002)
    let templateRoute = null;
    for (const [key, route] of Object.entries(routes)) {
      if (route.name === 'HYC-Wed-001' || route.name === 'HYC-Wed-002') {
        templateRoute = route;
        console.log(`Using template route: ${route.name}`);
        break;
      }
    }
    
    if (!templateRoute) {
      console.error('No template route found (need HYC-Wed-001 or HYC-Wed-002)');
      return;
    }
    
    // 3. Build waypoint points
    const routePoints = [];
    const coordinates = [];
    
    for (const waypointName of waypointsNeeded) {
      // Find waypoint by name
      let waypointId = null;
      let waypointData = null;
      
      for (const [id, wp] of Object.entries(waypoints)) {
        if (wp.name === waypointName) {
          waypointId = id;
          waypointData = wp;
          break;
        }
      }
      
      if (!waypointId) {
        console.error(`Waypoint ${waypointName} not found in SignalK`);
        return;
      }
      
      console.log(`  Found waypoint ${waypointName}: ${waypointId}`);
      
      routePoints.push({
        href: `/resources/waypoints/${waypointId}`
      });
      
      // Get coordinates
      if (waypointData.feature && waypointData.feature.geometry && waypointData.feature.geometry.coordinates) {
        const coords = waypointData.feature.geometry.coordinates;
        coordinates.push([coords[0], coords[1]]);
      } else if (waypointData.position) {
        const lon = waypointData.position.longitude || waypointData.position.lon;
        const lat = waypointData.position.latitude || waypointData.position.lat;
        coordinates.push([lon, lat]);
      }
    }
    
    // 4. Build route data using template structure
    const routeId = generateUUID();
    const routeData = JSON.parse(JSON.stringify(templateRoute)); // Deep copy
    routeData.name = "HYC-Wed-003";
    routeData.description = "Wednesday-003-PWPWCPC";
    routeData.feature.geometry.coordinates = coordinates;
    routeData.points = routePoints;
    
    console.log('\nRoute data to be created:');
    console.log(JSON.stringify(routeData, null, 2));
    
    // 5. Create the route
    console.log(`\nCreating route with ID: ${routeId}`);
    const createResponse = await fetch(`/signalk/v2/api/resources/routes/${routeId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(routeData)
    });
    
    if (createResponse.ok) {
      console.log('✅ Route HYC-Wed-003 created successfully!');
      console.log(`   Route ID: ${routeId}`);
      console.log(`   Waypoints: ${waypointsNeeded.join('')}`);
    } else {
      const errorText = await createResponse.text();
      console.error('❌ Error creating route:', createResponse.status);
      console.error('Response:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
})();
