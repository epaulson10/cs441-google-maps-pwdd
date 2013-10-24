/*
 *  usmap.js
 *
 *  This file has these main responsibilities:
 *  1. Initialize the main page, index.html.
 *  2. Setup all the listeners for the main page.
 *  3. Grab values of HTML elements for other parts of the application.
 *
 *  @author Tanya L. Crenshaw
 */

define(['./utilities', './filterMenu', './admissions', './layers'], function(utilities, filterMenu, admissions, layers) {

	/*
	 *  lookup()
	 *
	 *  For an array of layers, this function filters the layers
	 *  according to the CEEB grabbed from the page (that is,
	 * 	entered by the user) and recenters the layer's map at the zipcode
	 *  associated with the given CEEB.
	 *
	 *  This function assumes that all the layers are on the same map.
	 *  Thus, when resetting the zoom and recentering the map, these
	 *  operations are done only once on the first layer.
	 *
	 *  @param layerArray An array of Google FusionTableLayers.
	 *  @param geocoder The geocoder service to use to recenter the map.
	 *  @return void
	 */

	var lookup = function(layerArray, geocoder) {

		// Get the CEEB code from the page, as entered by the user.
		var ceeb = utilities.getCEEB();

		// Did the user type anything?
		if(ceeb == "") {

			// Give an error message to the user:
			utilities.getErrorMsgElement().innerHTML = "Error: Please enter a CEEB";
		}

		// Did the user enter the CEEB?
		else {
			// Clear any error message.
			utilities.getErrorMsgElement().innerHTML = "";

			// Get the corresponding zipcode for this CEEB.  The zipcode for this
			// CEEB is contained in the same row as the CEEB in the Google Fusion
			// tables.  So, I need to get the Zip in the row whose 'Code' is
			// the CEEB entered by the user.  This is done using the GET API
			// specified in the Google Fusion Tables Developer documentation.

			// Create a url for
			// a subsequent GET request to a Google server.
			var query = "SELECT * FROM " + layerArray[0].eID + " WHERE Code = " + ceeb;

			var url = "https://www.googleapis.com/fusiontables/v1/query";
			url = url + "?sql=" + query;
			url = url + " &key=" + apikey;

			function handleResponse() {
				if(httpRequest.readyState === 4) {
					if(httpRequest.status === 200) {

						// The code reaches this point because the Google server
						// responded with some useful data.

						// The response is just a string.  I need
						// to parse it so that I can extract the zip code from it.
						var response = JSON.parse(httpRequest.responseText);

						if(response["rows"] != undefined) {
							// Set 	the zoom.
							layerArray[0].map.setZoom(6);

							var highSchoolName = admissions.getHighSchoolName(response);
							var highSchoolAddress = admissions.getHighSchoolAddress(response);
							var zipcode = admissions.getZipcode(response);
                                                        var state = admissions.getState(response);

							// Center the map.
							centerAt(layerArray[0].map, state, geocoder);

							// Filter the zip layer by zip
							//layers.filterByZip.call(layerArray[0], zipcode);

							// Filter the school layer by CEEB.
							layers.filterByCEEB.call(layerArray[0], ceeb);

							// Display the textual result
							utilities.getRightSidebarElement().innerHTML = highSchoolName + '<br>' + highSchoolAddress;

						} else {
							// Indicate to the user that I could not find that
							// CEEB.
							utilities.getErrorMsgElement().innerHTML = "Cannot locate CEEB: " + ceeb + ".";
						}

					}
				}
			}

		}

		// Send the GET Request to the Google Server
		utilities.sendRequest(url, handleResponse);
	};
	/*
	 *  centerAt()
	 *
	 *	Given an address, use the Google geocode service to obtain the
	 *  latitude and longitude points for that address and center the
	 *  window object's 'map' at the lat/lon point provided.
	 *
	 *  Note that the Google geocoder service is an asynchronous call,
	 *  so an anonymous callback function is used to handle the result.
	 *  Otherwise, the page will hang.
	 *
	 *  Based largely on the geocode sample provided in the Google Developer
	 *  documentation for Google Maps API 3 for Javascript.
	 *
	 *  @param address A string representing an address, such as "Chicago"
	 *  or "92171"
	 *
	 *  @return void
	 * */
	var centerAt = function(map, address, geocoder) {

		geocoder.geocode({
			'address' : address
		}, function(results, status) {
			if(status == google.maps.GeocoderStatus.OK) {
				map.setCenter(results[0].geometry.location);
			} else {
				alert("Geocode was not successful for the following reason: " + status);
			}
		});
	};
	/*
	 *  regionalize()
	 *
	 *  This function filters an array of layer objects based on the
	 *  region name grabbed from the page (that is, entered by the user)
	 *  and recenters the map at the region.
	 *
	 *  @param layerArray An array of Layer objects to regionalize.
	 *  @param geocoder The geocoder service to use to recenter the map.
	 *  @return void
	 */
	var regionalize = function(layerArray, geocoder) {

		// Get the region name from the page, as entered by the user.
		var region = utilities.getRegion();

		// Filter each layer by the region.
		utilities.forEach(layerArray, function(t) {
			layers.filterByRegion.call(t, region);
		});
		// Set the zoom.
		layerArray[0].map.setZoom(6);

		// Center the map at the state corresponding to the region.
		centerAt(layerArray[0].map, admissions.convertRegionToState(region), geocoder);
	};
	/*
	 *  initialize()
	 *
	 *  A function to:
	 *  1. create a google map centered at the us
	 *  2. Initialize two layer objects, one for zipcodes and one for schools.
	 *  3. instantiate a google maps geocoder service.
	 *
	 *  @param void
	 *  @return void
	 */
	var initialize = function() {

		// Set the Google API key for this namespace.
		apikey = 'AIzaSyDPIDblZh-H55gEkg7u6KVry1OZ-pgGpsQ';

		// Create the httpRequestor for this namespace.
		utilities.makeRequestor();

		// Encrypted IDs for the Google Fusion Table containing the
		// Oregon high school and CEEB data.
		var schoolEID = '1TysRKf1siV396AMbUKmi8w2-XB3Zeye2ObXjl8Y';

		// The Encrypted ID used below is that of tl_2010_41_zcta051_clean.kml
		// available in Tanya Crenshaw's public fusion tables.
		var zipEID = '1U6n-9O6I9q4qG10uNcNrCAlvactfL7O07IVPLbU';

		// Instatiate a new geocoder service
		var geocoder = new google.maps.Geocoder();

		// The center point of the map is Lincoln, NB.
		var usa = new google.maps.LatLng(40.8358, -96.6452);

		// Create a Google Map object centered at usa
		var map = new google.maps.Map(document.getElementById("contig_us_map_canvas"), {
			zoom : 4,
			center : usa,
			mapTypeId : google.maps.MapTypeId.ROADMAP
		});
		//
		//	Construct the layers
		//

		// Create a Layer object for the zip code boundary layer.  The second parameter
		// creates the Google FusionTablesLayer object.  The Layer is not currently being
		// filtered, so the final parameter is false.
		// var zipLayer = new layers.Layer("zips", new google.maps.FusionTablesLayer({
		// 	query : {
		// 		from : zipEID
		// 	}
		// }), zipEID, map, 'ZipCodeArea', false);

		// Create a Layer object for the high schools layer.  The second parameter
		// creates the Google FusionTablesLayer object.  The Layer is not currently being
		// filtered, so the final parameter is false.
		var schoolLayer = new layers.Layer("schools", new google.maps.FusionTablesLayer({
			query : {
				from : schoolEID
			}
		}), schoolEID, map, 'Zip', false);

		// Create an array of Layers
		var layerArray = new Array();
		// layerArray.push(zipLayer);
		layerArray.push(schoolLayer);

		// Attach the function lookup() to the lookupButton on the main page.
		utilities.addEvent(document.getElementById('lookupButton'), 'click', function() {
			return lookup(layerArray, geocoder);
		});
		//
		// Constructing the Filter Menus
		//
		// Create the Region Filtering menu
		// Connect the filter menu to the "regionFilterPanel" that is on the index.html page.
		// Get the menu options from the admissions domain model method, getRegions().
		// Attach the method filter() to the menu such that whenever the menu changes,
		// the filter() method is called.
		var regionFilterMenu = new filterMenu.FilterMenu("regionFilterMenu", "regionFilterMenu", "filterMenu", "regionFilterPanel", admissions.getRegions(), function() {
			return regionalize(layerArray, geocoder);
		});
		regionFilterMenu.createMenu();

	};
	// Any functions defined in this return statement are considered public
	// functions by RequireJS, and accessible through the namespace that
	// is attached to this module when loaded in other files.
	return {

		lookup : lookup,
		centerAt : centerAt,
		regionalize : regionalize,
		initialize : initialize
	};
});
