/* -----
    Blocks.ts

    Blocks is used to simulate Basic Blocks for each of the Essential Productions that we can find in our AST definition. 
    All attributes of the file follow the same structure:

    Production Object = {Name, Register, First, Final}

    Register - Used to Determine what Register is needed to handle First Action
    First - Used to instruct Code Generation on how to allocate the first child that is expected.
    Final - Used to instruct Code Generation on how to allocate the Final Child or Flip Required Flags

----- */

var _Blocks = [
    {name: "VarDecl", register: "Acc", first: {child: null, action: "load"},
    final: {child: 1, action: "store"}},

    {name: "AssignmentStatement", register: "Acc", first: {child: 1, action: "load"}, final: {child: 1, action: "store"}},

    {name: "PrintStatement", register: "YReg", first: {child: 0, action: "load-print"}, final: {
        // TODO: Implement appendText
    }},

]