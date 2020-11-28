
        //1. determine the first layer to solve
        //1.1 count number of edge facets solved for each face
        //1.2 count number of corner facets solved for each face
        //1.3 get the first layer by having the maximum of the tuple

        //2. solve the first layer X, having the opposite face Z
        //2.1 collect the list of (4) edge cubies, for each one
        //    XY, solving Y facet first (solving loc(Y) -> Y)
        //    if loc(Y) is Y: done solve loc(X)->X
        //    otherwise if loc(X) is Y then do command of loc(Y) moved to X'Y', then do 2.1.a
        //                 else 2.1.a: search command from location Y'->Y
        //2.2 collect the list of (4) corner cubies,
        //    locate corner cubies at Z face
        //    if loc(X) is not on Z: 2.2.a search command on loc(X) face from X->Z: C then CZ(', depending on previous clockwise)C'
        //    otherwise: do search command on loc(Y) from X->Z: C then CZ(', depending on previous clockwise)ZZC'Z then 2.2.a again
        //    no corner cubies at Z face, but have corner cubies at X face and wrong orientation then on C(loc(X)), then CZC' then 2.2.a

        //3. solve 4 edge cubies for the second layer
        //3.1. locate the edge cubies positioned at Z layer, find the cubies that non of facet is Z for each one:
        //     locate the facet which location is not Z: M, search command C to (loc(M)->M), then do transform: Z->facet(Z) 3.1.a:
        //3.1.a:M rotate Z->facet(Z):Y without changing the first layer X:
        //C: Z(M->Y); J:Y(X->Z); K:M(Y->Z) do C'JCJ'CKC'K'
        //repeat this until not edge on Z layer.
        //3.2. locate the edges wrong but on the the second layer. set M = loc(first facet), Y=loc(the second facet) do 3.1.a and 3.1
        //  until all edges are correct on the second layer

        //4. solve the 3rd layer
        //4.1 solve the 4 edge cubies: forming cross
        //4.1.a None of edge that has loc(Z) == Z: then pick the first neighboring face: M
        //  do 4.1.a.a  Y:Z'(M) and MZYZ'Y'M'
        //4.1.b one edge on Z, N:loc(the facet not on the Z) set M: opposite(N) then do 4.1.a.a
        //4.1.c two/three edges on Z, locate the faces M != Z where facet[M] == Z
        //      and opposite cubie where loc(Z) == Z, if none, get the first one as M, then 4.1.a.a
        //4.1.d adjust position of edge cubies, get Z face cycle,[....], [loc()...], get exchange face pairs for each M, N and N is Z'(M)
        //      do P:Z'(N): PZP'ZPZZP'Z
        //4.2 solve the 4 corner cubies
        //4.2.a solve the 4 corner cubies position
        //4.2.a.1 locate the correct one, then having M, N, P on N is Z'(M), P:Z(M), do ZNZ'P'Zn'Z'p'
        //      until all corner positioned correctly
        //4.2.a.2 M,N: N'XNX' until M,N solved, using Z', to move M,N then repeating untill all fixed

class BottomupSolver{
  constructor(state){
    this.cubeState = new CubeState(state); //store facets per each location
    this.countLimited = 0;
  }

