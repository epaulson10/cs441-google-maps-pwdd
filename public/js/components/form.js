/*
 * form.js
 *
 * A collection of useful utility functions that know how to retrieve user
 * input from the HTML form in index.html
 *
 * @author Kyle DeFrancia
 * @version 11/9/13.  Created this file -Kyle
 */
define([], function(){

    var Year = 'search_years';

    var GPA = 'gpa';
    var Gender = 'gender';
    var Major = 'major';
    var SATVerbal = 'sat_verbal';
    var SATMath = 'sat_math';

    /**
      * getSearchTerm()
      *
      * This function gets the search term from the page, as entered by
      * the user in the input textbox with id "search_term".
      *
      * @param void
      * @return The value of the html element with id "search_term"
      */
    var getSearchTerm = function() {

        return document.getElementById("search_term").value;
    };

    /**
      * getSearchType()
      * 
      * This function gets the search type from the page, as chosen in
      * the select element with id "search_type".
      * 
      * @param void
      * @return The value of the html element with id "search_type"
      */
    var getSearchType = function() {
        
        return document.getElementById("search_type").value;
    }

    /**
      * getSearchYears()
      *
      * This function gets the search year(s) from the page, as chosen in
      * the checkbox group "search_years"
      *
      * @param void
      * @return An array of integers representing all the years selected
      *
      */
    var getSearchYears = function() {

        rtnVal = [];

        //assumes there are no other input elements in this div besides checkboxes for years
        var checkBoxes = document.getElementById('search_years').getElementsByTagName('input');

        for(var i = 0; checkBoxes[i]; i++) {
            if(checkBoxes[i].checked) {
                rtnVal.push(checkBoxes[i].value);
            }
        }//for

        return rtnVal;
    }        

    /**
      * getSelectedFilter
      *
      * Returns the filter that user has selected.
      *
      * @param void
      * @return the filter that was selected
      *
      */
    var getSelectedFilter = function() {

        return document.querySelector('input[name="filter"]:checked').value;
    }

    /**
      * getFilterVals
      *
      * This function returns an array of the input fields for each filter
      *
      * @param filter the filter
      * @return an array, each element is user input
      */
    var getFilterVals = function(filter) {

        rtnVal = [];

        switch(filter) {
            case GPA:
                rtnVal.push(document.getElementById('gpa_min').value);
                rtnVal.push(document.getElementById('gpa_max').value);
                break;
            case Gender:
                rtnVal.push(document.getElementById('gender_select').value);
                break;
            case Major:
                rtnVal.push(document.getElementById('major_select').value);
                break;
            case SATVerbal:
                rtnVal.push(document.getElementById('satv_min').value);
                rtnVal.push(document.getElementById('satv_max').value);
                break;
            case SATMath:
                rtnVal.push(document.getElementById('satm_min').value);
                rtnVal.push(document.getElementById('satm_max').value);
                break;
            default:
        }

        return rtnVal;
    }

    /**
      * filterInputLength
      *
      * Get the number of input elements there are for a given filter in 
      * index.html. For example, the GPA filter has an input length of 2 and
      * the Gender filter has a length of 1.
      *
      * @param filter the filter
      * @param an integer representing the length of the return value
      *         of getFilterVals.
      *
      */
    var filterInputLength = function(filter) {

        var inputs = getFilterVals(filter);
        return inputs.length;
    }


    // Any functions defined in this return statement are considered public
    // functions by RequireJS, and accessible through the namespace that
    // is attached to this module when loaded in other files.
    return {
        GPA : GPA,
        Gender : Gender,
        Major : Major,
        SATVerbal : SATVerbal,
        SATMath : SATMath,
        getSearchYears : getSearchYears,
        getSearchTerm : getSearchTerm,
        getSearchType : getSearchType,
        getSelectedFilter : getSelectedFilter,
        getFilterVals : getFilterVals,
        filterInputLength : filterInputLength
    };
});
