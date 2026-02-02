////////// ////////// ////////// //////////
// SignalK Route Verification Script
// Compares SignalK routes with wednesday.js data
// Routes in SignalK should match wednesday.js MINUS the first waypoint (Z)
////////// ////////// ////////// //////////

import { Wednesday } from './wednesday.js';

// Function to convert waypoint array to string (removing asterisks for starboard marks)
function waypointsToString(waypoints) {
  return waypoints.map(wp => wp.replace('*', '')).join('');
}

// Function to extract waypoint names from SignalK route points
function extractWaypointsFromRoute(route) {
  if (!route.points || !Array.isArray(route.points)) {
    return null;
  }
  
  // Extract waypoint names from href paths
  // href format: "/resources/waypoints/{name}"
  const waypoints = route.points.map(point => {
    if (point.href) {
      const parts = point.href.split('/');
      return parts[parts.length - 1];
    }
    return null;
  }).filter(w => w !== null);
  
  return waypoints.join('');
}

// Fetch routes from SignalK
console.log('Fetching routes from SignalK...\n');

const routesUrl = "http://localhost:3000/signalk/v2/api/resources/routes";

fetch(routesUrl)
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(signalKRoutes => {
    console.log('========================================');
    console.log('SIGNALK ROUTE VERIFICATION REPORT');
    console.log('========================================\n');

    let totalChecked = 0;
    let matchCount = 0;
    let mismatchCount = 0;
    let notFoundCount = 0;
    let mismatches = [];

    // Find all HYC-Wed-XXX routes
    for (const [routeId, route] of Object.entries(signalKRoutes)) {
      // Check if route name matches HYC-Wed-XXX pattern
      const match = route.name && route.name.match(/^HYC-Wed-(\d{3})$/);
      
      if (!match) {
        continue; // Skip non-HYC-Wed routes
      }

      const courseNumber = match[1];
      totalChecked++;

      // Find corresponding course in wednesday.js
      const course = Wednesday.courses.find(c => c.number === courseNumber);

      if (!course) {
        console.log(`⚠️  Route ${route.name}: Course ${courseNumber} NOT FOUND in wednesday.js`);
        notFoundCount++;
        mismatches.push({
          route: route.name,
          issue: 'Course not found in wednesday.js'
        });
        continue;
      }

      // Get expected waypoints (remove first Z waypoint)
      const expectedWaypoints = course.waypoints.slice(1);
      const expectedString = waypointsToString(expectedWaypoints);

      // Get actual waypoints from SignalK route
      const actualString = extractWaypointsFromRoute(route);

      if (actualString === null) {
        console.log(`❌ Route ${route.name}: No waypoint data in SignalK route`);
        mismatchCount++;
        mismatches.push({
          route: route.name,
          course: courseNumber,
          issue: 'No waypoint data',
          expected: expectedString
        });
        continue;
      }

      if (actualString === expectedString) {
        console.log(`✅ Route ${route.name}: MATCH (${actualString})`);
        matchCount++;
      } else {
        console.log(`❌ Route ${route.name}: MISMATCH`);
        console.log(`   Expected (from wednesday.js): ${expectedString}`);
        console.log(`   Actual (in SignalK):          ${actualString}`);
        mismatchCount++;
        mismatches.push({
          route: route.name,
          course: courseNumber,
          expected: expectedString,
          actual: actualString
        });
      }
    }

    console.log('\n========================================');
    console.log('SUMMARY');
    console.log('========================================');
    console.log(`Total HYC-Wed routes checked: ${totalChecked}`);
    console.log(`Matches: ${matchCount}`);
    console.log(`Mismatches: ${mismatchCount}`);
    console.log(`Not found in wednesday.js: ${notFoundCount}`);

    if (mismatches.length > 0) {
      console.log('\n========================================');
      console.log('MISMATCHES DETAIL');
      console.log('========================================');
      mismatches.forEach(m => {
        console.log(`\nRoute: ${m.route}${m.course ? ` (Course ${m.course})` : ''}`);
        if (m.issue) {
          console.log(`  Issue: ${m.issue}`);
          if (m.expected) {
            console.log(`  Expected: ${m.expected}`);
          }
        } else {
          console.log(`  Expected: ${m.expected}`);
          console.log(`  Actual:   ${m.actual}`);
        }
      });
    }

    console.log('\n========================================\n');
  })
  .catch(error => {
    console.error('Error fetching routes from SignalK:', error.message);
    console.error('\nMake sure SignalK is running on http://localhost:3000');
  });
