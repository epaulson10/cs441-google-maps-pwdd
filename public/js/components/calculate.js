/*
 *  calculate.js
 *
 *  Functions to request information about students and calculate
 *  the admissions statistics to be displayed in the info box.
 *
 *  @author Joey Devlin
 *  @version 10/30/13.  Fixed formatting. Changes made by Kyle, Nick, and Erik
 *  @version 11/10/13. Made some changes, so no longer have to make a third Fusion Table
 *                     request. See topSchools for more information.
 */

define(['./utilities','./admissions'], function(utilities, admissions) {
    
    //constants
    //https://www.google.com/fusiontables/data?docid=1-kMbG4vqpghLbiIgEEDwi8JT05JiUAMEWwYO18M#rows:id=1
    var APP_TABLE_ID = '1-kMbG4vqpghLbiIgEEDwi8JT05JiUAMEWwYO18M';
	var CEEB = 2;
    var APPLIED = 8;
    var ACCEPTED = 9;
    var CONFIRMED = 10;
    var ENROLLED = 11;
    var HSNAME = 27;

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
    *  @param restrict What filter was selected, for now is null
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
            if(column == "HSName" && ceeb != undefined && ceeb != "NaN"){
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
				//Create an array to store ceeb and filter criteria numbers (key value pairs)
				var schools = {};
                
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

                    //because have only one requester have to link all of these together
					topSchools(response);
                }
                else{
                     utilities.getInfoBoxElement().innerHTML = "Cannot find data for " + search + ": " + term + ".";
                     utilities.getTopSchoolsBox().innerHTML = "<h3>Top Schools</h3>" + "Cannot find data for " + search + ": " + term + ".";
                }
				
            }
            else{
                utilities.getInfoBoxElement().innerHTML = "ERROR: for " + search + ": " + term + ".";
                utilities.getTopSchoolsBox().innerHTML = "ERROR: for " + search + ": " + term + ".";
            }
        } 
    };



    /**
    *  topSchools()
    *
    * Populates the right side bar with the schools that have the most applications
    *
    * @param response: SQL response from Query sent in getAppInfo
    * @return void
    */
    var topSchools = function(response){ 
        var tApplied = 0;
        //Create an array to store ceeb and filter criteria numbers (key value pairs)
        var schools = {};
        
        if(response["rows"] != undefined) {
            rows = response["rows"]; 

            //find the total number of students who applied to UP from each school
            for(var i = 0; i < rows.length; i++){ 
                if(rows[i][APPLIED] != "I"){

                    //Erik and Nick are adding this code
                    //Find all ceebs and number applied for them for top schools feature
                    var ceeb = rows[i][CEEB];
                    
                    if (schools[ceeb] === undefined){
                        var name = rows[i][HSNAME];
                        schools[ceeb] = [1,name];
                    }
                    else{
                        schools[ceeb][0] = schools[ceeb][0] + 1;
                    }

                }
            }
            console.log(schools);
            
            //Erik and Nick's section. Populate top schools bar.
            //Sorting section taken from: http://stackoverflow.com/questions/1069666/sorting-javascript-object-by-property-value
            var sortable = [];
            for (var school in schools) {
                sortable.push([school,schools[school]]);
            }
            sortable.sort(function(a,b) {return b[1][0]-a[1][0]});
            console.log(sortable);

            //decide how many schools to show
            if (sortable.length >10)
                numTopSchools = 10;
            else
                numTopSchools = sortable.length;

            var displayData = "";

            // Storable[i] looks like:
            // [CeebCode, ArrayPointer]      0               1
            //            ArrayPointer ->[#applied,High School name]
            for (var i =0; i < 10; i++) {
                if (sortable[i] === undefined)
                    break;
                displayData += (i+1) + ". " +  sortable[i][1][1] + ": " + sortable[i][1][0] + "<br>";
            }
            utilities.getTopSchoolsBox().innerHTML = "<h3>Top Schools</h3>" + displayData;
        }

                
    }
    
    // Any functions defined in this return statement are considered public
    // functions by RequireJS, and accessible through the namespace that
    // is attached to this module when loaded in other files.
    return {
        getAppInfo : getAppInfo
    };
});
