/**
 ** @author Ligang Wang, http://github.com/ligangwang/
 **/
let TeleporterModeCompression = 0;
let TeleporterModeSlice = 1;
let TeleporterOut = 0;
let TeleporterSplit = 1;
let TeleporterIn = 2;
class Teleporter{
	constructor(scene, facet, distance, outBound, inBound, axis, outDirection, inDirection){
		this.mode = TeleporterModeSlice;
		this.scene = scene;
		this.facet = facet;
		this.axis = axis;
		this.outBound = outBound;
		this.inBound  = inBound;
		this.distance = distance;
		this.length = 200;
		this.inBoundValue  = this.axis.get(this.inBound);
		this.outBoundValue = this.axis.get(this.outBound);
		//this.distance = Math.abs(this.outBoundValue - origin) + Math.abs(target - this.inBoundValue);
		//console.log(this.distance);
		this.outDirection  = outDirection;
		this.inDirection   = inDirection;
		this.cutPlaneToOut = new THREE.Plane(axis.getVector3(-outDirection), this.outBoundValue * this.outDirection);//new THREE.Plane(new THREE.Vector3(0, 0,-1), 900);
		this.cutPlaneToIn  = new THREE.Plane(axis.getVector3(outDirection), -this.outBoundValue * this.outDirection);
		this.inSidePlane   = new THREE.Plane(axis.getVector3(inDirection), this.inBoundValue);//new THREE.Plane(new THREE.Vector3(0, 0, 1), 1500);

		this.teleport = new THREE.Matrix4();
		let bound = this.inBound.clone();
		bound.sub(this.outBound);
		this.teleport.makeTranslation(bound.x, bound.y, bound.z);
		this.teleportReverse = new THREE.Matrix4();
		this.teleportReverse.makeTranslation(-bound.x, -bound.y, -bound.z);
		this.status = TeleporterOut;
		//console.log("init ", this.facet.name, this.facet.cubie.name);
		this.outTranslation = new THREE.Matrix4();
		this.inTranslation = new THREE.Matrix4();

		// let mirrorAxis = axis == AxisX? AxisZ : AxisX;
		// mirrorAxis.set(this.outBound, 0);
		// mirrorAxis.set(this.inBound, 0);
		// console.log("mirrorAxis: ", mirrorAxis, this.outBound, this.facet.name, this.facet.cubie.name);
		// this.mirrorOut = Transform(this.outBound, mirrorAxis.getVector3(1), Math.PI);
		// this.mirrorIn  = Transform(this.inBound, mirrorAxis.getVector3(1), Math.PI);
	}

	isAllMovedOut(){
		//not exists vertice behind out bound value
		return !this.facet.geometry.vertices.some(v=>(this.outDirection>0&&this.axis.get(v) < this.outBoundValue) ||
				(this.outDirection < 0 && this.axis.get(v) > this.outBoundValue))
	}

	existsMovedOut(){
		return this.facet.geometry.vertices.some(v=>(this.outDirection>0 && this.axis.get(v) > this.outBoundValue) ||
				(this.outDirection < 0 && this.axis.get(v) < this.outBoundValue));
	}

	existsMoreOut(){
		return (this.facet.geometry.vertices.filter(v=>(this.outDirection>0 && this.axis.get(v) > this.outBoundValue) ||
				(this.outDirection < 0 && this.axis.get(v) < this.outBoundValue)).length > this.facet.geometry.vertices.length/2);

	}

	existsMovedOutAtInSide(){
		return this.facet.geometry.vertices.some(v=>(this.inDirection>0 && this.axis.get(v) < this.inBoundValue) ||
				(this.inDirection < 0 && this.axis.get(v) > this.inBoundValue));
	}

