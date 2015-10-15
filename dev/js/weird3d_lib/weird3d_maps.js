window.Weird3d = window.Weird3d || {};
Weird3d.Tools = Weird3d.Tools || {};
Weird3d.Google = Weird3d.Google || {};
Weird3d.Maps = Weird3d.Maps || {};

Weird3d.Maps.MercZoom = {
	levels: [ 78271.5170, 39135.7585, 19567.8792, 9783.9396, 4891.9698,
			2445.9849, 1222.9925, 611.4962, 305.7481, 152.8741, 76.4370,
			38.2185, 19.1093, 9.5546, 4.7773, 2.3887, 1.1943, 0.5972, 0.2986,
			0.1493, 0.0746, 0.0373, 0.0187 ]
};

Weird3d.Maps.WGS84ToMerc = function (coord) {
	return proj4("WGS84", "EPSG:3857", {x: coord.lng, y: coord.lat});
};

Weird3d.Google.APIKey = "AIzaSyDZubUD2PGl9Qz_KMI94In9AQf8H7BTvuA";
Weird3d.Google.staticMapUrl = "https://maps.googleapis.com/maps/api/staticmap";
Weird3d.Google.MapType = {
	ROADS: "roads",
	HYBRID: "hybrid"
};

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

Weird3d.Maps.Static = function (opt) {
	var self = this;
	this.options = null;
	var scene = null;
	var renderer = null;
	var camera = null;
	this.viewBox = null;
	var container = null;
	
	function init (opt) {
		self.options = {
			//mapUrl = "http://maps.googleapis.com/maps/api/staticmap?scale=2&format=jpg-baseline&maptype=" + mapType + "&key=AIzaSyAk6N0fOjsoi-vgr2uHfNrWstewZyt4osM";
			//https://maps.googleapis.com/maps/api/staticmap?center=40.714728,-73.998672&zoom=12&size=400x400&key=AIzaSyDZubUD2PGl9Qz_KMI94In9AQf8H7BTvuA
			maptype: Weird3d.Google.MapType.ROADS,
			size_3d: {x: 100, y: 1}
		};

		if (!Weird3d.Tools.isUndefined(opt.center)) { self.options.center = opt.center; }
		if (!Weird3d.Tools.isUndefined(opt.zoom)) { self.options.zoom = opt.zoom; }
		if (!Weird3d.Tools.isUndefined(opt.size)) { self.options.size = opt.size; }
		if (!Weird3d.Tools.isUndefined(opt.maptype)) { self.options.maptype = opt.maptype; }
		if (!Weird3d.Tools.isUndefined(opt.container)) { container = opt.container; }
		if (!Weird3d.Tools.isUndefined(opt.scene)) { self.options.scene = opt.scene; }
		
		
		self.options.url = Weird3d.Google.staticMapUrl + "?center=" + self.options.center.lat + "," + self.options.center.lng +
												"&zoom=" + self.options.zoom +
												"&size=" + self.options.size.width + "x" + self.options.size.height +
												"&scale=2" +
												"&maptype=" + self.options.maptype +
												"&key=" + Weird3d.Google.APIKey;
		
		setViewBox();
		
		initScene(self.options.scene.size);
	}
	
	this.getScene = function () {
		return {scene: scene};
	};
	
	function setViewBox () {
		var merc = Weird3d.Maps.WGS84ToMerc(self.options.center);
		
		self.viewBox = {center: merc};
		
		var m_px = Weird3d.Maps.MercZoom.levels[self.options.zoom - 1];
		var merc_width = self.options.size.width * m_px;
		var merc_height = self.options.size.height * m_px;
		
		self.viewBox.x = self.viewBox.center.x - (merc_width / 2);
		self.viewBox.y = self.viewBox.center.y + (merc_height / 2);
		self.viewBox.width = merc_width;
		self.viewBox.height = merc_height;
		
		//console.log(self.viewBox);
	}
	
	function initScene (opt) {
		if (THREE) {
			scene = new THREE.Scene();
			//scene.fog = new THREE.Fog( 0x808080, self.options.size_3d.x, 1000 );
			//scene.fog = new THREE.FogExp2( 0xefd1b5, 0.0025 );
			
			renderer = new THREE.WebGLRenderer({ alpha: true });
			//renderer.setClearColor( 0xBEBEBE, 1);
			renderer.setSize( opt.width, opt.height);
			container.appendChild( renderer.domElement );
			
			Weird3d.Tools.set3DContainerClass(renderer.domElement);
			
		
			var mWidth = self.options.size_3d.x;
			var mHeight = Math.round(mWidth / (self.options.size.width/self.options.size.height));
			self.options.size_3d.z = mHeight;
			
			// CAMERA
			camera = new THREE.PerspectiveCamera( 45, opt.width/opt.height, 0.1, 4000 );
			
			var controls = new THREE.OrbitControls( camera, renderer.domElement);
			//controls.noZoom = true;
			//controls.target.set(0,0,0);
			//controls.damping = 0.2;
			//controls.addEventListener( 'change', render );
			
			var coef = 1;//(mWidth * 15) / opt.width;
			
			camera.position.x = mWidth * (-1) * (0.6 * coef);
			camera.position.y = mWidth * (0.5 * coef);
			camera.position.z = mWidth * (0.7 * coef);
			//camera.up = new THREE.Vector3(0,0,0);
    		camera.lookAt(new THREE.Vector3(0,0,0));
			//camera.lookAt(0, 0, 0);
			
			

			var mapGeo = new THREE.BoxGeometry( mWidth, self.options.size_3d.y, mHeight );
			//var bevelR = 1.9;
			//var mapGeo = new THREE.BeveledBlockGeometry( mWidth, 0.5, mHeight, bevelR );
			
			var material = new THREE.MeshPhongMaterial( { ambient: 0x555555, color: 0x555555, specular: 0xffffff, shininess: 4/*, shading: THREE.SmoothShading*/ } );
	
			var mapMat = new THREE.MeshPhongMaterial({ ambient: 0xFFFFFF, shading: THREE.SmoothShading });
			THREE.ImageUtils.crossOrigin = "";
			mapMat.map = THREE.ImageUtils.loadTexture(self.options.url);
	
			var boxMaterials = [ 
			 material, 
			 material, 
			mapMat, 
			material, 
			material, 
			material
                ]; 


                 var boxMaterial = new THREE.MeshFaceMaterial(boxMaterials); 
	
	
			var mapMesh = new THREE.Mesh( mapGeo, boxMaterial );
			scene.add( mapMesh );
	
			//scene.add( new THREE.AmbientLight( 0xFFFFFF ) );
			scene.add( new THREE.AmbientLight( 0x888888 ) );
	/*
			var sphere = new THREE.SphereGeometry( 0.2, 32, 32 );
			var light = new THREE.PointLight( 0xFDB813, 2, 50 );
			light.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xFDB813 } ) ) );
			light.position.set( 0, 20, 5 );
			scene.add( light );
*/


			hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
				hemiLight.color.setHSL( 0.9, 1, 0.9 );
				hemiLight.groundColor.setHSL( 1, 1, 1 );
				hemiLight.position.set( 0, mWidth, 0 );
				scene.add( hemiLight );
				
				
				/*
				scene.add( new THREE.AmbientLight( 0x888888 ) );
	
	var light = new THREE.DirectionalLight( 0xcccccc, 1 );
	light.position.set(5, -2, 5);
	scene.add( light );	
	*/
				
			
	
			self.render();
		}
		else {
			console.log("Missing three.js !");
		}
	}
	
	this.render = function () {
		if (renderer) {
			renderer.render(scene, camera);
		}
	};
	
	
	init(opt);
};