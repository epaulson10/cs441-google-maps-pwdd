/*
 *  calculate.js
 *
 *  Functions to request information about students and calculate
 *  the admissions statistics to be displayed in the info box.
 *
 *  @author Joey Devlin
 *  @version 10/30/13.  Fixed formatting. Changes made by Kyle, Nick, and Erik
 */

define(['./utilities','./admissions'], function(utilities, admissions) {
    
    //constants
    var APP_TABLE_ID = '1Dk_XmYIioHO9jltVtLzZuYR66BxkL-si8Wu7B8A';
	var CEEB = 2;
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
    *  @param restriction What filter was selected, for now is null
    *  @param ceeb The HS lookup zoomed in on. Is used to handle HS name searches
    *  @return Column name in applicant info fusion table
    */
    var getAppInfo = function(column,value,restrict,ceeb){ 
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
        
        //create URL for request
        var url = "https://www.googleapis.com/fusiontables/v1/query?sql="; 
        url += "SELECT * FROM " + APP_TABLE_ID; 
        url += " WHERE " + column + match + value + firstHS; 
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
        var search = utilities.getSearchType();
        var term = utilities.getSearchTerm();
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
