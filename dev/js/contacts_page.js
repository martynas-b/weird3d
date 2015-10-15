window.Weird3DContacts = window.Weird3DContacts || {};

Weird3DContacts.Environment = function (opt) {
	var self = this;
	this.options = null;
	var scene = null;
	var renderer = null;
	var camera = null;
	var container = null;
	var cubes = null, cube_opt = { size: {x: 5, y: 5, z: 5} };
	
	function init (opt) {
		self.options = {};
		if (!Weird3d.Tools.isUndefined(opt.scene.size)) { self.options.size = opt.scene.size; }
		if (!Weird3d.Tools.isUndefined(opt.container)) { container = opt.container; }
		
		scene = new THREE.Scene();
		renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
		//renderer.setClearColor( 0xBEBEBE, 1);
		renderer.setSize( opt.scene.size.width, opt.scene.size.height);
		container.appendChild( renderer.domElement );
		
		Weird3d.Tools.set3DContainerClass(renderer.domElement);
		
		camera = new THREE.PerspectiveCamera( 45, opt.scene.size.width/opt.scene.size.height, 0.1, 4000 );
		camera.position.x = -4;
		camera.position.y = 4;
		camera.position.z = 10;
		
		var controls = new THREE.OrbitControls( camera, renderer.domElement);	
		//controls.minDistance = camera.position.distanceTo(scene.position);
		//controls.maxDistance = skybox.rad;
		controls.noZoom = true;
		controls.target.set(0,0,0);
		
		scene.add( new THREE.AmbientLight( 0x888888 ) );

		var light = new THREE.DirectionalLight( 0xFFFFFF, 0.9 );
		light.position.set( 1300, 700, 1240 );

		scene.add( light );

		light = new THREE.DirectionalLight( 0xFFFFFF, 0.7 );
		light.position.set( -1000, 0, -1200 );

		scene.add( light );
		
		
		var path = "../dev/media/img/skybox/";
		var urls = [path + "px.jpg", path + "nx.jpg",
					path + "py.jpg", path + "ny.jpg",
					path + "pz.jpg", path + "nz.jpg" ];
		
		
		var textureCube = THREE.ImageUtils.loadTextureCube( urls );
		textureCube.format = THREE.RGBFormat;
		/*

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
		
		createCubes(textureCube);
		
		var render = function () {
			requestAnimationFrame( render );			
			
			renderer.render(scene, camera);	
		};

		render();
	}
	
	function createCubes (aEnvMap) {
		
		var links = [
			{
				img: "mb_2015_256.jpg",
			}
		];
		
		var geometry = new THREE.BoxGeometry( cube_opt.size.x, cube_opt.size.y, cube_opt.size.z );

		cubes = new THREE.Object3D();
		
		var tx = THREE.ImageUtils.loadTexture( "../dev/media/img/" + links[0].img );
		var material = new THREE.MeshPhongMaterial({ color: 0xC0C0C0, specular:0xC0C0C0, shininess: 100, map: tx });	
		var matBack = new THREE.MeshPhongMaterial({ color: 0xC0C0C0, specular:0xC0C0C0, shininess: 100 });
		if (aEnvMap) {
			matBack.envMap = aEnvMap;
		}
	
		var boxMaterials = [ 
			matBack, 
			matBack, 
			matBack, 
			matBack, 
			material, 
			matBack
		];
		
		var cube = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial(boxMaterials) );
		
		cubes.add( cube );
		
		scene.add( cubes );
	}
	
	init(opt);
}

var iOptions = {
	width: window.innerWidth,
	height: window.innerHeight
}

function start3d () {
	var w3dFP = new Weird3DContacts.Environment({
		container: document.getElementById("container_3d"),
		scene: {
			size: { width: iOptions.width, height: iOptions.height }
		}	
	});
}