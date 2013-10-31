// RequireJS Bootstrap File

/**
 *  require.config
 *
 *  This function will take an object of options and configure our RequireJS
 *  environment for us.
 *
 *  In this case we have simply defined the base URL (relative to the root
 *  of the website) and some additional paths that map to resources that
 *  we would like to define.
 *
 *  i.e., to define a resource for the Google Maps API, we will define a
 *  friendly name for it (google-maps), and set the value of this entry
 *  to the the URI of that resource (//maps.googleapis.com/maps/api/js?sensor=false).
 *
 *  For more information on the funny URL we used for google-maps, check out
 *  this _fantastic_ article written by Paul Irish (one of the giants in
 *  webdevelopment):
 *
 *  http://www.paulirish.com/2010/the-protocol-relative-url/
 */
require.config({
    baseUrl: 'public/js/',
    paths: {
        'jquery':'vendor/jquery-2.0.3',
        'utilities':'components/utilities',
        'admissions':'components/admissions',
        'layers':'components/layers',
        'usmap':'components/usmap',
        'calculate' : 'components/calculate'
    }
});

/**
 *
 *  require
 *
 *  This is the meat and bones of our Require bootstrap. Here we will define
 *  each of the modules, libraries, and other JS files that we will use in
 *  our project.
 *
 *  This process is similar to including files in a C file.
 *
 *  Notice that to define an import statement, we can simply point to the
 *  file relative to our baseUrl (defined in require.config above).
 *
 */
require([
    'jquery',
    'utilities',
    'admissions',
    'layers',
    'usmap',
    'calculate'
], function($,utilities,admissions,layers,usmap,calculate) {
//], function($, util, usmap) {

        // Note that the order of definition is VERY important. In the closure
        // defined next we see three variables being passed in: $, util, 
        // usmap. Now notice the order that we have listed our dependencies: 
        // jquery, utilities, and usmap. Require will bind the three arguments 
        // in turn to the namespace of our first three dependencies so that 
        // within this file we can reference jquery as $, utilities as util, 
        // and usmap as usmap. Fancy! 
        //
        // The closure accepts arguments <= the number of dependencies we have 
        // listed, otherwise those arguments don't mean anything.
    var $document = $(document);
    $document.ready(function() {
        usmap.initialize();        
    }); //document
}); //require()