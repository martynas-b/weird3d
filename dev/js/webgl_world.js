window.Tools = window.Tools || {};

Tools.isUndefined = function (val) {
	var res = true;
	if (typeof val !== "undefined"){
		res = false;
	}
	return res;
};

function start3d () {

	if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

	var world = new World(iWorldOptions);
}


function World (aOpt) {
	var self = this;
	var container = null;
	this.camera = null;
	this.scene = null;
	this.renderer = null;
	var controls = null;
	var iTerrain = null;
	var iPlayer = null;
	
	var iVR = null;
	
	this.sceneOptions = {size: {width: window.innerWidth, height: window.innerHeight}};
	var iOptions = {useControls: true, useVR: false, windowResize: false};
	
	var iMove = {
		moveSpeed: 3,
		lookSpeed: 0.4
	};

	var clock = new THREE.Clock();
	var iSize = {
		x: 5000,
		y: 5000,
		z: 5000
	};
	
	function initOptions (aOpt) {
		if (Browser.touch) {
			iOptions.useControls = false;
		}
		
		if (aOpt) {
			if (!Tools.isUndefined(aOpt.width)) { 
				self.sceneOptions.size.width = aOpt.width;
			}
			if (!Tools.isUndefined(aOpt.height)) {
				self.sceneOptions.size.height = aOpt.height;
			}
			if (!Tools.isUndefined(aOpt.useControls)) {
				iOptions.useControls = aOpt.useControls;
			}
			if (aOpt.useVR) {
				iOptions.useVR = aOpt.useVR;
			}
			if (aOpt.windowResize) {
				iOptions.windowResize = aOpt.windowResize;
			}
		}
	}

	function initScene() {
		if (iOptions.windowResize) {
			window.addEventListener( 'resize', onWindowResize, false );
		}
		
		container = document.getElementById( 'container_3d' );
		//width = container.offsetWidth;
		//height = 600;//container.offsetHeight;

		self.scene = new THREE.Scene();
		//scene.fog = new THREE.Fog( 0xAAAAAA, 100, 1000 );
		
		iPlayer = new Player({
			scene: self.scene
		});
	
		self.camera = new THREE.PerspectiveCamera( 45, self.sceneOptions.size.width / self.sceneOptions.size.height, 1, 10000 );
		self.camera.position.set( 0, iPlayer.attributes.height, 0 );
		self.camera.lookAt(/*scene.position*/new THREE.Vector3(0, 3, -500));
		
		self.scene.add( new THREE.AmbientLight( 0x333333 ) );

		var light = new THREE.DirectionalLight( 0xFFFFFF, 0.9 );
		light.castShadow = true;
		light.position.set( -1300, 700, 1240 );

		self.scene.add( light );

		light = new THREE.DirectionalLight( 0xFFFFFF, 0.7 );
		//light.castShadow = true;
		light.position.set( 1000, -500, -1200 );

		self.scene.add( light );		
	
		self.renderer = new THREE.WebGLRenderer({ antialias: true/*, alpha:true*/ } );
		self.renderer.setPixelRatio( window.devicePixelRatio );
		self.renderer.setSize( self.sceneOptions.size.width, self.sceneOptions.size.height );
		self.renderer.setClearColor( 0xAAAAAA, 1);
		self.renderer.gammaInput = true;
		self.renderer.gammaOutput = true;
		self.renderer.shadowMapEnabled = true;
		container.appendChild( self.renderer.domElement );
	
		var path = "../dev/media/img/skybox/";
		var urls = [path + "px.jpg", path + "nx.jpg",
					path + "py.jpg", path + "ny.jpg",
					path + "pz.jpg", path + "nz.jpg" ];

		var textureCube = THREE.ImageUtils.loadTextureCube( urls );
		textureCube.format = THREE.RGBFormat;

		//window.addEventListener( 'resize', onWindowResize, false );

		var shader = THREE.ShaderLib.cube;
		shader.uniforms.tCube.value = textureCube;

		var skyMaterial = new THREE.ShaderMaterial( {
			fragmentShader: shader.fragmentShader,
			vertexShader: shader.vertexShader,
			uniforms: shader.uniforms,
			depthWrite: false,
			side: THREE.BackSide
		} );

		var sky = new THREE.Mesh( new THREE.BoxGeometry( iSize.x, iSize.y, iSize.z ), skyMaterial );
		self.scene.add( sky );		
		
		iTerrain = new Terrain({
			scene: self.scene,
			camera: self.camera,
			playerObject: iPlayer.getObject()
		});
		iTerrain.addTerrain();
		
		
		if (iOptions.useVR) {
			iVR = new Weird3d.VR({
				world: self
			});
		}
		else if (iOptions.useControls) {
			controls = new THREE.FirstPersonControls( self.camera, self.renderer.domElement );
			controls.movementSpeed = iMove.moveSpeed;
			controls.lookSpeed = iMove.lookSpeed;
			//controls.activeLook = false;		
			//controls.lookVertical = false;
		}
		else {
			self.camera.position.y += 25;
			/*
			camera.position.set( 200, camera.position.y, -100 );
			camera.lookAt(scene.position);
			
			controls = new THREE.OrbitControls( camera, renderer.domElement);
			controls.target.set(0,0,0);		
			*/			
		}
		
		loadCollada({
			src: '../dev/media/dae/rosnaes_l.dae',
			position: {x: 0, y: 0, z: -150},
		}, function (dae) {	
			var clone = dae.clone();
			clone.position.set(20, 0, -150);
			self.scene.add( clone );
		});
		
		loadCollada({
			src: '../dev/media/dae/r_h1.dae',
			position: {x: 20, y: 40, z: 10}
		}, null);
	}
	
	function onWindowResize() {
		var width = window.innerWidth;
		var height = window.innerHeight;
		
		self.camera.aspect = width / height;
		self.camera.updateProjectionMatrix();
		
		if (iVR && iVR.vr.on) {
			iVR.setSize( width, height );
		}
		else {
			self.renderer.setSize( width, height );
		}
		
		self.sceneOptions.size.width = width;
		self.sceneOptions.size.height = height;
	}
	
	function loadCollada (aOpt, aCallBack) {
		var loader = new THREE.ColladaLoader();
		loader.options.convertUpAxis = true;
					
		loader.load( aOpt.src, function ( collada ) {

			var dae = collada.scene;
			
			dae.position.x = aOpt.position.x;
			dae.position.y = aOpt.position.y;
			dae.position.z = aOpt.position.z;
			
			dae.traverse( function ( object ) {
				if ( object instanceof THREE.Mesh ) {
					object.castShadow = true;
					object.receiveShadow = true;
					object.material.transparent = true;
				}
			} );
			
			self.scene.add(dae);			
			
			if (aCallBack) {
				aCallBack(dae);
			}
		} );
	}

	function animate() {

		requestAnimationFrame( animate );

		render();
		//stats.update();

	}

	function render() {
	
		if (iVR && iVR.vr.on) {
			iVR.update();
			iVR.render();
		}
		else {
	
			if (controls) {
				var delta = clock.getDelta();
				controls.update(delta);
			}
			else {
				var timer = Date.now() * 0.0002;

				self.camera.position.x = Math.cos( timer ) * 250;
				self.camera.position.z = Math.sin( timer ) * 250;

				self.camera.lookAt( self.scene.position );
			}
		
			self.renderer.render( self.scene, self.camera );
		
		}

	}
	
	function init (aOpt) {
		initOptions(aOpt);
		initScene();
		animate();
	}
	
	init(aOpt);
}

