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


    // Any functions defined in this return statement are considered public
    // functions by RequireJS, and accessible through the namespace that
    // is attached to this module when loaded in other files.
    return {
        addEvent : addEvent,
        forEach : forEach,
        getInfoBoxElement : getInfoBoxElement,
        getTopSchoolsBox : getTopSchoolsBox,
        getHSNameByCeeb : getHSNameByCeeb,
        makeRequestor : makeRequestor,
        sendRequest : sendRequest    
    };
});
