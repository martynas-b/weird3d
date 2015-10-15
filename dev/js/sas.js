var container, stats;

var camera, scene, renderer, objects;
var particleLight;
var dae;

var width;// = window.innerWidth;
var height;// = window.innerHeight;

function start3d () {

	if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

	var loader = new THREE.ColladaLoader();
	loader.options.convertUpAxis = true;
				
	loader.load( '../dev/media/dae/sas3.dae', function ( collada ) {

		dae = collada.scene;

		/*
		dae.traverse( function ( child ) {

			if ( child instanceof THREE.SkinnedMesh ) {

				var animation = new THREE.Animation( child, child.geometry.animation );
				animation.play();

			}

		} );

		dae.scale.x = dae.scale.y = dae.scale.z = 0.002;
		dae.updateMatrix();
		*/
		init();
		animate();

	} );
}

function init() {

	//container = document.createElement( 'div' );
	//document.body.appendChild( container );
	container = document.getElementById( 'container_3d' );
	width = container.offsetWidth;
	height = 600;//container.offsetWidth;

	camera = new THREE.PerspectiveCamera( 45, width / height, 1, 2000 );
	camera.position.set( 2, 2, 3 );

	scene = new THREE.Scene();

	// Grid

	var size = 14, step = 1;

	var geometry = new THREE.Geometry();
	var material = new THREE.LineBasicMaterial( { color: 0x303030 } );

	for ( var i = - size; i <= size; i += step ) {

		geometry.vertices.push( new THREE.Vector3( - size, - 0.04, i ) );
		geometry.vertices.push( new THREE.Vector3(   size, - 0.04, i ) );

		geometry.vertices.push( new THREE.Vector3( i, - 0.04, - size ) );
		geometry.vertices.push( new THREE.Vector3( i, - 0.04,   size ) );

	}

	var line = new THREE.Line( geometry, material, THREE.LinePieces );
	scene.add( line );

	// Add the COLLADA

	scene.add( dae );

	particleLight = new THREE.Mesh( new THREE.SphereGeometry( 4, 8, 8 ), new THREE.MeshBasicMaterial( { color: 0xffffff } ) );
	scene.add( particleLight );

	// Lights

	scene.add( new THREE.AmbientLight( 0xcccccc ) );

	var directionalLight = new THREE.DirectionalLight(/*Math.random() * 0xffffff*/0xeeeeee );
	directionalLight.position.x = Math.random() - 0.5;
	directionalLight.position.y = Math.random() - 0.5;
	directionalLight.position.z = Math.random() - 0.5;
	directionalLight.position.normalize();
	scene.add( directionalLight );

	var pointLight = new THREE.PointLight( 0xffffff, 4 );
	particleLight.add( pointLight );

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( width, height );
	renderer.setClearColor( 0x000000, 1);
	
	
	//var controls = new THREE.OrbitControls( camera, renderer.domElement);
	
	container.appendChild( renderer.domElement );
	/*
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	container.appendChild( stats.domElement );
	*/
	//

	//window.addEventListener( 'resize', onWindowResize, false );

}
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

//var clock = new THREE.Clock();

function render() {

	var timer = Date.now() * 0.0005;

	camera.position.x = Math.cos( timer ) * 10;
	camera.position.y = 2;
	camera.position.z = Math.sin( timer ) * 10;

	camera.lookAt( scene.position );

	particleLight.position.x = Math.sin( timer * 4 ) * 3009;
	particleLight.position.y = Math.cos( timer * 5 ) * 4000;
	particleLight.position.z = Math.cos( timer * 4 ) * 3009;

	//THREE.AnimationHandler.update( clock.getDelta() );

	renderer.render( scene, camera );

}