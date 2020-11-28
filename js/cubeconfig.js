/**
 ** @author Ligang Wang, http://github.com/ligangwang/
 **/

class CubeConfig {
	constructor(){
		this.axisY = new THREE.Vector3(0, 1, 0);
		this.origin = new THREE.Vector3(0, 0, 0);

		//the fixed place holding for cubies
		this.cubiclePositions = [];

		this.cubiclePositions[sort("UFR")] = new THREE.Vector3(200,200,200);
		this.cubiclePositions[sort("ULF")] = new THREE.Vector3(-200,200,200);
		this.cubiclePositions[sort("URB")] = new THREE.Vector3(200,200,-200);
		this.cubiclePositions[sort("DRF")] = new THREE.Vector3(200,-200,200);
		this.cubiclePositions[sort("DFL")] = new THREE.Vector3(-200,-200,200);
		this.cubiclePositions[sort("UBL")] = new THREE.Vector3(-200,200,-200);
		this.cubiclePositions[sort("DBR")] = new THREE.Vector3(200,-200,-200);
		this.cubiclePositions[sort("DLB")] = new THREE.Vector3(-200,-200,-200);

		this.cubiclePositions[sort("UF")] = new THREE.Vector3(0,200,200);
		this.cubiclePositions[sort("UR")] = new THREE.Vector3(200,200,0);
		this.cubiclePositions[sort("UB")] = new THREE.Vector3(0,200,-200);
		this.cubiclePositions[sort("UL")] = new THREE.Vector3(-200,200,0);

		this.cubiclePositions[sort("FR")] = new THREE.Vector3(200,0,200);
		this.cubiclePositions[sort("BR")] = new THREE.Vector3(200,0,-200);
		this.cubiclePositions[sort("BL")] = new THREE.Vector3(-200,0,-200);
		this.cubiclePositions[sort("FL")] = new THREE.Vector3(-200,0,200);
		this.cubiclePositions[sort("DF")] = new THREE.Vector3(0,-200,200);
		this.cubiclePositions[sort("DR")] = new THREE.Vector3(200,-200,0);
		this.cubiclePositions[sort("DB")] = new THREE.Vector3(0,-200,-200);
		this.cubiclePositions[sort("DL")] = new THREE.Vector3(-200,-200,0);

		this.cubiclePositions["F"] = new THREE.Vector3(0,0,200);
		this.cubiclePositions["D"] = new THREE.Vector3(0,-200,0);
		this.cubiclePositions["B"] = new THREE.Vector3(0,0,-200);
		this.cubiclePositions["R"] = new THREE.Vector3(200,0,0);
		this.cubiclePositions["L"] = new THREE.Vector3(-200,0,0);
		this.cubiclePositions["U"] = new THREE.Vector3(0,200,0);


		this.facetConfigs = [];
		this.facetConfigs["R"] = {color:0xaa0000};
		this.facetConfigs["U"] = {color:0xdcdcdc};
		this.facetConfigs["F"] = {color:0x00aa00};
		this.facetConfigs["L"] = {color:0xff6600};
		this.facetConfigs["D"] = {color:0xffee00};
		this.facetConfigs["B"] = {color:0x0000aa};

		//facelet is the place to hold facet. (cubicle:facelet)=>(cubie:facet)
		this.faceletConfigs = [];
		this.faceletConfigs["R"] = {position:new THREE.Vector3(100, 0, 0)};
		this.faceletConfigs["U"] = {position:new THREE.Vector3(0, 100, 0)};
		this.faceletConfigs["F"] = {position:new THREE.Vector3(0, 0, 100)};
		this.faceletConfigs["L"] = {position:new THREE.Vector3(-100, 0, 0)};
		this.faceletConfigs["D"] = {position:new THREE.Vector3(0, -100, 0)};
		this.faceletConfigs["B"] = {position:new THREE.Vector3(0, 0, -100)};

		//regular rotation config (on folded state)
		this.rotationOnFoldedConfigs = [];
		this.rotationOnFoldedConfigs["R"] = 	{axis:new THREE.Vector3(1, 0, 0), angle: -Math.PI/2};
		this.rotationOnFoldedConfigs["U"] = 	{axis:new THREE.Vector3(0, 1, 0), angle: -Math.PI/2};
		this.rotationOnFoldedConfigs["F"] = 	{axis:new THREE.Vector3(0, 0, 1), angle: -Math.PI/2};
		this.rotationOnFoldedConfigs["L"] = 	{axis:new THREE.Vector3(-1, 0, 0), angle: -Math.PI/2};
		this.rotationOnFoldedConfigs["D"] = 	{axis:new THREE.Vector3(0, -1, 0), angle: -Math.PI/2};
		this.rotationOnFoldedConfigs["B"] = 	{axis:new THREE.Vector3(0, 0, -1), angle: -Math.PI/2};
		this.rotationOnFoldedConfigs["R'"] = {axis:new THREE.Vector3(1, 0, 0), angle: Math.PI/2};
		this.rotationOnFoldedConfigs["U'"] = {axis:new THREE.Vector3(0, 1, 0), angle: Math.PI/2};
		this.rotationOnFoldedConfigs["F'"] = {axis:new THREE.Vector3(0,	0,1), angle: Math.PI/2};
		this.rotationOnFoldedConfigs["L'"] = {axis:new THREE.Vector3(-1, 0, 0), angle: Math.PI/2};
		this.rotationOnFoldedConfigs["D'"] = {axis:new THREE.Vector3(0, -1, 0), angle: Math.PI/2};
		this.rotationOnFoldedConfigs["B'"] = {axis:new THREE.Vector3(0, 0, -1), angle: Math.PI/2};

		//config used for folding action
		this.facetFoldingConfig = [];
		this.facetFoldingConfig["R"] = [{translation: new THREE.Vector3(300, 300, 0), axis: new THREE.Vector3(0,0,1), angle:Math.PI/2}];
		this.facetFoldingConfig["L"] = [{translation: new THREE.Vector3(-300, 300, 0), axis: new THREE.Vector3(0,0,1), angle:-Math.PI/2}];
		this.facetFoldingConfig["B"] = [{translation: new THREE.Vector3(0, 300,  -300), axis: new THREE.Vector3(1,0,0), angle:Math.PI/2}];
		this.facetFoldingConfig["F"] = [{translation: new THREE.Vector3(0, 300, 300), axis: new THREE.Vector3(1,0,0), angle:-Math.PI/2}];
		this.facetFoldingConfig["D"] = [{translation: new THREE.Vector3(0, 300, -300), axis: new THREE.Vector3(1,0,0), angle:Math.PI/2},
										  {translation: new THREE.Vector3(0, -300, -300), axis:new THREE.Vector3(1,0,0), angle:Math.PI/2}];

		/*
		rotating on unfolded 2D surface
		 */
		this.rotationOnUnfoldedConfigs = [];
		this.rotationOnUnfoldedConfigs["U'"] = [{transformType: "rotater", facets: "UFRBL", origin:new THREE.Vector3(0, 0, 0),  angle: Math.PI/2}];
		this.rotationOnUnfoldedConfigs["U"] = [{transformType: "rotater", facets: "UFRBL", origin:new THREE.Vector3(0, 0, 0),  angle: -Math.PI/2}];
		this.rotationOnUnfoldedConfigs["D'"] = [
												{transformType: "rotater", facets: "D", origin:new THREE.Vector3(0, 0, -1200),angle: Math.PI/2},
												{transformType: "rotater", facets: "FRBL", origin:new THREE.Vector3(0, 0, 0), angle: -Math.PI/2},
												];
		this.rotationOnUnfoldedConfigs["D"] = [
												{transformType: "rotater", facets: "D", origin:new THREE.Vector3(0, 0, -1200),angle: -Math.PI/2},
												{transformType: "rotater", facets: "FRBL", origin:new THREE.Vector3(0, 0, 0), angle: Math.PI/2},
												];

		this.rotationOnUnfoldedConfigs["R'"] = [	{transformType: "rotater", facets: "R", origin:new THREE.Vector3(600, 0, 0), 	angle: Math.PI/2},
													{transformType: "translater", facets: "DBU", translation: new THREE.Vector3(0, 0, 600)},

													{transformType: "teleporter", cubicle: "DFR", facet: "F", outBound:new THREE.Vector3(0, 300, 900), inBound:new THREE.Vector3(0, 300, -1500), distance:600,  axis:AxisZ, outDirection:1, inDirection:1},
													{transformType: "teleporter", cubicle: "FR", facet: "F", outBound:new THREE.Vector3(0, 300, 900), inBound:new THREE.Vector3(0, 300, -1500), distance:600,  axis:AxisZ, outDirection:1, inDirection:1},
													{transformType: "teleporter", cubicle: "FRU", facet: "F", outBound:new THREE.Vector3(0, 300, 900), inBound:new THREE.Vector3(0, 300, -1500), distance:600,  axis:AxisZ, outDirection:1, inDirection:1},
												];
		this.rotationOnUnfoldedConfigs["R"] = [	{transformType: "rotater", facets: "R", origin:new THREE.Vector3(600, 0, 0), 	angle: -Math.PI/2},
													{transformType: "translater", facets: "FUB", translation: new THREE.Vector3(0, 0, -600)},
													{transformType: "teleporter", cubicle: "DFR", facet: "D", outBound:new THREE.Vector3(0, 300, -1500), inBound:new THREE.Vector3(0, 300, 900), distance:600,  axis:AxisZ, outDirection:-1, inDirection:-1},
													{transformType: "teleporter", cubicle: "DR", facet: "D", outBound:new THREE.Vector3(0, 300, -1500), inBound:new THREE.Vector3(0, 300, 900), distance:600,  axis:AxisZ, outDirection:-1, inDirection:-1},
													{transformType: "teleporter", cubicle: "BDR", facet: "D", outBound:new THREE.Vector3(0, 300, -1500), inBound:new THREE.Vector3(0, 300, 900), distance:600,  axis:AxisZ, outDirection:-1, inDirection:-1},
												];

		this.rotationOnUnfoldedConfigs["L'"] = [	{transformType: "rotater", facets: "L", origin:new THREE.Vector3(-600, 0, 0), 	angle:Math.PI/2},
													{transformType: "translater", facets: "FUB", translation: new THREE.Vector3(0, 0, -600)},
													{transformType: "teleporter", cubicle: "DFL", facet: "D", outBound:new THREE.Vector3(0, 300, -1500), inBound:new THREE.Vector3(0, 300, 900), distance:600,  axis:AxisZ, outDirection:-1, inDirection:-1},
													{transformType: "teleporter", cubicle: "DL", facet: "D", outBound:new THREE.Vector3(0, 300, -1500), inBound:new THREE.Vector3(0, 300, 900), distance:600,  axis:AxisZ, outDirection:-1, inDirection:-1},
													{transformType: "teleporter", cubicle: "BDL", facet: "D", outBound:new THREE.Vector3(0, 300, -1500), inBound:new THREE.Vector3(0, 300, 900), distance:600,  axis:AxisZ, outDirection:-1, inDirection:-1},
													];
		this.rotationOnUnfoldedConfigs["L"] = [	{transformType: "rotater", facets: "L", origin:new THREE.Vector3(-600, 0, 0), 	angle: -Math.PI/2},
													{transformType: "translater", facets: "DUB", translation: new THREE.Vector3(0, 0, 600)},
													{transformType: "teleporter", cubicle: "DFL", facet: "F", outBound:new THREE.Vector3(0, 300, 900), inBound:new THREE.Vector3(0, 300, -1500), distance:600,  axis:AxisZ, outDirection:1, inDirection:1},
													{transformType: "teleporter", cubicle: "FL", facet: "F", outBound:new THREE.Vector3(0, 300, 900), inBound:new THREE.Vector3(0, 300, -1500), distance:600,  axis:AxisZ, outDirection:1, inDirection:1},
													{transformType: "teleporter", cubicle: "FLU", facet: "F", outBound:new THREE.Vector3(0, 300, 900), inBound:new THREE.Vector3(0, 300, -1500), distance:600,  axis:AxisZ, outDirection:1, inDirection:1},
													];
		this.rotationOnUnfoldedConfigs["F'"] = [
													{transformType: "rotater", facets: "F", origin:new THREE.Vector3(0, 0, 600),	angle: Math.PI/2},
													{transformType: "translater", facets: "RU", translation: new THREE.Vector3(-600, 0, 0)},

													{transformType: "teleporter", cubicle: "DFL", facet: "L", outBound:new THREE.Vector3(-900, 300, 0), inBound:new THREE.Vector3(-300, 300, -1600), distance:600,  axis:AxisX, outDirection:-1, inDirection:1},
													{transformType: "teleporter", cubicle: "FL", facet: "L", outBound:new THREE.Vector3(-900, 300, 0), inBound:new THREE.Vector3(-300, 300, -1600), distance:600,  axis:AxisX, outDirection:-1, inDirection:1},
													{transformType: "teleporter", cubicle: "FLU", facet: "L", outBound:new THREE.Vector3(-900, 300, 0), inBound:new THREE.Vector3(-300, 300, -1600), distance:600,  axis:AxisX, outDirection:-1, inDirection:1},

													{transformType: "teleporter", cubicle: "DFR", facet: "D", outBound:new THREE.Vector3(300, 300, -1600), inBound:new THREE.Vector3(900, 300, 0), distance:600,  axis:AxisX, outDirection:1, inDirection:-1},
													{transformType: "teleporter", cubicle: "DF", facet: "D", outBound:new THREE.Vector3(300, 300, -1600), inBound:new THREE.Vector3(900, 300, 0), distance:600,  axis:AxisX, outDirection:1, inDirection:-1},
													{transformType: "teleporter", cubicle: "DFL", facet: "D", outBound:new THREE.Vector3(300, 300, -1600), inBound:new THREE.Vector3(900, 300, 0), distance:600,  axis:AxisX, outDirection:1, inDirection:-1},
													];
		this.rotationOnUnfoldedConfigs["F"] = [
													{transformType: "rotater", facets: "F", origin:new THREE.Vector3(0, 0, 600),angle: -Math.PI/2},
													{transformType: "translater", facets: "LU", translation: new THREE.Vector3(600, 0, 0)},

													{transformType: "teleporter", cubicle: "DFR", facet: "R", outBound:new THREE.Vector3(900, 300, 0), inBound:new THREE.Vector3(300, 300, -1600), distance:600,  axis:AxisX, outDirection:1, inDirection:-1},
													{transformType: "teleporter", cubicle: "FR", facet:  "R", outBound:new THREE.Vector3(900, 300, 0), inBound:new THREE.Vector3(300, 300, -1600), distance:600,  axis:AxisX, outDirection:1, inDirection:-1},
													{transformType: "teleporter", cubicle: "FRU", facet: "R", outBound:new THREE.Vector3(900, 300, 0), inBound:new THREE.Vector3(300, 300, -1600), distance:600,  axis:AxisX, outDirection:1, inDirection:-1},

													{transformType: "teleporter", cubicle: "DFL", facet: "D", outBound:new THREE.Vector3(-300, 300, -1600), inBound:new THREE.Vector3(-900, 300, 0), distance:600,  axis:AxisX, outDirection:-1, inDirection:1},
													{transformType: "teleporter", cubicle: "DF", facet: "D", outBound:new THREE.Vector3(-300, 300, -1600), inBound:new THREE.Vector3(-900, 300, 0), distance:600,  axis:AxisX, outDirection:-1, inDirection:1},
													{transformType: "teleporter", cubicle: "DFR", facet: "D", outBound:new THREE.Vector3(-300, 300, -1600), inBound:new THREE.Vector3(-900, 300, 0), distance:600,  axis:AxisX, outDirection:-1, inDirection:1},
													];

		this.rotationOnUnfoldedConfigs["B'"] = [
													{transformType: "rotater", facets: "B", origin:new THREE.Vector3(0, 0,  -600), 	angle: Math.PI/2},
													{transformType: "translater", facets: "LU", translation: new THREE.Vector3(600, 0, 0)},

													{transformType: "teleporter", cubicle: "BDR", facet: "R", outBound:new THREE.Vector3(900, 300, 0), inBound:new THREE.Vector3(300, 300, -800), distance:600,  axis:AxisX, outDirection:1, inDirection:-1},
													{transformType: "teleporter", cubicle: "BR", facet:  "R", outBound:new THREE.Vector3(900, 300, 0), inBound:new THREE.Vector3(300, 300, -800), distance:600,  axis:AxisX, outDirection:1, inDirection:-1},
													{transformType: "teleporter", cubicle: "BRU", facet: "R", outBound:new THREE.Vector3(900, 300, 0), inBound:new THREE.Vector3(300, 300, -800), distance:600,  axis:AxisX, outDirection:1, inDirection:-1},

													{transformType: "teleporter", cubicle: "BDL", facet: "D", outBound:new THREE.Vector3(-300, 300, -800), inBound:new THREE.Vector3(-900, 300, 0), distance:600,  axis:AxisX, outDirection:-1, inDirection:1},
													{transformType: "teleporter", cubicle: "BD", facet: "D", outBound:new THREE.Vector3(-300, 300, -800), inBound:new THREE.Vector3(-900, 300, 0), distance:600,  axis:AxisX, outDirection:-1, inDirection:1},
													{transformType: "teleporter", cubicle: "BDR", facet: "D", outBound:new THREE.Vector3(-300, 300, -800), inBound:new THREE.Vector3(-900, 300, 0), distance:600,  axis:AxisX, outDirection:-1, inDirection:1},
													];
		this.rotationOnUnfoldedConfigs["B"] = [
													{transformType: "rotater", facets: "B", origin:new THREE.Vector3(0, 0,  -600), 	angle: -Math.PI/2},
													{transformType: "translater", facets: "RU", translation: new THREE.Vector3(-600, 0, 0)},

													{transformType: "teleporter", cubicle: "BDL", facet: "L", outBound:new THREE.Vector3(-900, 300, 0), inBound:new THREE.Vector3(-300, 300, -800), distance:600,  axis:AxisX, outDirection:-1, inDirection:1},
													{transformType: "teleporter", cubicle: "BL", facet: "L", outBound:new THREE.Vector3(-900, 300, 0), inBound:new THREE.Vector3(-300, 300, -800), distance:600,  axis:AxisX, outDirection:-1, inDirection:1},
													{transformType: "teleporter", cubicle: "BLU", facet: "L", outBound:new THREE.Vector3(-900, 300, 0), inBound:new THREE.Vector3(-300, 300, -800), distance:600,  axis:AxisX, outDirection:-1, inDirection:1},

													{transformType: "teleporter", cubicle: "BDR", facet: "D", outBound:new THREE.Vector3(300, 300, -800), inBound:new THREE.Vector3(900, 300, 0), distance:600,  axis:AxisX, outDirection:1, inDirection:-1},
													{transformType: "teleporter", cubicle: "BD", facet: "D", outBound:new THREE.Vector3(300, 300, -800), inBound:new THREE.Vector3(900, 300, 0), distance:600,  axis:AxisX, outDirection:1, inDirection:-1},
													{transformType: "teleporter", cubicle: "BDL", facet: "D", outBound:new THREE.Vector3(300, 300, -800), inBound:new THREE.Vector3(900, 300, 0), distance:600,  axis:AxisX, outDirection:1, inDirection:-1},
													];
	}
}
