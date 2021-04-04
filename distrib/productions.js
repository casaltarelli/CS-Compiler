/* -----
    Productions.ts

    Outlines all necessary Productions to define the grammar for our language. All attributes of this file
    follow the same structure:
    
    Production Object = [Name, First: [Terminals], Follow: [Terminals], Inner: [Non-Terminals], Peek?]

    All Sets are contained within Two-Dimensional Arrays to aid in determining which Production Rule to Follow.
    As you will see within Parse, the first thing we do is determine our Longest Match on our First Sets which tells us
    what Rule to follow for Parsing Inner-Productions and Follow Sets

    e.g Parse("IntExpr"):
     - The first thing we do is look at the First Set(s) to determine which Production Rule we could be looking at
         - either [digit intop Expr] or [digit]
     - Based on the structure of these Productions we use inner to accomplish our Recursive Calls, we are able to determine
       what Productions to call next based on the index of which First Set we satisfy

----- */
var _Productions = [
    { name: "Program", first: [], follow: [["EOP"]], inner: [["Block"]] },
    { name: "Block", first: [["L_BRACE"]], follow: [["R_BRACE"]], inner: [["StatementList"]] },
    { name: "StatementList", first: [], follow: [], inner: [["Statement", "StatementList"]], peek: true },
    { name: "Statement", first: [], follow: [],
        inner: [["PrintStatement", "AssignmentStatement", "VarDecl", "WhileStatement", "IfStatement"]], peek: true },
    { name: "PrintStatement", first: [["PRINT", "L_PARAN"]], follow: [["R_PARAN"]], inner: [["Expr"]] },
    { name: "AssignmentStatement", first: [["ID", "ASSIGN_OP"]], follow: [], inner: [["Expr"]] },
    { name: "VarDecl", first: [], follow: [], inner: [["Type", "ID"]] },
    { name: "WhileStatement", first: [["WHILE"]], follow: [], inner: [["BooleanExpr", "Block"]] },
    { name: "IfStatement", first: [["IF"]], follow: [], inner: [["BooleanExpr", "Block"]] },
    { name: "Expr", first: [], follow: [],
        inner: [["IntExpr", "StringExpr", "BooleanExpr", "ID"]], peek: true },
    { name: "IntExpr", first: [["DIGIT", "INT_OP"], ["DIGIT"]], follow: [], inner: [["Expr"], []] },
    { name: "StringExpr", first: [["QUOTE"]], follow: [["QUOTE"]], inner: [["CHARLIST"]] },
    { name: "BooleanExpr", first: [["L_PARAN"], ["BOOL_VAL"]], follow: [["R_PARAN"], []], inner: [["Expr", "BoolOp", "Expr"], []] },
    { name: "ID", first: [["ID"]], follow: [], inner: [] },
    { name: "CharList", first: [["CHAR"], ["SPACE"]], follow: [], inner: [["CharList"], ["CharList"]], peek: true },
    { name: "Type", first: [["INT", "STRING", "BOOLEAN"]], follow: [], inner: [] },
    { name: "BoolOp", first: [["BOOL_OP"]], follow: [], inner: [] },
    { name: "BoolVal", first: [["BOOL_VAL"]], follow: [], inner: [] },
    { name: "IntOp", first: [["INT_OP"]], follow: [], inner: [] },
    { name: "Digit", first: [["DIGIT"]], follow: [], inner: [] },
    { name: "Char", first: [["CHAR"]], follow: [], inner: [] },
    { name: "Space", first: [["SPACE"]], follow: [], inner: [] }
];
