
/*! Flatscreen.js
//  https://github.com/WWF-International/flatscreen
----------------------------------------------------------------------------- */

var flatscreen = function(youtubeParameters, gaEvents, alternativeThumbnails) {
    "use strict";

    var ytTag = document.createElement('script'),
        firstScriptTag = document.getElementsByTagName('script')[0],
        loadingTag = document.createElement('div'),
        player;

    if ( gaEvents === 'undefined' ) {
        var gaEvents = false;
    }

    // Setting the class of the loading screen element
    loadingTag.className = 'loading-screen';

    // Setting the source of the ytTag script
    ytTag.src = 'https://www.youtube.com/iframe_api';

    // If no player parameters have been passed over, then these defaults will
    // be used
    if ( typeof youtubeParameters === 'undefined' || youtubeParameters == ' ' || youtubeParameters === null || isObjectEmpty(youtubeParameters) === true ) {
         youtubeParameters = {
                autohide: 3, // 3 is a hidden perameter which hides the controls, but keeps the progress bar.
                color: 'white',
                controls: 1,
                disablekb: 0,
                modestbranding: 0,
                showinfo: 0,
                theme: 'light'
            };
    }

    // To ensure that the iframe honours other element's z-index, wmode is set
    // to transparent.
    youtubeParameters.wmode = 'transparent';

    // Autoplay should always be turned on. Don't change this.
    // It needs to autoplay to avoid clicking play once to trigger the load,
    // then *again* to play the video.
    youtubeParameters.autoplay = 1;

    // Generally, related videos are tricky if you're embedding a video on your
    // website. For this reason, they're turned off by default.
    youtubeParameters.rel = 0;


    // Add the YouTube script tag before the first script tag
    firstScriptTag.parentNode.insertBefore(ytTag, firstScriptTag);


    // -------------------------------------------------------------------------
    // Check to see if an object is empty
    // -------------------------------------------------------------------------
    function isObjectEmpty(object) {
        for ( var prop in object ) {
            if ( object.hasOwnProperty(prop) ) {
                return false;
            }
        }
        return true;
    }


    // -------------------------------------------------------------------------
    // Remove elements function
    // -------------------------------------------------------------------------
    function removeElement(targets) {
        var target;
        for (var i = targets.length - 1; i >= 0; i--) {
            target = document.getElementById(targets[i]);
            target.parentNode.removeChild(target);
        }
    }


    // -------------------------------------------------------------------------
    // Return an array for the GA events tracking, and fire the event
    // -------------------------------------------------------------------------
    function gaEvent(action, ytID) {
        if ( gaEvents === true ) {
            var eventCategory = 'Videos';
            var eventAction = action;
            var eventLabel = 'YouTube ID: ' + ytID;

            // Universal Analytics - analytics.js
            // https://developers.google.com/analytics/devguides/collection/analyticsjs/events#implementation
            if (typeof ga !== 'undefined') {
                ga('send', 'event', eventCategory, eventAction, eventLabel);
            }

            // Old Google Analytics - ga.js
            // https://developers.google.com/analytics/devguides/collection/gajs/methods/gaJSApiEventTracking
            if (typeof _gaq !== 'undefined') {
                _gaq.push( ['_trackEvent', eventCategory, eventAction, eventLabel] );
            }
        }
    }


    // -------------------------------------------------------------------------
    // This function is triggered when a triggerEvent is fired within the
    // YouTube iframe.
    // -------------------------------------------------------------------------
    function gaEventsTrigger(ytID, data) {

        if ( data === -1 ) {
            gaEvent('unstarted', ytID);
        }

        else if ( data === 0 ) {
            gaEvent('ended', ytID);
        }
        else if ( data === 1 ) {
            gaEvent('playing', ytID);
        }

        else if ( data === 2 ) {
            gaEvent('paused', ytID);
        }

        else if ( data === 3 ) {
            gaEvent('buffering', ytID);
        }

        else if ( data === 5 ) {
            gaEvent('video cued', ytID);
        }
    }

    // -------------------------------------------------------------------------
    // Create the specifications for the thumbnails and invisible buttons
    // -------------------------------------------------------------------------
    // Get all of the elements that are tagged as YouTube thumbnails with the
    // .flatscreen class. Get the #id of each .flatscreen container - which should be
    // the YouTube video's unique identifier. eg 'GaAgtwbZV_E'
    //
    // Go through each .flatscreen element, creating the thumbnail image and the
    // invisible button that lies over everything. (Invisible button is needed
    // to avoid the play icon pseudo-classes getting in the way.)
    //
    // Pass these details over to the createThumbnail function
    //
    function findYTelements() {
        // console.log('findYTelements');
        var screens = '';

        if ( document.getElementsByClassName ) {
            // Huzzah, a normal way of getting class names.
            screens = document.getElementsByClassName('js-flatscreen');
        }
        else if ( document.querySelectorAll ) {
            // Oh. Ah well, at least it works in IE8
            screens = document.querySelectorAll('.js-flatscreen');
        }

        else {
            // IE7, I will set Liam Neeson on you.
            screens = [];
            var classname = 'js-flatscreen',
                getEverything = document.getElementsByTagName('*');

            var classnameRegex = new RegExp('(^|\\s)' + classname + '(\\s|$)');
            for (var i = getEverything.length - 1; i >= 0; i--) {

                if ( classnameRegex.test(getEverything[i].className) ) {
                    screens.push(getEverything[i]);
                }
            }
        }

        // Need to check if there are actually any .flatscreen elements. If not,
        // then this will stop flatscreen.js from going any further.
        if ( screens === 0 || typeof screens === 'undefined' || screens === null ) {
            return false;
        }

        // console.log(screens);

        // if alternativeThumnails doesn't exist, create an empty object.
        if ( typeof alternativeThumbnails === 'undefined' ) {
            alternativeThumbnails = {};
        }

        for (var i = screens.length - 1; i >= 0; i--) {
            var ytID = screens[i].id,
                wrapper = '<div id="' + ytID + '-wrapper" class="flatscreen-wrapper"></div>',
                classes = screens[i].className;

            // Add the flatscreen class to style the screens[i] element, if not
            // already present.
            // -----------------------------------------------------------------
            if ( !classes.match(/(?: |^)flatscreen/g) ) {
              screens[i].className = classes + ' flatscreen';
            }

            // Use the alternative thumbnails if an object is present
            // -----------------------------------------------------------------
            var invisibleButton;
            var loadingScreen;
            var thumbnail;

            if ( typeof alternativeThumbnails[ytID] === 'string' ) {
                // console.log('alternative thumbnail - ' + alternativeThumbnails[ytID]);

                thumbnail = '<img src="' + alternativeThumbnails[ytID] + '" />';
                invisibleButton = '<div title="Click to play" class="invisible-button" id="' + ytID + '-invisible-button">' + thumbnail + '</div>';
                loadingScreen = '<div class="loading-screen" id="' + ytID + '-loading"><div class="loading-spinner" id="' + ytID + '-spinner"><span class="circles"></span><span class="circles"></span><span class="circles"></span><span class="circles"></span><span class="circles"></span><span class="circles"></span><span class="circles"></span><span class="circles"></span></div><img src="' + alternativeThumbnails[ytID] + '" /></div>';
                // console.log(screens[i].id);
            }


            // If the thumbnails haven't been set, then use the YT thumbnails
            // -----------------------------------------------------------------
            else {
                thumbnail = '<img src="//i1.ytimg.com/vi/' + ytID + '/mqdefault.jpg" />';
                invisibleButton = '<div title="Click to play" class="invisible-button" id="' + ytID + '-invisible-button">' + thumbnail + '</div>';
                loadingScreen = '<div class="loading-screen" id="' + ytID + '-loading"><div class="loading-spinner" id="' + ytID + '-spinner"><span class="circles"></span><span class="circles"></span><span class="circles"></span><span class="circles"></span><span class="circles"></span><span class="circles"></span><span class="circles"></span><span class="circles"></span></div><img src="//i1.ytimg.com/vi/' + ytID + '/mqdefault.jpg" /></div>';
                // console.log(screens[i].id);
            }


            createThumbnail(ytID, wrapper, invisibleButton, loadingScreen);
        }
    }


    // -------------------------------------------------------------------------
    // Create the thumbnail and trigger
    // -------------------------------------------------------------------------
    // Add the thumbnail.
    // Then when that's clicked, fire a function to create a pop-up window /
    // embed the video. (Can be swapped in for something else.)
    //
    function createThumbnail(target, wrapper, invisibleButton, loadingScreen) {
        // console.log('createThumbnail');

        // Get the target element specific to this YouTube video - and no other
        // Then add the thumbnail and invisible button into the target element.
        document.getElementById(target).innerHTML = wrapper + invisibleButton + loadingScreen;

        // Add a listener to the invisible button to fire the function when it's
        // clicked. Different modes of listening required for IE.
        var elInvisibleButton = document.getElementById(target + '-invisible-button');
        // console.log(elInvisibleButton);

        if ( elInvisibleButton.addEventListener ) {
            elInvisibleButton.addEventListener('click', function(){
                createLoadingScreen(target);
                // console.log('addEventListener fired');
            });
        }
        // else if ( elInvisibleButton.attachEvent ) {
        //     elInvisibleButton.attachEvent('onclick',
        //         function(){
        //             // IE8 needs this wrapped in another function to prevent it #
        //             // automatically being triggered
        //             createLoadingScreen(target);
        //         }
        //     );
        // }

        if ( gaEvents === true ) {
            gaEvent('ready for playback', target);
        }
    }


    // -------------------------------------------------------------------------
    // This function is fired when the thumbnail is clicked
    // -------------------------------------------------------------------------
    //
    function createLoadingScreen(ytID) {

        if ( gaEvents === true ) {
            gaEvent('thumbnail triggered', ytID);
        }

        // console.log('createLoadingScreen');
        var removeables = [ ytID + '-invisible-button' ];
        removeElement( removeables );

        document.getElementById( ytID + '-loading').style.display = 'block';

        youtubePlayer(ytID);
    }

    function youtubePlayer(ytID) {
        // console.log('youtubePlayer');

        player = new YT.Player(ytID + '-wrapper', {
            height: '100%',
            width: '100%',
            videoId: ytID,
            playerVars : youtubeParameters,
            events: {
                onReady: function(e){
                    steadyGo(e, ytID) // pass over ytID to remove reliance on the e parameters shifting and breaking flatscreen.
                },
                onStateChange : function(e){
                    stateChange(e)
                }
            }
        });
        // console.log(player);
        // console.log(ytID + '-wrapper')
 }


    function steadyGo(event, ytID) {
        // console.log('steadyGo');
        // console.dir(event);

        // REMOVED: get the YouTube ID from ID-wrapper event passed over;
        // this kept breaking - the 'f' would change to another letter every couple of months
        // var event.target.f.id.match( '(.{11})(?:-wrapper)' )[1], //

        var removeables = [ ytID + '-loading' ];

        removeElement( removeables );

        if ( gaEvents === true ) {
            gaEventsTrigger(ytID, event.data);
        }
    }

    function stateChange(event) {
        // console.log('stateChange');
        if ( gaEvents === true ) {
            var ytID = event.target.a.id.match( '(.{11})(?:-wrapper)' )[1]; // FIX THIS - "a" is undocumented, so will likely break in the future.

            gaEventsTrigger(ytID, event.data);
        }
    }

    findYTelements();
}