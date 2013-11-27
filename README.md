#PRESENTATION AT MELBJS

This is a short presentation I gave that summarises gest.js: [http://hadimichael.github.io/gestjs-presentation/](http://hadimichael.github.io/gestjs-presentation/)

#gest.js IN THE WILD

The University of Connecticut are using gest.js on a large-screen lobby display [http://grad.uconn.edu/lobbydisplay/winter/](http://grad.uconn.edu/lobbydisplay/winter/) - thanks to [@joelsalisbury](http://twitter.com/joelsalisbury)

Gesture game [http://thirst-staging.com/experiments/gest/](http://thirst-staging.com/experiments/gest/) - thanks to [@LochieAxo](http://twitter.com/LochieAxo)

I'd love to know how you will use gest.js! Please get in touch - [@hadi_michael](http://twitter.com/hadi_michael)

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

##Listening for recognised gestures
You will need to register an event listener on the <code>document</code> for <code>gest</code> using:
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

###Skin Filtering (off by default)
To improve recognition, you may choose to enable HSV skin filtering. You can do so by using:
<code>gest.options.skinFilter = true;</code>

###Messages (on by default)
gest.js shows on screen messages as user feedback, you can control these using:
<code>gest.options.messages = false;</code>

###Locking (0 by default)
Sometimes gest.js may rapidly pick up two consecutive gestures, often the second of these gestures is in error. To help mitigate this, you can set a <code>locking</code> option in milliseconds. This will lock gest.js and stop it from dispatching gest events. On screen messages however, will continue to be displayed. To set a locking timeout, use:
<code>gest.options.locking = 500;</code>

###Debugging (off by default)
In order to view the video stream and enable <code>console.log(…)</code> messages, you will need to toggle debugging using:
<code>gest.options.debug(true);</code>

#TODO

- Code cleanup (particularly around visuals)
- Better Firefox support...
- bespoke.js plugin

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