/**
 ** @author Ligang Wang, http://github.com/ligangwang/
 **/
class Facet{
	constructor(name, color, cubie, axis, position, faceletName){
		this.name = name;
		this.faceletName = faceletName;
		this.color = color;
		this.cubie = cubie;
		this.axis = axis;
		this.position = position.clone();
		this.createGeometry();
		this.createMeshes();
		this.setFacetToMeshes();
		this.cloneGeometryInSplit = null;
		this.splitMesh1 = null;
		this.splitGeometry1 = null;
		this.splitMesh2 = null;
		this.splitGeometry2 = null;
		this.m = new THREE.Matrix4();
  }

	setFacetToMeshes(){
		this.meshes.forEach(x=>x.facet = this);
	}

	createGeometry(){
			this.createFacetGeometry();
	}

	createMeshes (){
			this.createFacetMeshes();
	}

	setGeometry(geometry){
		let oldGeometry = this.geometry;
		this.geometry = geometry;
		this.meshes.forEach(x=>{
			x.geometry = geometry;
		});
		oldGeometry.dispose();
		this.geometry.verticesNeedUpdate = true;
	}

	createFacetGeometry(){
		let width = 200;
		let radius = 40;
		let position = this.position;
		let shape = new THREE.Shape();
		let height = width;
		let x = -width/2;
		let y = x;

		shape.moveTo( x, y + radius );
		shape.lineTo( x, y + height - radius );
		shape.quadraticCurveTo( x, y + height, x + radius, y + height );
		shape.lineTo( x + width - radius, y + height) ;
		shape.quadraticCurveTo( x + width, y + height, x + width, y + height - radius );
		shape.lineTo( x + width, y + radius );
		shape.quadraticCurveTo( x + width, y, x + width - radius, y );
		shape.lineTo( x + radius, y );
		shape.quadraticCurveTo( x, y, x, y + radius );

		this.geometry = new THREE.ShapeGeometry( shape );

		let m = new THREE.Matrix4();
		if (this.faceletName == "L" || this.faceletName == "R") {
			//mesh.rotation.set(0, Math.PI/2, 0);
			m.makeRotationAxis(new THREE.Vector3(0,1,0), Math.PI/2);
			this.applyMatrix(m);
		}
		else if (this.faceletName == "U" || this.faceletName == "D"){
			//mesh.rotation.set(Math.PI/2, 0, 0);
			m.makeRotationAxis(new THREE.Vector3(1,0,0), Math.PI/2);
			this.applyMatrix(m);
		}
		m.makeTranslation(position.x, position.y, position.z);
		this.applyMatrix(m);
	}

	createFacetMeshes(){
		this.meshes = [new THREE.Mesh( this.geometry, new THREE.MeshBasicMaterial({opacity: 1, color: this.color, side: THREE.DoubleSide }))];
	}

	updateSplitGeometries(scene, splitGeometry1, splitGeometry2){
		if (this.splitMesh1 === null){
			this.splitGeometry1 = splitGeometry1;
			this.splitMesh1 = new THREE.Mesh( splitGeometry1, new THREE.MeshBasicMaterial({opacity: 1, color: this.color, side: THREE.DoubleSide }));
			scene.add(this.splitMesh1);
			this.splitGeometry2 = splitGeometry2;
			this.splitMesh2 = new THREE.Mesh( splitGeometry2, new THREE.MeshBasicMaterial({opacity: 1, color: this.color, side: THREE.DoubleSide }));
			scene.add(this.splitMesh2);
			this.removeContentsFromScene(scene);
		}
		this.splitMesh1.geometry = splitGeometry1;
		this.splitMesh2.geometry = splitGeometry2;
	}

	removeSplitGeometries(scene){
		if (this.splitMesh1 !== null){
			scene.remove(this.splitMesh1);
			scene.remove(this.splitMesh2);
			this.addContentsToScene(scene);
			this.splitMesh1 = null;
			this.splitMesh2 = null;
			this.splitGeometry1.dispose();
			this.splitGeometry2.dispose();
			this.splitGeometry1 = null;
			this.splitGeometry2 = null;
		}
	}

	setOpacity(opacity){
		//console.log("set opacity: ", opacity);
		this.meshes.forEach(m=>m.material.opacity = opacity);
	}

	setPosition(position){
		this.m.makeTranslation(position.x, position.y, position.z);
		this.applyMatrix(this.m);
		this.position.add(position);
	}

	applyMatrix(matrix){
		this.geometry.applyMatrix(matrix);
		this.geometry.computeFaceNormals();
		this.geometry.computeVertexNormals();
	}

