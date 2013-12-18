messages: function (state) {
			if (state) {
				//create message container
				var messageContainer = document.createElement('div');
				messageContainer.className = 'gest-message';
				document.body.appendChild(messageContainer);
				
				var styles = {
					positioning: 'margin: 5% auto; min-width: 100px; max-width: 400px; width: 80%; padding: 15px;',
					copy: 'font: normal 35px/1.1 \"Helvetica Neue\", Helvetica, Arial, sans-serif; color: #fff; font-size: 45px; text-align: center;',
					general: 'display: block; background-color: #000; z-index: 100; border-radius: 10px;'
				},
					messageContainerStyle = styles.positioning + styles.copy + styles.general;
		
				utils.addEventListener('gest', document, function(gesture) {
					var message = '';
					if (gesture) {
						message = gesture.error.message;
					} else {
						message = 'Looks like you\'re running an old version of IE. Try using Google Chrome.';
					}
					messageContainer.innerHTML = '<p style=\"margin:0\">' + message + '</p>';
					messageContainer.setAttribute('style', messageContainerStyle);

					window.setTimeout(function() {
						messageContainer.setAttribute('style', 'display: none;');
					}, 2000);
				});
			} else {
				utils.removeEventListener('gest', document);
				var elems = document.getElementsByClassName('gest-message');
				for (var i=0;i<elems.length;i++) {
					elems[i].parentNode.removeChild(elems[i]);
				}
			}
		}