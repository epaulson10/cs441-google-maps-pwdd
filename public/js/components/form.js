/*
 * form.js
 *
 * A collection of useful utility functions that know how to retrieve user
 * input from the HTML form in index.html
 *
 * @author Kyle DeFrancia
 * @version 11/9/13.  Created this file -Kyle
 */
define(['./admissions'], function(admissions){

    var Year = 'search_years';
    var GPA = 'gpa';
    var Gender = 'gender';
    var Major = 'major';
    var SATVerbal = 'verbal';
    var SATMath = 'math';
    var NoFilter = 'no_filter';

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
      * setSearchTerm()
      *
      * This function sets the search term based on the parameter passed in.
      *
      * @param value - The new search term
      * @return void
      */
    var setSearchTerm = function(value) {
        document.getElementById("search_term").value = value;
    }

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
      * setSearchType()
      *
      * This function sets the search type based on the parameter passed in.
      *
      * @param value - The new search type
      * @return void
      */
    var setSearchType = function(value) {
        document.getElementById("search_type").value = value;
    }

    /**
      * checkInput()
      *
      * Determine if the text entered by the user is in a proper format.
      *
      * @return true if the search term input is valid, false if it is not
      */
    var checkInput = function() {

        var sType = getSearchType();
        var sTerm = getSearchTerm();

        var acceptable;
        switch(sType) {
            case admissions.CEEB:
                acceptable = /^[0-9]{6}$/;
                break;
            case admissions.HSNAME:
                acceptable = /^[\w ]+$|^[\w ]+, [A-Z]{2}$/;
                break; 
            case admissions.ZIP:
                acceptable = /^[0-9]{5}$/;
                break;
            case admissions.STATE:
                acceptable = /^[A-Z]{2}$/;
                break;
            case admissions.CITY:
                acceptable = /^[\w ]+$|^[\w ]+, [A-Z]{2}$/;
                break;
        }

        // test if the input matches an acceptable format
        return acceptable.test(sTerm);
    }

    /**
      * checkFilterInput()
      *
      * Determine if the user input for a filter is in a proper format.
      *
      * @return true if the filter input is valid, false if it is not
      */
    var checkFilterInput = function(filter) {

        var inputs = getFilterVals(filter);
        var acceptable;

        switch(filter) {
            case GPA:
                // inputs = [min, max]
                var valid = /^[0-9]{1,2}$|^[0-9]{1,2}.[0-9]+$/;
                acceptable = (valid.test(inputs[0]) && valid.test(inputs[1]) && (inputs[0] <= inputs[1]));
                break;
            case Gender:
                // inputs = [gender]
                var valid = /M|F/;
                acceptable = valid.test(inputs[0]); 
                break;
            case Major:
                // inputs = [major]
                var valid = ['Chemistry','Chemistry: ACS','Chemistry: Biochemistry','DNP Doctor of Nursing Practice',
                            'Drama','English','Fine Arts','History','Library Science','Mathematics','Music',
                            'Non-Matriculating','Nursing','Philosophy','Physics','Political Science','Social Work',
                            'Sociology','Sociology:Criminal Justice','Spanish','Theology','Undeclared'];
                acceptable = (valid.indexOf(inputs[0]) > -1);
                break;
            case SATMath:
            case SATVerbal:
                // inputs = [min, max]
                var valid = /^[0-9]+$/;
                acceptable = (valid.test(inputs[0]) && valid.test(inputs[1]) && (inputs[0] <= inputs[1]));
                break;
            case NoFilter:
            default:
                acceptable = true;
        }

        return acceptable;
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
            case NoFilter:
            default:
        }

        return rtnVal;
    }

    /**
      * autoSelectFilter()
      *
      * Automatically change the selected filter when a its inputs are changed.
      *
      */
    var autoSelectFilter = function(input) {

        console.log('Change detected! Here is what I got: ');
        console.log(input);

        switch(input) {
            case 'gpa_min':
            case 'gpa_max':
                document.getElementById('gpa_filter').checked = true;
                break;
            case 'major_select':
                document.getElementById('major_filter').checked = true;
                break;
            case 'gender_select':
                document.getElementById('gender_filter').checked = true;
                break;
            case 'satv_min':
            case 'satv_max':
                document.getElementById('satv_filter').checked = true;
                break;
            case 'satm_min':
            case 'satm_max':
                document.getElementById('satm_filter').checked = true;
                break;
            default:
        }
    }

    var getAllFilterInputs = function() {
        var inputs = [];
        inputs.push('gpa_min');
        inputs.push('gpa_max');
        inputs.push('gender_select');
        inputs.push('major_select');
        inputs.push('satv_min');
        inputs.push('satv_max');
        inputs.push('satm_min');
        inputs.push('satm_max');

        return inputs;
    }


    // Any functions defined in this return statement are considered public
    // functions by RequireJS, and accessible through the namespace that
    // is attached to this module when loaded in other files.
    return {
        NoFilter : NoFilter,
        GPA : GPA,
        Gender : Gender,
        Major : Major,
        SATVerbal : SATVerbal,
        SATMath : SATMath,
        getSearchYears : getSearchYears,
        getSearchTerm : getSearchTerm,
        getSearchType : getSearchType,
    	setSearchTerm : setSearchTerm,
    	setSearchType : setSearchType,
        getSelectedFilter : getSelectedFilter,
        getFilterVals : getFilterVals,
        checkInput : checkInput,
        checkFilterInput : checkFilterInput,
        getAllFilterInputs : getAllFilterInputs,
        autoSelectFilter : autoSelectFilter
    };
});