	clone(){
		let facet = new Facet(this.name, this.color, this.cubie, this.axis, this.position);
		facet.geometry = this.geometry.clone();
		facet.createMeshes();
		facet.setFacetToMeshes()
		return facet;
	}

	addContentsToScene(scene){
		this.meshes.forEach(x=>scene.add(x));
	}

	removeContentsFromScene(scene){
		this.meshes.forEach(x=>scene.remove(x));
	}
}

class Cubie{
	constructor(name){
		this.name = name;
	}

	setCubieState(cubieState, cubeConfig){
		let facets = [];
		cubieState.name.split('').forEach(facetName=>
			{
				let faceletName = cubieState.facetToLocMap[facetName];
				console.log("setting facet: ", facetName, faceletName, cubieState.name);
				let facet = new Facet(facetName, cubeConfig.facetConfigs[facetName].color, this,
					 cubeConfig.rotationOnFoldedConfigs[faceletName].axis, cubeConfig.faceletConfigs[faceletName].position, faceletName);
				facets[facetName] = facet;
			}
		);
		this.facets = facets;
		this.setPosition(cubeConfig.cubiclePositions[cubieState.cubicle]);
	}

	setPosition(position){
		this.position = position;
		Object.keys(this.facets).map(x=>this.facets[x]).forEach(facet=>facet.setPosition(position));
	}

	setOpacity(opacity){
		Object.keys(this.facets).map(x=>this.facets[x]).forEach(facet=>facet.setOpacity(opacity));
	}

	applyMatrix(matrix){
		Object.keys(this.facets).map(x=>this.facets[x]).forEach(facet=>facet.applyMatrix(matrix));
	}

	addContentsToScene(scene){
		Object.keys(this.facets).forEach(x=>this.facets[x].addContentsToScene(scene));
	}

	removeContentsFromScene(scene){
		Object.keys(this.facets).forEach(x=>this.facets[x].removeContentsFromScene(scene));
	}
}

class RubiksCube{
	constructor(state, scene){
		this.isFolded = true;
		this.scene = scene;
		this.cubeConfig = new CubeConfig();
		this.position = new THREE.Vector3(0,0,0);
		this.cubies = [];

		this.setState(state);
		this.isInAnimation = false;
		this.commands = "";
		this.enableAnimation = true;
		this.setIsInSolverMode(false);
		this.timePerAnimationMove = 5000/20; //in ms

	}

	setState(state){
		if(this.isActive()) return;
		let is2D = !this.isFolded;
		let enableAnimation = this.enableAnimation;
		this.enableAnimation = false;
		if(is2D){
			console.log("closing first.");
			this.fold();
		}
		//this.removeContentsFromScene();
		let cubeState = new CubeState(state);
		Object.keys(this.cubeConfig.cubiclePositions)
			.forEach(x=>this.setCubieState(cubeState.locToCubieMap[x], this.cubeConfig));
		this.cubeState = cubeState;
		this.addContentsToScene();
		if(is2D){
			console.log("reopening.");
			this.fold();
		}
		this.enableAnimation = enableAnimation;
	}

	setCubieState(cubieState){
		this.removeCubie(cubieState.name);
		this.cubies[cubieState.name] = new Cubie(cubieState.name);
		this.cubies[cubieState.name].setCubieState(cubieState, this.cubeConfig);
	}

	addContentsToScene(){
		Object.keys(this.cubies).forEach(x=>this.cubies[x].addContentsToScene(this.scene));
	}

	removeContentsFromScene(){
		Object.keys(this.cubies).forEach(x=>this.cubies[x].removeContentsFromScene(this.scene));
	}

	removeCubie(cubieName){
		if (cubieName in this.cubies){
			this.cubies[cubieName].removeContentsFromScene(this.scene);
			delete this.cubies[cubieName];
		}
	}

	setOpacity(opacity){
		Object.keys(this.cubies).map(x=>this.cubies[x]).forEach(x=>x.setOpacity(opacity));
	}

	setIsInSolverMode(enabled){
		this.isInSolverMode = enabled;
	}

