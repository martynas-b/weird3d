window.Weird3d = window.Weird3d || {};

Weird3d.VR = function (aOpt) {
	var self = this;
	var iWorld = null;
	this.vr = {on: null, effect: null};
	//this.oculus = {type: 1};
	this.cb = {
		type: 2,
		controls: null,
		//iOSSleepPreventInt: null
	};
	//var iFPControls = null;
	var clock = new THREE.Clock();
	//var oculuscontrol = null;
	
	function initOptions (aOpt) {
		if (aOpt) {
			if (aOpt.world) { 
				iWorld = aOpt.world;
			}
		}
	}
		
	function vrOn (aType) {
		self.vr.on = aType;
		
		//iWorld.vrStatusChange(true);
		/*
		var wp = window.parent;
		if (wp) {
			var frame = wp.document.getElementById("frame_PM_3d");
			if (frame) {
				wp.document.body.scrollTop = wp.document.body.scrollTop + frame.getBoundingClientRect().top;
			}
		}
		*/
	}
		
	function vrOff () {
		self.vr.on = null;
		/*
		iWorld.vrStatusChange(false);
				
		resetWorld();
		*/
	}
	
	function turnCBOnOff () {
		
		if (!self.vr.on) {
						
			self.vr.effect = new THREE.StereoEffect( iWorld.renderer );
			
			self.vr.effect.setSize( iWorld.sceneOptions.size.width, iWorld.sceneOptions.size.height );
			
			function setOrientationControls (e) {
				if (!e.alpha) {
					return;
				}
							
				self.cb.controls = new THREE.DeviceOrientationControls(iWorld.camera, true);
				self.cb.controls.connect();
				self.cb.controls.update();	
				
				window.removeEventListener('deviceorientation', setOrientationControls, true);
			}
			window.addEventListener('deviceorientation', setOrientationControls, true);
			
			/*
			if (Browser.touch) {
				self.cb.iOSSleepPreventInt = setInterval(function () {
				    window.location.href = "/new/page";
				    setTimeout(function () {
				        window.stop();
				    }, 0);
				}, 20000);
			}			
			*/
			/*
			if (Browser.touch) {
				iWorld.setAllowControls(false);
			}
			*/		
			vrOn(self.cb.type);
		}
		else {
			vrOff();
			/*
			if (Browser.touch) {
				iWorld.setAllowControls(true);
			}
			*/
			//clearInterval(self.cb.iOSSleepPreventInt);			
			
			self.cb.controls = null;
			
			self.vr.effect = null;
		}
	}
	/*
	function turnOculusOnOff () {
		var imgOc = document.getElementById(self.oculus.img.imgId);
		var imgCB = document.getElementById(self.cb.img.imgId);
		
		if (!self.vr.on) {
			imgOc.src = self.oculus.img.srcAct;
			imgCB.style.display = "none";
				
			self.vr.effect = new THREE.OculusRiftEffect( iWorld.renderer, { worldFactor: 1, HMDVers: "DK1" } );
			//effect = new THREE.VREffect( renderer );			
			self.vr.effect.setSize( iWorld.sceneOptions.size.width, iWorld.sceneOptions.size.height );
			
			if (!oculuscontrol) {
				var url = 'http://localhost:50000';
				$.ajax({
					  url: url,
					  success: function () {			  
						  oculuscontrol = new THREE.OculusControls(iWorld.cameraCtrl);
						  oculuscontrol.connect();
						
						  iFPControls = new THREE.FirstPersonControls( iWorld.cameraCtrl, iWorld.renderer.domElement );
						  iFPControls.lookSpeed = 0.00125;
						  iFPControls.lookVertical = true;
						
						  iWorld.setAllowControls(false);					  
					  },
					  error: function () {					  
						  console.log("'" + url + "' is not available.");
					  }
				});
			}
			else {
				oculuscontrol.enabled = true;
				iFPControls.enabled = true;
				
				iWorld.setAllowControls(false);
			}
			
			vrOn(self.oculus.type);			
			
			
		}
		else {
			vrOff();
			
			imgOc.src = self.oculus.img.src;
			imgCB.style.display = "inline";
			
			if (oculuscontrol) {
				oculuscontrol.enabled = false;			
				iFPControls.enabled = false;
				
				iWorld.setAllowControls(true);
			}
			
			self.vr.effect.dispose();			
			self.vr.effect = null;
			
			//fullScreenMode(false, element);
		}
	}
	*/
	/*
	function resetWorld () {
		iWorld.renderer.setSize( iWorld.sceneOptions.size.width, iWorld.sceneOptions.size.height );		

		iWorld.cameraCtrl.rotation.x = 0;
		iWorld.cameraCtrl.rotation.z = 0;		
	}
	*/
	/*
	function fullScreenMode (aParam, aElement) {
		var element = aElement;
		if (element) {
			if (aParam === true) {
				if (!element.fullscreenElement && !element.mozFullScreenElement && !element.webkitFullscreenElement && !element.msFullscreenElement ) {
					element.requestFullscreen = element.requestFullscreen || element.msRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;
					element.requestFullscreen();
				}
			}			
			//else {				
			//	if (element.fullscreenElement || element.mozFullScreenElement || element.webkitFullscreenElement || element.msFullscreenElement ) {
			//		element.exitFullscreen = element.exitFullscreen || element.msExitFullscreen || element.mozCancelFullScreen || element.webkitExitFullscreen;
			//		element.webkitExitFullscreen();
			//	}
			//}
		}		
	}
	*/
	this.update = function () {
	/*
		if (self.vr.on === self.oculus.type) {
			if (oculuscontrol) {
				var t = clock.getElapsedTime();
				
				iFPControls.update(t);
		        oculuscontrol.update(t);
			}
		}
		else*/ if (self.vr.on === self.cb.type) {
			if (self.cb.controls) {
				self.cb.controls.update(clock.getDelta());
			}
		}		
	};
	
	this.render = function () {
	/*
		if (self.vr.on === self.oculus.type) {
			self.vr.effect.render( iWorld.scene,  iWorld.cameraCtrl );
		}
		else*/ if (self.vr.on === self.cb.type) {
			self.vr.effect.render( iWorld.scene,  iWorld.camera );
		}		
		
	};
	
	this.setSize = function (aWidth, aHeight) {
		self.vr.effect.setSize( aWidth, aHeight );
	};
	
	function init (aOpt) {
		initOptions(aOpt);
		
		turnCBOnOff();
	}	
	
	init(aOpt);
};