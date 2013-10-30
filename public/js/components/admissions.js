/*
 *  admissions.js
 *
 *  A collection of methods for the Domain Knowledge specific to the
 *  Admissions Unit.  These methods are all centralized in this location
 *  instead of diffused throughout the application so that one can
 *  reason about this Domain Model more easily.
 *
 *  @author Tanya L. Crenshaw
 */

define([], function() {

    /*
     * regions
     *
     * An object that represents all of the region assignments in the
     * Admissions Unit.  Each property is a region name.  Each value
     * of each property is an array.  The first element of the array
     * is the two-letter state abbreviation associated with the region.
     * The remainder of the array is any subregions for the region.
     *
     * TODO: Incomplete list.  I don't feel, either, that this is the
     * best way to organize this data.
     */
    var regions = {
        "Alaska" : ["AK"],
        "Arizona" : ["AZ"],
        "Californa" : ["CA"],
        "Colorado" : ["CO"],
        "Hawaii" : ["HI"],
        "Idaho" : ["ID"],
        "Illinois" : ["IL"],
        "Maine" : ["ME"],
        "Minnesota" : ["MN"],
        "Nebraska" : ["NE"],
        "New Mexico" : ["NM"],
        "New York" : ["NY"],
        "North Nevada - Reno" : ["NV"],
        "South Nevada - Las Vegas" : ["NV"],
        "Oregon" : ["OR", "Salem", "Corvallis", "Eugene"],
        "Portland" : ["OR", "Area1", "Catholic1", "Catholic2", "Area2", "Area3", "Area4", "North Coast"],
        "Texas" : ["TX"],
        "Utah" : ["UT"],
        "Washington" : ["WA"]

    };

    /*
     * getRegions
     *
     * Based on the "Counselor Assignments" provided by Jason McDonald, this
     * method supplies an array of all of the Region Names for the Admissions
     * Unit, as group by counselor.
     *
     * TODO: TLC.  Currently, this is only a partial list, as I am doing a
     * proof of concept with regards to drop-down menus.  I need to finish
     * enumerating all the regions.
     *
     * @param none
     * @return regions An object containing each region as a property and
     * an array of all subregions as the value of each property.
     *
     */
    var getRegions = function() {

        return regions;
    };
    /*
     * convertRegionToState
     *
     * Convert the possible menu choices available to a two-letter
     * state abbreviation.
     *
     * @param menuChoice A user-supplied menu choice extracted from an HTML
     * element.
     * @return state A two-letter state abbreviation.
     */
    var convertRegionToState = function(region) {

        var state = regions[region][0];

        return state;

    };
    /*
     * getHighSchoolName
     *
     * Based on the construction of the Fusion Table used to supply high
     * school address and CEEB information, this function extracts
     * the high school name from a Fusion Table response and returns
     * it as a string.
     *
     */
    var getHighSchoolName = function(response) {
        return response["rows"][0][0].toString();
    };
    /*
     * getHighSchoolAddress
     *
     * Based on the construction of the Fusion Table used to supply high
     * school address and CEEB information, this function extracts
     * the high school address from a Fusion Table response and returns
     * it as a string.
     *
     */
    var getHighSchoolAddress = function(response) {
        return response["rows"][0][1].toString();
    };


    /*
     * getZipcode
     *
     * Based on the construction of the Fusion Table used to supply high
     * school address and CEEB information, this function extracts
     * the high school zipcode from a Fusion Table response and returns
     * it as a string.
     *
     */
    var getZipcode = function(response) {
        return response["rows"][0][4].toString();
    };


    /*
     * getState
     *
     */
    var getState = function(response) {
        return response["rows"][0][3].toString();
    };


    /*
     * getCity
     *
     */
    var getCity = function(response) {
        return response["rows"][0][2].toString();
    };


    /*
     * getCEEB
     *
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
        getRegions : getRegions,
        convertRegionToState : convertRegionToState,
        getHighSchoolName : getHighSchoolName,
        getHighSchoolAddress : getHighSchoolAddress,
        getZipcode : getZipcode,
        getState : getState,
        getCity : getCity,
		getCEEB : getCEEB
    };
});
