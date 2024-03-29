/*
 *  usmap.js
 *
 *  This file has these main responsibilities:
 *  1. Initialize the main page, index.html.
 *  2. Setup all the listeners for the main page.
 *  3. Set up map every time the lookup button is pressed.
 *
 *  @authors Tanya L. Crenshaw, Kyle DeFrancia, Joe Devlin, Erik Paulson, Nick
 *  @version 11/29/13. Add checks and error messages to ensure valid input.
 * 
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

        // check for that the input is valid
        if(sTerm == "") {
            // Give an error message to the user:
            utilities.getInfoBoxElement().innerHTML = '<div id="errormessage">Error: Please enter something to search for</div>';
            return;
        } else if(!form.checkInput()) {
            utilities.getInfoBoxElement().innerHTML = '<div id="errormessage">Error: Invalid search term.  Remember to use state abbreviatons.</div>';
            return;
        } else if(!form.checkFilterInput(filter)) {
            utilities.getInfoBoxElement().innerHTML = '<div id="errormessage">Error: Invalid filter input.  Check the range you specified.</div>';
            return;
        }

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
        console.log('First request URL: '+ url);

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

                    } else {
                        // Indicate to the user their search term was not found 
                        //TODO: figure out why getErrorElement doesn't work
                        utilities.getInfoBoxElement().innerHTML = '<div id="errormessage">Error: Cannot locate ' + sType + ': ' + sTerm + '.</div>';
                        utilities.getTopSchoolsBox().innerHTML = '<div id="errormessage">Error: Cannot locate ' + sType + ': ' + sTerm + '.</div>';
                    }
                }
            }
        }//handleResponse
        
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

        // Register the enter key to press the lookup button
        document.onkeydown = function (e){
            var keyCode = (e.keyCode ? e.keyCode : e.which);
            
            // 13 is the keycode for the enter key
            if (keyCode == '13'){
                document.getElementById('lookupButton').click();
            }
        };

        // Set the Google API key for this namespace.
        apikey = 'AIzaSyDPIDblZh-H55gEkg7u6KVry1OZ-pgGpsQ';

        // Create the httpRequestor for this namespace.
        utilities.makeRequestor();

        //https://www.google.com/fusiontables/DataSource?docid=1bU_c9DQExthlyR_zY6Qy-SyFYDIPbTKmilgV-hc
        var schoolEID = '1bU_c9DQExthlyR_zY6Qy-SyFYDIPbTKmilgV-hc';

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

        // Attach the autoSelectFilter() function to the filter inputs
        utilities.forEach(form.getAllFilterInputs(), function(i) {
            utilities.addEvent(document.getElementById(i), 'change', function() {
                return form.autoSelectFilter(i);
            });
        });
       
        // Attach the changeDefaultTest() function to the search type input 
        utilities.addEvent(document.getElementById('search_type'),'change', function() { 
            return form.changeDefaultText();
        });

        // Attach the filterHelp() function to the help link
        utilities.addEvent(document.getElementById('filter_help'), 'click', function() {
            return form.filterHelp();
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
