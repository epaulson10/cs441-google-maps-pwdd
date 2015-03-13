# Coding Standards #

## Bracket Style and whitespace ##

  * Opening brackets should be placed on the same line as the function that is being called.
  * One line of vertical white space will be left in-between the end of a function and the beginning of the comment header for the next function. Vertical white space should also be used where appropriate to designate separation of code inside functions.

```
   cs441GoogleMapsViz.initialize = function() {
       …
     
      //The code below is commented and thus there is vertical white space 
      //above to denote the separation
       … 
   }
	--THIS WILL BE WHITE SPACE--
   cs441GoogleMapsViz.random = function() {
       …

   }
```

## Comments ##
  * Issues to address should be annotated with TODO:
  * Comment headers for files should be done in the style of Doxygen. They should:
    * begin with /`*` .
    * have the file's name at the top.
    * provide a description of the file's purpose.
    * specify the original author using @author.
    * specify the date the file was updated as well as who made the changes marked by @version
```
   /*
    *  testing.js
    *  
    *  The purpose of this file is to perform x, y , z, etc...   
    *
    *  @author xxxxxxxxxxxx
    *  @version xx/xx/2013  Changed nothing. Changes made by xxxxxxxxxx
    */
```

  * Comment headers for functions should be done in the style of Doxygen. They should:
    * begin with /`**`.
    * include the function's name, with ().
    * specify each parameter using @param.
    * specify the return value using @return.
  * Any description of “tricky/unobvious” will be done with comments inside the function denoted by ”//” above the code in question.
```
  /**
    * function()
    *
    * @param int x, int y
    *
    * @return void
    *
    */
    void function(int x, int y) {
	//The variable z will hold the sum of x and y
        int z = x+y;
    }
```

## Global Variables ##

  * Aside from the project namespace, var pwdd, there should be no use of global variables.

## Namespace ##
  * All .js files should begin by initializing or adding to the project's namespace:
```
   /* From JavaScript patterns by S. Stefanov,
    *    "As the complexity of a program grows and some parts of the code
    * get split into different files, it becomes unsafe to just assume that
    * your code is first.  Therefore, before adding a property or creating
    * a namespace, it's best to check first that it doesn't already exist"
    */

   var pwdd = pwdd || {};
```

