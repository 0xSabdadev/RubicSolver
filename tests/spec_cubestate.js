describe("CubeState", function() {
  var solvedCubeState;
  var scrambledCubeState;
 beforeEach(function() {
    solvedCubeState = new CubeState(SINGMASTER_SOLVED_STATE);
  });

  it("should be able to return true when asked is solved state for singmaster solved notation", function() {
    expect(solvedCubeState.isSolved()).toEqual(true);
  });

  it("should solve the cube from any random positions", function(){
    //var init_state = "UR DF BR UL FU BU RD DL FR FL BD BL RFD LBD FLD BUR FUL RDB UBL UFR";
    //console.log(init_state.length);
    //new BottomupSolver(init_state).solve();
    for (var i=0;i<1;i++){
      scrambledCubeState = new CubeState(SINGMASTER_SOLVED_STATE);
      getRandomOps().forEach(x=>scrambledCubeState.rotate(x));
      var state = scrambledCubeState.getState();
      var solver = new BottomupSolver(state);
      expect(solver.solve()).not.toEqual([]);
    }
    //console.log(Array.from(Array(3).keys()));
  });


  it("should has valid position for solved position", function() {
    expect(isValidCubeState(SINGMASTER_SOLVED_STATE)).toEqual(true);
  });


  it("should has invalid position for the position having two cubies swapped", function() {
    //                         "UF UR UB UL DF DR DB DL FR FL BR BL UFR URB UBL ULF DRF DFL DLB DBR"
    expect(isValidCubeState("UR UF UB UL DF DR DB DL FR FL BR BL UFR URB UBL ULF DRF DFL DLB DBR")).toEqual(false);
  });

  it("should has valid position for the position having three cubies swapped", function() {
    //                         "UF UR UB UL DF DR DB DL FR FL BR BL UFR URB UBL ULF DRF DFL DLB DBR"
    expect(isValidCubeState("DL UR UB UL DF DR DB BR FR FL UF BL UFR URB UBL ULF DRF DFL DLB DBR")).toEqual(true);
  });

  it("should has invalid position for the position having one corner cubie twisted", function() {
    //                         "UF UR UB UL DF DR DB DL FR FL BR BL UFR URB UBL ULF DRF DFL DLB DBR"
    expect(isValidCubeState("UF UR UB UL DF DR DB DL FR FL BR BL UFR URB UBL ULF DRF DFL DLB BRD")).toEqual(false);
  });

  it("should has invalid position for the position having one edge cubie twisted", function() {
    //                         "UF UR UB UL DF DR DB DL FR FL BR BL UFR URB UBL ULF DRF DFL DLB DBR"
    expect(isValidCubeState("FU UR UB UL DF DR DB DL FR FL BR BL UFR URB UBL ULF DRF DFL DLB DBR")).toEqual(false);
  });

  it("test", function(){
    expect("esd".indexOf("d")).toEqual(2);
  });

  it("should has valid state from any 100 random positions", function(){
    //var init_state = "UR DF BR UL FU BU RD DL FR FL BD BL RFD LBD FLD BUR FUL RDB UBL UFR";
    for (var i=0;i<100;i++){
      scrambledCubeState = new CubeState(SINGMASTER_SOLVED_STATE);
      getRandomOps().forEach(x=>scrambledCubeState.rotate(x));
      var state = scrambledCubeState.getState();
      //console.log("valid state: ", state);
      expect(isValidCubeState(state)).toEqual(true);
    }
    //console.log(Array.from(Array(3).keys()));
  });
});
