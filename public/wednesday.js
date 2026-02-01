////////// ////////// ////////// //////////
// Copyright (c) 2026 Mark Deegan        //
////////// ////////// ////////// //////////
/**
 *  @author Mark Deegan
 *  @version 1.0
 */
// Mark Deegan
// Wednesday class for the SW Dev JS client app
// Contains static data for Wednesday sail racing
////////// ////////// ////////// ///////////*

export class Wednesday 
  { // start declaration of the Wednesday class containing static data
    // and some supporting functions
    ////////// ////////// ////////// //////////
    // the following table indicates the courses available
    // marks in lower-case and followed wiht an asterisk (*) are to be left to starboard
    // all others are to be left to port
    // courses containing only "1", "2, "3" are placeholder courses
    // and should be replaced with actual courses as required
    // Courses containing marks to be rounded to starboard are as follows:
    // 181, 182, 183
    // 241, 242, 243, 244
    // Course 0 also contains a starboard rounding mark 
    // but that is only for use as a special course
    // for testing the system
    ////////// ////////// ////////// //////////
    static "courses"= 
    [
      {"number": "000", "waypoints": ["N", "o*", "R", "o*", "U", "t*", "E"],"length_nm": 99},
      {"number": "001", "waypoints": ["Z", "W", "I", "H", "I"],"length_nm": 5.4},
      {"number": "002", "waypoints": ["Z", "W", "C", "P", "W", "I", "V"],"length_nm": 6.6},
      {"number": "003", "waypoints": ["Z", "P", "W", "P", "W", "C", "P", "C"],"length_nm": 7.3},
      {"number": "004", "waypoints": ["Z", "C", "I", "H", "P", "C", "P", "W", "V"],"length_nm": 9.3},
      {"number": "021", "waypoints": ["Z", "C", "H", "W", "C"],"length_nm": 5.3},
      {"number": "022", "waypoints": ["Z", "W", "C", "H", "W", "C"],"length_nm": 6.4},
      {"number": "023", "waypoints": ["Z", "W", "C", "H", "C", "V", "W", "C"],"length_nm": 7.8},
      {"number": "024", "waypoints": ["Z", "W", "C", "H", "C", "H", "W", "C"],"length_nm": 9.3},
      {"number": "041", "waypoints": ["Z", "C", "H", "P", "C"],"length_nm": 6},
      {"number": "042", "waypoints": ["Z", "W", "C", "H", "P", "C"],"length_nm": 6.8},
      {"number": "043", "waypoints": ["Z", "W", "C", "H", "C", "V", "W", "C"],"length_nm": 8.2},
      {"number": "044", "waypoints": ["Z", "W", "C", "H", "C", "H", "P", "C"],"length_nm": 9.6},
      {"number": "061", "waypoints": ["Z", "V", "W", "O", "V"],"length_nm": 6.1},
      {"number": "062", "waypoints": ["Z", "W", "C", "O", "V", "C"],"length_nm": 6.5},
      {"number": "063", "waypoints": ["Z", "H", "W", "C", "O", "V", "C"],"length_nm": 7.4},
      {"number": "064", "waypoints": ["Z", "V", "W", "C", "O", "V", "O", "W", "C"],"length_nm": 9.2},
      {"number": "081", "waypoints": ["Z", "V", "C", "D", "V", "C"],"length_nm": 5.3},
      {"number": "082", "waypoints": ["Z", "V", "W", "C", "D", "W", "C"],"length_nm": 6.6},
      {"number": "083", "waypoints": ["Z", "V", "W", "O", "V", "C", "D", "I"],"length_nm": 7.9},
      {"number": "084", "waypoints": ["Z", "V", "C", "D", "V", "W", "O", "W", "C"],"length_nm": 9.8},
      {"number": "101", "waypoints": ["Z", "V", "W", "I", "V", "W"],"length_nm": 6},
      {"number": "102", "waypoints": ["Z", "V", "W", "D", "V", "W", "C"],"length_nm": 6.7},
      {"number": "103", "waypoints": ["Z", "V", "W", "D", "W", "I", "V"],"length_nm": 8.2},
      {"number": "104", "waypoints": ["Z", "H", "W", "D", "V", "W", "I", "V"],"length_nm": 9.2},
      {"number": "121", "waypoints": ["Z", "V", "W", "I", "V", "C"],"length_nm": 5.7},
      {"number": "122", "waypoints": ["Z", "V", "W", "I", "W", "V", "C"],"length_nm": 7.1},
      {"number": "123", "waypoints": ["Z", "V", "P", "W", "D", "V", "P", "C"],"length_nm": 8.2},
      {"number": "124", "waypoints": ["Z", "V", "W", "D", "V", "W", "I", "H", "W"],"length_nm": 9.5},
      {"number": "141", "waypoints": ["Z", "I", "V", "W", "C", "W"],"length_nm": 5.3},
      {"number": "142", "waypoints": ["Z", "V", "P", "I", "V", "W"],"length_nm": 7},
      {"number": "143", "waypoints": ["Z", "V", "P", "V", "H", "W", "C", "W"],"length_nm": 8.2},
      {"number": "144", "waypoints": ["Z", "V", "P", "I", "V", "I", "O", "W"],"length_nm": 9.4},
      {"number": "161", "waypoints": ["Z", "V", "P", "C", "D", "I"],"length_nm": 5.5},
      {"number": "162", "waypoints": ["Z", "P", "W", "C", "V", "P", "C", "I"],"length_nm": 7},
      {"number": "163", "waypoints": ["Z", "H", "P", "C", "I", "P", "W"],"length_nm": 8.4},
      {"number": "164", "waypoints": ["Z", "V", "P", "C", "H", "P", "C", "I", "V"],"length_nm": 9.6},
      {"number": "181", "waypoints": ["Z", "V", "P", "W", "V*"],"length_nm": 5.2},
      {"number": "182", "waypoints": ["Z", "I", "V", "P", "W", "P", "W", "V*"],"length_nm": 6.1},
      {"number": "183", "waypoints": ["Z", "V", "P", "W", "U", "W", "C", "V*"],"length_nm": 7.6},
      {"number": "184", "waypoints": ["Z", "D", "U", "C", "O", "H"],"length_nm": 8.6},
      {"number": "201", "waypoints": ["Z", "I", "H", "C", "I", "V"],"length_nm": 5.3},
      {"number": "202", "waypoints": ["Z", "I", "H", "C", "H"],"length_nm": 6.3},
      {"number": "203", "waypoints": ["Z", "I", "H", "C", "O", "H"],"length_nm": 7.6},
      {"number": "204", "waypoints": ["Z", "I", "H", "C", "D", "P", "W", "I", "V"],"length_nm": 9},
      {"number": "221", "waypoints": ["Z", "I", "V", "C", "D", "V"],"length_nm": 5},
      {"number": "222", "waypoints": ["Z", "I", "H", "C", "I", "V"],"length_nm": 6},
      {"number": "223", "waypoints": ["Z", "I", "H", "W", "D", "O", "V"],"length_nm": 7.1},
      {"number": "224", "waypoints": ["Z", "I", "H", "W", "D", "H", "C", "V"],"length_nm": 9},
      {"number": "241", "waypoints": ["Z", "C", "H", "W", "V*"],"length_nm": 5.5},
      {"number": "242", "waypoints": ["Z", "C", "H", "W", "O*"],"length_nm": 6.8},
      {"number": "243", "waypoints": ["Z", "C", "O", "H", "W", "O*"],"length_nm": 7.6},
      {"number": "244", "waypoints": ["Z", "C", "K", "H", "W", "O*"],"length_nm": 8.6},
      {"number": "261", "waypoints": ["Z", "I", "V", "W", "C", "V"],"length_nm": 5.2},
      {"number": "262", "waypoints": ["Z", "C", "I", "H", "P", "W", "I", "V"],"length_nm": 6.8},
      {"number": "263", "waypoints": ["Z", "C", "D", "O", "W", "I", "V"],"length_nm": 7.3},
      {"number": "264", "waypoints": ["Z", "C", "D", "H", "P", "O", "V"],"length_nm": 8.6},
      {"number": "281", "waypoints": ["Z", "C", "I", "W", "C", "I"],"length_nm": 5.1},
      {"number": "282", "waypoints": ["Z", "C", "I", "W", "C", "D", "I"],"length_nm": 6},
      {"number": "283", "waypoints": ["Z", "C", "D", "W", "C", "K", "I"],"length_nm": 7.7},
      {"number": "284", "waypoints": ["Z", "C", "D", "W", "D", "C", "I"],"length_nm": 9.2},
      {"number": "301", "waypoints": ["Z", "C", "I", "W", "C", "I"],"length_nm": 5.1},
      {"number": "302", "waypoints": ["Z", "C", "K", "V", "W", "I"],"length_nm": 6.6},
      {"number": "303", "waypoints": ["Z", "C", "K", "P", "W", "I"],"length_nm": 7.7},
      {"number": "304", "waypoints": ["Z", "C", "G", "P", "C", "I"],"length_nm": 8.5},
      {"number": "321", "waypoints": ["Z", "C", "D", "V", "C", "I"],"length_nm": 5.2},
      {"number": "322", "waypoints": ["Z", "C", "D", "P", "C", "I"],"length_nm": 6.8},
      {"number": "323", "waypoints": ["Z", "W", "O", "U", "W", "I"],"length_nm": 7.7},
      {"number": "324", "waypoints": ["Z", "P", "W", "O", "U", "C", "I"],"length_nm": 8.6},
      {"number": "341", "waypoints": ["Z", "W", "C", "P", "W", "I"],"length_nm": 5.3},
      {"number": "342", "waypoints": ["Z", "W", "C", "D", "H", "C", "I"],"length_nm": 6.9},
      {"number": "343", "waypoints": ["Z", "W", "K", "H", "W", "C", "I"],"length_nm": 8.2},
      {"number": "344", "waypoints": ["Z", "W", "K", "U", "C", "I"],"length_nm": 9},
      {"number": "401", "waypoints": ["1", "2", "3"],"length_nm": 99},
      {"number": "402", "waypoints": ["1", "2", "3", "1", "3"],"length_nm": 99},
      {"number": "403", "waypoints": ["1", "2", "3", "1", "3", "1", "2", "3"],"length_nm": 99},
      {"number": "404", "waypoints": ["1", "2", "3", "1", "3", "1", "2", "3", "1", "3"],"length_nm": 99},
      {"number": "501", "waypoints": ["1", "2", "3"],"length_nm": 99},
      {"number": "502", "waypoints": ["1", "2", "3", "1", "2", "3"],"length_nm": 99},
      {"number": "503", "waypoints": ["1", "2", "3", "1", "2", "3", "1", "2", "3"],"length_nm": 99},
      {"number": "504", "waypoints": ["1", "2", "3", "1", "2", "3", "1", "2", "3", "1", "2", "3"],"length_nm": 99}
    ]; // end of courses array
    ////////// ////////// ////////// //////////

    ////////// ////////// ////////// //////////
    static marks = 
    [ // start of marks array
      {
      "shortName": "A",
      "longName": "Apex",
      "shape": "Conical",
      "colour": "black",
      "latDeg": "53",
      "latMin": "26.76",
      "NS": "N",
      "lonDeg": "6",
      "lonMin": "03.26",
      "EW": "W",
      "lat": "53.446",
      "lon": "-6.0543"
    },
    {
      "shortName": "B",
      "longName": "Balscadden",
      "shape": "Conical",
      "colour": "orange",
      "latDeg": "53",
      "latMin": "23.30",
      "NS": "N",
      "lonDeg": "6",
      "lonMin": "03.26",
      "EW": "W",
      "lat": "53.3883",
      "lon": "-6.0543"
    },
    {
      "shortName": "C",
      "longName": "Cush",
      "shape": "Conical",
      "colour": "black",
      "latDeg": "53",
      "latMin": "24.61",
      "NS": "N",
      "lonDeg": "6",
      "lonMin": "05.45",
      "EW": "W",
      "lat": "53.4101",
      "lon": "-6.0908"
    },
    {
      "shortName": "D",
      "longName": "Dunbo",
      "shape": "Conical",
      "colour": "yellow",
      "latDeg": "53",
      "latMin": "24.73",
      "NS": "N",
      "lonDeg": "6",
      "lonMin": "03.85",
      "EW": "W",
      "lat": "53.4121",
      "lon": "-6.0641"
    },
    {
      "shortName": "E",
      "longName": "East",
      "shape": "Conical",
      "colour": "black",
      "latDeg": "53",
      "latMin": "26.00",
      "NS": "N",
      "lonDeg": "6",
      "lonMin": "02.20",
      "EW": "W",
      "lat": "53.4333",
      "lon": "-6.0366"
    },
    {
      "shortName": "F",
      "longName": "Finish",
      "shape": "Cherry",
      "colour": "orange",
      "latDeg": "53",
      "latMin": "23.81",
      "NS": "N",
      "lonDeg": "6",
      "lonMin": "3.702",
      "EW": "W",
      "lat": "53.3968",
      "lon": "-6.0617"
    },
    {
      "shortName": "G",
      "longName": "Garbh",
      "shape": "Conical",
      "colour": "black",
      "latDeg": "53",
      "latMin": "25.00",
      "NS": "N",
      "lonDeg": "6",
      "lonMin": "02.32",
      "EW": "W",
      "lat": "53.4166",
      "lon": "-6.0386"
    },
    {
      "shortName": "Howth",
      "longName": "Howth",
      "shape": "IALA",
      "colour": "green",
      "latDeg": "53",
      "latMin": "23.69",
      "NS": "N",
      "lonDeg": "6",
      "lonMin": "03.56",
      "EW": "W",
      "lat": "53.3948",
      "lon": "-6.0593"
    },
    {
      "shortName": "H",
      "longName": "Hub",
      "shape": "Conical",
      "colour": "black",
      "latDeg": "53",
      "latMin": "25.71",
      "NS": "N",
      "lonDeg": "6",
      "lonMin": "04.43",
      "EW": "W",
      "lat": "53.4285",
      "lon": "-6.0738"
    },
    {
      "shortName": "I",
      "longName": "Island",
      "shape": "Conical",
      "colour": "black",
      "latDeg": "53",
      "latMin": "24.70",
      "NS": "N",
      "lonDeg": "6",
      "lonMin": "04.36",
      "EW": "W",
      "lat": "53.4116",
      "lon": "-6.0726"
    },
    {
      "shortName": "J",
      "longName": "Thulla",
      "shape": "Conical",
      "colour": "black",
      "latDeg": "53",
      "latMin": "23.80",
      "NS": "N",
      "lonDeg": "6",
      "lonMin": "03.40",
      "EW": "W",
      "lat": "53.3966",
      "lon": "-6.0566"
    },
    {
      "shortName": "K",
      "longName": "Stack",
      "shape": "Conical",
      "colour": "black",
      "latDeg": "53",
      "latMin": "24.60",
      "NS": "N",
      "lonDeg": "6",
      "lonMin": "03.11",
      "EW": "W",
      "lat": "53.41",
      "lon": "-6.0518"
    },
    {
      "shortName": "O",
      "longName": "Osprey",
      "shape": "Conical",
      "colour": "orange",
      "latDeg": "53",
      "latMin": "25.41",
      "NS": "N",
      "lonDeg": "6",
      "lonMin": "03.52",
      "EW": "W",
      "lat": "53.4235",
      "lon": "-6.0586"
    },
    {
      "shortName": "P",
      "longName": "Portmarnock",
      "shape": "Conical",
      "colour": "black",
      "latDeg": "53",
      "latMin": "25.63",
      "NS": "N",
      "lonDeg": "6",
      "lonMin": "05.80",
      "EW": "W",
      "lat": "53.4271",
      "lon": "-6.0966"
    },
    {
      "shortName": "Q",
      "longName": "Rowan Rocks",
      "shape": "IALA",
      "colour": "black",
      "latDeg": "53",
      "latMin": "23.88",
      "NS": "N",
      "lonDeg": "6",
      "lonMin": "03.22",
      "EW": "W",
      "lat": "53.398",
      "lon": "-6.0536"
    },
    {
      "shortName": "R",
      "longName": "South Rowan",
      "shape": "IALA",
      "colour": "green",
      "latDeg": "53",
      "latMin": "23.78",
      "NS": "N",
      "lonDeg": "6",
      "lonMin": "03.88",
      "EW": "W",
      "lat": "53.3963",
      "lon": "-6.0646"
    },
    {
      "shortName": "S",
      "longName": "Spit",
      "shape": "Conical",
      "colour": "black", 
      "latDeg": "53",
      "latMin": "24.35",
      "NS": "N",
      "lonDeg": "6",
      "lonMin": "04.48",
      "EW": "W",
      "lat": "53.4058",
      "lon": "-6.0746"
    },
    {
      "shortName": "U",
      "longName": "Ulysses",
      "shape": "Conical",
      "colour": "orange",
      "latDeg": "53",
      "latMin": "26.22",
      "NS": "N",
      "lonDeg": "6",
      "lonMin": "04.97",
      "EW": "W",
      "lat": "53.437",
      "lon": "-6.0828"
    },
    {
      "shortName": "V",
      "longName": "Viceroy",
      "shape": "Conical",
      "colour": "orange",
      "latDeg": "53",
      "latMin": "25.12",
      "NS": "N",
      "lonDeg": "6",
      "lonMin": "04.78",
      "EW": "W",
      "lat": "53.4186",
      "lon": "-6.0796"
    },
    {
      "shortName": "W",
      "longName": "West",
      "shape": "Conical",
      "colour": "black",
      "latDeg": "53",
      "latMin": "24.96",
      "NS": "N",
      "lonDeg": "6",
      "lonMin": "06.07",
      "EW": "W",
      "lat": "53.416",
      "lon": "-6.1011"
    },
    {
      "shortName": "X",
      "longName": "Xebec",
      "shape": "Conical",
      "colour": "black",
      "latDeg": "53",
      "latMin": "23.83",
      "NS": "N",
      "lonDeg": "6",
      "lonMin": "04.41",
      "EW": "W",
      "lat": "53.3971",
      "lon": "-6.0735"
    },
    {
      "shortName": "Z",
      "longName": "Zephyr",
      "shape": "Inflatable",
      "colour": "black",
      "latDeg": "53",
      "latMin": "25.85",
      "NS": "N",
      "lonDeg": "6",
      "lonMin": "02.65",
      "EW": "W",
      "lat": "53.4308",
      "lon": "-6.0441"
    }
  ]; // end of marks array
  ////////// ////////// ////////// //////////

  ////////// ////////// ////////// //////////
  // Add any supporting functions here in the Wednesday class
  static getCourseByNumber(courseNumber)
    {
      for (let i=0; i<Wednesday.courses.length; i++)
        {
          if (Wednesday.courses[i].number === courseNumber)
            {
              return Wednesday.courses[i];
            }
        }
      return null; // course not found
    } // end of getCourseByNumber function
  ////////// ////////// ////////// //////////
  
} // end declaration of the Wednesday class containing static data
////////// ////////// ////////// //////////