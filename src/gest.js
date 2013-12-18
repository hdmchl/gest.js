/* 
 * @name: gest.js
 * @description: gest.js is a webcam based gesture recognition library that can help developers make webpages more immersive.
 * @version: 0.5.0
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

window.gest = (function (window) {
	"use strict";

	//setup getUserMedia - this could screw up another implementation of getUserMedia on the page, but really, they shouldn't be using the camera for anything else
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

	//initialise default settings
	var	settings = {
		framerate: 25,
		videoCompressionRate: 5,
		sensitivity: 80, //value from 0 to 100
		debug: true
	},

	//manage gest's run states - I do this is to keep track of what the user wants to do and where gest is up to in it's initialisation
		gestIsInitialised = false,
		userHasAskedToStart = false,

	//declare global stream object that we can stop at any point
		stream,

	//declare DOM elements
		video, canvas, context, ccanvas, ccontext,

	/* @constructor */
	gest = function() {
		//use singleton design pattern - adopted from https://code.google.com/p/jslibs/wiki/JavascriptTips#Singleton_pattern
		//this shouldn't *really* be a problem, because we only ever return a single instance
		if (gest.prototype._singletonInstance) {
			return gest.prototype._singletonInstance;
		}
		gest.prototype._singletonInstance = this;

		//check if the dom is already ready - this technique is borrowed from jQuery
		if (document.readyState === 'complete') {
			_DOMready.call();
		} else {
			//otherwise wait for DOM to be ready before initialising
			utils.addEventListener('DOMContentLoaded', document, _DOMready);
			
			//fallback to window.onload, this will always work
			utils.addEventListener('load', window, _DOMready);
		}

		//the ready event handler and self cleanup method
		function _DOMready() {
			utils.removeEventListener('DOMContentLoaded', document, _DOMready);
			utils.removeEventListener('load', window, _DOMready);
			
			//we need to call and wait for init to finish before we know that we are actually ready
			if (init()) { gestIsInitialised = true; }

			if (userHasAskedToStart && gestIsInitialised) {
				//the user has already asked us to start, but we weren't ready. Now we are... let's try again
				return window.gest.start();
			}

			return false;
		}

		return true;
	},

	/* @private */
	dispatchGestEvent = function(_gestEvent) {
		//console.log(_gestEvent);
		var eventObj = utils.createCustomEvent('gest', document);

		//setup the event object with gesture information
		eventObj.direction = _gestEvent.direction || null;	//direction as a string, ex. left, right, up, down
		eventObj.up = _gestEvent.up || false;				//bool
		eventObj.down = _gestEvent.down || false;			//bool
		eventObj.left = _gestEvent.left || false;			//bool
		eventObj.right = _gestEvent.right || false;			//bool
		eventObj.error = _gestEvent.error || null;			//error message as an object {error (int), message (string)}

		//fire eventObj
		utils.fireEvent(eventObj);
	},

	/* @private */
	init = function () {
		//create required DOM elements
		video = document.createElement('video');
		canvas = document.createElement('canvas');

		if (!!video.canPlayType && !!(canvas.getContext && canvas.getContext('2d')) && !!navigator.getUserMedia) { //check browser support
			//setup DOM elements
			video.width = 300;
			//video.setAttribute('style', 'display: none;');
			document.body.appendChild(video);

			//canvas.setAttribute('style', 'width: 300px; display: none;');
			document.body.appendChild(canvas);

			context = canvas.getContext('2d');

			//for visualising the diff map
			ccanvas = document.createElement('canvas'); //compressed
			//ccanvas.setAttribute('style', 'display: none;');
			document.body.appendChild(ccanvas);

			ccontext = ccanvas.getContext('2d'); //compressed
		} else {
			throwError(0);
			return false;
		}

		return true;
	},

	/* @private */
	throwError = function(_code, _obj) {
		// setup up error codes
		var _error;

		switch (_code) {
			case 0:
				_error = {code: _code, message: 'gest.js can\'t run in your browser :('};
				break;

			case 1:
				_error = {code: _code, message: 'gest.js could not start.'};
				break;

			case 2:
				_error = {code: _code, message: 'gest.js has already started.'};
				break;

			case 10:
				_error = {code: _code, message: 'DEEENIED! gest.js needs webcam access.', obj: _obj};
				break;

			case 11:
				_error = {code: _code, message: 'A constraint specified is not supported by the web-browser.', obj: _obj};
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
		if (settings.debug) { console.error(_error.message); }
		dispatchGestEvent( {error: _error} );
	},

	/* @private */
	grabVideoFrame = function (width, height) {
		//grab a frame from the video and compress it to the width/height specified - we do this by drawing it onto a temporary canvas
		context.drawImage(video, 0, 0, width, height);

		//copy the get the current frame from the compressed video drawing on the canvas
		var currentFrame = context.getImageData(0, 0, width, height);

		//calculate the difference map
		getDifferenceMap(currentFrame, settings.sensitivity, width, height);
	},

	/* @private */
	previousFrame = false,
	getDifferenceMap = function (currentFrame, sensitivity, width, height) {
		var delt = context.createImageData(width, height);

		if (previousFrame !== false) {
			var totalx	= 0,
				totaly	= 0,
				totald	= 0, //total number of changed pixels
				totaln	= delt.width * delt.height,
				pix		= totaln * 4,
				maxAssessableColorChange = 256 * 3;

			while ((pix -= 4) >= 0) {
				//find the total change in color for this pixel-set
				var d = Math.abs(currentFrame.data[pix] - previousFrame.data[pix]) +
						Math.abs(currentFrame.data[pix+1] - previousFrame.data[pix+1]) +
						Math.abs(currentFrame.data[pix+2] - previousFrame.data[pix+2]); //don't do [pix+3] because alpha doesn't change

				if (d > maxAssessableColorChange*Math.abs((sensitivity-100)/100)) {
					//if there has been significant change in color, mark the changed pixel
					delt.data[pix]		= 255;	//R
					delt.data[pix+1]	= 0;	//G
					delt.data[pix+2]	= 0;	//B
					delt.data[pix+3]	= 255;	//alpha
					totald += 1;
					totalx += ((pix/4) % delt.width);
					totaly += (Math.floor((pix/4) / delt.height));
				} else {
					//otherwise keep it the same color
					delt.data[pix]		= currentFrame.data[pix];
					delt.data[pix+1]	= currentFrame.data[pix+1];
					delt.data[pix+2]	= currentFrame.data[pix+2];
					delt.data[pix+3]	= currentFrame.data[pix+3]; //change to 0 to hide user video
				}
			}
		}

		if (totald > 0) {
			//if any pixels have changed, check for a gesture
			//handle( {x: totalx, y: totaly, d: totald} );
		}

		//console.log(totald);
		previousFrame = currentFrame;
		ccontext.putImageData(delt, 0, 0);
	},

	/* @private */
	utils = {
		/* Event Handling utility by @hadi_michael - MIT License */
		htmlEvents: { //list of real events
			//<body> and <frameset> Events
			onload:1,
			onunload:1,
			//Form Events
			onblur:1,
			onchange:1,
			onfocus:1,
			onreset:1,
			onselect:1,
			onsubmit:1,
			//Image Events
			onabort:1,
			//Keyboard Events
			onkeydown:1,
			onkeypress:1,
			onkeyup:1,
			//Mouse Events
			onclick:1,
			ondblclick:1,
			onmousedown:1,
			onmousemove:1,
			onmouseout:1,
			onmouseover:1,
			onmouseup:1
		},

		addEventListener: function(evntName, elem, func) {
			if (elem.addEventListener)  //W3C
				elem.addEventListener(evntName, func, false);
			else if (elem.attachEvent && this.htmlEvents['on'+evntName]) { //OLD IE < 9
				elem.attachEvent('on'+evntName, func);
			} else {
				elem['on'+evntName] = func;
			}
		},

		removeEventListener: function(evntName, elem, func) {
			if (elem.removeEventListener)  //W3C
				elem.removeEventListener(evntName, func, false);
			else if (elem.detachEvent && this.htmlEvents['on'+evntName]) { //OLD IE < 9
				elem.detachEvent('on'+evntName, func);
			} else {
				elem['on'+evntName] = null;
			}
		},

		createCustomEvent: function(evntName, elem) {
			try {
				var evnt;
				if (elem.createEvent) { //W3C
					evnt = elem.createEvent('Event');
					evnt.initEvent(evntName, true, true);
				} else if (elem.createEventObject) { //OLD IE < 9
					evnt = elem.createEventObject();
					evnt.eventType = evntName;
				}
				evnt.evntName = evntName;
				evnt.evntElement = elem;
				return evnt;
			} catch (e) {
				console.error(e);
				return false;
			}
		},
		
		fireEvent: function(evntObj) {
			try {
				if (evntObj.evntElement.dispatchEvent){
					evntObj.evntElement.dispatchEvent(evntObj);
				} else if (evntObj.evntElement.fireEvent && this.htmlEvents['on'+evntObj.evntName]) { // IE < 9
					evntObj.evntElement.fireEvent('on'+evntObj.eventType, evntObj); // can only fire real events (such as 'click')
				} else if (evntObj.evntElement[evntObj.evntName]){
					evntObj.evntElement[evntObj.evntName]();
				} else if (evntObj.evntElement['on'+evntObj.evntName]){
					evntObj.evntElement['on'+evntObj.evntName]();
				}
			} catch (e) {
				console.error(e);
			}
		}
		/* /Event Handling utility */
	};

	/* @public */
	gest.prototype.start = function () {
		userHasAskedToStart = true;

		//o, the user wants us to start, but are we ready to? Stop, if we're not. This will get called again when we are ready.
		if (!gestIsInitialised) { return false; }

		//check to see if we are already running
		if (!video || !(video.paused || video.ended || video.seeking || video.readyState < video.HAVE_FUTURE_DATA)) { throwError(2); return false; }
		
		navigator.getUserMedia(
			// constraints
			{
				audio: false,
				video: true
			},

			// successCallback
			function(_LocalMediaStream) {
				stream = _LocalMediaStream;

				window.URL = window.URL || window.webkitURL;
				video.src = window.URL.createObjectURL(stream);

				video.addEventListener('canplaythrough',
					//play the video once it can play through
					function() {
						video.play();

						var width = Math.floor(video.videoWidth / settings.videoCompressionRate),
							height = Math.floor(video.videoHeight / settings.videoCompressionRate);
						
						setInterval(function() { grabVideoFrame(width, height); }, 1000/settings.framerate);
					}
				);
			},

			// errorCallback
			function(error) {
				if (error.PERMISSION_DENIED || error.name === 'PERMISSION_DENIED') {
					throwError(10, error);
				} else if (error.NOT_SUPPORTED_ERROR || error.name === 'NOT_SUPPORTED_ERROR') {
					throwError(11, error);
				} else if (error.MANDATORY_UNSATISFIED_ERROR || error.name === 'MANDATORY_UNSATISFIED_ERROR') {
					throwError(12, error);
				} else {
					throwError(13, error);
			}
		});

		return !!navigator.getUserMedia;
	};

	/* @public */
	gest.prototype.stop = function () {
		if (!gestIsInitialised || !userHasAskedToStart) { return false; }

		if (video) { video.src = ''; }
		return !!stream.stop();
	};

	/* @public */
	gest.prototype.options = {
		subscribeWithCallback: function(callback) {
			if (callback) {
				utils.addEventListener('gest', document, function(gesture) {
					callback(gesture);
				});
			}
		},
		sensitivity: function(value) {
			settings.sensitivity = value;
		},
		debug: function(state) {
			settings.debug = state;

			if (state) {
				//show debugging options, such as the video stream
				video.setAttribute('style', 'display:block');
				canvas.setAttribute('style', 'display:block');
				ccanvas.setAttribute('style', 'display:block');
			} else {

			}
			
			return settings.debug;
		}
	};

	return new gest();
}(window));