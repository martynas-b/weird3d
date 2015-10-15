window.Weird3d = window.Weird3d || {};
Weird3d.Tools = Weird3d.Tools || {};

Weird3d.Tools.isUndefined = function (val) {
	var res = true;
	if (typeof val !== "undefined") { res = false; }
	return res;
};

Weird3d.Tools.set3DContainerClass = function (container) {
	if (container) {
		var $container = container;
		if (!$container.jquery) {
			$container = $(container);
		}

		$container.addClass("container_3d");

		$container.mousedown(function(){
			$(this).addClass("container_3d_mousedown");
		});
		$container.mouseup(function(){
			$(this).removeClass("container_3d_mousedown");
		});
	}
};

Weird3d.Tools.loadShader = function (id) {
	return document.getElementById(id).textContent;
};

Weird3d.Tools.extShaderLoader = function (aCallback, aUrl) {
	if (aCallback && aUrl && (aUrl !== "")) {
		var xhr = new XMLHttpRequest();
		xhr.open("GET", aUrl, true);
		xhr.onload = function() {
			aCallback(this.responseText);
		}
		xhr.send(null);
	}
};