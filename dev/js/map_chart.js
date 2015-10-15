function start3d () {
	var $container = $("#container_3d");
	
	var map = new Weird3d.Maps.Static({
		center: { lat: 55, lng: 24 },
		zoom: 7,
		size: { width: 600, height: 500 },
		maptype: Weird3d.Google.MapType.HYBRID,
		container: document.getElementById("container_3d"),
		scene: {
			//size: { width: window.innerWidth, height: window.innerHeight } 
			size: { width: $container.width(), height: 700 } 
		}
	});
	
	if (typeof chart_data !== "undefined") {
		var mapChart = new Weird3d.Charts.MapChart({
			map: map,
			type: Weird3d.Charts.Type.BAR
		}, chart_data);
	}
	
	var map_us = new Weird3d.Maps.Static({
		center: { lat: 39.8, lng: -98.6 },
		zoom: 4,
		size: { width: 600, height: 500 },
		maptype: Weird3d.Google.MapType.ROADMAP,
		container: document.getElementById("container_3d_us"),
		scene: {
			size: { width: $container.width(), height: 700 } 
		}
	});
	
	if (typeof chart_data_us !== "undefined") {
		var mapChart = new Weird3d.Charts.MapChart({
			map: map_us,
			type: Weird3d.Charts.Type.BAR
		}, chart_data_us);
	}
	
	var render = function () {
		requestAnimationFrame( render );
	
		map.render();
		map_us.render();	
	};

	render();
	
}

