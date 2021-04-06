/* -----
    Productions.ts

    Outlines all necessary Productions to define the grammar for our language. All attributes of this file 
    follow the same structure:
    
    Production Object = [Name, First: [Terminals], Follow: [Terminals], Inner: [Non-Terminals], Peek?, Ambiguous?]

    You will see among these Productions two additional optinal attributes [Peek & Ambiguous] these are used in situations
    where additional information is needed to define how that respective production should be treated.
     - Peek? = This Production contains ONLY inner-productions, so we need to peek ahead to determine which inner-production 
         should be chosen.
     - Ambiguous? = This Productions First Set is ambiguous, meaning if any of the expected non-terminals match our currentToken,
         that we have a successful match.

    All Sets are contained within Two-Dimensional Arrays to aid in determining which Production Rule to Follow.
    As you will see within Parse, the first thing we do is determine our Longest Match on our First Sets which tells us 
    what Rule to follow for Parsing Inner-Productions and Follow Sets

    e.g Parse("IntExpr"):
     - The first thing we do is look at the First Set(s) to determine which Production Rule we could be looking at
         - either [digit intop Expr] or [digit]
     - Based on the structure of these Productions we use inner to accomplish our Recursive Calls, we are able to determine 
       what Productions to call next based on the index of which First Set we satisfy or via the peek flag for some special 
       cases, which tells our Parser that we need to peek ahead to determine the correct production to follow.

----- */

var _Productions = [
    { name: "Program",              first: [],                      follow: [["EOP"]],      inner: [["Block"]] },
    { name: "Block",                first: [["L_BRACE"]],           follow: [["R_BRACE"]],  inner: [["StatementList"]], peek: true },
    { name: "StatementList",        first: [],                      follow: [],             inner: [["Statement", "StatementList"]], peek: true  }, // Peek

    { name: "Statement",            first: [],                      follow: [],      
            inner: [["Block", "PrintStatement", "WhileStatement", "IfStatement", "AssignmentStatement", "VarDecl"]], peek: true }, // Peek

    { name: "PrintStatement",       first: [["PRINT", "L_PARAN"]],  follow: [["R_PARAN"]],  inner: [["Expr"]] },
    { name: "AssignmentStatement",  first: [["ID", "ASSIGN_OP"]],   follow: [],             inner: [["Expr"]] },
    { name: "VarDecl",              first: [],                      follow: [],             inner: [["Type", "ID"]] },
    { name: "WhileStatement",       first: [["WHILE"]],             follow: [],             inner: [["BooleanExpr", "Block"]] },
    { name: "IfStatement",          first: [["IF"]],                follow: [],             inner: [["BooleanExpr", "Block"]] },

    { name: "Expr",                 first: [],                      follow: [],            
            inner: [["IntExpr", "StringExpr", "BooleanExpr", "ID"]], peek: true }, // Peek

    { name: "IntExpr",              first: [["DIGIT", "INT_OP"], ["DIGIT"]], follow: [],    inner: [["Expr"], []]},

    { name: "StringExpr",           first: [["QUOTE"]],             follow: [["QUOTE"]],    inner: [["CharList"]] },
    { name: "BooleanExpr",          first: [["L_PARAN"], ["BOOL_VAL"]], follow: [["R_PARAN"], []],inner: [["Expr", "BoolOp", "Expr"], []] },

    { name: "ID",                   first: [["ID"]],                follow: [],             inner: [] },
    { name: "CharList",             first: [["CHAR"], ["SPACE"]],     follow: [],             inner: [["CharList"], ["CharList"]], peek: true }, // Peek

    { name: "Type",                 first: [["INT", "STRING", "BOOLEAN"]], follow: [],      inner: [], ambiguous: true},
    { name: "BoolOp",               first: [["BOOL_OP"]],           follow: [],             inner: [] },
    { name: "BoolVal",              first: [["BOOL_VAL"]],          follow: [],             inner: [] },
    { name: "IntOp",                first: [["INT_OP"]],            follow: [],             inner: [] },

    { name: "DIGIT",                first: [["DIGIT"]],             follow: [],             inner: [] },
    { name: "CHAR",                 first: [["CHAR"]],              follow: [],             inner: [] },
    { name: "SPACE",                first: [["SPACE"]],             follow: [],             inner: [] }
]

// ["CHAR"], ["SPACE"]