	test(){
		//console.log(this.getState());

		//console.log(this.cubies["DFR"].facets["F"].geometry.vertices.map(x=>x.z).reduce((a,b)=>a>b?a:b, -10000));
		let cubie = this.cubies["DFL"].facets["L"];
		// if (debug_count % 2 == 0)
		// 	cubie.removeContentsFromScene(this.scene);
		// else
		// 	cubie.addContentsToScene(this.scene);
		//debug_count += 1;
		//cubie.geometry.computeFaceNormals();
		//cubie.geometry.computeVertexNormals();
		//R, L
		//geometry = sliceGeometry(cubie.geometry, new THREE.Plane(new THREE.Vector3(0,0,-1), 800)); //OUT
		//geometry = sliceGeometry(cubie.geometry, new THREE.Plane(new THREE.Vector3(0,0,1), -800)); //IN

		//geometry = sliceGeometry(cubie.geometry, new THREE.Plane(new THREE.Vector3(0,0,1), 1400)); //OUT
		//geometry = sliceGeometry(cubie.geometry, new THREE.Plane(new THREE.Vector3(0,0,-1), -1400)); //IN

		//F
		//geometry = sliceGeometry(cubie.geometry, new THREE.Plane(new THREE.Vector3(-1,0,0), 800)); //OUT
		//geometry = sliceGeometry(cubie.geometry, new THREE.Plane(new THREE.Vector3(1,0,0), -800)); //IN

		//F
		//geometry = sliceGeometry(cubie.geometry, new THREE.Plane(new THREE.Vector3(1,0,0), 800)); //OUT
		//geometry = sliceGeometry(cubie.geometry, new THREE.Plane(new THREE.Vector3(-1,0,0), -800)); //IN

		/*
		geometry.vertices.forEach((v, i)=>
			{
				if(v.z < 800)
					console.log("not equal vertice: ", v);
			}
		)*/
		/*
		geometry.vertices.forEach(v=>{
				v.y -= 200;
			});

		mesh = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial({color: 0xff0000, side: THREE.DoubleSide}));
		this.scene.add(mesh);
		*/
	}

	getFacetFromLocationFace(loc, locFaceName){
		let cubieState = this.cubeState.locToCubieMap[loc]
		return this.cubies[cubieState.name].facets[cubieState.locToFacetMap[locFaceName]];
	}

	getTransformers(op, initAngle = 0){
		let opFaceName = op.slice(0, 1);
		let rotateCubies = this.getCubies(opFaceName);
		let transformers = [];
		let initRatio = Math.abs(initAngle)*2/Math.PI;
		if (this.isFolded){
			let rotateAxis = this.cubeConfig.rotationOnFoldedConfigs[op].axis;
			let rotateAngle = this.cubeConfig.rotationOnFoldedConfigs[op].angle;
			rotateAngle -= initAngle;
			transformers.push(new Rotater(rotateCubies, this.cubeConfig.origin, rotateAxis, rotateAngle));
		}else{//rotating on unfolded state
			for(let rotateConfig of this.cubeConfig.rotationOnUnfoldedConfigs[op]){
				if (rotateConfig.transformType == "translater"){
					let facets = this.getFacetsFromCubies(rotateCubies, rotateConfig.facets);
					//console.log("translator: ",op, rotateConfig.translation);
					let translation = rotateConfig.translation.clone();
					translation.sub(rotateConfig.translation.clone().multiplyScalar(initRatio));
					//console.log("initAngle: ", initAngle, initRatio, translation.z, rotateConfig.translation.clone().z, rotateConfig.translation.clone().multiplyScalar(initRatio).z);
					transformers.push(new Translater(facets, translation));
					//console.log("translator post: ", translation)
				}else if (rotateConfig.transformType == "rotater"){
					let facets = this.getFacetsFromCubies(rotateCubies, rotateConfig.facets);
					let rotateAngle = rotateConfig.angle;
					rotateAngle -= rotateConfig.angle * initRatio;
					transformers.push(new Rotater(facets, rotateConfig.origin, this.cubeConfig.axisY, rotateAngle));
				}else if (rotateConfig.transformType == "teleporter"){
					let distance = rotateConfig.distance;
					distance -= rotateConfig.distance * initRatio;
					transformers.push(new Teleporter(this.scene, this.getFacetFromLocationFace(rotateConfig.cubicle, rotateConfig.facet),
					distance,  rotateConfig.outBound, rotateConfig.inBound, rotateConfig.axis, rotateConfig.outDirection, rotateConfig.inDirection));
				}
			}
		}
		return transformers;
	}

	rotate(op, initAngle = 0){
		if (this.isInAnimation){
			console.log("the cube is rotating. quiting ".concat(op))
			return;
		}
		let transformers = this.getTransformers(op, initAngle);
		this.transform(transformers, op);
	}

	transform(transformers, op){
		let cube = this;
		this.withAnimation(
			function(args, total, delta){
				transformers.forEach(x=>x.transform(total, delta));
			},
			{cube:this},
			function(args){
				cube.cubeState.rotate(op);
				if (cube.cubeState.isSolved() && cube.isInSolverMode){
					cube.setIsInSolverMode(false);
				}
			}
		);
	}

