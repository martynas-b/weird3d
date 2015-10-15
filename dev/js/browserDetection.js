 /* $Header: /usr/local/cvsroot/lbs/src/www/LP_3.1/js/browserDetection.js,v 1.6 2015/05/12 09:20:34 mb Exp $ */

function isLocalStorageNameSupported(){
    var testKey = 'test';
	var has = true;
	try {
		localStorage.setItem(testKey, '1');
		localStorage.removeItem(testKey);		
	}catch (error){
		has = false;
	}
	return has;
}

function browserType(){
	var type = 1;
	if (window.ActiveXObject || ("ActiveXObject" in window)){
		type = 0; //0 - IE
	}
	return type;
}

function isTouch(){
	var touch = 0;
	if (("ontouchstart"in window) || navigator.msMaxTouchPoints){
		touch = 1;
	}
	return touch;
}

function getVersion(aObj){
	var type = browserType();
	var bVer = 0;
	var userAgent = navigator.userAgent;
	if (type === 0){
		aObj.mode = 0;
		aObj.SVG = false;		
		if (userAgent.indexOf("MSIE 8") !== -1){
			bVer = 8;
		}
		else if (userAgent.indexOf("MSIE 9") !== -1){
			bVer = 9;
		}	
		else if (userAgent.indexOf("MSIE 10") !== -1){
			bVer = 10;
		}
		else if (userAgent.indexOf("rv:11") !== -1){
			bVer = 11;
		}	
		else {bVer = 7;}
		
		if (bVer > 8) {
			if ((document.compatMode === 'CSS1Compat')||(bVer > 9)){
				aObj.mode = 1;
				aObj.SVG = true;
			}
		}
	}else if (type === 1){	
		if (navigator.oscpu && document.getElementsByClassName){
			bVer = 3;
			if (userAgent.indexOf("Android") !== -1){
				bVer = 25;
			}		
		}else if (userAgent.indexOf("Safari") !== -1){
			bVer = 20;
			if ((userAgent.indexOf("Mobile") !== -1)||(userAgent.indexOf("Android") !== -1)){
				bVer = 30;
			}
		}else if (userAgent.indexOf("Opera") !== -1){
			bVer = 2;
			if (userAgent.indexOf("Tablet") !== -1){
				bVer = 30;
			}
		}
	}
	return bVer;
}

function getOsName(){
	var navAppV = navigator.appVersion;
	var OSName="Unknown OS";
	if (navAppV.indexOf("Win")!==-1){
		OSName="Windows";
	}else if (navAppV.indexOf("Mac")!==-1){
		OSName="MacOS";
	}else if (navAppV.indexOf("X11")!==-1){
		OSName="UNIX";
	}else if (navAppV.indexOf("Linux")!==-1){
		OSName="Linux";
	}
	return OSName;
}	 
 
var Browser = {
	mode: 1, //1 - standart, 0 - quirks
	SVG: true,
	type: browserType(),
	storage: isLocalStorageNameSupported(),
	touch: isTouch(),
	vers: getVersion(this),
	os: getOsName()
};

