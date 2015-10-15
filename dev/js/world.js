var iGlobeTr = null;
		
		function start () {
			iGlobeTr = new GlobeTransforms();
			iGlobeTr.setup();
			iGlobeTr.startRotating();
		}
		
		function GlobeTransforms () {
			var PI2 = Math.PI * 2;
			var iTextureNode = null;
			//var iTOs = {rot : null};
			var iRotAttrs = {step : (PI2 / 1800/*1440*/), /*toSize : 50,*/ initRad : 0, currRad : 0};
			var iTexture = {node: null, urls: ["political_marked_water_2.png", "earth.jpg"]};
			
			this.setup = function () {
				iTrNode = document.getElementById("world__globe_transform");
				iTexture.node = document.getElementById("world__globe_texture");
			};
			
			this.startRotating = function () {
				startRotating();
			};
			
			function startRotating () {
				rotate(iRotAttrs.currRad);
			}
			/*
			this.stopRotating = function () {
				stopRotating();
			};
			
			function stopRotating () {
				clearTimeout(iTOs.rot);
			}
			*/
			function rotate (/*aRad*/) {
			/*
				iRotAttrs.currRad = aRad + iRotAttrs.step;
				
				iTrNode.setAttribute("rotation", "0 1 0 " + iRotAttrs.currRad);
				
				if (iRotAttrs.currRad >= PI2) {
					iRotAttrs.currRad = iRotAttrs.initRad;
				}
					
				iTOs.rot = setTimeout(function () {
					rotate(iRotAttrs.currRad);					
				}, iRotAttrs.toSize);
				*/
				requestAnimationFrame( rotate );
				
				iRotAttrs.currRad += iRotAttrs.step;
				
				iTrNode.setAttribute("rotation", "0 1 0 " + iRotAttrs.currRad);
				
				if (iRotAttrs.currRad >= PI2) {
					iRotAttrs.currRad = iRotAttrs.initRad;
				}
				
			}
			
			function changeTexture (aInx) {
				iTexture.node.setAttribute("url", '"../img/' + iTexture.urls[aInx] + '"');
			}
			
			this.mouseOverGlobe = function () {					
				changeTexture(1);
			};
			
			this.mouseOutGlobe = function () {
				changeTexture(0);
			};
		}


