/* -----
    Productions.ts

    Outlines all necessary Productions to define the grammar for our language. All attributes of this file
    follow the same structure:
    
    Production Object = [Name, First: [Terminals], Follow: [Terminals], Inner: [Non-Terminals]]

----- */
var _Productions = [
    { name: "Program", first: [], follow: ["EOP"], inner: ["Block"] },
    { name: "Block", first: ["L_BRACE"], follow: ["R_BRACE"], inner: ["StatementList"] },
    { name: "StatementList", first: [], follow: [], inner: ["Statement", "StatementList"] },
    { name: "Statement", first: [], follow: [], inner: { /* TODO: Implement Peek() */} },
    { name: "PrintStatement", first: ["PRINT", "L_PARAN"], follow: ["R_PARAN"], inner: ["Expr"] },
    { name: "AssignmentStatement", first: ["ID", "ASSIGN_OP"], follow: [], inner: ["Expr"] },
    { name: "VarDecl", first: [], follow: [], inner: ["Type", "ID"] },
    { name: "WhileStatement", first: ["WHILE"], follow: [], inner: ["BooleanExpr", "Block"] },
    { name: "IfStatement", first: ["IF"], follow: [], inner: ["BooleanExpr", "Block"] },
    { name: "Expr", first: [], follow: [], inner: { /* TODO: Implement Peek() */} },
    { name: "IntExpr", first: ["DIGIT", "INT_OP"], follow: [], inner: ["Expr"] },
    { name: "StringExpr", first: ["QUOTE"], follow: ["QUOTE"], inner: ["CHARLIST"] },
    { name: "BooleanExpr", first: ["L_PARAN"], follow: ["R_PARAN"], inner: ["Expr", "BoolOp", "Expr"] },
    { name: "ID", first: ["ID"], follow: [], inner: [] },
    { name: "CharList", first: ["CHAR", "SPACE"], follow: [], inner: ["CharList"] },
    { name: "Type", first: ["INT", "STRING", "BOOLEAN"], follow: [], inner: [] },
    { name: "BoolOp", first: ["BOOL_OP"], follow: [], inner: [] },
    { name: "BoolVal", first: ["BOOL_VAL"], follow: [], inner: [] },
    { name: "IntOp", first: ["INT_OP"], follow: [], inner: [] }
];
