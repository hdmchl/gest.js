/* 
 * Include some credits information in the page header. This is where I will attribute any necessary code etc..
 */

(function (document) {
	var head = document.getElementsByTagName('head')[0];
	var link = document.createElement('link');
	link.rel = "stylesheet";
	link.href="../credits/credits.css";
	head.appendChild(link);

	var body = document.getElementsByTagName('body')[0];
	var header = document.createElement('header');
	header.innerHTML = "<div class=\"credits header_div\"><a href=\"http://twitter.com/hadi_michael\"><img src=\"../credits/profile.png\" alt=\"Hadi Michael\"></a><p>By <a href=\"http://twitter.com/hadi_michael\">@hadi_michael</a></p></div>";

	header.innerHTML += "<div class=\"demo_name header_div\"><p>" + document.title + "</p></div>";

	body.appendChild(header);
}(document));