	transform(total, delta){
		let moveDistance = delta * this.distance

		//console.log("new position: ", this.facet.name, this.facet.cubie.name, new_position, out_cut_len, this.distance);
		this.axis.makeTranslation( this.outTranslation, moveDistance * this.outDirection);
		this.axis.makeTranslation( this.inTranslation, moveDistance * this.inDirection);
		if (this.status == TeleporterIn){ //Complete in
			this.facet.applyMatrix(this.inTranslation);
			if(this.existsMovedOutAtInSide()){
				//reverse from TeleporterIn to TeleporterOut
				this.teleportGeometryToOutSide(this.facet.geometry);
				this.status = TeleporterOut;
			}
		}
		else{ //In out or split
			if (delta == 1 && total == 1){//direct to in
				if (this.outDirection != this.inDirection)
					this.teleportGeometryToInSide(this.facet.geometry, this.inDirection * 300 + this.inBoundValue);
				else {
					let bound = this.inBound.clone();
					this.axis.add(bound, this.inDirection * 600);
					bound.sub(this.outBound);
					this.teleport.makeTranslation(bound.x, bound.y, bound.z);
					this.facet.geometry.applyMatrix(this.teleport);
				}
				this.status = TeleporterIn;
				return
			}
			this.facet.applyMatrix(this.outTranslation);
		}
		let existsMovedOut = this.existsMovedOut();
		let isAllMovedOut = this.isAllMovedOut();
		//TeleporterOut, TeleporterSplit, TeleporterIn
		//console.log("out bound value", this.outBoundValue);
		if(this.status == TeleporterOut && existsMovedOut){
			this.status = TeleporterSplit;
		}
		if(this.status == TeleporterSplit){
			if(!existsMovedOut){
				//reverse back from split to Out state
				this.facet.removeSplitGeometries(this.scene);
				//console.log("reverse from split to out state.: ", this.facet.name, this.facet.cubie.name);
				this.status = TeleporterOut;
			}else{
				//console.log("cut plane: ", this.out_plane, this.out_cut_plane);
				let inGeometry  = sliceGeometry(this.facet.geometry.clone(), this.cutPlaneToIn);
				let outGeometry = sliceGeometry(this.facet.geometry.clone(), this.cutPlaneToOut);
				//console.log("split: ", this.facet.name, this.facet.cubie.name);
				this.teleportGeometryToInSide(inGeometry);
				this.facet.updateSplitGeometries(this.scene,  outGeometry, inGeometry);
			}
		}


		if (isAllMovedOut || total == 1){
			if (this.status == TeleporterSplit){
				//all moving out
				let intentionIsOut = this.existsMoreOut();
				console.log("removing split: ",intentionIsOut, isAllMovedOut, this.facet.name, this.facet.cubie.name);
				//this.facet.geometry.vertices.forEach(v=>this.axis.add(v, this.inBoundValue-this.outBoundValue));
				if (intentionIsOut){
					this.teleportGeometryToInSide(this.facet.geometry);
					this.facet.removeSplitGeometries(this.scene);
					this.status = TeleporterIn;
					//console.log("cleaning move out, moved to in", isAllMovedOut, total, this.facet.name, this.facet.cubie.name);
				}else{
					this.facet.removeSplitGeometries(this.scene);
					//console.log("reverting back to out. ", isAllMovedOut, total, this.facet.name, this.facet.cubie.name);
					this.status = TeleporterOut;
				}
			}
		}
	}

	reset(){
		this.facet.removeSplitGeometries(this.scene);
	}

	teleportGeometryToInSide(geometry, oppositeMirrorValue = null){
		geometry.applyMatrix(this.teleport);
		if (this.outDirection != this.inDirection){
			//mirror with inBoundValue
			if (oppositeMirrorValue == null) oppositeMirrorValue = this.inBoundValue;
			geometry.vertices.forEach(v=>this.axis.add(v, -2 * (this.axis.get(v) - oppositeMirrorValue)));
		}
	}

	teleportGeometryToOutSide(geometry, mirrorValue = null){
		geometry.applyMatrix(this.teleportReverse);
		if (this.outDirection != this.inDirection){
			if (mirrorValue == null) mirrorValue = this.inBoundValue;
			geometry.vertices.forEach(v=>this.axis.add(v, -2 * (this.axis.get(v) - mirrorValue)));
		}
	}

	setDelta(delta){
		this.distance *= delta;
	}
}

class Translater{
	constructor(objects, translation){
		this.objects = objects;
		this.translation = translation;
		this.m = new THREE.Matrix4();
		this.total_translate = 0;
		//console.log("to translate: ", translation.z);
	}

	transform(total, delta){
		this.total_translate += this.translation.z * delta;
		//console.log("translating: ", delta, this.total_translate);
		this.m.makeTranslation(this.translation.x * delta, this.translation.y * delta, this.translation.z * delta);
		this.objects.forEach(obj=>obj.applyMatrix(this.m));
	}

	setDelta(delta){
		this.translation.x *= delta;
		this.translation.y *= delta;
		this.translation.z *= delta;
	}
	reset(){}
}

class Rotater{
	constructor(objects, origin, axis, angle){
		this.objects = objects;
		this.origin = origin;
		this.axis = axis;
		this.angle = angle;
		this.m = new THREE.Matrix4();
	}

	transform(total, delta){
		if (this.origin.x != 0 || this.origin.y != 0 || this.origin.z != 0){
			this.m = Transform(this.origin, this.axis, this.angle * delta);
		}else{
			this.m.makeRotationAxis(this.axis, this.angle * delta);
		}
		this.objects.forEach(obj=>obj.applyMatrix(this.m));
	}

	setDelta(delta){
		this.angle *= delta;
	}

	reset(){}
}
