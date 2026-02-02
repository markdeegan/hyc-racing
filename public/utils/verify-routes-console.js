// Paste this into the browser console to verify HYC-Wed routes match wednesday.js
// Make sure you're on a page that has access to SignalK API (like courseSelector.html)

(async function verifyRoutes() {
  console.log('========================================');
  console.log('SIGNALK ROUTE VERIFICATION');
  console.log('========================================\n');
  
  try {
    // Import Wednesday data
    const { Wednesday } = await import('./wednesday.js');
    console.log(`Loaded ${Wednesday.courses.length} courses from wednesday.js\n`);
    
    // Fetch waypoints from SignalK
    console.log('Fetching waypoints from SignalK...');
    const waypointsResponse = await fetch('/signalk/v2/api/resources/waypoints');
    const waypoints = await waypointsResponse.json();
    console.log(`Loaded ${Object.keys(waypoints).length} waypoints\n`);
    
    // Fetch routes from SignalK
    console.log('Fetching routes from SignalK...');
    const routesResponse = await fetch('/signalk/v2/api/resources/routes');
    const routes = await routesResponse.json();
    console.log(`Loaded ${Object.keys(routes).length} routes\n`);
    
    console.log('========================================');
    console.log('CHECKING HYC-Wed-XXX ROUTES');
    console.log('========================================\n');
    
    let totalChecked = 0;
    let matchCount = 0;
    let mismatchCount = 0;
    const mismatches = [];
    
    // Check each HYC-Wed route
    for (const [routeId, route] of Object.entries(routes)) {
      const match = route.name && route.name.match(/^HYC-Wed-(\d{3})$/);
      if (!match) continue;
      
      const courseNumber = match[1];
      totalChecked++;
      
      // Find course in wednesday.js
      const course = Wednesday.courses.find(c => c.number === courseNumber);
      
      if (!course) {
        console.log(`⚠️  Route ${route.name}: Course ${courseNumber} not found in wednesday.js`);
        mismatchCount++;
        mismatches.push({
          route: route.name,
          issue: 'Course not found in wednesday.js'
        });
        continue;
      }
      
      // Expected waypoints (remove first Z)
      const expectedWaypoints = course.waypoints.slice(1).map(wp => wp.replace('*', ''));
      const expectedString = expectedWaypoints.join('');
      
      // Get actual waypoints from route
      const actualWaypoints = [];
      if (route.points && Array.isArray(route.points)) {
        for (const point of route.points) {
          if (point.href) {
            const parts = point.href.split('/');
            const waypointId = parts[parts.length - 1];
            
            if (waypoints[waypointId] && waypoints[waypointId].name) {
              actualWaypoints.push(waypoints[waypointId].name);
            } else {
              actualWaypoints.push(`?${waypointId}?`);
            }
          }
        }
      }
      
      const actualString = actualWaypoints.join('');
      
      if (!actualString) {
        console.log(`❌ Route ${route.name}: No waypoint data`);
        mismatchCount++;
        mismatches.push({
          route: route.name,
          course: courseNumber,
          issue: 'No waypoint data',
          expected: expectedString
        });
        continue;
      }
      
      // Compare
      if (actualString === expectedString) {
        console.log(`✅ ${route.name}: MATCH (${actualString})`);
        matchCount++;
      } else {
        console.log(`❌ ${route.name}: MISMATCH`);
        console.log(`   Expected: ${expectedString} [${expectedWaypoints.join(', ')}]`);
        console.log(`   Actual:   ${actualString} [${actualWaypoints.join(', ')}]`);
        mismatchCount++;
        mismatches.push({
          route: route.name,
          course: courseNumber,
          expected: expectedString,
          expectedArray: expectedWaypoints,
          actual: actualString,
          actualArray: actualWaypoints
        });
      }
    }
    
    // Summary
    console.log('\n========================================');
    console.log('SUMMARY');
    console.log('========================================');
    console.log(`Total HYC-Wed routes checked: ${totalChecked}`);
    console.log(`✅ Matches: ${matchCount}`);
    console.log(`❌ Mismatches: ${mismatchCount}`);
    
    // Detailed mismatches
    if (mismatches.length > 0) {
      console.log('\n========================================');
      console.log('MISMATCH DETAILS');
      console.log('========================================');
      mismatches.forEach(m => {
        console.log(`\n${m.route}${m.course ? ` (Course ${m.course})` : ''}`);
        if (m.issue) {
          console.log(`  Issue: ${m.issue}`);
          if (m.expected) console.log(`  Expected: ${m.expected}`);
        } else {
          console.log(`  Expected: ${m.expected}`);
          console.log(`  Actual:   ${m.actual}`);
          if (m.expectedArray) {
            console.log(`  Expected waypoints: [${m.expectedArray.join(', ')}]`);
            console.log(`  Actual waypoints:   [${m.actualArray.join(', ')}]`);
          }
        }
      });
    }
    
    console.log('\n========================================\n');
    
    if (mismatchCount === 0) {
      console.log('🎉 All routes verified successfully!');
    } else {
      console.log(`⚠️  ${mismatchCount} route(s) need attention. See details above.`);
    }
    
  } catch (error) {
    console.error('❌ Error during verification:', error);
  }
})();
