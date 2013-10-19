/*
 *  filterMenus.js
 *
 *  A collection of methods for the application-specific FilterMenu object,
 *  including the constructor for the FilterMenu object. The methods
 *  initialize and populate the filter menus as rendered in the browser
 *  and set up listeners for the various filters of the user interface.
 *
 *  @author Tanya L. Crenshaw
 */

define(['./utilities'], function(utilities) {

	/* FilterMenu constructor
	 *
	 * @param name The name for the HTML element representing this FilterMenu object.
	 * @param idName The id for the HTML element representing this FilterMenu object.
	 * @param className The class for the HTML element representing this FilterMenu object.
	 * @param divId The HTML div element's id where the filter is to be placed.
	 * @param menuItems The object containing all the menu items with which to populate the menu.
	 * @param action The function to call when the menu changes.
	 * menu is to be placed.
	 */

	var FilterMenu = function(name, idName, className, divId, menuItems, action) {
		this.name = name;
		this.idName = idName;
		this.className = className;
		this.divId = divId;
		this.menuItems = menuItems;
		this.action = action;

		this.createMenu = function() {
			return createMenu.call(this);
		};
	};
	/*
	 * createMenu
	 *
	 * Create a select HTML element for the initialized FilterMenu object.
	 */
	var createMenu = function() {

		// Get the HTML element to which this menu has been assigned.
		el = document.getElementById(this.divId);

		// Create a select element
		var select = document.createElement("select");

		// Set some attributes
		select.setAttribute("name", this.name);
		select.setAttribute("id", this.idName);

		// Create a default "All" option
		option = document.createElement("option");
		option.setAttribute("value", "All");
		option.setAttribute("label", "All");
		select.appendChild(option);

		// Create some options in the select element based on the
		// menuItems assigned to this object.
		for(var propt in this.menuItems) {
			option = document.createElement("option");
			option.setAttribute("value", propt);
			option.setAttribute("label", propt);
			select.appendChild(option);
		}

		// Append the resulting select menu to the div assigned
		// to this object.
		el.appendChild(select);

		// Attach an action to the menu.
		// Attach the function toggleLayers() to the toggleButton on the main page.
		utilities.addEvent(document.getElementById(this.divId), 'change', this.action);

	};
	// Any functions defined in this return statement are considered public
	// functions by RequireJS, and accessible through the namespace that
	// is attached to this module when loaded in other files.
	return {
		FilterMenu : FilterMenu
	};

});
