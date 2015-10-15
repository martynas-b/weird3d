window.Cubonaut = window.Cubonaut || {};

Cubonaut.Environment = function (opt) {
	var self = this;
	this.options = null;
	var scene = null;
	var renderer = null;
	var camera = null;
	var container = null;
	var shader_material = null, cubes = null, color_cube = null, cube_opt = { size: {x: 4, y: 4, z: 4} };
	var skybox = {rad: 90};
	var d2r = Math.PI / 180;
	var mouse = { x: 0, y: 0 }, INTERSECTED = null;

	var clock = new THREE.Clock();
	
	function init (opt) {
		self.options = {};
		if (!Weird3d.Tools.isUndefined(opt.scene.size)) { self.options.size = opt.scene.size; }
		if (!Weird3d.Tools.isUndefined(opt.container)) { container = opt.container; }
		
		scene = new THREE.Scene();
		renderer = new THREE.WebGLRenderer({ /*alpha: true*//*antialias: true*/ });
		//renderer.setClearColor( 0xBEBEBE, 1);
		renderer.setSize( opt.scene.size.width, opt.scene.size.height);
		container.appendChild( renderer.domElement );
		
		Weird3d.Tools.set3DContainerClass(renderer.domElement);
		
		camera = new THREE.PerspectiveCamera( 45, opt.scene.size.width/opt.scene.size.height, 0.1, 4000 );
		camera.position.x = 40;
		camera.position.y = 30;
		camera.position.z = 40;
		
		var controls = new THREE.OrbitControls( camera, renderer.domElement);	
		controls.minDistance = camera.position.distanceTo(scene.position);
		controls.maxDistance = skybox.rad;
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
		
		
		/*
		var starGeo = new THREE.SphereGeometry(skybox.rad, 32, 32);
		var starMat = new THREE.MeshBasicMaterial();
		starMat.map = THREE.ImageUtils.loadTexture("../dev/media/img/skybox/milky_way_4.jpg");
		starMat.side = THREE.BackSide;
		var starMesh = new THREE.Mesh(starGeo, starMat);
		scene.add(starMesh);	
		*/
		
		
		createCubes(textureCube);
		
		container.addEventListener( 'mousemove', onDocumentMouseMove, false );
		container.addEventListener( 'mousedown', onDocumentMouseDown, false );
		
		var render = function () {
			requestAnimationFrame( render );
			
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
	
	function findMouseOver () {	
		var object = getIntersect();

		if ( object ) {
			if (object.cube) {
				if ( (object != INTERSECTED) && (object.material.color)) {
					if ( INTERSECTED ) {
						INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
					}
					INTERSECTED = object;
					INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
						
					INTERSECTED.material.color.copy( shader_material.uniforms.diffuse.value );
					
					renderer.domElement.style.cursor = "pointer";
				}
			}
		} 
		else {
			if ( INTERSECTED ) {
				INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
				renderer.domElement.style.cursor = "";
			}
			INTERSECTED = null;
		}
	}
	
	function onDocumentMouseDown () {
		var object = getIntersect();
		if ( object && object.cube) {
			console.log(object.cube_id);	
		}
	}
	
	function onDocumentMouseMove (event) {
		var $cont = $(container);
		var $wnd = $(window);
		mouse.x = ( (event.clientX - $cont.offset().left + $wnd.scrollLeft())/ self.options.size.width ) * 2 - 1;
		mouse.y = - ( (event.clientY - $cont.offset().top + $wnd.scrollTop()) / self.options.size.height ) * 2 + 1;
	}
	
	function createCubes (aEnvMap) {
		
		Weird3d.Tools.extShaderLoader(function(aVS) {
		
			var phongShader = THREE.ShaderLib.phong;
			var uniforms = THREE.UniformsUtils.clone(phongShader.uniforms);
			uniforms.diffuse = {type: "c", value: new THREE.Color( 0xC0C0C0 )};
			uniforms.specular = {type: "c", value: new THREE.Color( 0xC0C0C0 )};
			uniforms.shininess = {type: "f", value: 100.0};
			uniforms.reflectivity = {type: "f", value: 0.3};
					
			shader_material = new THREE.ShaderMaterial({
				uniforms: uniforms,
				vertexShader: aVS,/* Weird3d.Tools.loadShader("vertex"),*//*phongShader.vertexShader*/
				fragmentShader: phongShader.fragmentShader,
				lights: true,
				fog: true
			});
			shader_material.envMap = aEnvMap;
		
			var geometry = new THREE.BoxGeometry( cube_opt.size.x, cube_opt.size.y, cube_opt.size.z );
	
			cubes = new THREE.Object3D();
	
			var i = 0, cnt = 8, r = 10, colorInx = 1;
			var angleStep = (360 / cnt) * d2r, hAngle = 90 * d2r;
			var angle = 0;
			for (i = 0; i < cnt; i++) {
			
				var phong_material = new THREE.MeshPhongMaterial({ color: 0xC0C0C0, specular:0xC0C0C0, envMap: aEnvMap});
				phong_material.shininess = 100;
				//material.emissive = new THREE.Color( 0xffffff );
				//material.metal = true;
				//material.combine = THREE.AddOperation;
				phong_material.reflectivity = 0.3;		
		
				/*
				if (i === colorInx) {
					mat = shader_material;
				}
				*/
				var cube = new THREE.Mesh( geometry, phong_material );
				/*
				if (i === colorInx) {
					color_cube = cube;
				}
						*/	
				var x = r * Math.cos(angle) * Math.sin(hAngle);
				var y = r * Math.sin(angle) * Math.sin(hAngle);
				var z = r * Math.cos(hAngle);
				cube.position.x = x;
				cube.position.y = y;
				cube.position.z = z;
				cube.cube = true;
				cube.cube_id = "cube_" + i;
					
				cubes.add( cube );
		
				angle += angleStep;
			}
	
			scene.add( cubes );	
	
			/*
			var torus = new THREE.Mesh( new THREE.TorusGeometry( r, 0.1, 32, 100 ), phong_material );
			cubes.add( torus );
			*/
			var cylinder = new THREE.Mesh(	new THREE.CylinderGeometry(0.1, 0.1, r,  32), new THREE.MeshPhongMaterial({ color: 0xC0C0C0, specular:0xC0C0C0}) );
			cylinder.position.y = r / 2;
			cubes.add( cylinder );	
	
			var cone = new THREE.Mesh( new THREE.CylinderGeometry(2, 0, 60,  32), shader_material );
			cone.rotation.x = -90 * d2r;
			cone.position.z = -15;
				
			cubes.add( cone );			
		}, "../dev/js/shaders/v_phong1.vs");
	
	}
	
	init(opt);
}

var iOptions = {
	width: window.innerWidth,
	height: window.innerHeight
}

function start3d () {
	

	var cubonaut = new Cubonaut.Environment({
		container: document.getElementById("container_3d"),
		scene: {
			size: { width: iOptions.width, height: iOptions.height } 
			//size: { width: $(container.width()), height: $(container.height()) } 
		}
	
	});
}