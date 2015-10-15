window.Weird3d = window.Weird3d || {};
Weird3d.Charts = Weird3d.Charts || {};

Weird3d.Charts.Type = {
	BAR: "bar"	
};

Weird3d.Charts.MapChart = function (opt, data_set) {
	var self = this;
	this.options = null;
	var map = null;
	var data = null;
	var scene = null;
	var chart = null;

	function init (opt, data_set) {
		self.options = {
			type: Weird3d.Charts.Type.BAR
		};

		if (!Weird3d.Tools.isUndefined(opt.map)) {
			map = opt.map;
			scene = map.getScene().scene;
		}
		if (!Weird3d.Tools.isUndefined(opt.type)) { self.options.type = opt.type; }
		
		if (!Weird3d.Tools.isUndefined(data_set)) { data = data_set; }
		
		parseData();
	}
	
	function parseData () {
		if (data) {
			
			chart = {};
			chart.object = new THREE.Object3D();
			
			var set_inx = 1;
			var minMax = getMinMax(set_inx);
			var templGeo = getTemplateGeometry();
			
			var i = 0, lng = data.set.length;
			for (i = 0; i < lng; i++) {
				var unit = null;
				
				if (self.options.type === Weird3d.Charts.Type.BAR) {
					unit = getBarObject({
						unit: data.set[i],
						set_inx: set_inx,
						minMax: minMax}, templGeo);
				}
				
				if (unit !== null) {
					chart.object.add(unit);
				}
			}
			
			scene.add(chart.object);
		}
	}
	
	function getMinMax (set_inx) {
		var minMax = null;
		if (data) {
			var lng = data.set.length;
			if (lng > 0) {
				var i = 0;
				
				minMax = {};
				minMax.min = Number(data.set[0].subset[set_inx].value);
				minMax.max = minMax.min;
				
				for (i = 0; i < lng; i++) {
					var val = Number(data.set[i].subset[set_inx].value);
					if (val < minMax.min) { minMax.min = val; }
					else if (val > minMax.max) { minMax.max = val; }
				}
			}
		}
		return minMax;
	}
	
	function getTemplateGeometry () {
		var height = map.options.size_3d.x * 0.25;
		var radius = map.options.size_3d.x * 0.05;
		
		var geo = new THREE.CylinderGeometry( radius, radius, height, 32 );
		
		return {geometry: geo, height: height, radius: radius};
	}
	
	function getBarObject (data, templGeo) {
		var barObj = new THREE.Object3D();

		var bar_mat = new THREE.MeshPhongMaterial( { specular: 0xffffff, shininess: 4, shading: THREE.SmoothShading } );
		
		var col = new THREE.Color(Math.random(), Math.random(), Math.random());//getColorMix(new THREE.Color(0, 1, 0));
		bar_mat.color = col;
		bar_mat.ambient = col;
		
		var bar = new THREE.Mesh( templGeo.geometry, bar_mat );
			
		var scale = data.unit.subset[data.set_inx].value / data.minMax.max;
		bar.scale.y = scale;
		
		var yPos = ((templGeo.height * scale) / 2) + (map.options.size_3d.y / 2);
		
		var sprite = new Weird3d.Charts.TextSprite(data.unit.label + "\n" + data.unit.subset[data.set_inx].value, "black", null, 24);
		sprite.position.y = yPos;
		
		barObj.add(sprite);
		barObj.add(bar);
		
		barObj.position.y = yPos;
		
		var pos = getPosition(data.unit.coord);
		barObj.position.x = pos.x;
		barObj.position.z = pos.z;
		
		return barObj;
	}
	/*
	function getColorMix (mix) {
		var col = mix;
		
		var rr = Math.random();
		var rg = Math.random();
		var rb = Math.random();
		
		col.r = (col.r + rr) / 2;
		col.g = (col.g + rg) / 2;
		col.b = (col.b + rb) / 2;
		
		return col;
	}
	*/
	/*
	function getBar (data_unit, set_inx, minMax) {
		var bar_size = getBarSize(data_unit.subset[set_inx].value, minMax);
		
		var cyl = new THREE.CylinderGeometry( bar_size.radius, bar_size.radius, bar_size.height, 32 );
		var cyl_mat = new THREE.MeshPhongMaterial( { ambient: 0x005555, color: 0x005555, specular: 0xffffff, shininess: 4, shading: THREE.SmoothShading } );
		var bar = new THREE.Mesh( cyl, cyl_mat );
		bar.position.y = (bar_size.height / 2) + (map.options.size_3d.y / 2);
		
		var pos = getPosition(data_unit.coord);
		bar.position.x = pos.x;
		bar.position.z = pos.z;
		
		return bar;
	}
	
	function getBarSize (val, minMax) {
		var max_hgt = map.options.size_3d.x * 0.25;
		var radius = map.options.size_3d.x * 0.05;
		
		var height = (val / minMax.max) * max_hgt;
		
		return {height: height, radius: radius};
	}
	*/
	function getPosition (coord) {	
		var size_3d = map.options.size_3d;
		var vb = map.viewBox;
		var koef = vb.width / size_3d.x;
		
		var merc = Weird3d.Maps.WGS84ToMerc(coord);
		
		var x = (merc.x - vb.center.x) / koef;
		var z = ((merc.y - vb.center.y) * (-1)) / koef;
		
		var position = {
			x: x,
			z: z
		};
		return position;
	}
	
	
	init(opt, data_set);
};