  solve(){
    var allOps = []
    var ops;
    if (! this.cubeState.isSolved()){
        var X = this.determineTheFirstLayerToSolve();
        console.log("determined the first layer to solve: %s", X);
        ops = this.solveFirstLayerEdgeCubies(X);
        console.log("solved the first layer edge cubies: %s", ops.toString());
        allOps = allOps.concat(ops);
        var Z = OPPOSITE_FACE_NAMES[X];
        ops = this.solveFirstLayerCornerCubies(X, Z);
        console.log("solved the first layer corner cubies: " + ops);
        allOps = allOps.concat(ops);
        ops = this.solveSecondLayerEdgeCubies(X, Z);
        console.log("solved the second layer edge cubies: " + ops);
        allOps = allOps.concat(ops);
        ops = this.solveThirdLayerEdgeCubiesCross(Z);
        console.log("solved the third layer edge cubies cross: " + ops);
        allOps = allOps.concat(ops);
        ops = this.solveThirdLayerEdgeCubiesPosition(Z);
        console.log("solved the third layer edge cubies position: " + ops);
        allOps = allOps.concat(ops);
        this.countLimited = 0;
        ops = this.solveThirdLayerCornerCubiesPosition(Z);
        console.log("solved the third layer corner cubies position: " + ops);
        allOps = allOps.concat(ops);
        ops = this.solveThirdLayerCornerCubiesRotation(X, Z);
        console.log("solved the third layer corner cubies rotation: " + ops);
        allOps = allOps.concat(ops);
        ops = this.solveWholeCube(X, Z);
        console.log("solved the whole cube " + ops);
        allOps = allOps.concat(ops);
    }
    return allOps;
  }

  solveWholeLayer(face){
    var side = ROTATION_FACE_CYCLES[face][0];
    var loc = sort(side+face);
    var sideFacet = this.cubeState.locToCubieMap[loc].locToFacetMap[side];
    return side == sideFacet ? null : getCommandFromPath(face, side, sideFacet);
  }

  solveWholeCube (X, Z){
      var ops = [];
      var op = this.solveWholeLayer(X);
      if (op != null) ops.push(op);
      op = this.solveWholeLayer(Z);
      if (op != null) ops.push(op);
      return ops;
  }

  twisterThirdLayerCornerCubies(loc, X, Z, n){
      this.countLimited ++;
      if(this.countLimited > 100) throw "Wrong logic";
      var ops = [];
      var cornerLocs = CUBE_FACES[Z].filter(x=>x.length==3);
      var locs = cornerLocs.filter(x=>this.cubeState.locToCubieMap[x].locToFacetMap[Z] != Z);
      if (locs.length == 0) return [];
      //console.log("solving: " , locs, this.cubeState.locToCubieMap[loc].locToFacetMap[Z], Z);
      var op = reverseOp(Z);
      while (this.cubeState.locToCubieMap[loc].locToFacetMap[Z] == Z) {
          ops.push(op); this.cubeState.rotate(op);
          //console.log("rotating: " + op);
      }
      var repeatTimes = (this.cubeState.locToCubieMap[loc].locToFacetMap[n] == Z) ? 2 : 4;
      var nr = reverseOp(n); var xr = reverseOp(X);
      var macro = [];
      for(var i = 0; i < repeatTimes; i++) macro = macro.concat([nr, xr, n, X]);
      macro.forEach(op=>this.cubeState.rotate(op));
      ops = ops.concat(macro);
      //console.log("macro: ", macro);
      ops = ops.concat(this.twisterThirdLayerCornerCubies(loc, X, Z, n));
      return ops;
  }

  solveThirdLayerCornerCubiesRotation(X, Z){
      var ops = [];
      var locs = CUBE_FACES[Z].filter(loc=>loc.length==3).filter(loc=>!this.cubeState.locToCubieMap[loc].isSolved());
      if (locs.length > 0){
          var loc = locs[0];
          var sideLocs = loc.split('').filter(side=>side!=Z);
          var n = (getCommandFromPath(Z, sideLocs[0], sideLocs[1]) == Z) ? sideLocs[0] : sideLocs[1];
          //console.log("locating to %s", loc);
          //console.log(X, Z, loc, n);
          ops = ops.concat(this.twisterThirdLayerCornerCubies(loc, X, Z, n));
      }
      return ops;
  }

  rotateCornerOnThirdLayer(Z, n){
      var p = OPPOSITE_FACE_NAMES[n]; var nr = reverseOp(n); var pr = reverseOp(p);
      var zr = reverseOp(Z);
      var ops = [Z, n, zr, pr, Z, nr, zr, p];
      ops.forEach(op=>this.cubeState.rotate(op));
      //console.log(Z, n, ops);
      return ops;
  }

