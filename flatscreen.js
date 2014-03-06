function runFlatscreen(screenSize, youtubeParameters){

    var ytTag = document.createElement('script'),
        firstScriptTag = document.getElementsByTagName('script')[0],
        loadingTag = document.createElement('div'),
        player,
        screenSize;

    // Setting the class of the loading screen element
    loadingTag.className = 'loading-screen';

    // Setting the source of the ytTag <script>
    ytTag.src = 'https://www.youtube.com/iframe_api';

    // Check to see if an object is empty
    function isObjectEmpty(object) {
        for ( var prop in object ) {
            if ( object.hasOwnProperty(prop) ) {
                return false;
            }
        }
        return true;
    }

    // Checking what width and height perameters have been passed over.
    if ( screenSize === undefined || isObjectEmpty(screenSize) == true || screenSize.width == 0 || screenSize.height == 0 ) {
        screenSize = {
                height: 180,
                width: 320
            };
    };

    if ( screenSize.height === undefined ) {
        screenSize.height = Math.floor( (screenSize.width / 16) * 9 );
    };

    if ( screenSize.width === undefined ) {
        screenSize.width = Math.floor( (screenSize.height / 9) * 16 );
    };

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

        // console.log(screens);

        for (var i = screens.length - 1; i >= 0; i--) {
            var ytID = screens[i].id
                // thumbnail = '<img src="//i1.ytimg.com/vi/' + ytID + '/maxresdefault.jpg" id="' + ytID + '-thumbnail" width="' + screenSize.width + '" height="' + screenSize.height + '" />',
                thumbnail = '<div class="thumb" id="' + ytID + '-thumbnail"><img src="//i1.ytimg.com/vi/' + ytID + '/maxresdefault.jpg" id="' + ytID + '-thumbnail" width="' + screenSize.width + '" height="' + screenSize.height + '" /></div>',
                invisibleButton = '<div title="Click to play" class="invisible-button" id="' + ytID + '-invisible-button"><img src="//i1.ytimg.com/vi/' + ytID + '/maxresdefault.jpg" width="' + screenSize.width + '" height="' + screenSize.height + '" /></div>';
                // console.log(screens[i].id);
                createThumbnail(ytID, thumbnail, invisibleButton);
        }
    }


    // -------------------------------------------------------------------------
    // Create the thumbnail and trigger
    // -------------------------------------------------------------------------
    // Add the thumbnail.
    // Then when that's clicked, fire a function to create a pop-up window /
    // embed the video. (Can be swapped in for something else.)
    //
    function createThumbnail(target, thumbnail, invisibleButton) {
        // console.log('createThumbnail');

        // Get the target element specific to this YouTube video - and no other
        // Then add the thumbnail and invisible button into the target element.
        document.getElementById(target).innerHTML = invisibleButton + thumbnail ;

        // Add a listener to the invisible button to fire the function when it's
        // clicked. Different modes of listening required for IE.
        var elInvisibleButton = document.getElementById(target + '-invisible-button');
        // console.log(elInvisibleButton);

        if ( elInvisibleButton.addEventListener ) {
            elInvisibleButton.addEventListener('click', function(){
                createLoadingScreen(target, thumbnail);
                // console.log('addEventListener fired');
            });
        }
        else if ( elInvisibleButton.attachEvent ) {
            elInvisibleButton.attachEvent('onclick',
                function(){
                    // IE8 needs this wrapped in another function to prevent it #
                    // automatically being triggered
                    createLoadingScreen(target, thumbnail)
                }
            )
        }
    }


    // -------------------------------------------------------------------------
    // This function is fired when the thumbnail is clicked
    // -------------------------------------------------------------------------
    //
    function createLoadingScreen(ytID, thumbnail) {
        // console.log('createLoadingScreen');

        var ytContainer = document.getElementById(ytID),
            ytPos = {
                height : ytContainer.clientHeight,
                width : ytContainer.clientWidth,
                fromTop : ytContainer.offsetTop,
                fromLeft : ytContainer.offsetLeft
            },
            // this is a simple way of creating the spinner - a single
            // div.loading-spinner with 8 span.circles inside
            spinner = '<div class="loading-spinner" id="' + ytID + '-spinner"><span class="circles"></span><span class="circles"></span><span class="circles"></span><span class="circles"></span><span class="circles"></span><span class="circles"></span><span class="circles"></span><span class="circles"></span></div>';

        // set the dimensions and position of the loading screen
        loadingTag.id = ytID + '-loading';
        loadingTag.style.width = ytPos.width + 'px';
        loadingTag.style.height = ytPos.height + 'px';
        loadingTag.style.top = ytPos.fromTop + 'px';
        loadingTag.style.left = ytPos.fromLeft + 'px';


        document.body.appendChild(loadingTag); // adding this as the very last element, to avoid it being contained by any position: reletive element
        document.getElementById(loadingTag.id).innerHTML = thumbnail + spinner;

        youtubePlayer(ytID);
    }

    function youtubePlayer(ytID) {
        // console.log('youtubePlayer');

        player = new YT.Player(ytID, {
            height: screenSize.height,
            width: screenSize.width,
            videoId: ytID,
            playerVars : youtubeParameters,
            events: {
                'onReady': destroyLoadingScreen
            }
        });
    }


    // -------------------------------------------------------------------------
    // Anything that needs to be done once the video is laoded
    // -------------------------------------------------------------------------
    //
    function destroyLoadingScreen(event) {
        // console.log('destroyLoadingScreen');

        // Get the loading screen ID from YouTube ID that the event passed over
        var loading = document.getElementById(event.target.a.id + '-loading');

        // remove the loading screen
        loading.parentNode.removeChild(loading);
    }

   findYTelements();

}