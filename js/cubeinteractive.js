class CubeInteractive{
  constructor(cube, camera, element){
    this.cube = cube;
    this.camera = camera;
    this.element = element;
  	this.isInDragRotation = false;
  	this.raycaster = new THREE.Raycaster();
  	this.mouse = new THREE.Vector2();
  	this.rotateFaces = [];
  	[R, L, U, D, F, B].forEach(x=>this.rotateFaces[x.getOp()] = x);
  	this.rotateFacePlanes = [];
  	Object.keys(this.rotateFaces).forEach(x=>{
  			this.rotateFacePlanes[x]=(cube.isFolded)?this.rotateFaces[x].plane(300): U.plane(300);
  		}
  	);
  	this.rotateFaceName = null;
  	this.controls = new THREE.OrbitControls(this.camera, this.element);
  	this.controls.enableDamping = true;
  	this.controls.dampingFactor = 0.25;
  	this.controls.enableZoom = false;
    this.initAngle = 0;
    this.lastAngle = 0;
    this.intersect = null;
    this.transformers = null;
    this.op = null;
  }

	onMouseUp(event){
		if (this.isInDragRotation && this.rotateFaceName != null){
			//rotating remaining part
      if (this.lastAngle * this.initAngle < 0){
          //cancel op
          let transformers = this.transformers;
          transformers.forEach(x=>x.setDelta(this.getDelta(-this.initAngle)));
          //this.transformers.forEach(x=>x.transform(delta, delta));
          this.cube.withAnimation(
      			function(args, total, delta){
      				transformers.forEach(x=>x.transform(total, delta));
      			},
            {cube:this.cube}
      		);
          //console.log("revert: ", this.initAngle);
      }else{
          let initDelta = this.getDelta(this.initAngle);
          this.transformers.forEach(x=>x.setDelta(1.0-initDelta));
          this.cube.transform(this.transformers, this.op);
          //console.log("rotate: ", this.op, this.initAngle);
      }
		}
		this.isInDragRotation = false;
    this.rotateFaceName = null;
    this.controls.enableRotate = true;
    this.transformers = null;
	}

  getSmallAngle(angle){
    if (angle > Math.PI) angle = Math.PI * 2 - angle;
    if (angle < -Math.PI) angle = Math.PI * 2 + angle;
    return angle;
  }

	onMouseMove(event){
		if (this.isInDragRotation){
			this.setMousePosition(this.mouse, event);
			this.raycaster.setFromCamera(this.mouse, this.camera);
			if (this.rotateFaceName === null){
        //determine face to rotate
				let maxAngle = -1;
				Object.keys(this.intersects).forEach(faceName=>{
					let intersect = this.raycaster.ray.intersectPlane(this.rotateFacePlanes[faceName]);
					//console.log("setting ", faceName, intersect, this.rotateFacePlanes[faceName], event);
					let face = this.rotateFaces[faceName];
          let angle = this.getSmallAngle(face.getVector2(intersect).angle() - face.getVector2(this.intersects[faceName]).angle());
					angle = Math.abs(angle);
					if (angle>maxAngle){
						maxAngle = angle;
						this.rotateFaceName = faceName;
					}
				});
				this.intersect = this.intersects[this.rotateFaceName];
				//console.log("determined: ", this.rotateFaceName, maxAngle);
			}else{
        //determined face,
				let intersect = this.raycaster.ray.intersectPlane(this.rotateFacePlanes[this.rotateFaceName]);
				//do rotate angle
				let rotateFace = this.rotateFaces[this.rotateFaceName];
				let angle = rotateFace.getVector2(intersect).angle() - rotateFace.getVector2(this.intersect).angle()
        angle = this.getSmallAngle(angle);
        if (Math.abs(this.initAngle + angle) > Math.PI/2) return;
        if(this.transformers == null || this.initAngle * (this.initAngle+angle) < 0){
          if(this.transformers != null){
            let delta = this.getDelta(-this.initAngle);
            this.transformers.forEach(x=>x.transform(delta, delta));
            this.transformers.forEach(x=>x.reset());
            this.initAngle += -this.initAngle;
            angle += this.initAngle;
          }
          this.op = rotateFace.getOp();
  				if (angle > 0) this.op += "'";
          this.transformers = this.cube.getTransformers(this.op, 0); //reset transformers
          //console.log("reset transformers: ", this.op);
        }
        //console.log("rotating face: ", this.rotateFaceName, angle, op);
        let delta = this.getDelta(angle);
        this.transformers.forEach(x=>x.transform(delta, delta));
				this.intersect = intersect;
        this.initAngle += angle;
        this.lastAngle = angle;
        //console.log("initAngle: ", this.initAngle);
			}
		}
	}

  getDelta(angle){
    return this.op.length == 1 ? -angle * 2/Math.PI : angle * 2/Math.PI;
  }

	setMousePosition(mouse, event){
    let p = elementPosition(this.element);
		let x = event.pageX - p.x;
		let y = event.pageY - p.y;
		mouse.x = (x / this.element.offsetWidth) * 2 - 1;
		mouse.y = -(y / this.element.offsetHeight) * 2 + 1;
	}

	onMouseDown(event){
		//console.log("down: ", event);
		// if (this.cube.isActive() || !this.cube.isFolded) return;
    if (this.cube.isActive()) return;
    if(this.isInDragRotation){
      this.onMouseUp(event);
      return;
    }
		let mouse = new THREE.Vector2();
		this.setMousePosition(mouse, event);
		let raycaster = new THREE.Raycaster();
		raycaster.setFromCamera(mouse, this.camera);
		let intersects = raycaster.intersectObjects(this.cube.scene.children);
		if (intersects.length > 0){
			this.isInDragRotation = true;
      let intersect = intersects[0];
			let facetName = intersect.object.facet.name;
			let cubieName = intersect.object.facet.cubie.name;
			let cubicleName = this.cube.cubeState.cubieToLocMap[cubieName];
			let faceletName = this.cube.cubeState.locToCubieMap[cubicleName].facetToLocMap[facetName];
			let rotateFaceNames = this.cube.isFolded? cubicleName.split('').filter(x=>x!=faceletName) : [faceletName];
			this.intersects = [];
			rotateFaceNames.forEach(x=>this.intersects[x] = raycaster.ray.intersectPlane(this.rotateFacePlanes[x]));
		//console.log("selected: ", faceletName, cubicleName, this.intersects, event);
			this.rotateFaceName = null;
      this.initAngle = 0;
		}else{
			this.isInDragRotation = false;
		}
		this.controls.enableRotate = !this.isInDragRotation;
	}

	onTouchStart(event){
		this.onMouseDown(event.touches[0]);
	}

	onTouchMove(event){
		this.onMouseMove(event.touches[0]);
	}

	onTouchEnd(event){
		this.onMouseUp(event.touches[0]);
	}
}