Weird3d.Charts.TextCanvas = function (text, color, font, size) {
	/*
	var drawStringLines = function (ctx, text, posX, posY, textColor, rotation, font, fontSize) {
		var lines = text.split("\n");
		
		if (!rotation) rotation = 0;
		if (!font) font = "'serif'";
		if (!fontSize) fontSize = 16;
		if (!textColor) textColor = '#000000';
		
		ctx.save();
		
		ctx.font = fontSize + "px " + font;
		ctx.fillStyle = textColor;
		ctx.translate(posX, posY);
		ctx.rotate(rotation * Math.PI / 180);
		
		var i = 0;
		for (i = 0; i < lines.length; i++) {
			ctx.fillText(lines[i],0, i * fontSize);
		}
		ctx.restore();
	}
	*/
	size = size || 24;
	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');
	var fontStr = 'Bold ' + (size + 'px ') + (font || 'Arial');
	ctx.font = fontStr;
	
	var toks = text.split("\n");
	var i = 0, lines = toks.length;
	var w = 0;
	for (i = 0; i < lines; i++) {
		var tw = ctx.measureText( toks[i] ).width;
		if (tw > w) {
			w = tw;
		}
	}
	var h = Math.ceil((size * lines) + (size * 1.6));
	/*
	var w = ctx.measureText(text).width;
	var h = Math.ceil(size * 1.2);
	*/
	canvas.width = w;
	canvas.height = h;

	ctx.font = fontStr;
	ctx.fillStyle = color || 'black';
	ctx.textBaseline = "top";
	//ctx.fillText(text, 0, Math.ceil(size * 0.8));
	//drawStringLines(ctx, text, size);
	for (i = 0; i < lines; i++) {
		ctx.fillText(toks[i], 0, Math.ceil(i * size));
	}
	return canvas;
};

Weird3d.Charts.TextSprite = function (text, color, font, size) {
	
	var canvas = new Weird3d.Charts.TextCanvas(text, color, font, size);
		
	var texture = new THREE.Texture(canvas);
	texture.needsUpdate = true;
	var material = new THREE.SpriteMaterial( { map: texture, color: 0xffffff, fog: true } );
	var sprite = new THREE.Sprite( material );
	sprite.scale.set(material.map.image.width / 10, material.map.image.height / 10, 1.0);
	 
	return sprite;
};

	
	/*
	function makeTextSprite( message, parameters ) {
		if ( parameters === undefined ) parameters = {};
		
		var fontface = parameters.hasOwnProperty("fontface") ? 
			parameters["fontface"] : "Arial";
		
		var fontsize = parameters.hasOwnProperty("fontsize") ? 
			parameters["fontsize"] : 18;
		
		var borderThickness = parameters.hasOwnProperty("borderThickness") ? 
			parameters["borderThickness"] : 4;
		
		var borderColor = parameters.hasOwnProperty("borderColor") ?
			parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };
		
		var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
			parameters["backgroundColor"] : { r:255, g:255, b:255, a:1.0 };

		//var spriteAlignment = THREE.SpriteAlignment.topLeft;
			
		var canvas = document.createElement("canvas");
		var context = canvas.getContext("2d");
		context.font = "Bold " + fontsize + "px " + fontface;
	    
		// get size data (height depends only on font size)
		
		var toks = message.split("\n");
		var i = 0, lines = toks.length;
		var textWidth = 0;
		for (i = 0; i < lines; i++) {
			var tw = context.measureText( toks[i] ).width;
			if (tw > textWidth) {
				textWidth = tw;
			}
		}
		
		
		// background color
		context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","
									  + backgroundColor.b + "," + backgroundColor.a + ")";
		// border color
		context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
									  + borderColor.b + "," + borderColor.a + ")";

		context.lineWidth = borderThickness;
		roundRect(context, borderThickness/2, borderThickness/2, textWidth + borderThickness, (fontsize * lines) + (fontsize * 0.4) + borderThickness, 6);
		// 1.4 is extra height factor for text below baseline: g,j,p,q.
		
		// text color
		context.fillStyle = "rgba(0, 0, 0, 1.0)";
		context.textAlign = "left";
	    //context.textBaseline = "middle";
		//context.fillText( message, borderThickness, fontsize + borderThickness);
		drawString(context, message, borderThickness, fontsize + borderThickness, "rgba(0, 0, 0, 1.0)", 0, fontface, fontsize);
		
		
		// canvas contents will be used for a texture
		var texture = new THREE.Texture(canvas);
		texture.needsUpdate = true;

		var spriteMaterial = new THREE.SpriteMaterial( 
			{ map: texture, useScreenCoordinates: false} );
		var sprite = new THREE.Sprite( spriteMaterial );
		
		sprite.scale.set(spriteMaterial.map.image.width / 10, spriteMaterial.map.image.height / 10, 1.0);
		//sprite.scale.set(30, 15, 1.0);
		
		return sprite;	
	}
	
	function roundRect(ctx, x, y, w, h, r) {
	    ctx.beginPath();
	    ctx.moveTo(x+r, y);
	    ctx.lineTo(x+w-r, y);
	    ctx.quadraticCurveTo(x+w, y, x+w, y+r);
	    ctx.lineTo(x+w, y+h-r);
	    ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
	    ctx.lineTo(x+r, y+h);
	    ctx.quadraticCurveTo(x, y+h, x, y+h-r);
	    ctx.lineTo(x, y+r);
	    ctx.quadraticCurveTo(x, y, x+r, y);
	    ctx.closePath();
	    ctx.fill();
		ctx.stroke();   
	}
	*/