  solveThirdLayerCornerCubiesPosition(Z){
      this.countLimited ++;
      if (this.countLimited > 100) throw "Error wrong loop";
      var cornerLocs = CUBE_FACES[Z].filter(loc=>loc.length==3);
      var positionSolvedLocs = cornerLocs.filter(loc=>this.cubeState.locToCubieMap[loc].name == loc);
      //console.log("position solved: " + positionSolvedLocs);
      //console.log("locations: " + cornerLocs);

      var ops = [];
      if (positionSolvedLocs.length == 4)
          return ops;
      if (positionSolvedLocs.length == 2 || positionSolvedLocs.length == 3) throw "Wrong status";
      var n;
      if (positionSolvedLocs.length == 1){
          var loc = positionSolvedLocs[0];
          var sideLocs = loc.split('').filter(side=>side!=Z);
          n = (getCommandFromPath(Z, sideLocs[0], sideLocs[1]) == Z) ? sideLocs[0] : sideLocs[1];

      }else if(positionSolvedLocs.length == 0){
          n = ROTATION_FACE_CYCLES[Z][0];
      }
      ops = ops.concat(this.rotateCornerOnThirdLayer(Z, n));
      ops = ops.concat(this.solveThirdLayerCornerCubiesPosition(Z));
      return ops;
  }

  switchEdgePositionOnThirdLayer(Z, m, n){
      var p = OPPOSITE_FACE_NAMES[m]; var pr = reverseOp(p);
      var ops = [p, Z, pr, Z, p, Z.repeat(2), pr, Z];
      ops.forEach(op=>this.cubeState.rotate(op));
      return ops;
  }

  solveThirdLayerEdgeCubiesPosition(Z){
      var sideIndex = [];
      var indexSide = [];
      var ops = [];
      ROTATION_FACE_CYCLES[Z].forEach((x, i) => {sideIndex[x] = i; indexSide[i] = x;});
      var currentPosition = ROTATION_FACE_CYCLES[Z]
          .map(x=>this.cubeState.locToCubieMap[sort(x+Z)].locToFacetMap[x])
          .map(side=>sideIndex[side]);
      var n = null; var m = null;
      for(var i=0; i<currentPosition.length; i++){
          var next = (i+1) % currentPosition.length;
          if ((currentPosition[next] + 1) % currentPosition.length == currentPosition[i]){
              n = indexSide[i]; m=indexSide[next];
              break;
          }
      }
      if (n!=null){
          ops = ops.concat(this.switchEdgePositionOnThirdLayer(Z, m, n));
          ops = ops.concat(this.solveThirdLayerEdgeCubiesPosition(Z));
      }else{ //check last
          var sideLoc = ROTATION_FACE_CYCLES[Z][0];
          var sideFacet = this.cubeState.locToCubieMap[sort(sideLoc+Z)].locToFacetMap[sideLoc];
          if (sideLoc!=sideFacet){
              var op = getCommandFromPath(Z, sideLoc, sideFacet);
              ops.push(op); this.cubeState.rotate(op);
              //ops = ops.concat(this.solveThirdLayerEdgeCubiesPosition(Z));
          }
      }
      return ops;
  }

  rotateEdgeCubiesOnThirdLayer(Z, m){
      var zr = reverseOp(Z);
      var mr = reverseOp(m);
      var y = ROTATION_FACE_MAP[zr][m]; var yr = reverseOp(y);
      var ops = [m, Z, y, zr, yr, mr];
      ops.forEach(x=>this.cubeState.rotate(x));
      return ops;
  }

