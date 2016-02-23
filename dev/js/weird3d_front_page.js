window.Weird3DFP = window.Weird3DFP || {};

Weird3DFP.Environment = function (opt) {
	var self = this;
	this.options = null;
	var scene = null;
	var renderer = null;
	var camera = null;
	var container = null;
	var titleCont = null;
	var cubes = null, cube_opt = { size: {x: 4, y: 4, z: 4} };
	//var skybox = {rad: 50};
	var mouse = { x: -1000, y: -1000, clicked_id: null, down: false }, INTERSECTED = null;

	//var clock = new THREE.Clock();
	
	function init (opt) {
		self.options = {};
		if (!Weird3d.Tools.isUndefined(opt.scene.size)) { self.options.size = opt.scene.size; }
		if (!Weird3d.Tools.isUndefined(opt.container)) { container = opt.container; }
		if (!Weird3d.Tools.isUndefined(opt.title_container)) { titleCont = opt.title_container; }
		
		scene = new THREE.Scene();
		renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
		//renderer.setClearColor( 0xBEBEBE, 1);
		renderer.setSize( opt.scene.size.width, opt.scene.size.height);
		container.appendChild( renderer.domElement );
		
		Weird3d.Tools.set3DContainerClass(renderer.domElement);
		
		camera = new THREE.PerspectiveCamera( 45, opt.scene.size.width/opt.scene.size.height, 0.1, 4000 );
		camera.position.x = 10;
		camera.position.y = 5;
		camera.position.z = 20;
		
		var controls = new THREE.OrbitControls( camera, renderer.domElement);	
		//controls.minDistance = camera.position.distanceTo(scene.position);
		//controls.maxDistance = skybox.rad;
		controls.noZoom = true;
		controls.target.set(0,0,0);
		
		scene.add( new THREE.AmbientLight( 0x888888 ) );

		var light = new THREE.DirectionalLight( 0xFFFFFF, 0.9 );
		light.position.set( -1300, 700, 1240 );

		scene.add( light );

		light = new THREE.DirectionalLight( 0xFFFFFF, 0.7 );
		light.position.set( 1000, -500, -1200 );

		scene.add( light );
		
		/*
		var path = "../dev/media/img/skybox/milky_way/";
		var urls = [path + "0004.jpg", path + "0002.jpg",
					path + "0006.jpg", path + "0005.jpg",
					path + "0001.jpg", path + "0003.jpg" ];
		
		
		var textureCube = THREE.ImageUtils.loadTextureCube( urls );
		textureCube.format = THREE.RGBFormat;
		

		var shader = THREE.ShaderLib.cube;
		shader.uniforms.tCube.value = textureCube;

		var skyMaterial = new THREE.ShaderMaterial( {
			fragmentShader: shader.fragmentShader,
			vertexShader: shader.vertexShader,
			uniforms: shader.uniforms,
			depthWrite: false,
			side: THREE.BackSide
		} );

		var sky = new THREE.Mesh( new THREE.BoxGeometry( 200, 200, 200 ), skyMaterial );
		scene.add( sky );
		*/
		
		createCubes(/*textureCube*/);
		
		container.addEventListener( 'mousemove', onDocumentMouseMove, false );
		container.addEventListener( 'mousedown', onDocumentMouseDown, false );
		container.addEventListener( 'mouseup', onDocumentMouseUp, false );
		container.addEventListener( 'mouseout', onDocumentMouseOut, false );
				
		var render = function () {
			requestAnimationFrame( render );
			/*
			var et = clock.getElapsedTime();
			var angle = et * d2r;
			*/
			if (cubes) {
				//cubes.rotation.z = (-1) * angle * 2;
			
				findMouseOver();
			}
			/*
			if (shader_material) {
				var h = (Math.sin(angle * 20) / 2) + 0.5;
				var col = new THREE.Color();
				col.setHSL(h, 0.5, 0.5);
			
				shader_material.uniforms.diffuse.value.copy(col);
				shader_material.uniforms.specular.value.copy(col);
			}
			*/
			
			
			renderer.render(scene, camera);	
		};

		render();
	}
	
	function getIntersect () {
		var object = null;
		var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
		vector.unproject( camera );
		var ray = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

		var intersects = ray.intersectObjects( cubes.children );

		if ( intersects.length > 0 ) {
			object = intersects[ 0 ].object;
		}
		return object;
	}
	
	function resetCube () {
		if ( INTERSECTED ) {
			INTERSECTED.scale.set(1, 1, 1);
		}
	}
	
	function showCubeTitle (aTitle) {
		if (titleCont) {
			titleCont.innerHTML = aTitle;
		}
	}
	
	function findMouseOver () {		
		var object = getIntersect();
		if ( object ) {
			if (!mouse.down) {
				if (object.cube) {
					if (object != INTERSECTED) {
						resetCube();
					
						INTERSECTED = object;
				
						if (object.link) {
							var scale = 1.1;
							INTERSECTED.scale.set(scale, scale, scale);
				
							renderer.domElement.style.cursor = "pointer";
							showCubeTitle(INTERSECTED.title);
						}
						else {
							renderer.domElement.style.cursor = "";
							showCubeTitle("");
						}
					}
				}
			}
		} 
		else {
			if ( INTERSECTED ) {
				resetCube();
			
				renderer.domElement.style.cursor = "";
				showCubeTitle("");
				clearMouseDown();
			}
			INTERSECTED = null;
		}
	}
	
	function clearMouseDown () {
		mouse.clicked_id = null;
	}
	
	function onDocumentMouseOut () {
		mouse.down = false;
	}
	
	function onDocumentMouseUp () {
		mouse.down = false;
		var object = getIntersect();
		if ( object && object.cube && object.link ) {		
			if (object.cube_id === mouse.clicked_id) {
				window.location.href = "http://weird3d.com" + object.link;
			}			
			clearMouseDown();
		}
	}
	
	function onDocumentMouseDown () {
		mouse.down = true;
		var object = getIntersect();
		if ( object && object.cube && object.link ) {
			mouse.clicked_id = object.cube_id;
		}
	}
	
	function onDocumentMouseMove (event) {
		var $cont = $(container);
		var $wnd = $(window);
		mouse.x = ( (event.clientX - $cont.offset().left + $wnd.scrollLeft())/ self.options.size.width ) * 2 - 1;
		mouse.y = - ( (event.clientY - $cont.offset().top + $wnd.scrollTop()) / self.options.size.height ) * 2 + 1;
	}
	
	function createCubes (/*aEnvMap*/) {
		var links = [
			{
				img: "x3dom_globe.jpg",
				link: "/x3dom-travel-map",
				title: "X3DOM travel map"
			},
			{
				img: "three_globe.jpg",
				link: "/three-js-travel-map",
				title: "three.js travel map"
			},
			{
				img: "bars.jpg",
				link: "/bar-chart-on-a-dynamic-map",
				title: "Bar charts on a dynamic map"
			},
			{
				img: "sas.jpg",
				link: "/models-created-in-rhino",
				title: "Models created in Rhino"
			},
			{
				img: "tooth.jpg",
				link: "/golden-tooth",
				title: "Golden tooth"
			},
			{
				img: "cubonaut.jpg",
				link: "/cubonaut",
				title: "Cubonaut"
			},
			{
				img: "terrain.jpg",
				link: "/terrain",
				title: "San Francisco terrain"
			},
			{
				img: "terr_vr.jpg",
				link: "/vr-on-real-terrain",
				title: "VR on real terrain"
			}
		];
				
		var geometry = new THREE.BoxGeometry( cube_opt.size.x, cube_opt.size.y, cube_opt.size.z );

		cubes = new THREE.Object3D();
		
		var i = 0, j = 0, cnt = 3;
		var y = ((cnt / 2) - 0.5) * (-1) * cube_opt.size.y;
		
		var lng = links.length;
		
		for (i = 0; i < cnt; i++) {
			var x = ((cnt / 2) - 0.5) * (-1) * cube_opt.size.x;
			
			for (j = 0; j < cnt; j++) {
				var counter = (i * cnt) + j;
				
				var material = new THREE.MeshPhongMaterial({ color: 0xC0C0C0, specular:0xC0C0C0});
				material.shininess = 100;
				//material.emissive = new THREE.Color( 0xffffff );
				//material.metal = true;
				//material.combine = THREE.AddOperation;
				//phong_material.reflectivity = 0.3;		
				
				var cube = new THREE.Mesh( geometry, material );	
			
				if (counter < lng) {
					var tx = THREE.ImageUtils.loadTexture( "../dev/media/img/weird3d_front_page/" + links[counter].img );
					material.map = tx;
					
					cube.link = links[counter].link;
					cube.title = links[counter].title;
				}
				
				cube.position.x = x;
				cube.position.y = y;
			
				cube.cube = true;
								
				cube.cube_id = "cube_" + counter;
				
				cubes.add( cube );
				
				x += cube_opt.size.x;
			
			}
			
			y += cube_opt.size.y;
		}

		scene.add( cubes );
	}
	
	init(opt);
}

var iOptions = {
	width: window.innerWidth,
	height: window.innerHeight
}

function start3d () {
	var w3dFP = new Weird3DFP.Environment({
		container: document.getElementById("container_3d"),
		title_container: document.getElementById("title_container"),
		scene: {
			size: { width: iOptions.width, height: iOptions.height } 
			//size: { width: $(container.width()), height: $(container.height()) } 
		}
	
	});
}