function Player (aOpt) {
	var self = this;
	var iScene = null;
	var iObject = null;
	this.attributes = {height: 1.8};
	
	function initOptions (aOpt) {
		if (aOpt) {
			if (!Tools.isUndefined(aOpt.scene)) { 
				iScene = aOpt.scene;
			}
		}
	}	
	
	function addPlayer () {
		var geo = new THREE.SphereGeometry( self.attributes.height / 2, 16, 16 );
		iObject = new THREE.Mesh(geo, new THREE.MeshBasicMaterial());
		iObject.position.y = self.attributes.height / 2;
		iScene.add(iObject);
	}
	
	this.getObject = function () {
		return iObject;
	};
	
	function init (aOpt) {
		initOptions(aOpt);
		//addPlayer();
	}	
	
	init(aOpt);
}

function Terrain (aOpt) {
	var iScene = null;
	var iCamera = null;
	var iPlayerObj = null;
	
	function initOptions (aOpt) {
		if (aOpt) {
			if (!Tools.isUndefined(aOpt.scene)) { 
				iScene = aOpt.scene;
			}
			if (!Tools.isUndefined(aOpt.camera)) { 
				iCamera = aOpt.camera;
			}
			if (!Tools.isUndefined(aOpt.playerObject)) { 
				iPlayerObj = aOpt.playerObject;
			}
		}
	}
	
	this.addTerrain = function () {			
		var size = 603;
		
		var segm = 32;
		var geometry = new THREE.PlaneBufferGeometry( size, size, segm - 1, segm - 1 );
		//geometry.computeFaceNormals();
		//geometry.computeVertexNormals();
				
		//var bingTArr = [1296,1297,1296,1295,1293,1291,1290,1290,1290,1289,1290,1290,1289,1287,1285,1282,1267,1248,1229,1220,1215,1211,1208,1210,1212,1213,1215,1217,1222,1238,1256,1278,1298,1297,1296,1295,1293,1292,1292,1292,1292,1292,1293,1293,1292,1291,1289,1289,1288,1279,1262,1248,1224,1217,1211,1210,1211,1213,1215,1218,1225,1246,1267,1281,1299,1299,1297,1295,1293,1293,1293,1294,1293,1293,1294,1294,1293,1293,1292,1292,1291,1285,1283,1278,1252,1232,1220,1215,1213,1214,1215,1218,1227,1248,1271,1282,1301,1301,1299,1296,1294,1294,1293,1294,1295,1294,1294,1293,1292,1291,1290,1290,1289,1288,1288,1288,1283,1258,1242,1228,1218,1215,1216,1220,1232,1251,1269,1276,1304,1304,1303,1300,1298,1295,1293,1293,1299,1300,1292,1292,1291,1290,1288,1288,1287,1287,1288,1287,1286,1271,1257,1245,1228,1217,1215,1221,1237,1254,1270,1273,1308,1308,1310,1309,1305,1301,1298,1302,1315,1313,1299,1291,1291,1289,1287,1286,1285,1284,1284,1284,1283,1276,1267,1257,1243,1226,1217,1219,1235,1253,1268,1272,1317,1323,1331,1336,1337,1330,1320,1335,1354,1343,1310,1292,1291,1289,1286,1285,1284,1283,1282,1280,1281,1281,1278,1265,1254,1241,1230,1222,1228,1245,1257,1258,1345,1362,1369,1376,1383,1366,1362,1379,1385,1363,1320,1293,1291,1289,1287,1285,1284,1282,1281,1279,1280,1281,1278,1270,1262,1258,1251,1243,1235,1237,1243,1251,1390,1404,1406,1406,1406,1391,1392,1403,1402,1371,1331,1298,1291,1290,1287,1286,1285,1284,1282,1280,1279,1278,1276,1273,1270,1271,1269,1262,1257,1254,1250,1261,1422,1416,1411,1412,1409,1405,1406,1404,1390,1369,1339,1312,1302,1293,1289,1285,1284,1284,1282,1280,1279,1278,1276,1275,1277,1278,1277,1274,1271,1270,1267,1269,1432,1427,1420,1419,1414,1411,1409,1403,1385,1374,1362,1345,1328,1315,1306,1286,1282,1282,1282,1280,1279,1278,1278,1279,1281,1282,1282,1280,1276,1274,1272,1273,1436,1431,1429,1426,1420,1415,1410,1405,1399,1394,1382,1372,1357,1345,1331,1299,1285,1281,1281,1279,1279,1280,1281,1281,1282,1283,1283,1282,1280,1277,1276,1276,1439,1435,1433,1431,1427,1418,1412,1408,1405,1401,1391,1374,1366,1351,1328,1310,1294,1283,1280,1279,1280,1285,1285,1283,1284,1284,1284,1283,1281,1279,1278,1279,1442,1439,1437,1434,1429,1421,1415,1411,1407,1402,1392,1375,1358,1339,1326,1314,1295,1286,1282,1281,1286,1291,1291,1287,1286,1285,1284,1282,1281,1281,1281,1281,1449,1450,1446,1439,1433,1426,1418,1412,1408,1405,1398,1386,1357,1332,1319,1309,1294,1289,1286,1286,1290,1293,1292,1290,1287,1285,1283,1282,1281,1282,1282,1282,1454,1467,1463,1446,1437,1429,1419,1413,1409,1404,1391,1378,1354,1331,1316,1306,1299,1292,1289,1289,1292,1294,1293,1291,1288,1285,1283,1281,1282,1283,1284,1284,1455,1466,1474,1461,1445,1434,1424,1415,1410,1404,1389,1374,1350,1332,1318,1309,1302,1296,1294,1293,1295,1295,1295,1292,1288,1284,1282,1282,1282,1284,1284,1285,1455,1464,1479,1479,1458,1441,1430,1419,1411,1403,1389,1374,1346,1333,1322,1315,1308,1303,1301,1298,1298,1296,1295,1292,1288,1283,1282,1283,1284,1285,1286,1286,1455,1464,1477,1483,1465,1446,1434,1421,1411,1403,1389,1375,1344,1334,1328,1326,1320,1313,1308,1304,1300,1296,1293,1291,1288,1286,1285,1285,1286,1286,1287,1288,1453,1462,1475,1481,1465,1449,1437,1423,1413,1405,1396,1389,1350,1336,1333,1334,1330,1322,1313,1307,1302,1297,1293,1291,1289,1288,1287,1287,1287,1288,1289,1289,1451,1461,1474,1484,1476,1453,1438,1421,1412,1405,1397,1391,1370,1352,1352,1343,1334,1327,1318,1311,1302,1296,1293,1292,1290,1290,1289,1289,1289,1290,1290,1291,1446,1458,1471,1480,1480,1461,1437,1420,1411,1404,1398,1390,1380,1369,1358,1342,1334,1328,1323,1315,1305,1297,1293,1293,1291,1291,1291,1291,1291,1291,1292,1292,1443,1454,1465,1474,1475,1467,1447,1420,1411,1403,1398,1393,1386,1370,1350,1340,1338,1335,1330,1323,1311,1303,1295,1293,1292,1292,1293,1293,1293,1292,1293,1294,1440,1449,1459,1468,1472,1473,1467,1425,1410,1404,1400,1395,1391,1381,1368,1355,1350,1346,1336,1326,1315,1307,1296,1293,1293,1293,1294,1294,1294,1294,1293,1295,1436,1444,1453,1463,1469,1472,1473,1449,1418,1407,1402,1396,1392,1390,1383,1369,1357,1348,1338,1329,1320,1313,1303,1295,1293,1293,1294,1294,1295,1295,1295,1295,1432,1440,1449,1459,1467,1471,1476,1469,1443,1415,1405,1399,1395,1392,1383,1368,1356,1348,1342,1336,1330,1321,1310,1298,1293,1293,1294,1294,1295,1295,1296,1297,1425,1435,1446,1455,1463,1469,1475,1477,1466,1437,1418,1405,1395,1389,1378,1371,1364,1354,1349,1342,1334,1326,1315,1304,1295,1293,1293,1294,1294,1294,1295,1298,1418,1429,1441,1450,1460,1468,1472,1475,1477,1461,1441,1418,1403,1393,1387,1381,1370,1361,1355,1347,1339,1333,1326,1316,1304,1294,1293,1293,1293,1293,1295,1299,1415,1424,1437,1446,1456,1467,1469,1470,1474,1478,1468,1454,1430,1405,1393,1387,1375,1368,1362,1354,1347,1342,1336,1328,1318,1305,1295,1293,1293,1294,1298,1303,1413,1421,1433,1442,1449,1460,1464,1461,1457,1465,1480,1479,1465,1437,1404,1391,1382,1376,1368,1360,1355,1350,1345,1339,1331,1320,1307,1297,1294,1296,1299,1304,1412,1419,1429,1437,1441,1450,1453,1449,1443,1446,1458,1471,1481,1470,1440,1407,1397,1384,1375,1366,1361,1357,1352,1346,1339,1329,1319,1307,1299,1298,1300,1302,1410,1414,1417,1425,1433,1440,1440,1438,1435,1434,1423,1434,1464,1486,1469,1437,1414,1389,1380,1371,1367,1362,1357,1351,1343,1334,1325,1312,1302,1300,1301,1302];
		var bingTArr = [37,47,55,61,62,62,60,60,60,61,62,62,61,54,54,55,56,57,57,56,56,55,54,53,51,48,47,46,45,44,41,39,33,44,53,58,61,60,59,58,59,60,61,61,61,55,54,54,54,55,56,55,55,54,52,51,49,47,46,45,43,41,39,37,33,44,52,56,58,58,56,56,57,59,60,60,60,56,54,53,54,54,54,54,53,51,50,48,47,47,45,43,42,40,38,36,30,41,50,55,56,56,56,56,57,59,60,59,58,56,55,54,53,53,53,52,51,49,48,46,46,45,44,43,41,39,36,35,27,38,48,54,56,56,56,56,56,58,59,58,57,56,56,55,54,53,51,50,48,47,46,45,44,44,43,42,40,38,35,33,29,40,49,56,60,57,56,56,57,58,58,57,57,56,56,55,54,53,50,48,47,46,45,44,44,43,42,41,40,38,34,31,29,41,51,57,62,59,56,57,58,58,58,57,57,57,56,55,55,53,49,47,46,45,44,43,42,41,40,40,38,35,31,28,28,40,50,57,62,60,57,59,59,59,58,57,57,56,56,55,54,52,48,46,45,44,43,42,41,40,39,38,36,33,30,25,25,37,47,54,61,61,60,60,59,59,57,57,56,55,55,54,53,51,49,47,45,44,42,41,40,39,38,36,34,32,28,20,21,30,41,52,60,62,61,60,59,59,57,56,55,54,54,53,51,49,48,46,44,43,41,40,39,37,36,35,33,31,26,16,21,27,39,51,59,62,62,60,59,58,57,55,55,53,52,51,50,48,46,45,43,42,40,39,37,36,34,33,31,28,23,14,21,28,37,47,55,61,62,60,59,57,56,55,54,52,50,49,48,47,45,44,43,41,39,38,36,33,32,30,29,26,21,12,20,27,34,45,54,58,58,59,58,57,55,54,52,49,47,47,47,46,45,44,42,40,38,37,35,32,29,28,26,24,18,8,17,24,32,42,51,55,55,56,57,56,55,53,50,47,45,45,45,45,44,43,41,40,39,39,38,33,28,25,23,21,16,8,13,22,31,41,48,50,52,54,55,56,56,55,51,47,44,43,44,43,42,41,40,40,39,38,35,31,26,22,20,17,11,7,8,21,32,41,45,46,49,51,53,54,54,51,46,44,40,40,42,41,40,39,36,34,33,31,29,27,24,20,16,11,8,6,6,16,30,39,42,44,45,48,49,48,46,45,43,39,36,39,40,37,33,30,28,27,27,26,24,21,18,14,9,7,6,4,5,13,28,37,40,41,41,41,42,41,40,39,38,32,27,27,26,23,21,19,17,16,15,13,11,9,8,7,6,4,3,2,5,13,29,35,38,38,36,35,35,35,35,34,27,18,12,9,8,7,7,7,6,6,6,5,5,4,4,3,3,2,1,1,4,14,29,33,34,32,31,29,26,22,19,14,9,7,6,5,4,3,3,2,2,2,2,2,1,1,1,1,1,0,0,0,4,14,28,30,31,29,26,21,15,9,7,6,4,3,2,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,14,27,27,28,27,22,14,8,5,3,2,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,13,23,24,26,25,16,8,4,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,12,20,22,25,23,11,6,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,11,18,20,23,18,9,5,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,8,12,12,12,10,7,4,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,7,7,7,6,5,3,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,5,6,5,5,3,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,3,4,4,3,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,2,2,2,2,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
		
		var tArr = [];
		var cells = 32;
		for (var t1 = cells; t1 > 0; t1--) {
			var tBase = ((t1 - 1) * cells);
			for (var t2 = 0; t2 < cells; t2++) {
				var inx =  tBase + t2; 
				tArr.push(bingTArr[inx]);
			}
		}		
		
		var vertices = geometry.attributes.position.array;
		var i = 0, lng = vertices.length;
		var tInx = 0;
		for ( i = 0; i < lng; i += 3 ) {
			var h = tArr[tInx];
			vertices[ i + 2 ] = h;
			tInx++;
		}		
		
		var material = new THREE.MeshLambertMaterial({ shading: THREE.SmoothShading });
		THREE.ImageUtils.crossOrigin = "";
		var grTx = THREE.ImageUtils.loadTexture( "http://maps.googleapis.com/maps/api/staticmap?scale=2&format=jpg-baseline&maptype=satellite&key=AIzaSyDZubUD2PGl9Qz_KMI94In9AQf8H7BTvuA&center=37.80825872812958%2c-122.47460577518036&zoom=17&size=636x639&.jpg" );
		//var grTx = THREE.ImageUtils.loadTexture( "http://maps.googleapis.com/maps/api/staticmap?scale=2&format=jpg-baseline&maptype=satellite&key=AIzaSyAk6N0fOjsoi-vgr2uHfNrWstewZyt4osM&center=38.463149218042645%2c-109.7513599185295&zoom=17&size=637x639" );
		//grTx.wrapS = grTx.wrapT = THREE.RepeatWrapping; 
		//var grTxRep = size / 2;
		//grTx.repeat.set( grTxRep, grTxRep );
		//grTx.flipY = false;
		material.map = grTx;
		
		var terrTile = new THREE.Mesh( geometry, material);
		terrTile.receiveShadow = true;
		terrTile.rotation.x = -Math.PI / 2;
		
		iScene.add( terrTile );
		
		var inx1 = segm / 2 - 1;
		var inx2 = inx1 + 1;
		
		var e1 = tArr[segm * inx1 + inx1];
		var e2 = tArr[segm * inx1 + inx2];
		var e3 = tArr[segm * inx2 + inx1];
		var e4 = tArr[segm * inx2 + inx2];
		
		var h = (e1 + e2 + e3 + e4) / 4;
		if (iCamera) {			
			iCamera.position.y += h;
		}
		if (iPlayerObj) {
			iPlayerObj.position.y += h;
		}
		
		/*
		addEdgeFence({
			size: size
		});
		*/
	};
	/*
	function addEdgeFence (aOpt) {
		var hgt = 20;		
		var txSRep = (aOpt.size / 512) * 10, txTRep = 0.95;
		var eGeo = new THREE.PlaneBufferGeometry(aOpt.size, hgt);
		
		var trTexture = THREE.ImageUtils.loadTexture( 'media/img/trees1.png' );
		trTexture.wrapS = trTexture.wrapT = THREE.RepeatWrapping; 
		trTexture.repeat.set( txSRep, txTRep );
		var eMat = new THREE.MeshPhongMaterial( { map: trTexture, transparent: true } );
		
		var halfSize = aOpt.size / 2;
		var e1 = new THREE.Mesh(eGeo, eMat);
		e1.position.x = halfSize;
		e1.position.y = hgt / 2;
		e1.rotation.y = -Math.PI / 2;
		iScene.add( e1 );
		
		var e2 = new THREE.Mesh(eGeo, eMat);
		e2.position.z = halfSize;
		e2.position.y = hgt / 2;
		e2.rotation.y = -Math.PI;
		iScene.add( e2 );
		
		var e3 = new THREE.Mesh(eGeo, eMat);
		e3.position.x = -halfSize;
		e3.position.y = hgt / 2;
		e3.rotation.y = Math.PI / 2;
		iScene.add( e3 );
		
		var e4 = new THREE.Mesh(eGeo, eMat);
		e4.position.z = -halfSize;
		e4.position.y = hgt / 2;
		iScene.add( e4 );		
	}
	*/
	function init (aOpt) {
		initOptions(aOpt);
	}	
	
	init(aOpt);
}