  solveThirdLayerEdgeCubiesCross(Z){
      //Z:
      var ops = [];
      //console.log("hello ", Z, ROTATION_FACE_CYCLES[Z]);
      var zEdgeSidesSolvedWithZ = ROTATION_FACE_CYCLES[Z].filter(side=>this.cubeState.locToCubieMap[sort(side+Z)].locToFacetMap[Z] == Z);
      if (zEdgeSidesSolvedWithZ.length == 4) return ops;
      var m;
      if (zEdgeSidesSolvedWithZ.length == 0){
          m = ROTATION_FACE_CYCLES[Z][0];
      }else if(zEdgeSidesSolvedWithZ.length == 1){
          m = OPPOSITE_FACE_NAMES[zEdgeSidesSolvedWithZ[0]];
      }else if(zEdgeSidesSolvedWithZ.length == 2){
          if (OPPOSITE_FACE_NAMES[zEdgeSidesSolvedWithZ[0]] == zEdgeSidesSolvedWithZ[1])
              m = ROTATION_FACE_CYCLES[Z].find(side=>!zEdgeSidesSolvedWithZ.some(x=>x==side));
          else{
              if (getCommandFromPath(Z, zEdgeSidesSolvedWithZ[0], zEdgeSidesSolvedWithZ[1]) == Z)
                  m = OPPOSITE_FACE_NAMES[zEdgeSidesSolvedWithZ[1]];
              else
                  m = OPPOSITE_FACE_NAMES[zEdgeSidesSolvedWithZ[0]];
          }
      }else throw "not expected here"
      ops = ops.concat(this.rotateEdgeCubiesOnThirdLayer(Z, m));
      ops = ops.concat(this.solveThirdLayerEdgeCubiesCross(Z));
      return ops;
  }

  solveSecondLayerEdgeZtoYonM(m, Z, y){
      var c = getCommandFromPath(Z, m, y); var j = getCommandFromPath(y, m, Z); var k = getCommandFromPath(m, y, Z);
      //console.log(c, Z, m, y);
      //console.log(j, y, m, Z);
      //console.log(k, m, Z, y);
      var cr = reverseOp(c); var jr = reverseOp(j); var kr = reverseOp(k);
      var ops = [cr,j,c,jr,c,k,cr,kr];
      //console.log("OPS now: " + z_to_y);
      ops.forEach(op=>this.cubeState.rotate(op));
      return ops;
  }

  solveSecondLayerEdgeCubies(X, Z){
    var zEdgeLocs = CUBE_FACES[Z].filter(loc=>loc.length == 2)
            .filter(loc=>! (Z in this.cubeState.locToCubieMap[loc].facetToLocMap))
            .map(loc=> [1-this.cubeState.locToCubieMap[loc].getNumberOfFacetSolved(), loc])
            .sort().map(x=>x[1]);
    var ops = [];
    var op;
    this.countLimited ++;
    if (this.countLimited > 100) throw "something wrong";
    //console.log("zEdgeLocs: " + zEdgeLocs);
    if (zEdgeLocs.length>0){
        var loc = zEdgeLocs[0];
        var sideLoc = loc.split('').find(x=>x!=Z);
        var sideFacet = this.cubeState.locToCubieMap[loc].locToFacetMap[sideLoc];
        var zFacet = this.cubeState.locToCubieMap[loc].locToFacetMap[Z];
        //console.log("solving %s", loc, sideLoc, sideFacet);
        if (sideLoc != sideFacet){
            op = getCommandFromPath(Z, sideLoc, sideFacet); //solving side facet
            ops.push(op); this.cubeState.rotate(op);
            //console.log("OP Now: " + op);

        }else{
            //:Z --> zFacet, z_y
            ops = ops.concat(this.solveSecondLayerEdgeZtoYonM(sideFacet, Z, zFacet));
        }
        ops = ops.concat(this.solveSecondLayerEdgeCubies(X, Z));
    }
    var edges = ROTATION_FACE_CYCLES[Z];
    var neighborEdges = edges.slice(1, edges.length).concat(edges.slice(0,1));
    var edgeLocs = edges.map((side, i)=>sort(edges[i]+neighborEdges[i]));
    //console.log(edgeLocs);
    var mEdgeLocs = edgeLocs.filter(loc=>!this.cubeState.locToCubieMap[loc].isSolved());
    if (mEdgeLocs.length > 0){
        var loc = mEdgeLocs[0].split('');
        ops = ops.concat(this.solveSecondLayerEdgeZtoYonM(loc[0], Z, loc[1]));
        ops = ops.concat(this.solveSecondLayerEdgeCubies(X, Z));
    }
    return ops;
  }

