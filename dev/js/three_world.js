function start3d () {
	var $container = $('#container_3d');
	//$container.css({cursor: "-webkit-grab"});
	$container.mousedown(function(){
		$(this).addClass("container_3d_mousedown");
	});
	$container.mouseup(function(){
		$(this).removeClass("container_3d_mousedown");
	});
	
	var sceneOpt = {width: $container.width(), height: 700};
	
	var renderer = new THREE.WebGLRenderer({ alpha: true });
	renderer.setSize( sceneOpt.width, sceneOpt.height);
	//renderer.setClearColor( 0xffffff, 1);
	//document.getElementById("container").appendChild( renderer.domElement );

	$container.append(renderer.domElement);

	var scene = new THREE.Scene();
	var camera = new THREE.PerspectiveCamera( 75, sceneOpt.width / sceneOpt.height, 0.1, 1000 );
	camera.position.z = 2;	
	
	
	var controls = new THREE.OrbitControls( camera, renderer.domElement);
	//controls.damping = 0.2;
	//controls.addEventListener( 'change', render );
	
	
	scene.add( new THREE.AmbientLight( 0x888888 ) );
	
	var light = new THREE.DirectionalLight( 0xcccccc, 1 );
	light.position.set(5, -2, 5);
	scene.add( light );	
			
	var earthMesh = new Planet({
		radius: 0.7,
		texture: "../dev/media/img/political_marked_water_2.png"
		//texture: "../dev/media/img/earthmap.jpg"		
	});
	scene.add(earthMesh);
	
	// create the geometry sphere
	var starGeo  = new THREE.SphereGeometry(90, 32, 32);
	// create the material, using a texture of startfield
	var starMat  = new THREE.MeshBasicMaterial();
	starMat.map   = THREE.ImageUtils.loadTexture("../dev/media/img/starfield.png");
	starMat.side  = THREE.BackSide;
	// create the mesh based on geometry and material
	var starMesh  = new THREE.Mesh(starGeo, starMat);
	scene.add(starMesh);	

	var render = function () {
		requestAnimationFrame( render );
	
		earthMesh.rotation.y += 0.003;

		renderer.render(scene, camera);	
	};

	render();
	
}

function Planet (opt) {
	var self = this;
	this.options = null;
	var planetMesh = null;
	
	init(opt);
	
	function init (opt) {
		self.options = opt;
		
		var geometry = new THREE.SphereGeometry(self.options.radius, 32, 32);
		var material = new THREE.MeshPhongMaterial();
		material.map = THREE.ImageUtils.loadTexture(self.options.texture);
		planetMesh = new THREE.Mesh(geometry, material);
	}
	
	return planetMesh;
}

