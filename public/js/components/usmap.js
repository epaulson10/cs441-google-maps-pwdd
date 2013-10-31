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
 */

define(['./utilities', './admissions', './layers', './calculate'], function(utilities, admissions, layers, calculate) {

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

        // Get search type
        var sType = utilities.getSearchType();

        // Get the search term from the page, as entered by the user.
        var sTerm = utilities.getSearchTerm();

        // Did the user type anything?
        if(sTerm == "") {
            // Give an error message to the user:
            utilities.getErrorMsgElement().innerHTML = "Error: Please enter something to search for";
        } else {

            // Clear any error message.
            utilities.getErrorMsgElement().innerHTML = "";

            // Get all the information for a given search term.

            // Create a url for
            // a subsequent GET request to a Google server.
            var term;
            if (sType != admissions.ZIP && sType != admissions.CEEB) {
                term = "'" + sTerm + "'";
            } else {
                term = sTerm;
            }
            var query = "SELECT * FROM " + layerArray[0].eID + " WHERE " + sType + " = " + term;

            var url = "https://www.googleapis.com/fusiontables/v1/query";
            url = url + "?sql=" + query;
            url = url + " &key=" + apikey;

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
                            centerAt(layerArray[0].map, center, geocoder);

                            // Filter the layer to display only the desired schools
                            layers.filterBy.call(layerArray[0], sType, sTerm);
                            
                            //have only 1 requestor, so have to link requests
                            utilities.getInfoBoxElement().innerHTML = 'Calculating...';
                            calculate.getAppInfo(sType, sTerm, null, ceeb);

                        } else {
                            // Indicate to the user their search term was not found 
                            //TODO: figure out why getErrorElement doesn't work
                            utilities.getInfoBoxElement().innerHTML = "Cannot locate " + sType + ": " + sTerm + ".";
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

        // Encrypted IDs for the Google Fusion Table containing the
        // Oregon high school and CEEB data.
        var schoolEID = '1TysRKf1siV396AMbUKmi8w2-XB3Zeye2ObXjl8Y';

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
    };


    // Any functions defined in this return statement are considered public
    // functions by RequireJS, and accessible through the namespace that
    // is attached to this module when loaded in other files.
    return {
        lookup : lookup,
        getZoomLevel : getZoomLevel,
        centerAt : centerAt,
        initialize : initialize
    };
});