  getLocWhenSideFacetOnSideLoc(locs, X, Z){
    for(var loc of locs){
        //loc = cornerCubiesXnotAtZ[0];
        var facetXon = this.cubeState.locToCubieMap[loc].facetToLocMap[X];
        var sideLoc = loc.split('').find(x=>x!=Z && x!=facetXon);
        var sideFacet = this.cubeState.locToCubieMap[loc].locToFacetMap[sideLoc];
        //console.log("side loc and facet: " + sideLoc + " " + sideFacet);
        if (sideLoc == sideFacet) return loc;
    }
    return null;
  }

  getLocWhenSideFacetOnOtherSideLoc(locs, Z){
    for(var loc of locs){
        var sideLocs = loc.split('').filter(x=>x!=Z);
        var aLoc = sideLocs[0];
        let bLoc = sideLocs[1];
        var aFacet = this.cubeState.locToCubieMap[loc].locToFacetMap[aLoc];
        var bFacet = this.cubeState.locToCubieMap[loc].locToFacetMap[bLoc];
        if (bLoc == aFacet) return loc;
    }
    return null;
  }

  solveFirstLayerCornerCubies(X, Z){
    this.countLimited ++;
    if (this.countLimited > 100) throw "bad loop";
    var ops = [];
    var op, pushOp, loc, sideLocs;
    var zCornerLocs = CUBE_FACES[Z].filter(loc=>loc.length == 3);
    var cornerCubiesXnotAtZ = zCornerLocs.filter(loc=>X in this.cubeState.locToCubieMap[loc].facetToLocMap &&
        this.cubeState.locToCubieMap[loc].facetToLocMap[X] != Z);
    //console.log("cornerCubiesXnotAtZ: " + cornerCubiesXnotAtZ);
    if (cornerCubiesXnotAtZ.length >0){
        //console.log("cornerCubiesXnotAtZ cubies state: ", this.cubeState.get_state());
        //console.log("cornerCubiesXnotAtZ: " + cornerCubiesXnotAtZ);

        var loc = this.getLocWhenSideFacetOnSideLoc(cornerCubiesXnotAtZ, X, Z);
        if (loc==null){
            loc = cornerCubiesXnotAtZ[0];
        }
        var facetXon = this.cubeState.locToCubieMap[loc].facetToLocMap[X]
        var sideLoc = loc.split('').find(x=>x!=Z && x!=facetXon)
        var sideFacet = this.cubeState.locToCubieMap[loc].locToFacetMap[sideLoc];
        //console.log("side loc and facet: " + sideLoc + " " + sideFacet);
        if (sideLoc != sideFacet){
            op = getCommandFromPath(Z, sideLoc, sideFacet);
            ops.push(op); this.cubeState.rotate(op);
            //console.log("maving to right corner x not at z: ", op);
        }
        else{
            //one is Z,facetXon in loc
            pushOp = getCommandFromPath(facetXon, X, sideLoc);
            if (pushOp == null || pushOp == undefined) throw "error: " + facetXon + " " + X + " " + sideLoc;
            ops.push(pushOp); this.cubeState.rotate(pushOp);
            //console.log(pushOp);
            op = getCommandFromPath(Z, facetXon, sideLoc);
            if (op == null || op == undefined) throw "error: " + Z + " " + facetXon + " " + sideLoc;
            ops.push(op); this.cubeState.rotate(op);
            //console.log(op);
            op = reverseOp(pushOp);
            if (op == null || op == undefined) throw "error:";
            ops.push(op); this.cubeState.rotate(op);
            //console.log(op);
        }
        ops = ops.concat(this.solveFirstLayerCornerCubies(X, Z));

    }
    var cornerCubiesXatZ = zCornerLocs.filter(loc=>this.cubeState.locToCubieMap[loc].facetToLocMap[X] == Z);
    //console.log("cornerCubiesXatZ: (%s, %s): ", X, Z);

    //console.log(cornerCubiesXatZ.map(loc=>this.cubeState.locToCubieMap[loc]));
    if (cornerCubiesXatZ.length > 0){
        //console.log("cornerCubiesXatZ cubies state: ", this.cubeState.get_state());
        //console.log("cornerCubiesXatZ:" + cornerCubiesXatZ);
        var loc = this.getLocWhenSideFacetOnOtherSideLoc(cornerCubiesXatZ, Z);
        if (loc == null) loc = cornerCubiesXatZ[0];
        var sideLocs = loc.split('').filter(x=>x!=Z);
        var aLoc = sideLocs[0]; bLoc = sideLocs[1];
        var aFacet = this.cubeState.locToCubieMap[loc].locToFacetMap[aLoc];
        var bFacet = this.cubeState.locToCubieMap[loc].locToFacetMap[bLoc];
        if (bLoc != aFacet){
            op = getCommandFromPath(Z, bLoc, aFacet);
            //if (op == null || op == undefined) throw "error: " + Z + " " + bLoc + " " + aFacet;
            ops.push(op); this.cubeState.rotate(op);
            //console.log("turning to right x->z: %s", op);
        }else{
            var pushOp = getCommandFromPath(aFacet, X, bFacet);
            //if (pushOp == null || pushOp == undefined) throw "error: " + aFacet + " " + X + " " + bFacet;
            ops.push(pushOp); this.cubeState.rotate(pushOp);
            //console.log(pushOp);
            var zOp = getCommandFromPath(Z, bFacet, aFacet);
            //if (zOp == null || zOp == undefined) throw "error: " + Z + " " + bFacet + " " + aFacet;
            ops.push(zOp.repeat(2)); this.cubeState.rotate(zOp.repeat(2));
            //console.log(zOp.repeat(2));
            op = reverseOp(pushOp); ops.push(op); this.cubeState.rotate(op);
            //console.log(op);
            ops.push(zOp); this.cubeState.rotate(zOp);
            //console.log(zOp);
        }
        ops = ops.concat(this.solveFirstLayerCornerCubies(X, Z));
    }
    var xCornerLocs = CUBE_FACES[X].filter(loc=>loc.length == 3).filter(loc=>!this.cubeState.locToCubieMap[loc].isSolved());
    //console.log("xCornerLocs: " + xCornerLocs);
    if (xCornerLocs.length > 0){
        //console.log("xCornerLocs: " + xCornerLocs);
        loc = xCornerLocs[0];
        sideLocs = loc.split('').filter(x=>x!=X);
        var aLoc = sideLocs[0]; var bLoc = sideLocs[1];
        pushOp = getCommandFromPath(aLoc, X, bLoc); ops.push(pushOp); this.cubeState.rotate(pushOp);
        //console.log(pushOp);
        op = getCommandFromPath(Z, bLoc, aLoc); ops.push(op); this.cubeState.rotate(op);
        //console.log(op);
        op = reverseOp(pushOp); ops.push(op); this.cubeState.rotate(op);
        //console.log(op);
        ops = ops.concat(this.solveFirstLayerCornerCubies(X, Z));
    }
    return ops;
  }

