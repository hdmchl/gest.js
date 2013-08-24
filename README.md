#LIVE PREVIEW and DEMOS

Simple Demo: [http://hadimichael.github.io/gest.js/demos/simple/index.html](http://hadimichael.github.io/gest.js/demos/simple/index.html)

Using gest.js to control SlideJS: [http://hadimichael.github.io/gest.js/demos/slidejs/index.html](http://hadimichael.github.io/gest.js/demos/slidejs/index.html)

#USAGE

##Include the library (gest.js)
You will need to include the 'gest.js' script using something like:

<code>&lt;script type="text/javascript" src="gest.min.js"&gt;&lt;/script&gt;</code>

##Start gesture detection
You can start gest.js by calling:
<code>gest.start();</code>

##Listening for recognised gestures
You will need to register an event listener on the <code>document</code> for <code>gest</code> using:
<pre><code>document.addEventListener('gest', function(gesture) {
	//handle gesture .direction .up .down .left .right
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
gest.js offers a few options

###Skin Filtering (off by default)
To improve recognition, you may choose to enable HSV skin filtering. You can do so by using:
<code>gest.options.skinFilter = true;</code>

###Messages (on by default)
gest.js shows on screen messages as user feedback, you can control these using:
<code>gest.options.messages = false;</code>

###Debugging (off by default)
In order to view the video stream and enable <code>console.log(…)</code> messages, you will need to toggle debugging using:
<code>gest.options.debug(true);</code>

#TODO

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