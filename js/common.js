/**
 ** @author Ligang Wang, http://github.com/ligangwang/
 **/
 
function sort(s) {
	return s.split("").sort().join("");
}

var AxisX = {
	get: function (obj) {
		return obj.x;
	},
	
	getVector3 : function(value){
		return new THREE.Vector3(value, 0, 0);
	},

	set: function(obj, v){
		obj.x = v;
	},
	add: function(obj, v){
		obj.x += v;
	},
	
	makeTranslation: function(m, v){
		m.makeTranslation(v, 0, 0);
	},
	
	adjust : function(obj, v){
		obj.x += v;	
	},
};

var AxisY = {
	get: function (obj) {
		return obj.y;
	},

	getVector3 : function(value){
		return new THREE.Vector3(0, value, 0);
	},
	
	set: function(obj, v){
		obj.y = v;
	},

	add: function(obj, v){
		obj.y += v;
	},
	   
	makeTranslation: function(m, v){
		m.makeTranslation(0, v, 0);
	},
	  
	adjust : function(obj, v){
		obj.y += v;	
	},
};

var AxisZ = {
	get: function (obj) {
		return obj.z;
	},
	
	getVector3 : function(value){
		return new THREE.Vector3(0, 0, value);
	},

	set: function(obj, v){
		obj.z = v;
	},

	add: function(obj, v){
		obj.z += v;
	},
	
	makeTranslation: function(m, v){
		m.makeTranslation(0, 0, v);
	},
	  
	adjust : function(obj, v){
		obj.z += v;	
	},
};

var F = {
	getVector2 : function(obj){
		return new THREE.Vector2(obj.x, obj.y);
	},

	plane : function(d){
		return new THREE.Plane(new THREE.Vector3(0,0,-1), d);
	},
	
	getOp : function(){
		return "F";
	}
};

var B = {
	getVector2 : function(obj){
		return new THREE.Vector2(obj.y, obj.x);
	},

	plane : function(d){
		return new THREE.Plane(new THREE.Vector3(0,0,1), d);
	},
	
	getOp : function(){
		return "B";
	}
};

var U = {
	getVector2 : function(obj){
		return new THREE.Vector2(obj.z, obj.x);
	},

	plane : function(d){
		return new THREE.Plane(new THREE.Vector3(0, -1, 0), d);
	},
	
	getOp : function(){
		return "U";
	}
};

var D = {
	getVector2 : function(obj){
		return new THREE.Vector2(obj.x, obj.z);
	},

	plane : function(d){
		return new THREE.Plane(new THREE.Vector3(0, 1, 0), d);
	},
	
	getOp : function(){
		return "D";
	}
};

var R = {
	getVector2 : function(obj){
		return new THREE.Vector2(obj.y, obj.z);
	},

	plane : function(d){
		return new THREE.Plane(new THREE.Vector3(-1, 0, 0), d);
	},
	
	getOp : function(){
		return "R";
	}
};

var L = {
	getVector2 : function(obj){
		return new THREE.Vector2(obj.z, obj.y);
	},

	plane : function(d){
		return new THREE.Plane(new THREE.Vector3(1, 0, 0), d);
	},
	
	getOp : function(){
		return "L";
	}
};

var Transform = function(){
	var translation = new THREE.Matrix4();
	var rotation = new THREE.Matrix4();
	var inverseTranslation = new THREE.Matrix4();
	return function(translate, axis, angle){
		translation.makeTranslation(-translate.x, -translate.y, -translate.z);
		inverseTranslation.makeTranslation(translate.x, translate.y, translate.z);
		rotation.makeRotationAxis(axis, angle);
		var m = translation.multiplyMatrices(rotation, translation);	
		m.multiplyMatrices(inverseTranslation, m);
		return m;
	};
}()


function getRandom(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function eqSet(as, bs){
	if (as.size!=bs.size) return false;
	for(var a of as) if (!bs.has(a)) return false;
	return true;
}

function getNumericStyleProperty(style, prop){
    return parseInt(style.getPropertyValue(prop),10) ;
}

function elementPosition(e) {
    var x = 0, y = 0;
    var inner = true ;
    do {
        x += e.offsetLeft;
        y += e.offsetTop;
        var style = getComputedStyle(e,null) ;
        var borderTop = getNumericStyleProperty(style,"border-top-width") ;
        var borderLeft = getNumericStyleProperty(style,"border-left-width") ;
        y += borderTop ;
        x += borderLeft ;
        if (inner){
          var paddingTop = getNumericStyleProperty(style,"padding-top") ;
          var paddingLeft = getNumericStyleProperty(style,"padding-left") ;
          y += paddingTop ;
          x += paddingLeft ;
        }
        inner = false ;
    } while (e = e.offsetParent);
    return { x: x, y: y };
}