  existsSolvedCubieOnFace(faceName){
    return ROTATION_FACE_CYCLES[faceName].some(side=>this.cubeState.locToCubieMap[sort(side+faceName)].isSolved());
  }

  solveFirstLayerEdgeFacets(facetToSolve, sideName, cubieName, X){
    var ops = [];
    var op;
    var cubieLoc = this.cubeState.cubieToLocMap[cubieName];
    var facetLoc = this.cubeState.locToCubieMap[cubieLoc].facetToLocMap[facetToSolve];
    var sideLoc = this.cubeState.locToCubieMap[cubieLoc].facetToLocMap[sideName];
    if (facetLoc == facetToSolve)//solved
        return ops;
    if (sideLoc==facetToSolve||sideLoc == OPPOSITE_FACE_NAMES[facetToSolve]){
        if (facetLoc != X && facetLoc != OPPOSITE_FACE_NAMES[X])
            op = getCommandFromPath(facetLoc, X, sideLoc);
        else op = facetLoc;
        //console.log("solving %s of %s", facetToSolve, cubieName);
        //console.log("got: %s at %s (%s) : %s --> %s ", op, facetLoc, X, sideName, sideLoc);
        ops.push(op); this.cubeState.rotate(op);
        ops = ops.concat(this.solveFirstLayerEdgeFacets(facetToSolve, sideName, cubieName, X));
    }else{
        //console.log("getting command for %s @ %s, %s @ %s", sideName, sideLoc, facetToSolve, facetLoc);
        if (sideLoc == X && this.existsSolvedCubieOnFace(X)){
            op = facetLoc.repeat(2); //moving the cubie to Z side
        }else{
            op = getCommandFromPath(sideLoc, facetLoc, facetToSolve);
        }
        //console.log("got command is %s ", op);
        // if (op == null || op == undefined){
        //     console.log("no op matched for %s, %s, %s", sideLoc, facetLoc, facetToSolve);
        //     throw "Error !";
        // }
        ops.push(op); this.cubeState.rotate(op);
        ops = ops.concat(this.solveFirstLayerEdgeFacets(facetToSolve, sideName, cubieName, X));
    }
    return ops;
  }

