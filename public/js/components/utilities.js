/*
 * utilities.js
 *
 * A collection of useful utility functions required by many parts of the
 * application.
 *
 * @author Tanya L. Crenshaw, Fernando Freire
 * @version 10/30/13.  Fixed formatting. Changes made by Kyle, Nick, and Erik
 */

define([], function(){

  /**
    * addEvent()
    *
    * A utility function adapted from Google Code university to
    * simplify the browser-dependent act of adding events to
    * html elements.  Given an element, an event, and a function
    * this function checks the browser capability, and uses the
    * correct "add listener" or "attach event" function to
    * bind the function to the event for the element.
    *
    * @param el The html element.
    * @param evt A string representing the event.  e.g. 'click'
    * @param fn The function that will be invoked when the given
    * event 'evt' is experienced by the given element 'el'.
    *
    * @return void
    */
    var addEvent = function(el, evt, fn) {
        if(el.addEventListener) {
            el.addEventListener(evt, fn, false);
        } else if(el.attachEvent) {
            el.attachEvent('on' + evt, fn);
        }
    };

  /**
    * forEach()
    *
    * A utility function adopted from "Eloquent JavaScript" that
    * accepts an action and applies that action to each element in
    * an array.  This helps to abstract the tedium of for-loops.
    *
    * @param array The array of elements to operate upon.
    * @param action The action to perform on each element.
    *
    * @return void
    */
    var forEach = function(array, action) {
        for(var i = 0; i < array.length; i++) {
            action(array[i]);
        }
    };

  /**
    *  makeRequestor()
    *
    *  This function makes an object to make http requests.
    *
    *  This function is adapted from:
    *    https://developer.mozilla.org/en-US/docs/AJAX/Getting_Started
    *
    *  This application calls this function only once; it uses only
    *  one httpRequest object to send all subsequent GET requests.
    *
    *  @param void
    *  @return void
    */
    var makeRequestor = function() {
        if(window.XMLHttpRequest) {// Mozilla, Safari, ...
            httpRequest = new XMLHttpRequest();
        } else if(window.ActiveXObject) {// IE
            try {
                httpRequest = new ActiveXObject("Msxml2.XMLHTTP");
            } catch (e) {
                try {
                    httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
                } catch (e) {
                }
            }
        }

        if(!httpRequest) {
            alert('Cannot create http requestor!');
            return false;
        }
    };

  /**
    *  sendRequest()
    *
    *  This function utlizes the namespace's httpRequest object to make
    *  http requests.  It sets up the httpRequest onreadystatechange
    *  property to be the response function passed to this function.
    *
    *  This function is adapted from:
    *    https://developer.mozilla.org/en-US/docs/AJAX/Getting_Started
    *
    *  @param url The well-formed url representing the http request.
    *  @param response The function describing the behavior that should
    *         occur after the httpRequest object gets a response.
    *  @return void
    */
    var sendRequest = function(url, response) {

        httpRequest.onreadystatechange = response;
        httpRequest.open('GET', url);
        httpRequest.send();

    }

  /**
    * getErrorMsgElement()
    *
    * This function gets the element from the page where error messages
    * should be placed.
    *
    * @param void
    * @return The html element with id "errormessage"
    */
    var getErrorMsgElement = function() {
        return document.getElementById("errormessage");
    };

  /**
    * getInfoBoxElement()
    *
    * This function gets the info box element from the page.
    *
    * @param void
    * @return The handle of the html element.
    */
    var getInfoBoxElement = function() {

        return document.getElementById("info_box");
    };
	
	/**
    * getTopSchoolsBox()
    *
    * This function gets the top school div located to the right of the map
    *
    * @param void
    * @return The handle of the html element.
    */
    var getTopSchoolsBox = function() {

        return document.getElementById("top_schools");
    };
	
	/**
    * getHSNameByCeeb()
    *
    * This function parses a highschool name out of a fusion table query
	* by a given ceeb.
    *
    * @param response The fusion table response
	* @param ceeb The highschool whose name we wish to retrieve
    * @return A string containing the high school name.
    */
	var getHSNameByCeeb = function(response,ceeb) {
		if (response["rows"][0] !== undefined){
			for (var i = 0; i < response["rows"].length; i++) {
				var debug = response["rows"][i][5].toString();
				if (response["rows"][i][5] == ceeb){
					return response["rows"][i][0].toString();
				}
			}
		}
		else
			return "No highschool found";
	};

  /**
    * Encrypted IDs for all of the data graciously scraped
    * and converted by the CS441 students, organized
    * by layer and then by state.
    *
    * Despite the assignment, some teams did not organize
    * by state.  See instances of "Set1" and "Set2" for examples.
    *
    * Each table has an owner listed.  If you are having problems with a
    * table, contact the owner.
    *
    * Each table has been tested within the current cs441
    * example source.  If a table is marked as "Working"
    * that means that it displays the state's data when
    * filtered by the regionFilterMenu.
    *
    * If you want to access a particular table via the Google web interface,
    * just concatenate the particular encrypted id to this url:
    * 
    * https://www.google.com/fusiontables/data?docid=
    *
    *
    */

    /* As of 10/29, I was having trouble uploading all of Gadbois' tables.  This may be a personal problem with my machine
     * or it may be Google is having trouble with traffic.  I was able to go to the web interface for the tables, tho.
     */
    var tables = {
        "schools" : {
            "AK" : "1BnS-hHq88C6ZFwVxbbPO_y60Z6YgDmT0xBV0yE8", // TLC: 10/29.  Meyer et al.   Broken.  Does not contain Alaska?
            "AZ" : "1qfh_Ang7T1SZU_ksFuikFChk11QiFgH7N3VwX38", // TLC: 10/27.  Mueller et al. Working.
            "CA" : "1BnS-hHq88C6ZFwVxbbPO_y60Z6YgDmT0xBV0yE8", // TLC: 10/29.  Meyer et al.   Working.
            "CO" : "1TMA9tSPlSIvJVqdfTP0JuxKJhBejygkVuXZFgKg", // TLC: 10/28.  Gadbois et al. Colorado, Illinois, Nebraska, Utah.  Working.  Geocoded incorrectly.
            "HI" : "1eJtzOTidfcg7lZzt8EXmhZ44KWLT1XwbZv_ZhfA", // TLC: 10/27.  Mueller et al. Working.
            "ID" : "1BnS-hHq88C6ZFwVxbbPO_y60Z6YgDmT0xBV0yE8", // TLC: 10/29.  Meyer et al.   Broken.  Does not contain Idaho?
            "IL" : "1TMA9tSPlSIvJVqdfTP0JuxKJhBejygkVuXZFgKg", // TLC: 10/28.  Gadbois et al. Colorado, Illinois, Nebraska, Utah.  Working.  Geocoded incorrectly.
            "ME" : "15ubOSYr_dPPg1jogrxP-MsxyDufp3LQrdbPn2qk", // TLC: 10/28.  Garcia et al.  Working.
            "MN" : "1BnS-hHq88C6ZFwVxbbPO_y60Z6YgDmT0xBV0yE8", // TLC: 10/29.  Meyer et al.   Working.
            "NE" : "1TMA9tSPlSIvJVqdfTP0JuxKJhBejygkVuXZFgKg", // TLC: 10/28.  Gadbois et al. Colorado, Illinois, Nebraska, Utah.  Working.  Geocoded incorrectly.
            "NM" : "1G2ym2jYBbZBUUDuVUFza4fcyRS4wWK-kCTR7rrE", // TLC: 10/27.  Mueller et al. Working.
            "NV" : "18NwuT4jTzpHZmnBlFc0mGRRbfwTdSCvmiwmjmkc", // TLC: 10/27.  Garcia et al.  Working.
            "NY" : "14BrOdBhBKJOAEoMMU_jXXSNVY3nFZTglWjYg8UA", // TLC: 10/27.  Mueller et al. Working.
            "OR" : "1YcgR53xYb2OQm77NNyYfMh7-nwkrtZxoig7U_ms", // TLC: 10/27.  Crenshaw.      Working.
            "TX" : "1yhOPuREkVMFiEoGzvXvuSzLWTQ5Bz2hkqBv3ydU", // TLC: 10/28.  Garcia et al.  Working.
            "UT" : "1GyWQUGxxIlnv7tQawGVE5NJ5Po3GYpetsLjjmu0", // TLC: 10/28.  Gadbois et al. Colorado, Illinois, Nebraska, Utah.  Working. 
            "WA" : "11iPDAUiYhncL2iyoJ6fvPrmjv1iPSt55XjIGcbM", // TLC: 10/27.  Garcia et al.  Working.  Geocoded incorrectly.
        },

        "zips" : {
            "AK" : "1FNPaWfRBUgGPugh0TJ5kHzs5W2E9ZdyrvNg91Ms", // TLC: 10/29.  Meyer et al.  California, Idaho, Alaska.  Working.
            "AZ" : "1b8vDRj6_8iPCjaIgpqy-ytX-VIgRLfW0BCpcKT8", // TLC: 10/27.  Mueller et al.  Working.
            "CA" : "1FNPaWfRBUgGPugh0TJ5kHzs5W2E9ZdyrvNg91Ms", // TLC: 10/29.  Meyer et al.  California, Idaho, Alaska.  Working.
            "CO" : "1pGyFVJ3u9C9jEQGpl_aba7r7uWiIVBDAUADFilM", // TLC: 10/27.  Gadbois et al.  Working.  
            "HI" : "1aAd9SN0kmg7DtK1jhuh3M5C4y0OYihgdhS_Z6IA", // TLC: 10/27.  Mueller et al.  Working.
            "ID" : "1FNPaWfRBUgGPugh0TJ5kHzs5W2E9ZdyrvNg91Ms", // TLC: 10/27.  Meyer et al.  California, Idaho, Alaska.  Working.
            "IL" : "1cKRKxLql_yySfS0VKJR8l3FRnv9QYmO5hnvv3Cs", // TLC: 10/27.  Gadbois et al.  Working.
            "ME" : "11t_bjHCP5fSU1YdUjcPwnjT8TKsaYxmpmkKs9tk", // TLC: 10/27.  Garcia et al.   Working.
            "MN" : "1pkW7EOA4TaoLrR637OeKsR4_WG2EERyqRhSMKJs", // TLC: 10/29.  Meyer et al.  Oregon and Minnesota.
            "NE" : "168QyhgFvpITQmKeXdQ3NQSNkgDC55T4B1PUJKhk", // TLC: 10/27.  Gadbois et al.  Working.
            "NM" : "1bFE-rO_gsHyDp7e5yKUirHKL5qv3KU6wLKJk_kE", // TLC: 10/27.  Mueller et al.  Working.
            "NV" : "1NIpIVPjf8n-ZCEWnZoLl3uCJApMvOukFrYzdCZ0", // TLC: 10/27.  Garcia et al.   Working.
            "NY" : "1fPNF_U6oLbIresIP7azTx60-_z2yPa7MXmQJ3OM", // TLC: 10/27.  Mueller et al.  Working.
            "OR" : "1U6n-9O6I9q4qG10uNcNrCAlvactfL7O07IVPLbU", // TLC: 10/27.  Crenshaw.       Working.
            "TX" : "1VM5jgrP_ROg5kFcTpwpJuw-fDpgvaSeQ4JAgEvw", // TLC: 10/27.  Garcia et al.   Working.
            "UT" : "1ImtKIQYOTlEFgy1oLF8WeygB3antpx8Nx-qwQYU", // TLC: 10/27.  Gadbois et al.  Working.
            "WA" : "1jNwC6KeDC3NnVlReslJZB8VvujKjyxQhDs7o5Tc", // TLC: 10/27.  Garcia et al.   Working.
        },

        "students" : {
            "Enrolled" : "1MpKoIu0SIVNvEILq-HqPHOYbK67akZU-h3jSRHw", // Crenshaw
            "Set1" : "1S4AFgnDa4IVeNTgXm5qjoVqUSB_GD0OPkRgktME"       // Meyer
        }

    };

    // Any functions defined in this return statement are considered public
    // functions by RequireJS, and accessible through the namespace that
    // is attached to this module when loaded in other files.
    return {
        addEvent : addEvent,
        forEach : forEach,
        getErrorMsgElement : getErrorMsgElement,
        getInfoBoxElement : getInfoBoxElement,
		getTopSchoolsBox : getTopSchoolsBox,
		getHSNameByCeeb : getHSNameByCeeb,
        makeRequestor : makeRequestor,
        sendRequest : sendRequest,    
        tables : tables
    };
});
