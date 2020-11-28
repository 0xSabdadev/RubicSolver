/**
 ** @author Ligang Wang, http://github.com/ligangwang/
 **/

class CubeConsole{
	constructor(initialState, parentControl){
		this.cube = new RubiksCube(initialState, new THREE.Scene());
		this.cube.enableAnimation = true;
		this.inputText = "";
		this.inputTimer = null;

		this.parentControl = parentControl;
		this.renderWidth = parentControl.offsetWidth;
		this.renderHeight = parentControl.offsetHeight;
		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( this.renderWidth, this.renderHeight );
		this.renderer.setClearColor(0x262626);
		//this.renderer.autoClear = false;
		this.parentControl.appendChild( this.renderer.domElement );
		//this.stats = new Stats();
		//this.parentControl.appendChild( this.stats.dom );

		this.camera = new THREE.PerspectiveCamera( 50, this.renderWidth / this.renderHeight, 0.1, 10000 );
		this.camera.lookAt(this.cube.scene.position);
		this.camera.position.z = 1000;
		this.camera.position.y = 1000;
		this.camera.position.x = 1000;

		this.interactive = new CubeInteractive(this.cube, this.camera, this.renderer.domElement);

/*
	let plane = new THREE.Plane(new THREE.Vector3(0, 0, -1), -200);
	let geom = new THREE.SphereGeometry(100, 100, 100);
	geom = sliceGeometry(geom, plane);
	let material = new THREE.MeshBasicMaterial({ wireframe: false });
	let mesh = new THREE.Mesh(geom, material);
	this.cube.scene.add(mesh);
*/
	}

	render(){
		let scene = this.cube.scene;
		let renderer = this.renderer;
		let camera = this.camera;
		let controls = this.interactive.controls;
		//let stats = this.stats;
		function animate() {
			TWEEN.update();
			controls.update();
			//stats.update();
			renderer.render( scene, camera );
			requestAnimationFrame( animate );
		}
		animate();
	}

	resetInputTimer(){
		window.clearTimeout(this.inputTimer);
		this.inputTimer = window.setTimeout(this.onTimer, 1000, this);
	}


	onTimer(cubeConsole){
		if (cubeConsole.inputText.length > 0){
			cubeConsole.cube.command(cubeConsole.inputText);
			cubeConsole.inputText = "";
		}
	}

	deleteChar(){
		this.inputText = this.inputText.substring( 0, this.inputText.length - 1 );
		this.resetInputTimer();
	}

	inputChar(ch){
		if (!this.cube.isInSolverMode) {
			let prevChar = this.inputText.substr(this.inputText.length - 1)
			if (this.cube.isValidInputChar(prevChar, ch)){
				//this.changeInputText(this.inputText + ch);
				if("OST".indexOf(ch.toUpperCase()) > -1){
					ch = ch.toUpperCase();
				}else if (ch == ch.toLowerCase() && ch != "'")
					ch = ch.toUpperCase() + "'";
				console.log("ch: ", ch);
				this.inputText += ch;
				this.resetInputTimer();
			}
		}
	}

}