  solveFirstLayerEdgeCubies(X){
    var ops = [];
    var sidesToSolve  = ROTATION_FACE_CYCLES[X]
        .map(side=>[X in this.cubeState.locToCubieMap[sort(side+X)].locToFacetMap,
                    this.cubeState.locToCubieMap[sort(side+X)].getNumberOfFacetSolved(), side])
        .filter(x=>x[1]!=2).sort().map(x=>x[2]);
    if (sidesToSolve.length > 0){
        var side = sidesToSolve[0];
        var name = sort(side + X);
        var loc = name;
        if (!this.cubeState.locToCubieMap[loc].isSolved()){
            //console.log("solving %s on %s ...", side, name);
            var op = this.solveFirstLayerEdgeFacets(side, X, name, X)
            ops = ops.concat(op);
            //console.log("done: " + op);
            //console.log("solving %s on %s ...", X, name);
            op = this.solveFirstLayerEdgeFacets(X, side, name, X)
            ops = ops.concat(op);
            //console.log("done: " + op);
            this.countLimited ++;
            //console.log(this.countLimited);
            if(this.countLimited > 100)
                throw "count limit hit !";
        }
        ops = ops.concat(this.solveFirstLayerEdgeCubies(X));
    };
    return ops;
  }

  determineTheFirstLayerToSolve(){
    var numOfEdgeFacetsSolved = [];
    FACE_NAMES.forEach(faceName=>
      {
          var countKey =
          [
              this.cubeState.getNumOfFacetsSolved(CUBE_FACES[faceName].filter(loc=>loc.length==2)),
              this.cubeState.getNumOfFacetsSolved(CUBE_FACES[faceName].filter(loc=>loc.length==3))
          ].map(x=>x<10?"0" + x.toString() : x.toString()).join('');
          numOfEdgeFacetsSolved[countKey] = faceName;
      }
    );
    //console.log(numOfEdgeFacetsSolved);
    return numOfEdgeFacetsSolved[Object.keys(numOfEdgeFacetsSolved).reduce((a,b)=>a>b?a:b)];
  }
}
