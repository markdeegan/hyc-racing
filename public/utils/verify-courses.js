////////// ////////// ////////// //////////
// Course Verification Script
// Compares PDF course data with wednesday.js data
////////// ////////// ////////// //////////

// PDF data extracted from Wednesday Course Card
const pdfCourses = {
  "001": "ZWIHI",
  "002": "ZWCPWIV",
  "003": "ZPWPWCPC",
  "004": "ZCIHPCPWV",
  "021": "ZCHWC",
  "022": "ZWCHWC",
  "023": "ZWCHCVWC",
  "024": "ZWCHCHWC",
  "041": "ZCHPC",
  "042": "ZWCHPC",
  "043": "ZWCHCVWC",
  "044": "ZWCHCHPC",
  "061": "ZVWOV",
  "062": "ZWCOVC",
  "063": "ZHWCOVC",
  "064": "ZVWCOVOWC",
  "081": "ZVCDVC",
  "082": "ZVWCDWC",
  "083": "ZVWOVCDI",
  "084": "ZVCDVWOWC",
  "101": "ZVWIVW",
  "102": "ZVWDVWC",
  "103": "ZVWDWIV",
  "104": "ZHWDVWIV",
  "121": "ZVWIVC",
  "122": "ZVWIWVC",
  "123": "ZVPWDVPC",
  "124": "ZVWDVWIHW",
  "141": "ZIVWCW",
  "142": "ZVPIVW",
  "143": "ZVPVHWCW",
  "144": "ZVPIVIOW",
  "161": "ZVPCDI",
  "162": "ZPWCVPCI",
  "163": "ZHPCIPW",
  "164": "ZVPCHPCIV",
  "181": "ZVPWV",
  "182": "ZIVPWPWV",
  "183": "ZVPWUWCV",
  "184": "ZDUCOH",
  "201": "ZIHCIV",
  "202": "ZIHCH",
  "203": "ZIHCOH",
  "204": "ZIHCDPWIV",
  "221": "ZIVCDV",
  "222": "ZIHCIV",
  "223": "ZIHWDOV",
  "224": "ZIHWDHCV",
  "241": "ZCHWV",
  "242": "ZCHWO",
  "243": "ZCOHWO",
  "244": "ZCKHWO",
  "261": "ZIVWCV",
  "262": "ZCIHPWIV",
  "263": "ZCDOWIV",
  "264": "ZCDHPOV",
  "281": "ZCIWCI",
  "282": "ZCIWCDI",
  "283": "ZCDWCKI",
  "284": "ZCDWDCI",
  "301": "ZCIWCI",
  "302": "ZCKVWI",
  "303": "ZCKPWI",
  "304": "ZCGPCI",
  "321": "ZCDVCI",
  "322": "ZCDPCI",
  "323": "ZWOUWI",
  "324": "ZPWOUCI",
  "341": "ZWCPWI",
  "342": "ZWCDHCI",
  "343": "ZWKHWCI",
  "344": "ZWKUCI"
};

import { Wednesday } from './wednesday.js';

// Function to convert waypoint array to string (removing asterisks for starboard marks)
function waypointsToString(waypoints) {
  return waypoints.map(wp => wp.replace('*', '')).join('');
}

// Verify courses
console.log('========================================');
console.log('COURSE VERIFICATION REPORT');
console.log('========================================\n');

let totalChecked = 0;
let matchCount = 0;
let mismatchCount = 0;
let mismatches = [];

for (const [courseNum, pdfWaypoints] of Object.entries(pdfCourses)) {
  totalChecked++;
  
  const course = Wednesday.courses.find(c => c.number === courseNum);
  
  if (!course) {
    console.log(`❌ Course ${courseNum}: NOT FOUND in wednesday.js`);
    mismatchCount++;
    mismatches.push({
      course: courseNum,
      issue: 'Not found in wednesday.js',
      pdf: pdfWaypoints
    });
    continue;
  }
  
  const jsWaypoints = waypointsToString(course.waypoints);
  
  if (jsWaypoints === pdfWaypoints) {
    console.log(`✅ Course ${courseNum}: MATCH (${pdfWaypoints})`);
    matchCount++;
  } else {
    console.log(`❌ Course ${courseNum}: MISMATCH`);
    console.log(`   PDF:  ${pdfWaypoints}`);
    console.log(`   JS:   ${jsWaypoints}`);
    mismatchCount++;
    mismatches.push({
      course: courseNum,
      pdf: pdfWaypoints,
      js: jsWaypoints
    });
  }
}

console.log('\n========================================');
console.log('SUMMARY');
console.log('========================================');
console.log(`Total courses checked: ${totalChecked}`);
console.log(`Matches: ${matchCount}`);
console.log(`Mismatches: ${mismatchCount}`);

if (mismatches.length > 0) {
  console.log('\n========================================');
  console.log('MISMATCHES DETAIL');
  console.log('========================================');
  mismatches.forEach(m => {
    console.log(`\nCourse ${m.course}:`);
    if (m.issue) {
      console.log(`  Issue: ${m.issue}`);
      console.log(`  PDF waypoints: ${m.pdf}`);
    } else {
      console.log(`  PDF: ${m.pdf}`);
      console.log(`  JS:  ${m.js}`);
    }
  });
}

console.log('\n========================================\n');
