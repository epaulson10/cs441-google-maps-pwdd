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
 *  @version 11/11/13. Updated code, so the top schools are click-able.
 *                     Still need to actually make it do something.
 */


define(['./usmap','./utilities','./admissions', './form'], function(usmap, utilities, admissions, form) {
    
    //constants
    //https://www.google.com/fusiontables/data?docid=1-kMbG4vqpghLbiIgEEDwi8JT05JiUAMEWwYO18M#rows:id=1
    var APP_TABLE_ID = '1TwmkByLOqdTQqwmYb7dIC6ygGDlQAjSyWNSCZUg';
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
    var getAppInfo = function(column, value, years, restrict, ceeb){ 

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
                    
                    utilities.getInfoBoxElement().innerHTML ="<div id = infoBoxHeader> Searched by " + search + " : " + term +"<br><br></div>" + temp; 

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
                        schools[ceeb] = [1,name,ceeb];
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

			addTopSchools(sortable);
        }

                
    }
	
	
	/*
	* addTopSchools()
	*
	* Adds the HTML and listeners to the Top Schools info panel
	*
	* @param : storable - data strucure containing the necessary info to 
	*		   search for a specific High School
	*/
	function addTopSchools(sortable){
		//decide how many schools to show
		if (sortable.length >10)
			numTopSchools = 10;
		else
			numTopSchools = sortable.length;
			
		var displayData = "";
		var element = utilities.getTopSchoolsBox();
		
		//add header to field
		element.innerHTML = "<h3>Top Schools</h3>";
		
		// Storable[i] looks like:
		// [CeebCode, ArrayPointer]      0               1          2
		//            ArrayPointer ->[#applied,High School name, ceeb]
		for (var i =0; i < 10; i++) {
			if (sortable[i] === undefined)
				break;
			var newPar =document.createElement("p");
			var ceebParam = sortable[i][0];
			newPar.innerHTML = "<a href = #>" + (i+1) + ". " +  sortable[i][1][1] + ": " + sortable[i][1][0] + "</a>" + "<br>";
			newPar.id = ceebParam;
			element.appendChild(newPar);
			
			//when the user clicks on a school, simulate search by CEEB
			newPar.onclick = function(){
				console.log("CLICKED " + this.id);
				var origSearchTerm = form.getSearchTerm();
				var origSearchType = form.getSearchType();
				
				form.setSearchType("Code");
				form.setSearchTerm(this.id);
				
				document.getElementById('lookupButton').click();
				
			};
		}
	}
    
    // Any functions defined in this return statement are considered public
    // functions by RequireJS, and accessible through the namespace that
    // is attached to this module when loaded in other files.
    return {
        getAppInfo : getAppInfo
    };
});
