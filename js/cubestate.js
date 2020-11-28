var FACE_PAIRS = [["F", "B"], ["L", "R"], ["U", "D"]];
var SINGMASTER_SOLVED_STATE = "UF UR UB UL DF DR DB DL FR FL BR BL UFR URB UBL ULF DRF DFL DLB DBR";
var SINGMASTER_SOLVED_SLOTS = SINGMASTER_SOLVED_STATE.split(' ');
var FACE_NAMES = [].concat.apply([], FACE_PAIRS);
var ALL_SLOTS = SINGMASTER_SOLVED_SLOTS.concat(FACE_NAMES);
var OPPOSITE_FACE_NAMES = [];
FACE_PAIRS.forEach(x=>{
    OPPOSITE_FACE_NAMES[x[0]] = x[1];
    OPPOSITE_FACE_NAMES[x[1]] = x[0];
});

var convertCycleToMap = function(cycle, repeat_times){
    map = []
    for (var i = 0, len=cycle.length; i < len; i++){
        map[cycle[i]] = cycle[(i+repeat_times)%len];
    }
    return map;
}

ROTATION_FACE_CYCLES = [];
ROTATION_FACE_CYCLES["R"] = ["F", "U", "B", "D"]; //R: F->U->B->D
ROTATION_FACE_CYCLES["U"] = ["F", "L", "B", "R"]; //U: F->R->B->L
ROTATION_FACE_CYCLES["F"] = ["U", "R", "D", "L"]; //F: R->U->L->D
ROTATION_FACE_CYCLES["L"] = ROTATION_FACE_CYCLES["R"].slice().reverse();
ROTATION_FACE_CYCLES["D"] = ROTATION_FACE_CYCLES["U"].slice().reverse();
ROTATION_FACE_CYCLES["B"] = ROTATION_FACE_CYCLES["F"].slice().reverse();
for (var op of FACE_NAMES){
    ROTATION_FACE_CYCLES[op + "'"] = ROTATION_FACE_CYCLES[op].slice().reverse();
}

OPERATIONS = Object.keys(ROTATION_FACE_CYCLES);
ROTATION_FACE_MAP = [];
for(var opKey in ROTATION_FACE_CYCLES){
    ROTATION_FACE_MAP[opKey] = convertCycleToMap(ROTATION_FACE_CYCLES[opKey], 1);
    ROTATION_FACE_MAP[opKey.repeat(2)] = convertCycleToMap(ROTATION_FACE_CYCLES[opKey], 2);
    var opFace = opKey.slice(0, 1);
    map[opFace] = opFace; //the same face not changed.
    ROTATION_FACE_MAP[opKey][opFace] = opFace;
    ROTATION_FACE_MAP[opKey.repeat(2)][opFace] = opFace;
}

//console.log(ROTATION_FACE_MAP);
var getCommandFromPath = function(rotateFace, fromSide, toSide){
    var cycle = ROTATION_FACE_CYCLES[rotateFace];
    var startPos = cycle.indexOf(fromSide);
    if (startPos < 0)
        return null;
    var steps = 0;
    var matched = false;
    for(var i=( startPos + 1 ) % cycle.length; i!=startPos; i=(i+1) % cycle.length){
        steps ++;
        if (cycle[i] == toSide)
        {
            matched = true;
            break;
        }
    }
    if (!matched)
        return null;

    return steps > cycle.length/2 ? (rotateFace + "'").repeat(steps-cycle.length/2) : rotateFace.repeat(steps);
}

CUBE_FACES = [];	//cube index storing locations(cubicles) per face
FACE_NAMES.forEach(x=>CUBE_FACES[x] = []);
ALL_SLOTS.forEach(x=>{
        var loc = sort(x);
		loc.split('').forEach(x=>CUBE_FACES[x].push(loc))
    });

var reverseOp = function(op){
    if (op.length == 1)
        return op + "'";
    else if (op.length == 2){
        ops = op.split('');
        return op[1] == "'" ? op[0] : op;
    }
    else
        throw "not supported op: " + op;
}

function getRandomOps(){
    return Array.from(Array(20).keys()).map(x=>OPERATIONS[getRandom(0, OPERATIONS.length - 1)]);
}

class CubieState{
  constructor(facetOrientation, locOrientation){
    this.name = sort(facetOrientation);
    this.cubicle = sort(locOrientation);
    this.locToFacetMap = [];
    this.facetToLocMap = [];
    facetOrientation.split('').forEach((x, i)=>{
            this.facetToLocMap[x] = locOrientation[i];
            this.locToFacetMap[locOrientation[i]] = x;
        }
    );
  }

  rotate(op){
      let locToFacetMap = []
      Object.keys(this.locToFacetMap).forEach(fromLoc=>
          {
              let toLoc = ROTATION_FACE_MAP[op][fromLoc];
              let facetName = this.locToFacetMap[fromLoc];
              locToFacetMap[toLoc] = facetName;
              this.facetToLocMap[facetName] = toLoc;
          }
      );
      this.locToFacetMap = locToFacetMap;
      this.cubicle = Object.keys(locToFacetMap).sort().join('');
      return this.cubicle; //returning new location
  }

	isSolved(){
		return Object.keys(this.locToFacetMap).every(x=>x == this.locToFacetMap[x]);
	}

  getNumberOfFacetSolved(){
      return Object.keys(this.facetToLocMap).filter(x=>this.facetToLocMap[x] == x).length;
  }

