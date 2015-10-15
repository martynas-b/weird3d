window.Skull = window.Skull || {};

Skull.Environment = function (opt) {
	var self = this;
	this.options = null;
	var scene = null;
	var renderer = null;
	var camera = null;
	var container = null;
	//var skybox = {rad: 90};
	//var d2r = Math.PI / 180;
	var skull = null;

	//var clock = new THREE.Clock();
	
	function init (opt) {
		self.options = {fullscreen: true};
		if (!Weird3d.Tools.isUndefined(opt.scene.size)) { self.options.size = opt.scene.size; }
		if (!Weird3d.Tools.isUndefined(opt.fullscreen)) { self.options.fullscreen = opt.fullscreen; }
		if (!Weird3d.Tools.isUndefined(opt.container)) { container = opt.container; }
		
		if (self.options.fullscreen) {
			window.addEventListener( 'resize', onWindowResize, false );
		}
		
		scene = new THREE.Scene();
		renderer = new THREE.WebGLRenderer({ /*alpha: true*//*antialias: true*/ });
		//renderer.setClearColor( 0xBEBEBE, 1);
		renderer.setSize( opt.scene.size.width, opt.scene.size.height);
		container.appendChild( renderer.domElement );
		
		Weird3d.Tools.set3DContainerClass(renderer.domElement);
		
		camera = new THREE.PerspectiveCamera( 45, opt.scene.size.width/opt.scene.size.height, 0.1, 4000 );
		camera.position.x = 200;
		camera.position.y = 0;
		camera.position.z = 400;
		
		var controls = new THREE.OrbitControls( camera, renderer.domElement);	
		//controls.minDistance = camera.position.distanceTo(scene.position);
		//controls.maxDistance = skybox.rad;
		//controls.noZoom = true;
		controls.target.set(0,0,0);
		
		scene.add( new THREE.AmbientLight( 0x333333 ) );

		var light = new THREE.DirectionalLight( 0xFFFFFF, 0.9 );
		light.position.set( -1300, 700, 1240 );

		scene.add( light );

		light = new THREE.DirectionalLight( 0xFFFFFF, 0.7 );
		light.position.set( 1000, -500, -1200 );

		scene.add( light );
		
		
		/*
		var path = "../dev/media/img/skybox/";
		var urls = [path + "px.jpg", path + "nx.jpg",
					path + "py.jpg", path + "ny.jpg",
					path + "pz.jpg", path + "nz.jpg" ];
				*/	
		
		
		
		var path = "../dev/media/img/skybox/milky_way/";
		var urls = [path + "0004.jpg", path + "0002.jpg",
					path + "0006.jpg", path + "0005.jpg",
					path + "0001.jpg", path + "0003.jpg" ];
		
		
		/*
		var path = "../dev/media/img/skybox/sky_arizona/";
		var urls = [path + "b.jpg", path + "b.jpg",
					path + "b.jpg", path + "b.jpg",
					path + "b.jpg", path + "b.jpg" ];
		*/
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
		
		
		var loader = new THREE.JSONLoader();
		loader.load( '../dev/media/json/skull_dec_0_1_join.json', function ( geometry, materials ) {
		
			
			
				var material = new THREE.MeshPhongMaterial({ color: 0xFFFFF0/*, specular:0xFFFFF0, envMap: textureCube*/});		

				skull = new THREE.Mesh( geometry, material/*new THREE.MeshFaceMaterial( materials ) */);
				skull.scale.set(0.5, 0.5, 0.5);
				skull.position.y = -5;
					
				scene.add( skull );
				
				
				
		} );
		
		
		var render = function () {
			requestAnimationFrame( render );
			/*
			var et = clock.getElapsedTime();
			var angle = et * d2r;
			
			if (cubes) {
				cubes.rotation.z = (-1) * angle * 2;
				
				findMouseOver();
			}
			
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
	
	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );
	}
	
	init(opt);
}

var iOptions = {
	width: window.innerWidth,
	height: window.innerHeight,
	fullscreen: true
}

function start3d () {
	

	var skull = new Skull.Environment({
		container: document.getElementById("container_3d"),
		scene: {
			size: { width: iOptions.width, height: iOptions.height } 
			//size: { width: $(container.width()), height: $(container.height()) } 
		},
		fullscreen: iOptions.fullscreen
	});
}