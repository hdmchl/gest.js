// functioning demo on 18/07/2013

var head = document.getElementsByTagName('head')[0];
var script = document.createElement('script');
script.type = 'text/javascript';
script.src = 'https://bitbucket.org/hadimichael/gest.js/raw/6c5c23b34792ff0224901879e3e9be4e2e1ebcbc/gest.js';

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