  clone(){
      var facets = Object.keys(this.facetToLocMap);
      var locs = facets.map(x=>this.facetToLocMap[x]);
      return new CubieState(facets.join(''), locs.join(''));
  }
}

class CubeState{
  constructor(state){
    this.locToCubieMap = [];
    this.cubieToLocMap = [];
    this.initState = state;
    var cubies = state.split(' ').concat(FACE_NAMES);
    if (ALL_SLOTS.length != cubies.length) throw "Length not matched for cubicle and cubie";
    ALL_SLOTS.forEach((x, i)=>this.addCubieState(ALL_SLOTS[i], cubies[i]));
  }

  getState(){
      return SINGMASTER_SOLVED_SLOTS
          .map(x=>x.split('').map(o=>this.locToCubieMap[sort(x)].locToFacetMap[o]))
          .map(x=>x.join('')).join(' ');
  }


  addCubieState(locOrientation, facetOrientation){
      var loc = sort(locOrientation);
      var cubieState = new CubieState(facetOrientation, locOrientation);
      this.locToCubieMap[loc] = cubieState;
      this.cubieToLocMap[cubieState.name] = loc;
  }

  rotate(op){
      let locToCubieMap = [];
      let opFaceName = op.slice(0, 1);
      CUBE_FACES[opFaceName].forEach(fromLoc=>
          {
              let cubieState = this.locToCubieMap[fromLoc];
              let toLoc = cubieState.rotate(op);
              this.cubieToLocMap[cubieState.name] = toLoc;
              locToCubieMap[toLoc] = cubieState;
          }
      );

      Object.keys(locToCubieMap).forEach(loc=>this.locToCubieMap[loc] = locToCubieMap[loc]);
  }

  getCubieStates(locFaceName){
      return CUBE_FACES[locFaceName].map(loc=>this.locToCubieMap[loc]);
  }

  getCubieState(cubieName){
      return this.locToCubieMap[this.cubieToLocMap[cubieName]];
  }

	isSolved(){
		return Object.keys(this.locToCubieMap).map(loc=>this.locToCubieMap[loc]).every(cubieState=>cubieState.isSolved());
	}

  getNumOfFacetsSolved(locations){
      return locations.map(loc=>Object.keys(this.locToCubieMap[loc].locToFacetMap)
                  .filter(x=>x==this.locToCubieMap[loc].locToFacetMap[x]).length)
                  .reduce((a,b)=>a+b, 0);
  }

  clone(){
      return new CubeState(this.getState());
  }
}

function isValidCubeState(state){
    var slots = SINGMASTER_SOLVED_SLOTS.map(x=>sort(x));
    var cubies = state.split(' ').map(x=>sort(x));
    if (!eqSet(new Set(slots), new Set(cubies))) return false;
    var cycles = getCycles(slots, cubies);
    var swaps = cycles.map(x=>x.length - 1).reduce((a,b)=>a+b, 0);
    if (swaps%2!=0) return false;
    if (sumOfCorner(state) % 3 !=0) return false;
    if (sumOfEdge(state) % 2 != 0) return false;
    return true;
}

function sumOfEdge(state){
    var edgeCubies = state.split(' ').filter(x=>x.length==2);
    var fbEdges = edgeCubies.filter(x=>x.indexOf("U") < 0 && x.indexOf("D") < 0)
    var udEdges = edgeCubies.filter(x=>x.indexOf("U") >= 0 || x.indexOf("D") >= 0)
    var edgeValues = [];
    ["U", "D"].forEach(f=>edgeValues = edgeValues.concat(udEdges.map(x=>x.indexOf(f)).filter(x=>x>=0)));
    ["F", "B"].forEach(f=>edgeValues = edgeValues.concat(fbEdges.map(x=>x.indexOf(f)).filter(x=>x>=0)));
    return edgeValues.reduce((a,b)=>a+b, 0);
}

function sumOfCorner(state){
    var cornerCubies = state.split(' ').filter(x=>x.length==3);
    var cornerValues = [];
    cornerValues = cornerValues.concat(cornerCubies.map(x=>Math.max(x.indexOf("U"))).filter(x=>x>=0));
    cornerValues = cornerValues.concat(cornerCubies.map(x=>Math.max(x.indexOf("D"))).filter(x=>x>=0));
    return cornerValues.reduce((a,b)=>a+b, 0);
}

function getCycles(slots, cubies){
    var cubieToLocMap = [];
    cubies.map((x,i)=>[cubies[i], slots[i]]).filter(x=>x[0] != x[1]).forEach(x=>cubieToLocMap[x[0]] = x[1]);
    //from 0 to 1
    var counts = 0;
    var cubieNames = Object.keys(cubieToLocMap);
    if (cubieNames.length == 0) return [];
    var cycle = [];
    var cycles = [];
    cubieNames.forEach(x=>{
        if (x in cubieToLocMap){
            var loc = cubieToLocMap[x];
            delete cubieToLocMap[x];
            if (cycle.length == 0) {
                cycles.push(cycle);
                cycle.push(x);
            }
            while (cycle[0]!=loc){
                counts++;
                if (counts>100) throw "error wrong somethere";
                cycle.push(loc);
                var loc1 = cubieToLocMap[loc];
                delete cubieToLocMap[loc];
                loc = loc1;
            }
            cycle = [];
        }
    });
    return cycles;
}
