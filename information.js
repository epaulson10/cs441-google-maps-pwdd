/*
 *  information.js
 *
 *  A collection of functions that collect and format the information that
 * is displayed about the zipcode areas on the map.
 *
 *  @author Tanya L. Crenshaw
 */


/* From JavaScript patterns by S. Stefanov, 
 *    "As the complexity of a program grows and some parts of the code
 * get split into different files, it becomes unsafe to just assume that 
 * your code is first.  Therefore, before adding a property or creating
 * a namespace, it's best to check first that it doesn't already exist"
 */
var cs441GoogleMapsViz = cs441GoogleMapsViz || {};


/*
 *  formatInfoWindow()
 * 
 * Based on the parameter 'information', format and display a collection
 * of information in the infoWindow for the FusionTablesLayer selection
 * parameter.
 *
 * @param displayedArea The FusionTablesLayer selection that is 
 * currently displayed.
 * 
 * @param information The data to be displayed in the infoWindow 
 * for the current display.
 * 
 * @return void
 */
cs441GoogleMapsViz.formatInfoWindow = function(displayedArea, information)
{
			displayedArea.infoWindowHtml ="";
	        displayedArea.infoWindowHtml += "<p><div id=\"zip_popup\">Zip Code:</div> " + information + "</p>";
};

    
