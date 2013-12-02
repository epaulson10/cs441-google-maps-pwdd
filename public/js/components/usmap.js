/*
 *  usmap.js
 *
 *  This file has these main responsibilities:
 *  1. Initialize the main page, index.html.
 *  2. Setup all the listeners for the main page.
 *  3. Grab values of HTML elements for other parts of the application.
 *
 *  @author Tanya L. Crenshaw
 *  @version 10/30/13.  Fixed formatting. Changes made by Kyle, Nick, and Erik
 *  @version 11/3/13. Updated fusion table ID and edited fusion table query.  Joe Devlin
 */

define(['./utilities', './admissions', './layers', './calculate', './form'], function(utilities, admissions, layers, calculate, form) {

  /**
    *  lookup()
    *
    *  For an array of layers, this function filters the layers
    *  according to the CEEB grabbed from the page (that is,
    *     entered by the user) and recenters the layer's map at the zipcode
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

        // Get the search parameters from the page, as entered by the user.
        var sType = form.getSearchType();
        var sTerm = form.getSearchTerm();
        var years = form.getSearchYears();
        var filter = form.getSelectedFilter();

        // Did the user type anything?
        if(sTerm == "") {
            // Give an error message to the user:
            utilities.getErrorMsgElement().innerHTML = "Error: Please enter something to search for";
        } else {
            // Clear any error message.
            utilities.getErrorMsgElement().innerHTML = "";

            // Create a url for
            // a subsequent GET request to a Google server.
            var terms = sTerm.split(',');
            var term = terms[0];
            var eq;
            if (sType != admissions.ZIP && sType != admissions.CEEB) {
                term = "'" + term + "'";
                eq = ' CONTAINS IGNORING CASE ';
            } else {
                eq = ' = ';
            }

            var query = "SELECT * FROM " + layerArray[0].eID + " WHERE " + sType + eq + term;

            // search by City or Highschool Name might also include a state like "Portland, OR"
            if (sType == admissions.HSNAME || sType == admissions.CITY) {
                if (terms[1]) {
                    //trim off the leading space
                    terms[1] = terms[1].replace(/^\s/g, '');
                    query += " AND " + admissions.STATE + eq + "'" + terms[1] + "'";
                }
            } 

            var url = "https://www.googleapis.com/fusiontables/v1/query";
            url = url + "?sql=" + query;
            url = url + "&key=" + apikey;
            console.log(url);
            function handleResponse() {
                if(httpRequest.readyState === 4) {
                    if(httpRequest.status === 200) {
                        // The code reaches this point because the Google server
                        // responded with some useful data.
                        var response = JSON.parse(httpRequest.responseText);
                        console.log(response);
                        if(response["rows"] != undefined) {
                            // Set the zoom.
                            var zoomLvl = getZoomLevel(sType);
                            layerArray[0].map.setZoom(zoomLvl);

                            var hsName = admissions.getHighSchoolName(response);
                            var hsAddress = admissions.getHighSchoolAddress(response);
                            var zipcode = admissions.getZipcode(response);
                            var city = admissions.getCity(response);
                            var state = admissions.getState(response);
                            var ceeb = admissions.getCEEB(response);

                            // Center the map.
                            var center;
                            switch(sType) {
                                case admissions.CEEB:
                                case admissions.HSNAME:
                                    center = hsAddress;
                                    break; 
                                case admissions.ZIP:
                                    center = zipcode;
                                    break;
                                case admissions.STATE:
                                    center = state;
                                    break;
                                case admissions.CITY:
                                    center = city + " " + state;
                                    break;
                            }
                            center = center + " , United States of America";
                            console.log(center);
                            centerAt(layerArray[0].map, center, geocoder);

                            // Filter the layer to display only the desired schools
                            layers.filterBy.call(layerArray[0], sType, sTerm, eq);
                            
                            //have only 1 requestor, so have to link requests
                            utilities.getInfoBoxElement().innerHTML = 'Calculating...';

                            calculate.getAppInfo(sType, sTerm, years, filter, ceeb);

                            utilities.getTopSchoolsBox().innerHTML = 'Calculating...';
                            calculate.getAppInfo(sType, sTerm, null, ceeb);


                        } else {
                            // Indicate to the user their search term was not found 
                            //TODO: figure out why getErrorElement doesn't work
                            utilities.getInfoBoxElement().innerHTML = "Cannot locate " + sType + ": " + sTerm + ".";
                            utilities.getTopSchoolsBox().innerHTML = "Cannot locate " + sType + ": " + sTerm + ".";
                        }
                    }
                }
            }
        }
        // Send the GET Request to the Google Server
        utilities.sendRequest(url, handleResponse);
    };

  /**
    * getZoomLevel()
    * 
    * Given a search type, return the appropriate zoom level to 
    * best display the data on the map.
    *
    * @param sType A search type, such as "ceeb" or "state"
    * @return An integer zoom level
    *
    */
    var getZoomLevel = function(sType) {

        var zoom;

        switch(sType) {
            case admissions.ZIP:
            case admissions.CEEB:
            case admissions.HSNAME:
                zoom = 12;
                break;
            case admissions.STATE:
                zoom = 6;
                break;
            case admissions.CITY:
                zoom = 11;
                break;
            default:
                zoom = 7;
        }

        return zoom;
    }

  /**
    *  centerAt()
    *
    *    Given an address, use the Google geocode service to obtain the
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
    */
    var centerAt = function(map, address, geocoder) {

        geocoder.geocode({
            'address' : address
        }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                map.setCenter(results[0].geometry.location);
            } else {
                alert("Geocode was not successful for the following reason: " + status);
            }
        });
    };
	
	/**
    *  changeDefaultText()
    *
    *  Provide a hint as to the expected format when the user selects a new search type
    *
    *  @param void
    *  @return void
    */
	var changeDefaultText = function() {
		//get the search type from the form
		var searchType = form.getSearchType();
		//get the textbox element from the html
		var textBox = document.getElementById('search_term');
		
		switch(searchType) {
            case admissions.ZIP:
				textBox.placeholder = "5 digit Zip. e.g 97103";
				break;
            case admissions.CEEB:
				textBox.placeholder = "CEEB Code. e.g 380630";
				break;
            case admissions.HSNAME:
				textBox.placeholder = "HS,STATE. e.g Central Catholic, OR";
				break;
            case admissions.STATE:
				textBox.placeholder = "State Abbrev. e.g OR";
				break;
            case admissions.CITY:
				textBox.placeholder = "City. e.g Portland";
				break;
        }
	};
	

  /**
    *  initialize()
    *
    *  A function to:
    *  1. create a google map centered at the us
    *  2. Initialize one layer object, for high schools.
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

        //https://www.google.com/fusiontables/DataSource?docid=1wEej4K9DkB_U3PeUn_f-hYK6mRNwgxqItc0iuNE#rows:id=1
        var schoolEID = '1wEej4K9DkB_U3PeUn_f-hYK6mRNwgxqItc0iuNE';

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
        //    Construct the layers
        //

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
        layerArray.push(schoolLayer);

		
        // Attach the function lookup() to the lookupButton on the main page.
        utilities.addEvent(document.getElementById('lookupButton'), 'click', function() {
            return lookup(layerArray, geocoder);
        });
		
		utilities.addEvent(document.getElementById('search_type'),'change', function() { 
			return changeDefaultText();
		});
    };

    // Any functions defined in this return statement are considered public
    // functions by RequireJS, and accessible through the namespace that
    // is attached to this module when loaded in other files.
    return {
        lookup : lookup,
        getZoomLevel : getZoomLevel,
        centerAt : centerAt,
		changeDefaultText : changeDefaultText,
        initialize : initialize
    };
});
