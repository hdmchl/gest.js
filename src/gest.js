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

window.gest = (function (document) {
	"use strict";

	//setup getUserMedia - this could screw up another implementation of getUserMedia on the page, but really, they shouldn't be using the camera for anything else
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia; //|| navigator.msGetUserMedia;

	//initialise the return object
	var	eventObj = {},

	//initialise default settings
		settings = {
		framerate: 25,
		videoCompressionRate: 5,
		debug: true,
		locked: false
	},

	//declare DOM elements
		video, canvas, context, ccanvas, ccontext,

	/* @constructor */
	gest = function(_text) {
		//use singleton design pattern - adopted from https://code.google.com/p/jslibs/wiki/JavascriptTips#Singleton_pattern
		//this shouldn't *really* be a problem, because we only ever return a single instance
		if (gest.prototype._singletonInstance) {
			return gest.prototype._singletonInstance;
		}
		gest.prototype._singletonInstance = this;

		//check if the dom is already ready - this technique is borrowed from jQuery
		if (document.readyState === "complete") {
			_DOMready.call();
		} else {
			//otherwise wait for DOM to be ready before initialising
			document.addEventListener( "DOMContentLoaded", _DOMready, false );
			
			//fallback to window.onload, this will always work
			window.addEventListener( "load", _DOMready, false );
		}

		//the ready event handler and self cleanup method
		function _DOMready() {
			document.removeEventListener( "DOMContentLoaded", _DOMready, false );
			window.removeEventListener( "load", _DOMready, false );
			
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
		}

		return true;
	},

	/* @private */
	dispatchGestEvent = function(_gestEvent) {
		//console.log(_gestEvent);

		//intialise the event object
		eventObj.direction = _gestEvent.direction || null;	//direction as a string, ex. left, right, up, down
		eventObj.up = _gestEvent.up || false;				//bool
		eventObj.down = _gestEvent.down || false;			//bool
		eventObj.left = _gestEvent.left || false;			//bool
		eventObj.right = _gestEvent.right || false;			//bool
		eventObj.error = _gestEvent.error || null;			//error message as an object {error, message}

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
			return false;
		}
	},

	/* @private */
	init = function () {
		//create required DOM elements
		video = document.createElement('video');
		canvas = document.createElement('canvas');

		if (!!video.canPlayType && !!(canvas.getContext && canvas.getContext('2d')) && !!navigator.getUserMedia) { //check browser support
			//setup DOM elements
			video.width = 300;
			video.setAttribute('style', 'display: none;');
			document.body.appendChild(video);

			canvas.setAttribute('style', 'width: 300px; display: none;');
			document.body.appendChild(canvas);

			context = canvas.getContext('2d');

			ccanvas = document.createElement('canvas'); //compressed
			ccanvas.setAttribute('style', 'display: none;');
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

		switch (_code) {
			case 0:
				_error = {code: _code, message: 'Try using Google Chrome, because your current web-browser doesn\'t support gest.js :('};
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

	return new gest();
}(document));