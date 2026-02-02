////////// ////////// ////////// //////////
// Copyright (c) 2026 Mark Deegan        //
////////// ////////// ////////// //////////
/**
 *  @author Mark Deegan
 *  @version 1.0
 */
// Mark Deegan
// Tuesday class for the SW Dev JS client app
// Contains static data for Tuesday sail racing
////////// ////////// ////////// ///////////*

export class Tuesday 
  { // start declaration of the Tuesday class containing static data
    // and some supporting functions
    ////////// ////////// ////////// //////////
    // the following table indicates the courses available
    // marks in lower-case and followed with an asterisk (*) are to be left to starboard
    // all others are to be left to port
    // Marks coloured RED shall be rounded / passed to PORT
    // Marks coloured GREEN shall be rounded / passed to STARBOARD
    ////////// ////////// ////////// //////////
    static "courses"= 
    [
      {"number": "001", "waypoints": ["Z", "W", "I", "H", "I"],"length_nm": 5.4},
      {"number": "002", "waypoints": ["Z", "W", "I", "H", "I", "V"],"length_nm": 6.3},
      {"number": "003", "waypoints": ["Z", "W", "I", "H", "P", "W", "I", "V"],"length_nm": 7.9},
      {"number": "004", "waypoints": ["Z", "W", "C", "P", "W", "P", "C", "P", "W", "C"],"length_nm": 9.5},
      {"number": "021", "waypoints": ["Z", "W", "I", "H", "V"],"length_nm": 5.5},
      {"number": "022", "waypoints": ["Z", "W", "C", "H", "P", "C"],"length_nm": 6.3},
      {"number": "023", "waypoints": ["Z", "W", "C", "H", "C", "V", "C"],"length_nm": 7.0},
      {"number": "024", "waypoints": ["Z", "W", "C", "H", "C", "H", "C"],"length_nm": 9.2},
      {"number": "041", "waypoints": ["Z", "W", "C", "V", "W", "C"],"length_nm": 5.1},
      {"number": "042", "waypoints": ["Z", "W", "C", "H", "W", "C"],"length_nm": 6.3},
      {"number": "043", "waypoints": ["Z", "W", "C", "V", "W", "H", "W", "C"],"length_nm": 8.1},
      {"number": "044", "waypoints": ["Z", "W", "C", "H", "C", "V", "W", "V", "C"],"length_nm": 8.9},
      {"number": "061", "waypoints": ["Z", "V", "C", "V", "C", "V", "C"],"length_nm": 5.5},
      {"number": "062", "waypoints": ["Z", "W", "C", "O", "V"],"length_nm": 6.0},
      {"number": "063", "waypoints": ["Z", "W", "O", "W", "V", "C"],"length_nm": 7.7},
      {"number": "064", "waypoints": ["Z", "V", "W", "O", "V", "O", "W", "C"],"length_nm": 8.8},
      {"number": "081", "waypoints": ["Z", "V", "C", "D", "V", "C"],"length_nm": 5.1},
      {"number": "082", "waypoints": ["Z", "V", "C", "D", "V", "W", "C"],"length_nm": 5.8},
      {"number": "083", "waypoints": ["Z", "V", "W", "O", "W", "C"],"length_nm": 7.0},
      {"number": "084", "waypoints": ["Z", "V", "C", "D", "V", "W", "O", "V"],"length_nm": 8.6},
      {"number": "101", "waypoints": ["Z", "V", "W", "V", "W", "C"],"length_nm": 5.4},
      {"number": "102", "waypoints": ["Z", "D", "W", "D", "V"],"length_nm": 6.2},
      {"number": "103", "waypoints": ["Z", "V", "W", "D", "W", "I", "V"],"length_nm": 8.1},
      {"number": "104", "waypoints": ["Z", "D", "V", "W", "D", "W", "I", "V"],"length_nm": 9.1},
      {"number": "121", "waypoints": ["Z", "V", "W", "I", "V"],"length_nm": 4.9},
      {"number": "122", "waypoints": ["Z", "V", "W", "D", "V", "C"],"length_nm": 6.3},
      {"number": "123", "waypoints": ["Z", "O", "P", "V", "P", "W", "C"],"length_nm": 7.6},
      {"number": "124", "waypoints": ["Z", "V", "W", "D", "W", "D", "C"],"length_nm": 9.2},
      {"number": "141", "waypoints": ["Z", "D", "V", "D", "V", "C"],"length_nm": 5.4},
      {"number": "142", "waypoints": ["Z", "V", "P", "I", "V", "C"],"length_nm": 6.1},
      {"number": "143", "waypoints": ["Z", "H", "P", "D", "V", "W", "C"],"length_nm": 8.0},
      {"number": "144", "waypoints": ["Z", "V", "P", "I", "V", "W", "C", "V", "W"],"length_nm": 9.0},
      {"number": "161", "waypoints": ["Z", "I", "V", "P", "C"],"length_nm": 4.7},
      {"number": "162", "waypoints": ["Z", "V", "P", "I", "V", "W", "C"],"length_nm": 6.9},
      {"number": "163", "waypoints": ["Z", "D", "P", "C", "V", "P", "C"],"length_nm": 8.2},
      {"number": "164", "waypoints": ["Z", "V", "P", "C", "H", "D", "O", "V"],"length_nm": 9.1},
      {"number": "181", "waypoints": ["Z", "I", "H", "I", "V"],"length_nm": 5.5},
      {"number": "182", "waypoints": ["Z", "I", "P", "W", "I", "V"],"length_nm": 6.3},
      {"number": "183", "waypoints": ["Z", "V", "P", "W", "P", "C", "I", "V"],"length_nm": 7.7},
      {"number": "184", "waypoints": ["Z", "V", "P", "C", "I", "H", "I", "H", "V"],"length_nm": 9.6},
      {"number": "201", "waypoints": ["Z", "I", "P", "W", "V"],"length_nm": 5.2},
      {"number": "202", "waypoints": ["Z", "I", "P", "W", "V", "C", "I"],"length_nm": 6.3},
      {"number": "203", "waypoints": ["Z", "I", "V", "P", "W", "H", "C"],"length_nm": 7.2},
      {"number": "204", "waypoints": ["Z", "I", "H", "C", "O", "D", "O", "V", "I"],"length_nm": 8.8},
      {"number": "221", "waypoints": ["Z", "I", "V", "C", "V", "C"],"length_nm": 5.0},
      {"number": "222", "waypoints": ["Z", "I", "H", "C", "I", "V"],"length_nm": 6.2},
      {"number": "223", "waypoints": ["Z", "I", "H", "W", "I", "V", "C"],"length_nm": 7.5},
      {"number": "224", "waypoints": ["Z", "I", "H", "C", "V", "C", "V", "W", "C"],"length_nm": 8.5},
      {"number": "241", "waypoints": ["Z", "C", "O", "V", "C"],"length_nm": 5.3},
      {"number": "242", "waypoints": ["Z", "C", "V", "C", "H", "W", "C"],"length_nm": 6.8},
      {"number": "243", "waypoints": ["Z", "C", "O", "C", "O", "V"],"length_nm": 7.8},
      {"number": "244", "waypoints": ["Z", "C", "H", "W", "O", "C", "V"],"length_nm": 9.2},
      {"number": "261", "waypoints": ["Z", "C", "D", "V", "W", "C"],"length_nm": 5.1},
      {"number": "262", "waypoints": ["Z", "C", "I", "C", "I", "V", "W", "C"],"length_nm": 6.2},
      {"number": "263", "waypoints": ["Z", "C", "I", "O", "V", "O", "W", "C"],"length_nm": 7.9},
      {"number": "264", "waypoints": ["Z", "C", "I", "H", "P", "W", "O", "V", "C"],"length_nm": 8.7},
      {"number": "281", "waypoints": ["Z", "C", "D", "W", "C"],"length_nm": 5.3},
      {"number": "282", "waypoints": ["Z", "C", "I", "W", "I", "W", "C"],"length_nm": 7.0},
      {"number": "283", "waypoints": ["Z", "C", "I", "W", "C", "D", "W", "C"],"length_nm": 7.9},
      {"number": "284", "waypoints": ["Z", "C", "O", "P", "I", "W", "C"],"length_nm": 8.6},
      {"number": "301", "waypoints": ["Z", "C", "D", "W", "C"],"length_nm": 5.3},
      {"number": "302", "waypoints": ["Z", "C", "I", "W", "C", "W", "C"],"length_nm": 6.0},
      {"number": "303", "waypoints": ["Z", "C", "O", "P", "V", "P", "C"],"length_nm": 8.2},
      {"number": "304", "waypoints": ["Z", "C", "I", "O", "P", "V", "P", "I", "C"],"length_nm": 9.2},
      {"number": "321", "waypoints": ["Z", "C", "I", "V", "I", "V", "C"],"length_nm": 5.2},
      {"number": "322", "waypoints": ["Z", "W", "C", "I", "V", "I", "D", "V", "C"],"length_nm": 6.3},
      {"number": "323", "waypoints": ["Z", "C", "I", "V", "W", "C", "W", "C", "I", "V"],"length_nm": 7.4},
      {"number": "324", "waypoints": ["Z", "W", "I", "P", "W", "V", "P", "W", "C"],"length_nm": 8.7},
      {"number": "341", "waypoints": ["Z", "W", "C", "I", "V", "I", "V"],"length_nm": 5.4},
      {"number": "342", "waypoints": ["Z", "W", "C", "P", "C", "I", "V"],"length_nm": 6.7},
      {"number": "343", "waypoints": ["Z", "W", "C", "P", "W", "I", "V", "C"],"length_nm": 7.2},
      {"number": "344", "waypoints": ["Z", "W", "C", "P", "C", "D", "H", "P", "C"],"length_nm": 9.4}
    ]; // end of courses array
    ////////// ////////// ////////// //////////

    // Tuesday uses the same marks as Wednesday
    // Reference the Wednesday marks data if needed
    ////////// ////////// ////////// //////////
} // end Tuesday class
