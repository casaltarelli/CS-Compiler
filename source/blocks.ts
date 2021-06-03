/* -----
    Blocks.ts

    Blocks is used to simulate Basic Blocks for each of the Essential Productions that we can find in our AST definition. 
    All attributes of the file follow the same structure:

    Production Object = {Name, Register, First, Final, Sequence}

    Register - Used to Determine what Register is needed to handle First Action
    First - Used to instruct Code Generation on how to allocate the first child that is expected.
    Final - Used to instruct Code Generation on how to allocate the Final Child or Flip Required Flags

    Within First & Final there is a potential attribute known as Allocate. 
        True    - Signifies for this action allocate generation to one our our Register Handlers. 
        False   - The First or Final is simple enough to be handled within the Basic Block.

----- */

var _Blocks = [
    { name: "VarDecl",              register: "Acc", first: {allocate: true, child: null, action: "Load"}, 
        final: {allocate: true, child: 1, action: "Store"}, },
    { name: "AssignmentStatement",  register: "Acc", first: {allocate: true, child: 1, action: "Load"}, 
        final: {allocate: true, child: 0, action: "Store"}},
    { name: "PrintStatement",       register: "YReg", first: {allocate: true, child: 0, action: "Load-print"}, 
        final: {allocate: false, generate: function() { _CodeGeneration.appendText("FF"); } }},
    { name: "IfStatement",          register: "XReg", first: {allocate: true, child: 0, action: "Compare"},
       final: {allocate: false, generate: function() { return }}},
    { name: "WhileStatement",       register: "XReg", first: {allocate: true, child: 0, action: "Compare"},
       final: {allocate: false, generate: function() { return }}}
];