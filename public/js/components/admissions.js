/*
 *  admissions.js
 *
 *  A collection of methods for the Domain Knowledge specific to the
 *  Admissions Unit.  These methods are all centralized in this location
 *  instead of diffused throughout the application so that one can
 *  reason about this Domain Model more easily.
 *
 *  @author Tanya L. Crenshaw
 *  @version 10/30/13.  Fixed formatting. Changes made by Kyle, Nick, and Erik
 */

define([], function() {

  /**
    * getHighSchoolName
    *
    * Based on the construction of the Fusion Table used to supply high
    * school address and CEEB information, this function extracts
    * the high school name from a Fusion Table response and returns
    * it as a string.
    *
    * @param response from Google Fusion Table query
    * @return a string containing the high school name
    */
    var getHighSchoolName = function(response) {
        return response["rows"][0][0].toString();
    };
    
  /**
    * getHighSchoolAddress
    *
    * Based on the construction of the Fusion Table used to supply high
    * school address and CEEB information, this function extracts
    * the high school address from a Fusion Table response and returns
    * it as a string.
    *
    * @param response from Google Fusion Table query
    * @return a string containing the high school address
    */
    var getHighSchoolAddress = function(response) {
        return response["rows"][0][1].toString();
    };

  /**
    * getZipcode
    *
    * Based on the construction of the Fusion Table used to supply high
    * school address and CEEB information, this function extracts
    * the high school zipcode from a Fusion Table response and returns
    * it as a string.
    *
    * @param response from Google Fusion Table query
    * @return a string containing the high school zip code
    */
    var getZipcode = function(response) {
        return response["rows"][0][4].toString();
    };

  /**
    * getState
    *
    * @param response from Google Fusion Table query
    * @return a string containing the high school state
    */
    var getState = function(response) {
        return response["rows"][0][3].toString();
    };

  /**
    * getCity
    *
    * @param response from Google Fusion Table query
    * @return a string containing the high school city
    */
    var getCity = function(response) {
        return response["rows"][0][2].toString();
    };

  /**
    * getCEEB
    *
    * @param response from Google Fusion Table query
    * @return a string containing the high school CEEB code
    */
    var getCEEB = function(response) {
        return response["rows"][0][5].toString();
    };

    // Any functions defined in this return statement are considered public
    // functions by RequireJS, and accessible through the namespace that
    // is attached to this module when loaded in other files.
    return {
        CEEB: "Code",
        HSNAME: "HighSchool",
        CITY: "City",
        STATE: "State",
        ZIP: "Zip",
        getHighSchoolName : getHighSchoolName,
        getHighSchoolAddress : getHighSchoolAddress,
        getZipcode : getZipcode,
        getState : getState,
        getCity : getCity,
        getCEEB : getCEEB,
    };
});
