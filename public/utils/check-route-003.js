////////// ////////// ////////// //////////
// Check if specific route exists in SignalK
////////// ////////// ////////// //////////

const routeName = "HYC-Wed-003";
const routesUrl = "http://localhost:3000/signalk/v2/api/resources/routes";

console.log(`Checking for route: ${routeName}\n`);

fetch(routesUrl)
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(routes => {
    console.log(`Total routes in SignalK: ${Object.keys(routes).length}\n`);
    
    // Look for HYC-Wed-003
    let found = false;
    let routeData = null;
    let routeId = null;
    
    for (const [id, route] of Object.entries(routes)) {
      if (route.name === routeName) {
        found = true;
        routeId = id;
        routeData = route;
        break;
      }
    }
    
    if (found) {
      console.log(`✅ Found route: ${routeName}`);
      console.log(`   Route ID: ${routeId}`);
      console.log(`   Description: ${routeData.description || 'N/A'}`);
      console.log(`   Number of waypoints: ${routeData.points ? routeData.points.length : 0}`);
      
      if (routeData.points && routeData.points.length > 0) {
        console.log(`\n   Waypoint hrefs:`);
        routeData.points.forEach((point, idx) => {
          console.log(`     ${idx + 1}. ${point.href}`);
        });
      }
      
      console.log(`\n   Full route data:`);
      console.log(JSON.stringify(routeData, null, 2));
    } else {
      console.log(`❌ Route "${routeName}" NOT FOUND in SignalK`);
      
      // Show routes that start with HYC-Wed
      console.log(`\nRoutes starting with "HYC-Wed":`);
      const hycRoutes = Object.entries(routes)
        .filter(([id, route]) => route.name && route.name.startsWith('HYC-Wed'))
        .sort((a, b) => a[1].name.localeCompare(b[1].name));
      
      if (hycRoutes.length > 0) {
        hycRoutes.forEach(([id, route]) => {
          console.log(`  - ${route.name}`);
        });
      } else {
        console.log(`  (No HYC-Wed routes found)`);
      }
    }
  })
  .catch(error => {
    console.error('Error:', error.message);
    console.error('\nMake sure SignalK is running on http://localhost:3000');
  });
