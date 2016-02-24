window.Skull = window.Skull || {};

Skull.Environment = function (opt) {
	var self = this;
	this.options = null;
	var scene = null;
	var renderer = null;
	var camera = null, cameraTarget = null;
	var cameraRadius = 200;
	var container = null;
	//var skybox = {rad: 90};
	var skull = null;
	var lights = {l1: null, l2: null, l3: null};
	var particleSystem = null;
	var effects = {
		rain: {
			texture: '../dev/media/img/raindrop1.png',
			speedH: 0.05,
			speedV: 3.0
		},
		snow: {
			texture: '../dev/media/img/snowflake1.png',
			speedH: 1.0,
			speedV: 1.0
		}
	}

	var clock = new THREE.Clock();
	
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
		
		var awayXZ = 60;
		
		camera.position.x = awayXZ;
		camera.position.y = 0;
		camera.position.z = awayXZ;
		
		cameraTarget = new THREE.Vector3( 0, 0, 0 );
		camera.lookAt(cameraTarget);
		
		
		var controls = new THREE.OrbitControls( camera, renderer.domElement);	
		//controls.minDistance = camera.position.distanceTo(scene.position);
		//controls.maxDistance = skybox.rad;
		//controls.noZoom = true;
		controls.target.set(0,0,0);
		
		
		//scene.add( new THREE.AmbientLight( 0x333333 ) );

		lights.l1 = new THREE.DirectionalLight( 0xFFFFFF, 0.9 );
		lights.l1.position.set( -1300, 700, 1240 );
		scene.add( lights.l1 );

	
		lights.l2 = new THREE.DirectionalLight( 0xFFFFFF, 0.9 );
		lights.l2.position.set( 1000, -500, -1200 );
		scene.add( lights.l2 );
		
		lights.l3 = new THREE.DirectionalLight( 0xFFFFFF, 0.9 );
		lights.l3.position.set( 0, 1, 0 );
		scene.add( lights.l3 );
		
	
		loopLightning(lights.l1);
		loopLightning(lights.l2);
		loopLightning(lights.l3);
		
		
		/*
		var path = "../dev/media/img/skybox/";
		var urls = [path + "px.jpg", path + "nx.jpg",
					path + "py.jpg", path + "ny.jpg",
					path + "pz.jpg", path + "nz.jpg" ];
				*/	
		
		
		/*
		var path = "../dev/media/img/skybox/milky_way/";
		var urls = [path + "0004.jpg", path + "0002.jpg",
					path + "0006.jpg", path + "0005.jpg",
					path + "0001.jpg", path + "0003.jpg" ];
		*/
		
		/*
		var path = "../dev/media/img/skybox/sky_arizona/";
		var urls = [path + "b.jpg", path + "b.jpg",
					path + "b.jpg", path + "b.jpg",
					path + "b.jpg", path + "b.jpg" ];
		*/
		/*
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
		
		loadSkull();		
		
		loadEffect();	
		
		var render = function () {
			requestAnimationFrame( render );
			
			if (particleSystem) {
				elapsedTime = clock.getElapsedTime();
				particleSystem.material.uniforms.elapsedTime.value = elapsedTime * 10;
			}
	
			renderer.render(scene, camera);	
		};

		render();
	}
	
	function loadSkull () {
		var loader = new THREE.JSONLoader();
		loader.load( '../dev/media/json/skull_dec_0_1_join.json', function ( geometry, materials ) {
					
			
				var material = new THREE.MeshPhongMaterial({ color: 0xFFFFF0/*, specular:0xFFFFF0, envMap: textureCube*/});		

				skull = new THREE.Mesh( geometry, material/*new THREE.MeshFaceMaterial( materials ) */);
				
				var scale = 0.3;
				
				skull.scale.set(scale, scale, scale);
				skull.position.y = -10;
					
				scene.add( skull );
				
		} );	
	}
	
	function loadEffect () {
		var rand = function ( v ) {
			return (v * (Math.random() - 0.5));
		};
		
		var effect = effects.rain;
		
		
		var texture = THREE.ImageUtils.loadTexture( effect.texture );
		texture.flipY = false;
		
		var particleSystemHeight = 100;
		var numParticles = 10000,
			width = 100,
			height = particleSystemHeight,
			depth = 100,
			parameters = {
				color: 0xFFFFFF,
				height: particleSystemHeight,
				radiusX: 2.5,
				radiusZ: 2.5,
				size: 100,
				scale: 4.0,
				opacity: 0.4,
				speedH: effect.speedH,
				speedV: effect.speedV
			};
			
			
		var	systemGeometry = new THREE.Geometry();
		
		for( var i = 0; i < numParticles; i++ ) {
			var vertex = new THREE.Vector3(
					rand( width ),
					Math.random() * height,
					rand( depth )
				);

			systemGeometry.vertices.push( vertex );
		}
		
		
		var vsl = new Weird3d.Tools.ExternalShaderLoader();
		vsl.load("../dev/js/shaders/rain.vs", function (aTxt) {
			
			var vst = aTxt;
			
			var fsl = new Weird3d.Tools.ExternalShaderLoader();
			fsl.load("../dev/js/shaders/rain.fs", function (aTxt) {
			
				var fst = aTxt;			
				
				var	systemMaterial = new THREE.ShaderMaterial({
						uniforms: {
								color:  { type: 'c', value: new THREE.Color( parameters.color ) },
								height: { type: 'f', value: parameters.height },
								elapsedTime: { type: 'f', value: 0 },
								radiusX: { type: 'f', value: parameters.radiusX },
								radiusZ: { type: 'f', value: parameters.radiusZ },
								size: { type: 'f', value: parameters.size },
								scale: { type: 'f', value: parameters.scale },
								opacity: { type: 'f', value: parameters.opacity },
								texture: { type: 't', value: texture },
								speedH: { type: 'f', value: parameters.speedH },
								speedV: { type: 'f', value: parameters.speedV }
						},
						vertexShader: vst,
						fragmentShader: fst,
						blending: THREE.AdditiveBlending,
						transparent: true,
						depthTest: false
					});

				particleSystem = new THREE.Points( systemGeometry, systemMaterial );
				particleSystem.position.y = -height/2;

				scene.add( particleSystem );				
		
			});		
		});
	}
	
	function loopLightning (aLight) {	
	
		aLight.intensity = 0.9;
		
		setTimeout(function () {
		
		
			aLight.intensity = 0;
		
		
			setTimeout(function () {
				loopLightning(aLight);
			}, Math.random() * 5000);
			
		}, 200);		
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