// functioning demo on 18/07/2013

var head = document.getElementsByTagName('head')[0];
var script = document.createElement('script');
script.type = 'text/javascript';
script.src = 'https://bitbucket.org/hadimichael/gest.js/raw/c05a8313a0255564f22e63132e4fca1d4bfd0cd0/gest.js';

script.onload = function() { 
	var div = document.createElement('div');
	div.setAttribute('style', 'position: fixed; top: 10px; left: 10px; width: 100px; z-index:100; color: lime; font-size: 35px; font-family: Arial;');
	document.body.appendChild(div);
	
	document.addEventListener('gest', function(gesture) {
		div.innerHTML = gesture.direction;
		if (gesture.direction === 'left') {
			$('.next').trigger('click');
		} else if (gesture.direction === 'right') {
			$('.prev').trigger('click');
		}
	}, false);

	gest.start();
};

head.appendChild(script);