/*
 *  census.js
 *
 *  A collection of methods for the Domain Knowledge specific to the
 *  US Census Bureau zip code tabulation area data.  These methods are all
 *  centralized in this location instead of diffused throughout the application
 *  so that one can reason about this Domain Knowledge more easily.
 *
 *  @author Tanya L. Crenshaw
 */

define([], function() {

	var zctas = {
		"AK" : 2,
		"AZ" : 4,
		"CA" : 6,
		"CO" : 8,
		"HI" : 15,
		"ID" : 16,
		"IL" : 17,
		"ME" : 23,
		"MN" : 27,
		"NE" : 31,
		"NM" : 35,
		"NV" : 32,
		"NY" : 36,
		"OR" : 41,
		"TX" : 48,
		"UT" : 49,
		"WA" : 53,
	};

	/*
	 * convertStateToUSBNumber
	 *
	 * Convert a two-letter state abbreviation to the corresponding US Census
	 * Bureau state number.  Based on the numbering used in the original
	 * .shp files downloaded from
	 * http://www.census.gov/cgi-bin/geo/shapefiles2010/layers.cgi
	 *
	 * @param state A two-letter state abbreviation.
	 * @return number The corresponding US Census bureau state number.
	 */
	var convertStateToUSBNumber = function(state) {

		return zctas[state];

	};
	// Any functions defined in this return statement are considered public
	// functions by RequireJS, and accessible through the namespace that
	// is attached to this module when loaded in other files.
	return {
		convertStateToUSBNumber : convertStateToUSBNumber
	};
});
