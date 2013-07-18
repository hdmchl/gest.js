/* 
 * @author: Hadi Michael
 * @name: gest.js
 * @version: 0.2.0
 * @description: gest.js is a webcam based gesture recognition library that helps developers make webpages more immersive.
 */

window.gest = (function () {
	var startState = false;
	var framerate = 25;
	var videoCompressionRate = 5;
	var width = height = 0;

	var stream;
	var gestEvent = {
		direction: null,
	};

	//declare DOM elements
	var video, canvas, context, ccanvas, ccontext, messageContainer;

	/* @constructor */
    gest = function () {
    	//expose and initialise public variables
    	this.options = {
    		skinFilter: false, //default to false until I have fixed it up...
    	}

    	//check browser support for WebRTC getUserMedia
		navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
		if (!navigator.getUserMedia) {
			console.log('getUserMedia is not supported!');
			return false;
		}

		//init if the dom is already ready
		if (document.readyState == "complete") { console.log("DOM was ready"); return init(); }

		//wait for DOM to be ready before initialising
		document.addEventListener( "DOMContentLoaded", DOMready, false );
		//fallback to window.onload, this will always work
		window.addEventListener( "load", DOMready, false );

    	//the ready event handler and self cleanup method
		function DOMready() {
			document.removeEventListener( "DOMContentLoaded", DOMready, false );
			window.removeEventListener( "load", DOMready, false );
			
			return init();
		}
	};

    /* @private */
    var init = function () {
    	//create the necessary DOM elements
		video = document.createElement('video');
		video.width = 300;
		video.setAttribute('style', 'visibility: hidden;');
		document.body.appendChild(video);

		canvas = document.createElement('canvas');
		canvas.setAttribute('style', 'width: 300px; display: none;');
		document.body.appendChild(canvas);

		context = canvas.getContext('2d');

		ccanvas = document.createElement('canvas');
		ccanvas.setAttribute('style', 'visibility: hidden;');
		document.body.appendChild(ccanvas);

		ccontext = ccanvas.getContext('2d');

		//create a messages container
		messageContainer = document.createElement('div');
		document.body.appendChild(messageContainer);

		//bind gest.js events to the document for now, 
		//I'm still undecided on whether I should let devs bind the event to their own elements...
		if (document.createEventObject) {
			//IE support, because I can
			gestEvent = document.createEventObject();
			gestEvent.eventType = "gest";
		} else {
			//all the cool kids
			gestEvent = document.createEvent("Event");
			gestEvent.initEvent("gest", true, true);
		}

		return true;
    }

    /* @public */
    gest.prototype.debug = function (state) {
    	if (state) {
    		ccanvas.setAttribute('style', "visibility: visible; position: fixed; left: 0; top: 0; width: 100%; height: 100%; opacity: 1;");
    	} else {
    		ccanvas.setAttribute('style', "visibility: hidden; position: fixed; left: 0; top: 0; width: 100%; height: 100%; opacity: 1;");
    	}
    }

    /* @public */
    gest.prototype.start = function () {
    	if (startState) { console.log('gest has already started'); return };

    	startState = true;

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
						function(){
							video.play();

							width = Math.floor(video.videoWidth / videoCompressionRate);
							height = Math.floor(video.videoHeight / videoCompressionRate);
							
							setInterval(grabVideoFrame, 1000/framerate);

							newMessage("The force is strong with you. <br /> Go forth and gesture!");
						}
					)
		  		}, 

		  		// errorCallback
		  		function(error) {
		  			switch(error) {
		  				case PERMISSION_DENIED:
		  					console.log('DEEEENIED! The user denied permission to use a media device required for the operation.');
		  					break;

		  				case NOT_SUPPORTED_ERROR:
		  					console.log('Error. A constraint specified is not supported by the browser.');
		  					break;

		  				case MANDATORY_UNSATISFIED_ERROR:
		  					console.log('Error. No media tracks of the type specified in the constraints are found.');
		  					break;

		  				default:
		  					console.log('Error. Couldn\'t get user media.');
		  			}
		  			
		  		});
		} else {
		  	console.log('getUserMedia is not supported!');
		  	//video.src = 'mydemovideo.webm'; // define a fallback for demo purposes
		}
    };

    /* @public */
    gest.prototype.stop = function () {
    	video.src = '';
    	if (stream.stop) { stream.stop() };
    	startState = false;
    }

    /* @private */
	var grabVideoFrame = function (){
		canvas.width = ccanvas.width = width;
		canvas.height = ccanvas.height = height;

		//draw mirrored frame into context
		context.drawImage(video, width, 0, -width, height);
		
		//copy the context into our processing context
		var currentFrame = context.getImageData(0, 0, width, height);
		ccontext.putImageData(currentFrame, 0, 0)
		
		if (gest.options.skinFilter) {
			getDifferenceMap(skinfilter(currentFrame), 150);
		} else {
			getDifferenceMap(currentFrame, 150);
		}
	}

	/* @private */
	/* skin filtering */
	var huemin = 0.0,
		huemax = 0.10,
		satmin = 0.0,
		satmax = 1.0,
		valmin = 0.4,
		valmax = 1.0;

	var skinfilter = function (currentFrame){
		
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
		       		
		       		skin_filter[count_data_big_array] 	= r; 
					skin_filter[count_data_big_array+1] = g;
					skin_filter[count_data_big_array+2] = b;
					skin_filter[count_data_big_array+3] = a;
		        	
		        	} else {
		        	
		        	skin_filter.data[count_data_big_array] 	 = 0;
					skin_filter.data[count_data_big_array+1] = 0;
					skin_filter.data[count_data_big_array+2] = 0; 
					skin_filter.data[count_data_big_array+3] = 0;
		        	
		        	}

	            	count_data_big_array = index_value * 4;
			}
		}

		return skin_filter;
	}

	function rgb2Hsv(r, g, b){
	    r = r / 255;
	    g = g / 255;
	    b = b / 255;

	    var max = Math.max(r, g, b);
	    var min = Math.min(r, g, b);

	    var h, s, v = max;

	    var d = max - min;

	    s = max == 0 ? 0 : d / max;

	    if(max == min){
	        h = 0; // achromatic
	    }else{

	        switch(max){
	            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
	            case g: h = (b - r) / d + 2; break;
	            case b: h = (r - g) / d + 4; break;
	    	}
	   		h /= 6;
	   	}

	    return [h, s, v];
	}

	var last = false;
	/* /skin filtering */

	/* @private */
	var getDifferenceMap = function (currentFrame, toleratedMovementThreshold){
		delt = context.createImageData(width, height);

		if (last !== false) {

			var totalx 	= 0,
				totaly 	= 0,
				totald 	= 0,
				totaln 	= delt.width * delt.height,
				pix 	= totaln * 4;

			while (pix -= 4) {

				var d = Math.abs(currentFrame.data[pix] - last.data[pix]) + 
						Math.abs(currentFrame.data[pix+1] - last.data[pix+1]) + 
						Math.abs(currentFrame.data[pix+2] - last.data[pix+2]);

				if (d > toleratedMovementThreshold) {
					delt.data[pix] 		= 255; 	//R
					delt.data[pix+1] 	= 0; 	//G
					delt.data[pix+2] 	= 0; 	//B
					delt.data[pix+3] 	= 255; 	//alpha
					totald += 1;
					totalx += ((pix/4) % width);
					totaly += (Math.floor((pix/4) / delt.height));
				}
				else {
					delt.data[pix] 		= currentFrame.data[pix];
					delt.data[pix+1] 	= currentFrame.data[pix+1];	
					delt.data[pix+2] 	= currentFrame.data[pix+2];
					delt.data[pix+3] 	= currentFrame.data[pix+3]; //change to 0 to hide user video
				}

			}
		}

		if (totald) {
			//if some movement has been detected
			handle( {x: totalx, y: totaly, d: totald} );
		}

		//console.log(totald);
		last = currentFrame;
		ccontext.putImageData(delt, 0, 0);
	}
	
	var wasdown = false;
	var movethresh = 2;
	var brightthresh = 300;
	var overthresh = 1000;
	var avg = 0
	var state = 0; //States: 0 waiting for gesture, 1 waiting for next move after gesture, 2 waiting for gesture to end

	function handle(movement){
		var down = {
			x: movement.x / movement.d,
			y: movement.y / movement.d,
			d: movement.d,
		};

		avg = (0.9 * avg) + (0.1 * down.d);
		
		var davg = down.d - avg,
			good = davg > brightthresh;

		//console.log(davg)
		var direction = null;

		switch(state){
			case 0:
				if(good){
					//Found a gesture, waiting for next move
					state = 1;
					wasdown = {
						x: down.x,
						y: down.y,
						d: down.d
					}
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
					gestEvent.direction = 'left';
				} else if (dx > movethresh && dirx) {
					gestEvent.direction = 'right';
				}

				if (dy > movethresh && !dirx) {
					if(davg > overthresh){
						gestEvent.direction = 'long down';
					}
					else{
						gestEvent.direction = 'down';
					}
				} else if(dy < -movethresh && !dirx) {
					if(davg > overthresh){
						gestEvent.direction = 'long up';
					}
					else{
						gestEvent.direction = 'up';
					}
				}
				
				//console.log(gestEvent.direction);
				//fire gestevent
				if (document.createEventObject) {
					//IE 
					document.fireEvent("on" + gestEvent.eventType, gestEvent);
				} else {
					//everyone else
					document.dispatchEvent(gestEvent);
				}

				break;

			case 2:
				//Wait for gesture to end
				if (!good) {
					//Gesture ended
					state = 0;
				}
				break;
		}
	}

	/* @private */
	var newMessage = function(message) {
		var messageContainerStyle = "visibility: visible; position: fixed; left: 50%; top: 50%; width: 500px; height: 80px; margin-left: -250px; margin-top: -40px; padding: 1%; background-color: #222222; border-radius: 10px; z-index: 100; font-family: Arial; color: #FFFFFF; font-size: 35px; text-align: center;";	
		var messageContainerOpacity = 1;

		messageContainer.innerHTML = message;
		messageContainer.setAttribute('style', messageContainerStyle);

		setTimeout(function() {
			var timer = setInterval(function() {
				if (messageContainerOpacity-0.1 <= 0) {
					clearTimeout(timer);
					messageContainer.setAttribute('style', 'visibility: hidden');
				} else {
					messageContainerOpacity -= 0.05;
					messageContainer.setAttribute('style', 'opacity: ' + messageContainerOpacity + ';' + messageContainerStyle);
				}
			}, 50) //fade it out
		}, 2500) //show message for
	}

    return new gest();
}());