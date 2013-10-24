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
        var stype = utilities.getSearchType();

        // Get the search term from the page, as entered by the user.
        var sterm = utilities.getSearchTerm();

        // Did the user type anything?
        if(sterm == "") {

            // Give an error message to the user:
            utilities.getErrorMsgElement().innerHTML = "Error: Please enter something to search for";

        } else {

            // Clear any error message.
            utilities.getErrorMsgElement().innerHTML = "";

            // Get the corresponding zipcode for this CEEB.  The zipcode for this
            // CEEB is contained in the same row as the CEEB in the Google Fusion
            // tables.  So, I need to get the Zip in the row whose 'Code' is
            // the CEEB entered by the user.  This is done using the GET API
            // specified in the Google Fusion Tables Developer documentation.

            // Actually, just get all the information for a given search term.

            // Create a url for
            // a subsequent GET request to a Google server.
            var query = "SELECT * FROM " + layerArray[0].eID + " WHERE Code = " + sterm;

            var url = "https://www.googleapis.com/fusiontables/v1/query";
            url = url + "?sql=" + query;
            url = url + " &key=" + apikey;

            function handleResponse() {
                if(httpRequest.readyState === 4) {
                    if(httpRequest.status === 200) {

                        // The code reaches this point because the Google server
                        // responded with some useful data.

                        var response = JSON.parse(httpRequest.responseText);

                        if(response["rows"] != undefined) {
                            // Set the zoom.
                            var zoomLvl = getZoomLevel(stype);
                            layerArray[0].map.setZoom(zoomLvl);

                            var hsName = admissions.getHighSchoolName(response);
                            var hsAddress = admissions.getHighSchoolAddress(response);
                            var zipcode = admissions.getZipcode(response);
                            var city = admissions.getCity(response);
                            var state = admissions.getState(response);

                            // Center the map.
                            var center;
                            switch(stype) {
                                case "ceeb":
                                case "hsname":
                                    center = hsAddress;
                                    break; 
                                case "zip":
                                    center = zipcode;
                                    break;
                                case "state":
                                    center = state;
                                    break;
                                case "city":
                                    center = city + " " + state;
                                    break;
                            }
                            centerAt(layerArray[0].map, center, geocoder);

                            // Filter the school layer by CEEB.
                            layers.filterByCEEB.call(layerArray[0], sterm);

                            // Display the textual result
                            utilities.getRightSidebarElement().innerHTML = hsName + '<br>' + hsAddress;

                        } else {
                            // Indicate to the user their search term was not found 
                            utilities.getErrorMsgElement().innerHTML = "Cannot locate " + stype + ": " + sterm + ".";
                        }

                    }
                }
            }

        }

        // Send the GET Request to the Google Server
        utilities.sendRequest(url, handleResponse);
    };


    /*
     * getZoomLevel()
     * 
     * Given a search type, return the appropriate zoom level to 
     * best display the data on the map.
     *
     * @param stype A search type, such as "ceeb" or "state"
     * @return An integer zoom level
     *
     */
    var getZoomLevel = function(stype) {

        var zoom;

        switch(stype) {
            case "zip":
            case "ceeb":
            case "hsname":
                zoom = 12;
                break;
            case "state":
                zoom = 6;
                break;
            case "city":
                zoom = 11;
                break;
            default:
                zoom = 7;
        }

        return zoom;
    }


    /*
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
        regionalize : regionalize,
        initialize : initialize
    };
});
