/* 
 * @name: gest.js
 * @description: gest.js is a webcam based gesture recognition library that can help developers make webpages more immersive.
 * @version: 0.4.3
 * @author: Hadi Michael (http://hadi.io)
 * @acknowledgements: gest.js is an extension of work started by William Wu (https://github.com/wvvvw)
 * @license: MIT License
	The MIT License (MIT)

	Copyright (c) 2013 Hadi Michael (http://hadi.io)

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.
*/

window.gest = (function (document) {
	//setup getUserMedia - this could screw up another implementation of getUserMedia on the page, but really, they shouldn't be using the camera for anything else
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia; //|| navigator.msGetUserMedia;

	//initialise the return object
	var	eventObj = {},

	//initialise default settings
		settings = {
		framerate: 25,
		videoCompressionRate: 5,
		debug: false,
		locked: false
	},

	//manage gest's run states - I do this is to keep track of what the user wants to do and where gest is up to in it's initialisation
		gestIsInitialised = false,
		userHasAskedToStart = false,

	//declare global stream object that we can stop at any point
		stream,

	//declare DOM elements
		video, canvas, context, ccanvas, ccontext,
		width = 0,
		height = 0;

	/* @private */
	var dispatchGestEvent = function(_gestEvent) {
		//console.log(_gestEvent);

		//intialise the event object
		eventObj.direction = _gestEvent.direction || null; //direction as a string, ex. left, right, up, down
		eventObj.up = _gestEvent.up || false;				//bool
		eventObj.down = _gestEvent.down || false;			//bool
		eventObj.left = _gestEvent.left || false;			//bool
		eventObj.right = _gestEvent.right || false;		//bool
		eventObj.error = _gestEvent.error || null;			//error message as an object {error, message}

		if ((eventObj.up || eventObj.down || eventObj.left || eventObj.right) && settings.locked) {
			if (settings.debug) { console.log('Locked. Gesture skipped.'); }
			return false;
		} else {
			settings.locked = true;

			setTimeout(function() {
				settings.locked = false;
			}, gest.options.locking);
		}

		//fire eventObj
		try {
			if (document.createEventObject) {
				//IE 
				return document.fireEvent("on" + eventObj.eventType, eventObj);
			} else {
				//everyone else
				return document.dispatchEvent(eventObj);
			}
		} catch (e) {
			console.error(e);
			console.log(eventObj);
			return false;
		}
	};

	/* @constructor */
	gest = function () {
		//initialise and setup public variables (options)
		this.options = {
			skinFilter: false,	//do not do skin filtering by default
			messages: true,		//show on screen messages by default
			locking: 0,			//lock gest for some time (in ms) to prevent multiple gesture detection

			debug: function(state) {
				settings.debug = state;

				if (state) {
					//show debugging options, such as the video stream
					ccanvas.setAttribute('style', "visibility: visible; position: fixed; left: 0; top: 0; width: 100%; height: 100%; opacity: 1;");
				} else {
					ccanvas.setAttribute('style', "visibility: hidden; position: fixed; left: 0; top: 0; width: 100%; height: 100%; opacity: 1;");
				}
				
				return settings.debug;
			}
		};

		//check if the dom is already ready - this technique is borrowed from jQuery
		if (document.readyState === "complete") {
			DOMready();
		} else {
			//otherwise wait for DOM to be ready before initialising
			document.addEventListener( "DOMContentLoaded", DOMready, false );
			
			//fallback to window.onload, this will always work
			window.addEventListener( "load", DOMready, false );
		}

		//the ready event handler and self cleanup method
		function DOMready() {
			document.removeEventListener( "DOMContentLoaded", DOMready, false );
			window.removeEventListener( "load", DOMready, false );
			
			//bind gest.js events to the document, we need to do this ASAP so we can open means of communication with the front-end
			if (document.createEventObject) {
				//IE support
				eventObj = document.createEventObject();
				eventObj.eventType = "gest";
			} else {
				//all the cool kids
				eventObj = document.createEvent("Event");
				eventObj.initEvent("gest", true, true);
			}

			//we need to call and wait for init to finish before we know that we are actually ready
			if (init()) { gestIsInitialised = true; }

			if (userHasAskedToStart && gestIsInitialised) {
				return gest.start();
			} else {
				return gestIsInitialised;
			}
		}

		return true;
	};

	/* @private */
	var init = function () {
		//create a messages container
		//messageContainer = document.createElement('div');
		//document.body.appendChild(messageContainer);

		//check browser support for WebRTC getUserMedia
		if (!navigator.getUserMedia) {
			throwError(0);
			return false;
		}

		//create and setup the required DOM elements
		video = document.createElement('video');
		video.width = 300;
		video.setAttribute('style', 'display: none;');
		document.body.appendChild(video);

		canvas = document.createElement('canvas');
		canvas.setAttribute('style', 'width: 300px; display: none;');
		document.body.appendChild(canvas);

		context = canvas.getContext('2d');

		ccanvas = document.createElement('canvas');
		ccanvas.setAttribute('style', 'display: none;');
		document.body.appendChild(ccanvas);

		ccontext = ccanvas.getContext('2d');

		return true;
	};

	/* @public */
	gest.prototype.start = function () {
		userHasAskedToStart = true;

		if (!navigator.getUserMedia || !gestIsInitialised) { return false; }

		if (!video || !(video.paused || video.ended || video.seeking || video.readyState < video.HAVE_FUTURE_DATA)) { throwError(2); return false; }

		if (navigator.getUserMedia) {
			navigator.getUserMedia(
				// constraints
				{
					audio: false,
					video: true
				},

				// successCallback
				function(LocalMediaStream) {
					stream = LocalMediaStream;

					window.URL = window.URL || window.webkitURL;
					video.src = window.URL.createObjectURL(stream);

					video.addEventListener('canplaythrough',
						//play the video once it can play through
						function() {
							video.play();

							//width = Math.floor(video.videoWidth / settings.videoCompressionRate);
							//height = Math.floor(video.videoHeight / settings.videoCompressionRate);
							
							//setInterval(grabVideoFrame, 1000/settings.framerate);

							showMessage("The force is strong with you. <br />Go forth and gesture!");
						}
					);
				},

				// errorCallback
				function(error) {
					if (error.PERMISSION_DENIED) {
						throwError(10, error);
					} else if (error.NOT_SUPPORTED_ERROR) {
						throwError(11, error);
					} else if (error.MANDATORY_UNSATISFIED_ERROR) {
						throwError(12, error);
					} else {
						throwError(13, error);
					}
				});
		} else {
			throwError(0);
			//video.src = 'myfallbackvideo.webm'; // define a fallback for demo purposes
		}

		return !!navigator.getUserMedia;
	};

	/* @public */
	gest.prototype.stop = function () {
		if (!navigator.getUserMedia) { return false; }

		if (video) { video.src = ''; }
		return !!stream.stop();
	};

	/* @private */
	var grabVideoFrame = function (){
		canvas.width = width;
		ccanvas.width = width;
		canvas.height = height;
		ccanvas.height = height;

		//draw mirrored frame into context
		context.drawImage(video, width, 0, -width, height);
		
		//copy the context into our processing context
		var currentFrame = context.getImageData(0, 0, width, height);
		ccontext.putImageData(currentFrame, 0, 0);
		
		if (gest.options.skinFilter) {
			getDifferenceMap(skinfilter(currentFrame), 150);
		} else {
			getDifferenceMap(currentFrame, 150);
		}
	};

	/* @private */
	/* skin filtering using HUE (colour) SATURATION (dominance of the colour) VALUE (brightness of the colour) 
	 * this algorithms reliability is heavily dependant on lighting conditions - see this journal article http://wwwsst.ums.edu.my/data/file/Su7YcHiV9AK5.pdf
	 */
	var huemin = 0.0,
		huemax = 0.1,
		satmin = 0.3,
		satmax = 1.0,
		valmin = 0.4,
		valmax = 1.0;

	var skinfilter = function(currentFrame) {
		
		skin_filter = context.getImageData(0, 0, width, height);
		var total_pixels = skin_filter.width * skin_filter.height;
		var index_value = total_pixels * 4;
		
		var count_data_big_array = 0;
		for (var y = 0; y < height; y++)
		{
			for (var x = 0 ; x < width ; x++)
			{
				index_value = x + y * width;
				r = currentFrame.data[count_data_big_array];
				g = currentFrame.data[count_data_big_array+1];
				b = currentFrame.data[count_data_big_array+2];
				a = currentFrame.data[count_data_big_array+3];

				hsv = rgb2Hsv(r,g,b);

				//When the hand is too close (hsv[0] > 0.59 && hsv[0] < 1.0)
				
				//Skin Range on HSV values
				if( ( (hsv[0] > huemin && hsv[0] < huemax) || (hsv[0] > 0.59 && hsv[0] < 1.0) ) && (hsv[1] > satmin && hsv[1] < satmax) && (hsv[2] > valmin && hsv[2] < valmax) ) {
					
					skin_filter[count_data_big_array]	= r;
					skin_filter[count_data_big_array+1] = g;
					skin_filter[count_data_big_array+2] = b;
					skin_filter[count_data_big_array+3] = a;
					
					} else {
					
					skin_filter.data[count_data_big_array]		= 255;
					skin_filter.data[count_data_big_array+1]	= 255;
					skin_filter.data[count_data_big_array+2]	= 255;
					skin_filter.data[count_data_big_array+3]	= 0;
					
					}

					count_data_big_array = index_value * 4;
			}
		}

		return skin_filter;
	};

	function rgb2Hsv(r, g, b){
		r = r / 255;
		g = g / 255;
		b = b / 255;

		var max = Math.max(r, g, b);
		var min = Math.min(r, g, b);

		var h, s, v = max;

		var d = max - min;

		s = max === 0 ? 0 : d / max;

		if (max == min) {
			h = 0; // achromatic
		} else {

			switch(max){
				case r:
					h = (g - b) / d + (g < b ? 6 : 0);
					break;
				case g:
					h = (b - r) / d + 2;
					break;
				case b:
					h = (r - g) / d + 4;
					break;
				default:
					break;
			}
			h /= 6;
		}

		return [h, s, v];
	}

	/* @private */
	/* get pixel difference map */
	var last = false;
	var getDifferenceMap = function (currentFrame, toleratedMovementThreshold) {
		delt = context.createImageData(width, height);

		if (last !== false) {

			var totalx	= 0,
				totaly	= 0,
				totald	= 0,
				totaln	= delt.width * delt.height,
				pix		= totaln * 4;

			while (pix -= 4) {

				var d = Math.abs(currentFrame.data[pix] - last.data[pix]) +
						Math.abs(currentFrame.data[pix+1] - last.data[pix+1]) +
						Math.abs(currentFrame.data[pix+2] - last.data[pix+2]);

				if (d > toleratedMovementThreshold) {
					delt.data[pix]		= 255;	//R
					delt.data[pix+1]	= 0;	//G
					delt.data[pix+2]	= 0;	//B
					delt.data[pix+3]	= 255;	//alpha
					totald += 1;
					totalx += ((pix/4) % width);
					totaly += (Math.floor((pix/4) / delt.height));
				} else {
					delt.data[pix]		= currentFrame.data[pix];
					delt.data[pix+1]	= currentFrame.data[pix+1];
					delt.data[pix+2]	= currentFrame.data[pix+2];
					delt.data[pix+3]	= currentFrame.data[pix+3]; //change to 0 to hide user video
				}

			}
		}

		if (totald) {
			//if enough movement has been detected
			handle( {x: totalx, y: totaly, d: totald} );
		}

		//console.log(totald);
		last = currentFrame;
		ccontext.putImageData(delt, 0, 0);
	};

	/* handle any movements that exceed the speficified thresholds */
	var wasdown = false,
		movethresh = 2,
		brightthresh = 300,
		overthresh = 1000,
		avg = 0,
		state = 0; //States: 0 waiting for gesture, 1 waiting for next move after gesture, 2 waiting for gesture to end

	function handle(movement){
		var down = {
			x: movement.x / movement.d,
			y: movement.y / movement.d,
			d: movement.d
		};

		avg = (0.9 * avg) + (0.1 * down.d);
		
		var davg = down.d - avg,
			good = davg > brightthresh;

		//console.log(davg);

		switch(state){
			case 0:
				if(good){
					//Found a gesture, waiting for next move
					state = 1;
					wasdown = {
						x: down.x,
						y: down.y,
						d: down.d
					};
				}
				break;
			
			case 1:
				//Got next move, do something based on direction
				state = 2;

				var dx = down.x - wasdown.x,
					dy = down.y - wasdown.y;
				
				var dirx = Math.abs(dy) < Math.abs(dx); //(dx,dy) is on a bowtie
				
				//console.log(good,davg)
				if (dx < -movethresh && dirx) {
					dispatchGestEvent({
						direction: 'Left',
						left: true
					});
				} else if (dx > movethresh && dirx) {
					dispatchGestEvent({
						direction: 'Right',
						right: true
					});
				}

				if (dy > movethresh && !dirx) {
					if (davg > overthresh) {
						dispatchGestEvent({
							direction: 'Long down',
							down: true
						});
					} else {
						dispatchGestEvent({
							direction: 'Down',
							down: true
						});
					}
				} else if (dy < -movethresh && !dirx) {
					if (davg > overthresh) {
						dispatchGestEvent({
							direction: 'Long up',
							up: true
						});
					} else {
						dispatchGestEvent({
							direction: 'Up',
							up: true
						});
					}
				}
				
				showMessage('<span style="line-height: 80px; vertical-align: middle;">' + gestEvent.direction + '</span>', 50);
				
				break;

			case 2:
				//Wait for gesture to end
				if (!good) {
					//Gesture ended
					state = 0;
				}
				break;

			default:
				break;
		}
	}

	/* @private */
	var throwError = function(_code, _obj) {
		// setup up error codes

		switch (_code) {
			case 0:
				_error = {code: _code, message: 'Your web browser does not support gest.js :( <br />Try using Google Chrome.'}; //getUserMedia is not support by your browser
				break;

			case 1:
				_error = {code: _code, message: 'gest.js could not start.'};
				break;

			case 2:
				_error = {code: _code, message: 'gest.js has already started.'};
				break;

			case 10:
				_error = {code: _code, message: 'DEEEENIED! The user denied permission to use a media device required for the operation.', obj: _obj};
				break;

			case 11:
				_error = {code: _code, message: 'A constraint specified is not supported by the web browser.', obj: _obj};
				break;

			case 12:
				_error = {code: _code, message: 'No media tracks of the type specified in the constraints are found.', obj: _obj};
				break;
			
			case 13:
				_error = {code: _code, message: 'Couldn\'t get user media.', obj: _obj};
				break;

			default:
				_error = null;
				break;
		}

		//tell the developer and user about the error
		if (settings.debug) { console.error(_error); }
		//showMessage(_error.message, 4000);
		dispatchGestEvent( {error: _error} );
	};

	/* @private */
	var messageTimout = null,
		messageTimer = null,
		messageLocked = false;
	var	showMessage = function(HTMLmessage, _duration) {
		if (!gest.options.messages || !HTMLmessage) { return false; }
		if (messageLocked) { messageLocked = true; return false; } //don't interrupt longer (locked) messages, these need time to be read
		
		var duration = _duration || 2500; // set a default duration of 2500ms

		window.clearTimeout(messageTimout);
		window.clearInterval(messageTimer);
	
		//make the messages box take an appropriate size in the screen
		var messageContainerStyle = "visibility: visible; position: fixed; left: 50%; top: 40%; min-height: 80px; margin-top: -50px; padding: 10px; background-color: #222222; border-radius: 10px; z-index: 100; font: normal 15px/1.1 \"Helvetica Neue\", Helvetica, Arial, sans-serif; color: #FFFFFF; font-size: 35px; text-align: center;";
		if (document.width > 767 || window.innerWidth > 767) {
			messageContainerStyle += "margin-left: -250px; width: 500px";
		} else {
			messageContainerStyle += "margin-left: -40%; width:80%; min-width: 250px";
		}
		var messageContainerOpacity = 1;

		messageContainer.innerHTML = HTMLmessage;
		messageContainer.setAttribute('style', messageContainerStyle);

		messageTimout = window.setTimeout(function() {
			messageTimer = window.setInterval(function() {
				if (messageContainerOpacity-0.1 <= 0) {
					window.clearInterval(messageTimer);
					messageContainer.setAttribute('style', 'visibility: hidden');
				} else {
					messageContainerOpacity -= 0.05;
					messageContainer.setAttribute('style', 'opacity: ' + messageContainerOpacity + ';' + messageContainerStyle);
				}
				messageLocked = false;
			}, 40); //fade it out
		}, duration); //show message for

		if (duration >= 2000) { messageLocked = true; } //lock messages that need time to be read

		return true;
	};

	return new gest();
}(document));