	withAnimation(action, args = {}, onComplete = null){
		if (this.enableAnimation){
			this.isInAnimation = true;
			let tween = new TWEEN.Tween({value:0.0}).to({value: 1.0}, this.timePerAnimationMove);
			let lastData = 0.0;
			tween.onUpdate(function(){
				let delta = this.value - lastData;
				lastData = this.value;
				action(args, this.value, delta);
			});
			tween.onComplete(function(){
				args.cube.isInAnimation = false;
				if (onComplete!= null)
					onComplete(args);
				args.cube.doNextCommand();
			});
			tween.start();
		}else{
			action(args, 1, 1);
			if (onComplete != null)
				onComplete(args);
			args.cube.doNextCommand();
		}
	}

	isActive(){
		return this.isInAnimation || this.isInSolverMode;
	}

	getCubies(locFaceName){
		return this.cubeState.getCubieStates(locFaceName).map(cs=>this.cubies[cs.name]);
	}

	getFacets(locFaceName){
		return this.cubeState.getCubieStates(locFaceName).map(cs=>this.cubies[cs.name].facets[cs.locToFacetMap[locFaceName]]);
	}

	getFacetsByLocFace(cubies, locFaceName){
		return cubies.map(x=>this.cubeState.cubieToLocMap[x.name])
			.filter(loc=>loc.indexOf(locFaceName) >= 0)
			.map(loc=>this.cubeState.locToCubieMap[loc])
			.map(cs=>this.cubies[cs.name].facets[cs.locToFacetMap[locFaceName]]);
	}

	getFacetsFromCubies(cubies, locFaceNames){
		return [].concat.apply([], locFaceNames.split('').map(locFace=>this.getFacetsByLocFace(cubies, locFace)));
	}

	doFold(doUnfolding, delta){
		for (let facetName in this.cubeConfig.facetFoldingConfig){
			let facets = this.getFacets(facetName);
			let foldingConfigs = this.cubeConfig.facetFoldingConfig[facetName];
			let m = null;
			for (let foldingConfig of foldingConfigs){
				let translate = foldingConfig.translation;
				if (m != null){
					translate.applyMatrix4(m);
				}
				let rotateAxis = foldingConfig.axis;
				let rotateAngle = foldingConfig.angle * delta;
				m = Transform(translate, rotateAxis, doUnfolding? rotateAngle:-rotateAngle);
				for (let facet of facets){
					facet.applyMatrix(m);
					facet.position.applyMatrix4(m);
				}
			}
		}
	}

	fold(){
		this.withAnimation(
			function(args, total, delta){
				args.cube.doFold(args.cube.isFolded, delta);
			},
			{cube:this},
			function(args){
				args.cube.isFolded  = !args.cube.isFolded;
				/*
				for (let facetName in args.cube.cubeConfig.facetFoldingConfig){
					let facets = args.cube.getFacets(facetName);
					facets.forEach(facet=>{
						facet.position.x = Math.round(facet.position.x);
						facet.position.y = Math.round(facet.position.y);
						facet.position.z = Math.round(facet.position.z);
					});
				}*/
			});
	}

	isValidInputChar(prevChar, char){
		prevChar = prevChar.toUpperCase();
		char = char.toUpperCase();
		if ("OST".indexOf(char) > -1){
			return true;
		}
		return (char in this.cubeConfig.rotationOnFoldedConfigs) || ("OST'".indexOf(prevChar) < 0 && char == "'");
	}

	command(command){
		this.commands = this.commands.concat(command);
		if (!this.isInAnimation){
			this.doNextCommand();
		}
	}


	doNextCommand(){
		let op = this.getNextOp();
		if (op != ""){
			if (op == "S"){
				this.randomize();
			}
			else if(op == "O"){
				this.fold();
			}
			else if(op == "T"){
				this.test();
			}
			else{this.rotate(op);}
		}
	}

	getNextOp(){
		let len = this.commands.length;
		let lookAt = 0;
		if (len > 1){
			if (this.commands[1] == "'"){
				lookAt = 2;
			}else{
				lookAt = 1;
			}
		}else if(len == 1){
			lookAt = 1;
		}
		let op = this.commands.slice(0, lookAt);
		this.commands = this.commands.slice(lookAt);
		return op;
	}

	randomize(){
		let saved = this.enableAnimation;
		this.enableAnimation = false;
		getRandomOps().forEach(x=>this.rotate(x));
		this.enableAnimation = saved;
	}

	getCubeState(){
		return this.cubeState.clone();
	}

	getState(){
		return this.cubeState.getState();
	}
}
