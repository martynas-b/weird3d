var iOptions = {
	width: window.innerWidth,
	height: window.innerHeight
}

function start3d (opt) {

	if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
	
	var tooth = new Tooth(iOptions);
}


function Tooth (opt) {
	var container;
	//var stats;
	var camera, scene, renderer;
	//var line = null;
	var tooth = null/*, tooth2 = null, tooth_org = null*/;

	var width = opt.width;
	var height = opt.height;
	
	var d2r = Math.PI / 180;

	var clock = new THREE.Clock();
	
	init();

	function initScene() {

		//container = document.createElement( 'div' );
		//document.body.appendChild( container );
		container = document.getElementById( 'container_3d' );
		//width = container.offsetWidth;
		//height = 600;//container.offsetHeight;

		scene = new THREE.Scene();
	
		camera = new THREE.PerspectiveCamera( 45, width / height, 1, 2000 );
		camera.position.set( -5, 3, 2 );
		camera.lookAt(scene.position);

		// Grid
		/*
		var size = 14, step = 1;

		var geometry = new THREE.Geometry();
		var material = new THREE.LineBasicMaterial( { color: 0x303030 } );

		for ( var i = - size; i <= size; i += step ) {

			geometry.vertices.push( new THREE.Vector3( - size, - 0.04, i ) );
			geometry.vertices.push( new THREE.Vector3(   size, - 0.04, i ) );

			geometry.vertices.push( new THREE.Vector3( i, - 0.04, - size ) );
			geometry.vertices.push( new THREE.Vector3( i, - 0.04,   size ) );

		}

		line = new THREE.Line( geometry, material, THREE.LinePieces );
		scene.add( line );
		*/
		/*
		particleLight = new THREE.Mesh( new THREE.SphereGeometry( 4, 8, 8 ), new THREE.MeshBasicMaterial( { color: 0xffffff } ) );
		scene.add( particleLight );
		var pointLight = new THREE.PointLight( 0xffffff, 4 );
		particleLight.add( pointLight );
		*/
		// Lights

		//scene.add( new THREE.AmbientLight( 0x151515 ) );
/*
		var directionalLight = new THREE.DirectionalLight(0xeeeeee );
		directionalLight.position.copy(camera.position);
		scene.add( directionalLight );

		var light = new THREE.PointLight(0xffffff);
		light.position.set(-50,-200,50);
		scene.add(light);
		*/
		
		scene.add( new THREE.AmbientLight( 0x333333 ) );

		var light = new THREE.DirectionalLight( 0xFFFFFF, 0.9 );
		light.position.set( -1300, 700, 1240 );

		scene.add( light );

		light = new THREE.DirectionalLight( 0xFFFFFF, 0.7 );
		light.position.set( 1000, -500, -1200 );

		scene.add( light );		
		
	
		renderer = new THREE.WebGLRenderer({ antialias: true } );
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( width, height );
		renderer.setClearColor( 0xAAAAAA, 1);
		renderer.gammaInput = true;
		renderer.gammaOutput = true;
		container.appendChild( renderer.domElement );
		
		var controls = new THREE.OrbitControls( camera, renderer.domElement);
		controls.target.set(0,0,0);
	
		var path = "../dev/media/img/skybox/";
		var urls = [path + "px.jpg", path + "nx.jpg",
					path + "py.jpg", path + "ny.jpg",
					path + "pz.jpg", path + "nz.jpg" ];

		var textureCube = THREE.ImageUtils.loadTextureCube( urls );
		textureCube.format = THREE.RGBFormat;

		//window.addEventListener( 'resize', onWindowResize, false );

		// Add the COLLADA
	
		/*
		var loader = new THREE.ColladaLoader();
		loader.options.convertUpAxis = true;
				
		loader.load( '../dev/media/dae/sas3.dae', function ( collada ) {

			dae = collada.scene;
		
			scene.add( dae );
		} );
		*/
		var shader = THREE.ShaderLib.cube;
		shader.uniforms.tCube.value = textureCube;

		var skyMaterial = new THREE.ShaderMaterial( {
			fragmentShader: shader.fragmentShader,
			vertexShader: shader.vertexShader,
			uniforms: shader.uniforms,
			depthWrite: false,
			side: THREE.BackSide
		} );

		var sky = new THREE.Mesh( new THREE.BoxGeometry( 500, 500, 500 ), skyMaterial );
		scene.add( sky );
	
		var loader = new THREE.JSONLoader();
		loader.load( '../dev/media/json/tooth_dec.json', function ( geometry, materials ) {
		
				
			var shaderXhr = new XMLHttpRequest();
			shaderXhr.open("GET", "../dev/js/shaders/v_phong1.vs", true);
			shaderXhr.onload = function() {
					
				var phongShader = THREE.ShaderLib.phong;
				var uniforms = THREE.UniformsUtils.clone(phongShader.uniforms);
				uniforms.diffuse = {type: "c", value: new THREE.Color( 0xFFD700 )};
				uniforms.specular = {type: "c", value: new THREE.Color( 0xB99445 )};
			
				var custom_material = new THREE.ShaderMaterial({
				  uniforms: uniforms,
				  vertexShader: this.responseText,/*loadShader("vertex"),*///phongShader.vertexShader,
				  fragmentShader: phongShader.fragmentShader,
				  lights: true,
				  fog: true
				});
				custom_material.envMap = textureCube;
			
				//var material = new THREE.MeshPhongMaterial({ color: 0xFFD700, specular:0xB99445, envMap: textureCube});		

				tooth = new THREE.Mesh( geometry, custom_material/*new THREE.MeshFaceMaterial( materials )*/ );
				tooth.scale.set(0.1, 0.1, 0.1);
					
				scene.add( tooth );
				
				
			};
			shaderXhr.send(null);
		
		
		
		
		
		
			
			
			/*
			stats = new Stats();
			stats.domElement.style.position = 'absolute';
			stats.domElement.style.top = '0px';
			container.appendChild( stats.domElement );
			*/
				
		} );
	}
	/*
	function loadShader (id) {
		return document.getElementById(id).textContent;
	}
	*/
	/*
	function onWindowResize() {

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );

	}
	*/
	//

	function animate() {

		requestAnimationFrame( animate );

		render();
		//stats.update();

	}

	function render() {
		var et = clock.getElapsedTime();
	/*
		var timer = Date.now() * 0.0005;

		camera.position.x = Math.cos( timer ) * 10;
		camera.position.y = 2;
		camera.position.z = Math.sin( timer ) * 10;

		camera.lookAt( scene.position );

		particleLight.position.x = Math.sin( timer * 4 ) * 3009;
		particleLight.position.y = Math.cos( timer * 5 ) * 4000;
		particleLight.position.z = Math.cos( timer * 4 ) * 3009;

		//THREE.AnimationHandler.update( clock.getDelta() );
	*/
		var angle = et * 10 * d2r;
		if (tooth) {		
			tooth.rotation.y = angle;
		}	
		/*
		if (tooth2) {
			tooth2.rotation.y = angle;
		}
		if (tooth_org) {
			tooth_org.rotation.y = angle;
		}
		*/
		//var h = (Math.sin(angle) / 2) + 0.5;
		//line.material.color.setHSL(h, 0.5, 0.5);

		renderer.render( scene, camera );

	}
	
	function init () {
		initScene();
		animate();
	}
}



