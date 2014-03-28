#What is gest.js? Check out this presentation from MelbJS

This is a short presentation I gave at MelbJS that summarises gest.js: [http://hadimichael.github.io/gestjs-presentation/](http://hadimichael.github.io/gestjs-presentation/)

#gest.js IN THE WILD

- Air2048 Tile Game [http://bennettfeely.com/air2048/](http://bennettfeely.com/air2048/) - thanks to [@bennettfeely](http://twitter.com/bennettfeely)

- The University of Connecticut are using gest.js on a large-screen lobby display [http://grad.uconn.edu/lobbydisplay/winter/](http://grad.uconn.edu/lobbydisplay/winter/) - thanks to [@joelsalisbury](http://twitter.com/joelsalisbury)

- Stop the Elves - Christmas game [http://stoptheelves.thirststudios.com/](http://stoptheelves.thirststudios.com/) - thanks again to [@LochieAxo](http://twitter.com/LochieAxo)

- Gesture game [http://thirst-staging.com/experiments/gest/](http://thirst-staging.com/experiments/gest/) - thanks to [@LochieAxo](http://twitter.com/LochieAxo)

Are you using gest.js? Please get in touch [@hadi_michael](http://twitter.com/hadi_michael)

#EXAMPLES

A simple gest.js demo that displays the gesture direction on screen: [http://hadimichael.github.io/gest.js/demos/simple/index.html](http://hadimichael.github.io/gest.js/demos/simple/index.html)

Using gest.js to control [Nathan Searles' SlidesJS](http://www.slidesjs.com/): [http://hadimichael.github.io/gest.js/demos/slidesjs/index.html](http://hadimichael.github.io/gest.js/demos/slidesjs/index.html)

#USAGE

##Include the library (gest.js)
You will need to include the 'gest.js' library using something like:

<code>&lt;script type="text/javascript" src="gest.min.js"&gt;&lt;/script&gt;</code>

##Start gesture detection
You can start gest.js by calling:
<code>gest.start();</code>

##Listen for recognised gestures

### Method 1 (recommended)
Use the <code>.options.subscribeWithCallback(...)</code> function to listen for gestures:
<pre><code>gest.options.subscribeWithCallback(function(gesture) {
	//handle gesture .direction .up .down .left .right .error
});
</code></pre>
This method is recommended because it will automatically handle cross-browser event handling.

### Method 2
You can register an event listener on the <code>document</code> for <code>gest</code> using:
<pre><code>document.addEventListener('gest', function(gesture) {
	//handle gesture .direction .up .down .left .right .error
}, false);
</code></pre>

##How to handle recognised gestures
On every event, you will be passed a <code>gesture</code> object that contains:

- <code>.direction</code> the recognised gesture in words as a string
- <code>.up</code> boolean, true if the recognised gesture is up
- <code>.down</code> boolean, true if the recognised gesture is down
- <code>.left</code> boolean, true if the recognised gesture is left
- <code>.right</code> boolean, true if the recognised gesture is right
- <code>.error</code> an error object with...
	- <code>.code</code> a code as an int
	- <code>.message</code> and a message as a string

##Stop gesture detection
You can stop gest.js at any time by calling:
<code>gest.stop();</code>

##Using Options

###Sensitivity (80 by default)
You can specify the degree of colour change that should be used to determine whether or not a pixel has changed. The specified value should range from 0-100, with 100 implying that the slightest change should be enough. You can specify sensitivity using: <code>gest.options.sensitivity(85);</code>

###Skin Filtering (off by default)
To improve recognition in bright lighting conditions, you can enable HSV skin filtering using: <code>gest.options.skinFilter(true);</code>

###Debugging (off by default)
In order to view the video stream and enable <code>console.log(…)</code> messages, you will need to toggle debugging using: <code>gest.options.debug(true);</code>

#WHAT'S CHANGED

##v0.5.0 (latest)

- Firefox support (woohoo!)
- Error handling, all the way back to the stone-age (IE7)
- Better event handling
- Ability for the developer to define sensitivity
- A new <code>.options.subscribeWithCallback(...)</code> function
- On screen messages is now DEPRECATED. I decided that this is something that the front-end developer should build - it shouldn't be part of the library. If you really want it back, check demo/simple.
- Locking is now DEPRECATED. It wasn't an elegant enough solution. It might come back in future releases...

#TODO
- bespoke.js plugin (this is pretty much done, I just need to package it up)
- Fine tune skin filtering values
- Include a ready flag... might do this, not sure yet.
- Bring back the ready message: "The force is strong with you, go forth and gesture."

#Acknowledgements
gest.js is an extension of work started by William Wu [https://github.com/willy-vvu](https://github.com/willy-vvu).

#LICENSE (MIT)

Copyright (c) 2013, Hadi Michael (http://hadi.io)

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