/*
 *  calculate.js
 *
 *  Functions to request information about students and calculate
 *  the admissions statistics to be displayed in the info box.
 *
 *  @author Joey Devlin
 *  @version 10/30/13.  Fixed formatting. Changes made by Kyle, Nick, and Erik
 */

define(['./utilities','./admissions', './form'], function(utilities, admissions, form) {
    
    //constants
    var APP_TABLE_ID = '1Dk_XmYIioHO9jltVtLzZuYR66BxkL-si8Wu7B8A';
    var APPLIED = 8;
    var ACCEPTED = 9;
    var CONFIRMED = 10;
    var ENROLLED = 11; 

    /**
      *  convertColumn()
      *
      *  Converts between the column names in the fusion table that displays 
      *  information on the map and the one that adds up all the
      *  applicant info.
      *
      *  @param input The column name in the HS Geo info fusion table
      *  @return Column name in applicant info fusion table
      */
    var convertColumn = function(input){ 
        switch(input) { 
            case admissions.ZIP: 
                input = "HSZip"; 
                break; 
            case admissions.CEEB: 
                input = "HighSchoolCode"; 
                break; 
            case admissions.HSNAME: 
                input = "HSName"; 
                break; 
            case admissions.STATE: 
                input = "HSState"; 
                break; 
            case admissions.CITY: 
                input = "HSCity"; 
                break; 
        } 
        return input; 
    }; 
    
    /**
      *  getAppInfo()
      *
      *  Find the total number of studends that have enrolled, applied,
      *  been accepted, and confirmed.
      *
      *  @param column The column the user is searching by
      *  @param value What was in the text box
      *  @param years An array of years to display data for
      *  @param restriction What filter was selected
      *  @param ceeb The HS lookup zoomed in on. Is used to handle HS name searches
      *  @return Column name in applicant info fusion table
      */
    var getAppInfo = function(column, value, years, restrict, ceeb){ 

        //TODO: We probably need to move all of these column names to a
        //      different file, like admissions.js I would think

        column = convertColumn(column);

        //set defaults for variables
        var match = " CONTAINS IGNORING CASE ";
        var firstHS = "";
        
        //need to deal with integer and string matches
        if(column == "HighSchoolCode" || column == "HSZip"){
            match = " = ";
        }
        else{
            //silly fusion table query needs '' around term
            value = "'"+value+"'"; 
            
            //only want to get data for the HS we zoom in on
            if(column == "HSName" && ceeb != undefined){
                firstHS = " AND HighSchoolCode = " + ceeb;
            }
        }

        // make sure we only get data for the selected years
        var data_years = 'Entry_Year IN (';
        for(var i = 0; years[i]; i++) {
            data_years += "'" + years[i] + "', ";
        }
        //trim off the last ", " and put the closing paren on
        //var re = /, $/;
        //data_years.replace(re, ')');
        data_years = data_years.slice(0, -2);
        data_years += ')';

        // apply the filter selected by the user
        var filter;
        var inputs = form.getFilterVals(restrict);
        switch(restrict) {
            case form.GPA:
                filter = 'HS_GPA >= ' + inputs[0] + ' AND HS_GPA <= ' + inputs[1];
                break;
            case form.Gender:
                filter = "Gender MATCHES '" + inputs[0] + "'";
                break;
            case form.Major:
                filter = 'Planned_Major_Code = ' + admissions.majorToCode(inputs[0]);
                break;
            case form.SATVerbal:
                filter = 'SAT_Verbal >= ' + inputs[0] + ' AND SAT_Verbal <= ' + inputs[1];
                break;
            case form.SATMath:
                //it really is SAT_MAth in the database
                filter = 'SAT_MAth >= ' + inputs[0] + ' AND SAT_MAth <= ' + inputs[1];
                break;
            case form.None:
            default:
                filter = '';
        }


        //create URL for request
        var url = "https://www.googleapis.com/fusiontables/v1/query?sql="; 
        url += "SELECT * FROM " + APP_TABLE_ID; 
        url += " WHERE " + column + match + value + firstHS; 
        url += " AND " + data_years;
        if(filter) {
            url += " AND " + filter;
        }
        url += "&key=" + apikey; 
        console.log(url); 
   
        utilities.sendRequest(url, appResponse); 
    }; 

    /**
      *  appResponse()
      *
      *  Handles the response from the fusion table hosted at:
      *  https://www.google.com/fusiontables/DataSource?docid=1w-D42ugHUlbWRt_s4NFUDkB7NURvYQQoB55dSW8#rows:id=1
      *  Populates the textbox beneath the map based on the query send in getAppInfo()
      *
      * @param void
      * @return void
      */
    var appResponse = function(){ 
        var search = form.getSearchType();
        var term = form.getSearchTerm();
        if(httpRequest.readyState === 4) { 
            if(httpRequest.status === 200) { 
                var response = JSON.parse(httpRequest.responseText); 
                console.log(response); 
                
                //initialize counters to zero
                var tApplied = tAccepted = tEnrolled = tConfirmed = 0; 
                
                if(response["rows"] != undefined) {
                    //find the totals for students that have applied, confirmed, enrolled, and accepted
                    rows = response["rows"]; 
                    for(var i = 0; i < rows.length; i++){ 
                        if(rows[i][APPLIED] != "I"){ 
                            tApplied ++; 
                        }                     
                        if(rows[i][ACCEPTED] == "A"){ 
                            tAccepted ++; 
                        } 
                        if(rows[i][ENROLLED] == "Y"){ 
                            tEnrolled ++; 
                        }                     
                        if(rows[i][CONFIRMED] == "CONF"){ 
                            tConfirmed ++; 
                        } 
                    } 

                    //string with all the application info we need to display
                    var temp = "Applied : "+tApplied+"<br>Accepted : " + tAccepted +
                                "<br>Confirmed : " + tConfirmed + "<br>Enrolled : " + tEnrolled; 
                    
                    utilities.getInfoBoxElement().innerHTML ="Searched by " + search + " : " + term +"<br><br>" + temp; 
                }
                else{
                     utilities.getInfoBoxElement().innerHTML = "Cannot find data for " + search + ": " + term + ".";
                }
            } 
        } 
    };
    
    // Any functions defined in this return statement are considered public
    // functions by RequireJS, and accessible through the namespace that
    // is attached to this module when loaded in other files.
    return {
        getAppInfo : getAppInfo
    };
});
