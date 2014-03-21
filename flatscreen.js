function runFlatscreen(youtubeParameters, gaEvents, thumbnailDirectory){

    var ytTag = document.createElement('script'),
        firstScriptTag = document.getElementsByTagName('script')[0],
        loadingTag = document.createElement('div'),
        player,
        screenSize,
        gaEventsArray = ['_trackEvent', 'Videos'];

    // Setting the class of the loading screen element
    loadingTag.className = 'loading-screen';

    // Setting the source of the ytTag <script>
    ytTag.src = 'https://www.youtube.com/iframe_api';

    // If no player parameters have been passed over, then these defaults will
    // be used
    if ( youtubeParameters === undefined || youtubeParameters == ' ' || youtubeParameters === null || isObjectEmpty(youtubeParameters) == true ) {
        var youtubeParameters = {
                autohide: 1, // 3 is a hidden perameter which hides the controls, but keeps the progress bar.
                color: 'white',
                controls: 1,
                disablekb: 0,
                modestbranding: 0,
                showinfo: 0,
                theme: 'light'
            };
    };

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


    // Add the YouTube script tag before the first <script> tag
    firstScriptTag.parentNode.insertBefore(ytTag, firstScriptTag);


    // If gaEvents is set to true, but GA isn't there - then we need to reset
    // gaEvents to false
    if ( gaEvents === true && typeof _gaq === 'undefined' ) {
        var gaEvents = false;
    }

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
        for (var i = targets.length - 1; i >= 0; i--) {
            target = document.getElementById(targets[i]);
            target.parentNode.removeChild(target);
        }
    }


    // -------------------------------------------------------------------------
    // Return an array for the GA events tracking, and fire the event
    // -------------------------------------------------------------------------
    function gaEvent(action, ytID) {
        var arr = gaEventsArray.concat(action, 'YouTube ID: ' + ytID);
        _gaq.push( arr );
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
        };
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
            screens = document.getElementsByClassName('flatscreen');
        }
        else if ( document.querySelectorAll ) {
            // Oh. Ah well, at least it works in IE8
            screens = document.querySelectorAll('.flatscreen');
        }

        else {
            // IE7, I will set Liam Neeson on you.
            var screens = [],
                classname = 'flatscreen',
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
        if ( screens == 0 || screens === undefined || screens === null ) {
            return false;
        }

        // console.log(screens);

        for (var i = screens.length - 1; i >= 0; i--) {
            var ytID = screens[i].id,
                wrapper = '<div id="' + ytID + '-wrapper" class="flatscreen-wrapper"></div>';

            if ( thumbnailDirectory === undefined || thumbnailDirectory == ' ' || thumbnailDirectory === null || isObjectEmpty(thumbnailDirectory) == true ) {
                var invisibleButton = '<div title="Click to play" class="invisible-button" id="' + ytID + '-invisible-button"><img src="//i1.ytimg.com/vi/' + ytID + '/maxresdefault.jpg" /></div>',
                loadingScreen = '<div class="loading-screen" id="' + ytID + '-loading"><div class="loading-spinner" id="' + ytID + '-spinner"><span class="circles"></span><span class="circles"></span><span class="circles"></span><span class="circles"></span><span class="circles"></span><span class="circles"></span><span class="circles"></span><span class="circles"></span></div><img src="//i1.ytimg.com/vi/' + ytID + '/maxresdefault.jpg" /></div>';
                // console.log(screens[i].id);
            }

            else {
                var invisibleButton = '<div title="Click to play" class="invisible-button" id="' + ytID + '-invisible-button"><img src="' +thumbnailDirectory + '/' + ytID + '.jpg" /></div>',
                loadingScreen = '<div class="loading-screen" id="' + ytID + '-loading"><div class="loading-spinner" id="' + ytID + '-spinner"><span class="circles"></span><span class="circles"></span><span class="circles"></span><span class="circles"></span><span class="circles"></span><span class="circles"></span><span class="circles"></span><span class="circles"></span></div><img src="' + thumbnailDirectory + '/' + ytID + '.jpg" /></div>';
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
        else if ( elInvisibleButton.attachEvent ) {
            elInvisibleButton.attachEvent('onclick',
                function(){
                    // IE8 needs this wrapped in another function to prevent it #
                    // automatically being triggered
                    createLoadingScreen(target)
                }
            )
        }

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
        };

        // console.log('createLoadingScreen');
        removeables = [ ytID + '-invisible-button' ];
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
                'onReady': steadyGo,
                'onStateChange' : stateChange
            }
        });
        // console.log(player);
        // console.log(ytID + '-wrapper');
    }


    function steadyGo(event) {
        // console.log('steadyGo');
        // get the YouTube ID from ID-wrapper event passed over
        var ytID = event.target.a.id.match( '(.{11})(?:-wrapper)' )[1],
            removeables = [ ytID + '-loading' ];

        removeElement( removeables );

        if ( gaEvents === true ) {
            gaEventsTrigger(ytID, event.data);
        }
    }

    function stateChange(event) {
        // console.log('stateChange');
        if ( gaEvents === true ) {
            var ytID = event.target.a.id.match( '(.{11})(?:-wrapper)' )[1];

            gaEventsTrigger(ytID, event.data);
        };
    }

    findYTelements();

}