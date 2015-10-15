function start3d () {
	var sceneOpt = {width: 800, height: 600};
	var $container = $('#container');

	var scene = new THREE.Scene();
	var camera = new THREE.PerspectiveCamera( 75, sceneOpt.width/sceneOpt.height, 0.1, 1000 );


	//controls.damping = 0.2;
	//controls.addEventListener( 'change', render );

	var renderer = new THREE.WebGLRenderer({ alpha: true });
	renderer.setSize( sceneOpt.width, sceneOpt.height);
	//renderer.setClearColor( 0xffffff, 1);
	//document.getElementById("container").appendChild( renderer.domElement );

	$container.append(renderer.domElement);


	var controls = new THREE.OrbitControls( camera, renderer.domElement);

	var geometry = new THREE.BoxGeometry( 1, 2, 1 );
	//var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );


	var material = new THREE.MeshPhongMaterial( { ambient: 0x555555, color: 0x555555, specular: 0xffffff, shininess: 50, shading: THREE.SmoothShading } );

	var cube = new THREE.Mesh( geometry, material );
	scene.add( cube );

	scene.add( new THREE.AmbientLight( 0x000000 ) );

	var sphere = new THREE.SphereGeometry( 0.1, 16, 8 );

	var light = new THREE.PointLight( 0x80ff80, 2, 50 );
	light.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0x80ff80 } ) ) );
	light.position.set( 5, 0, 5 );
	scene.add( light );

	camera.position.z = 20;

	var render = function () {
		requestAnimationFrame( render );

		cube.rotation.x += 0.01;
		cube.rotation.y += 0.01;

		renderer.render(scene, camera);
	
	};

	render();
}

