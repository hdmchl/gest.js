/* This demo uses gest.js to allow the user to control the image carousel on Deloitte Digital's homepage using mid-air hand gestures.
 *
 * Open Chrome and go to http://www.deloittedigital.com.au
 * Open the JavaScript console. On Windows: CTRL-SHIFT-J and on Mac ALT-⌘-J
 * Paste this code and hit enter:
 */

var head = document.getElementsByTagName('head')[0];
var script = document.createElement('script');
script.type = 'text/javascript';
script.src = 'https://raw.github.com/hadimichael/gest.js/master/src/gest.min.js';

script.onload = function() { 
	document.addEventListener('gest', function(gesture) {
		if (gesture.left) {
			$('.next').trigger('click');
		} else if (gesture.right) {
			$('.prev').trigger('click');
		}
	}, false);

	gest.start();
};

head.appendChild(script);
	
/*
 * Close the console and Allow Chrome to access your webcam.
 * Gesture horizontally with your hand to move the carousel.
 */