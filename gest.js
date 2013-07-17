window.gest = (function () {
	var framerate = 25;
	var videoCompressionRate = 5;
	var toleratedMovementThreshold = 150;
	var width = height = 0;

	//declare DOM elements
	var video, canvas, context, ccanvas, ccontext;
	var gestEvent;

    gest = function () {
    	this.options = {
    		skinFilter: false, //default to false until I have fixed it up...
    	}

    	//create the required DOM elements
		video = document.createElement('video');
		video.id = "video";
		video.width = 300;
		video.setAttribute('autoplay', 'autoplay');
		video.setAttribute('style', 'visibility: hidden;');
		document.body.appendChild(video);

		canvas = document.createElement('canvas');
		canvas.id = "canvas";
		canvas.style.width = "300px";
		canvas.style.display = "none";
		document.body.appendChild(canvas);

		context = canvas.getContext('2d');

		ccanvas = document.createElement('canvas');
		ccanvas.setAttribute('style', 'visibility: hidden;');
		document.body.appendChild(ccanvas);

		ccontext = ccanvas.getContext('2d');

		//initialise gest events
		if (document.createEvent) {
			gestEvent = document.createEvent("HTMLEvents");
			gestEvent.initEvent("gestRecognised", true, true);
		} else {
			gestEvent = document.createEventObject();
			gestEvent.eventType = "gestRecognised";
		}
    } 

    var stream;
    gest.prototype.start = function (preview) {
    	if (preview) {
    		ccanvas.setAttribute('style', "visibility: visible; position: fixed; left: 0; top: 0; width: 100%; height: 100%; opacity: 1;");
    	}

    	window.URL = window.URL || window.webkitURL;
		navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

    	if (navigator.getUserMedia) {
		  	navigator.getUserMedia(
		  		{
		  			audio: false,
		  			video: true
		  		}, function(s) {
		  			stream = s;
		    		video.src = window.URL.createObjectURL(stream);

		    		video.addEventListener('play',
						function(){
							width = Math.floor(video.videoWidth / videoCompressionRate);
							height = Math.floor(video.videoHeight / videoCompressionRate);
							setInterval(grabVideoFrame, 1000/framerate);
						}
					)
		  		}, function() {
		  			console.log('DEEEEENIED!');
		  		});
		} else {
		  	console.log('getUserMedia is not supported!');
		  	//video.src = 'somevideo.webm'; // define a fallback.
		}
    };

    gest.prototype.stop = function () {
    	stream.stop();
    	video.src = '';
    }

	function grabVideoFrame(){
		//TODO: need to reset the canvas sizes, or else they don't redraw
		canvas.width = ccanvas.width = width;
		canvas.height = ccanvas.height = height;

		//draw mirrored frame into context
		context.drawImage(video, width, 0, -width, height);
		
		//copy the context into our processing context
		var currentFrame = context.getImageData(0, 0, width, height);
		ccontext.putImageData(currentFrame, 0, 0)
		
		if (gest.options.skinFilter) {
			toleratedMovementThreshold = 250;
			checkForGestures(skinfilter(currentFrame));
		} else {
			toleratedMovementThreshold = 150;
			checkForGestures(currentFrame);
		}
	}

	// set skin filtering parameters
	var huemin = 0.0;
	var huemax = 0.10;
	var satmin = 0.0;
	var satmax = 1.0;
	var valmin = 0.4;
	var valmax = 1.0;

	function skinfilter(currentFrame){
		
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

	function checkForGestures(currentFrame){
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
					delt.data[pix] 		= 255; //R
					delt.data[pix+1] 	= 0; //G
					delt.data[pix+2] 	= 0; //B
					delt.data[pix+3] 	= 255; //alpha
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
	
	//var down = false;
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
				if (document.createEvent) {
					document.dispatchEvent(gestEvent);
				} else {
					document.fireEvent("on" + gestEvent.eventType, gestEvent);
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

    return new gest();
}());