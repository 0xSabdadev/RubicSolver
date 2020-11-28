document.addEventListener( 'keypress', onDocumentKeyPress, false );
document.addEventListener( 'keydown',  onDocumentKeyDown, false );

document.getElementById("switchsidebar").addEventListener("click", switchsidebar);
document.getElementById("scramble").addEventListener("click", scramble);
document.getElementById("solve").addEventListener("click", solve);
document.getElementById("fold").addEventListener("click", fold);
document.getElementById("execute").addEventListener("click", execute);
document.getElementById("speed").addEventListener("change", onChangeSpeed);
//document.getElementById("command").addEventListener( 'keypress', onDocumentKeyPress);
document.getElementById("getposition").addEventListener("click", getPosition);
document.getElementById("setposition").addEventListener("click", setPosition);

let command = document.getElementById("command");
let position = document.getElementById("position");
let cubeElement = document.getElementById("cube");
let status = document.getElementById("status");
let cubeConsole = new CubeConsole(SINGMASTER_SOLVED_STATE, cubeElement);
let sideBarIsOpen = false;
cubeConsole.render();
//cubeConsole.cube.enableAnimation = false;
//cubeConsole.inputChar('O');
cubeConsole.renderer.domElement.addEventListener('mousedown', onMouseDown, false);
cubeConsole.renderer.domElement.addEventListener('mousemove', onMouseMove, false);
cubeConsole.renderer.domElement.addEventListener('mouseup', onMouseUp, false);
cubeConsole.renderer.domElement.addEventListener('touchstart', onTouchStart, false);
cubeConsole.renderer.domElement.addEventListener('touchmove', onTouchMove, false);
cubeConsole.renderer.domElement.addEventListener('touchend', onTouchEnd, false);

function scramble() { cmd ('S');}
function solve() { cmd ('V');}
function fold() {
  // if (cubeConsole.cube.isFolded){
  //   screen.lockOrientation('landscape');
  // }else{
  //   screen.unlockOrientation();
  // }
  cmd ('O');
}
function execute(){
  command.value.split('').forEach(x=>cubeConsole.inputChar(x));
  command.value = "";
}
function getPosition(){
  position.value = cubeConsole.cube.getState();
}

function setPosition(){
  let state = position.value;
  if(isValidCubeState(state)){
    cubeConsole.cube.setState(state);
  }else{
    status.innerText = "Invalid state !"
  }
}

window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize() {
		let windowHalfX = window.innerWidth / 2;
		let windowHalfY = window.innerHeight / 2;
		cubeConsole.camera.aspect = window.innerWidth / window.innerHeight;
		cubeConsole.camera.updateProjectionMatrix();
		cubeConsole.renderer.setSize( window.innerWidth, window.innerHeight );
}

function onChangeSpeed(e){
  cubeConsole.cube.timePerAnimationMove = 5000/e.target.value;
}

function onMouseUp(event){
	cubeConsole.interactive.onMouseUp(event);
}

function onMouseMove(event){
	cubeConsole.interactive.onMouseMove(event);
}

function onMouseDown(event){
	cubeConsole.interactive.onMouseDown(event);
}
function onTouchStart(event){
	cubeConsole.interactive.onTouchStart(event);
}

function onTouchMove(event){
	cubeConsole.interactive.onTouchMove(event);
}

function onTouchEnd(event){
	cubeConsole.interactive.onTouchEnd(event);
}

function onDocumentKeyDown( event ) {
  if(sideBarIsOpen) return;
	var keyCode = event.keyCode;
	if ( keyCode == 8 ) {
		//event.preventDefault();
		cubeConsole.deleteChar();
		//console.log("deleting");
		//return false;
	}
}

function onDocumentKeyPress ( event ) {
  if(sideBarIsOpen) return;
	var keyCode = event.which;
	if ( keyCode == 8 ) {

		//event.preventDefault();
	} else if (document.activeElement.nodeName == "BODY"||
            document.activeElement.id == "command"){
		var ch = String.fromCharCode( keyCode );
    console.log("press: ", ch, document.activeElement.id);
    cmd(ch);
	}
}

function cmd(op){
  if(op.toUpperCase()=="V"){
    onBottomUpSolver();
  }else{
    cubeConsole.inputChar(op);
  }
}

function onCommand(op){
	cubeConsole.cube.command(op);
}

function onChangeTransparent(value){
	var opacity = (100-value)/100;
	cubeConsole.cube.setOpacity(opacity);
}

function onBottomUpSolver(){
	cubeConsole.cube.setIsInSolverMode(true);
	var solver = new BottomupSolver(cubeConsole.cube.getState());
	solver.solve().forEach(op=>cubeConsole.cube.command(op));
}

function setInitialPosition(){
	var initState = document.getElementById("initPosition").value;
	if (!isValidCubeState(initState)){
		document.getElementById("initPosition").select();
		document.getElementById("message").innerText = "invalid state !";
		return;
	}else{
		document.getElementById("message").innerText = "";
		cubeConsole.cube.setCubeState(initState);
	}
}

function switchsidebar() {
    if (document.getElementById("cubeSidenav").style.width != "150px"){
      document.getElementById("cubeSidenav").style.width = "150px";
      sideBarIsOpen = true;
    }
    else {
      document.getElementById("cubeSidenav").style.width = "0px";
      sideBarIsOpen = false;
    }
}
