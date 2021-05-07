/* -----
    SemanticAnalysis.ts

    The Semantic Analyzer is used to generate an Abstract Syntax Tree from our Concrete Syntax Tree that was created in Parse.
    Once our AST has been generated, we then execute a pre-order traversal to find any warnings/errors for Semantic Analysis.

----- */
var CSCompiler;
(function (CSCompiler) {
    var SemanticAnalyzer = /** @class */ (function () {
        function SemanticAnalyzer(cst, operators, scope, warnings, errors, ast, symbolTable, analyzing) {
            if (cst === void 0) { cst = null; }
            if (operators === void 0) { operators = null; }
            if (scope === void 0) { scope = -1; }
            if (warnings === void 0) { warnings = []; }
            if (errors === void 0) { errors = []; }
            if (ast === void 0) { ast = null; }
            if (symbolTable === void 0) { symbolTable = null; }
            if (analyzing === void 0) { analyzing = true; }
            this.cst = cst;
            this.operators = operators;
            this.scope = scope;
            this.warnings = warnings;
            this.errors = errors;
            this.ast = ast;
            this.symbolTable = symbolTable;
            this.analyzing = analyzing;
        }
        SemanticAnalyzer.prototype.init = function (cst) {
            // Announce Parser
            _Log.output({ level: "INFO", data: "Starting Semantic Analysis..." });
            // Default Attributes
            this.cst = cst;
            this.scope = -1;
            this.warnings = [];
            this.errors = [];
            this.ast = new CSCompiler.Tree();
            this.symbolTable = new CSCompiler.Tree();
            this.analyzing = true;
            // Productions Lists
            this.operators = _Productions.filter(function (op) { return op.name.indexOf("Op") !== -1 || op.name.indexOf("OP") !== -1; });
        };
        /**
         * build(node)
         * - Build is the primary driver for creating our
         *   AST definition, while simutaneously defining our
         *   Symbol Table for the program.
         */
        SemanticAnalyzer.prototype.build = function (node) {
            var essentialFlag = false;
            var operationFlag = false;
            console.log("-------------------------");
            console.log("BUILD: Current Node: " + node.name);
            // Update Visited Flag on Node 
            node.visited = true;
            // Get Production Reference 
            var production = _Productions.filter(function (production) { return production.name == node.name; })[0];
            // Check if current Node is an Essential Production
            if (production.essential) {
                // Update Essential Flag
                essentialFlag = true;
                // Check if Node has Operator Child [Expr Special Case]
                var operationIndex = 0;
                for (var i = 0; i < node.children.length; i++) {
                    if ((this.operators.map(function (o) { return o.name; }).indexOf(node.children[i].name) > -1)) {
                        operationFlag = true;
                        operationIndex = i;
                        //console.log("BUILD: Operation Production Found!");
                    }
                }
                if (!(operationFlag)) {
                    // Add Node to AST Definition
                    this.ast.addNode("Non-Terminal", node.name, { line: node.data.line, col: node.data.col });
                    //console.log("BUILD: Production Node Created in AST: " + node.name);
                    // Check for Node "Block" -- Update Symbol Table Scope
                    if (node.name == "Block") {
                        //console.log("BUILD: Created New Symbol Table Child!");
                        this.scope++;
                        this.symbolTable.addTableNode(this.scope);
                    }
                }
                // Check if Production requires us to collect Terminal(s) or SubTree
                if (production.seek) {
                    if (operationFlag) {
                        //console.log("BUILD: Entering SeekTree");
                        this.seekTree(node, operationIndex);
                    }
                    else {
                        //console.log("BUILD: Entering SeekTerminal");
                        var set = this.seekTerminal(node, [], true);
                        // console.log("BUILD: Set Returned from SeekTerminal: ");
                        // for (var s in set) {
                        //     console.log(" - " + set[s].name);
                        // }
                        // Collect Non-Terminals Collected -- Check Set for Quote Instance [String]
                        var stringIndex = null;
                        out: for (var terminal in set) {
                            if (set[terminal].name != "\"") {
                                // Add Terminal to AST
                                this.ast.addNode("Terminal", set[terminal].name, { line: set[terminal].data.line, col: set[terminal].data.col });
                                //console.log("BUILD: Terminal Symbol added to AST: " + set[terminal].name);
                            }
                            else {
                                stringIndex = terminal;
                                break out;
                            }
                        }
                        // Check if String Found
                        if (stringIndex != null) {
                            // Collect Accurate Location for new Single Node
                            var line = set[stringIndex].data.line;
                            var col = set[stringIndex].data.col;
                            // Combine Set to Single Node [CharList Case]
                            set = set.map(function (n) { return n.name; }).join("");
                            // Add Terminal to AST Defintion
                            this.ast.addNode("Terminal", set.substring(stringIndex), { line: line, col: col });
                            //console.log("BUILD: Terminal Symbol added to AST: " + set.substring(stringIndex));
                        }
                    }
                }
            }
            // Proceed to Children for current Node
            for (var child in node.children) {
                if (node.children[child].type == "Non-Terminal" && !(node.children[child].visited)) {
                    //console.log("BUILD: Call for Non-Terminal " + node.children[child].name);
                    this.build(node.children[child]);
                }
            }
            // If Essential Production found ascendTree on our AST
            if (essentialFlag) {
                // Ascend to Parent Table
                if (node.name == "Block") {
                    this.symbolTable.ascendTable();
                    //console.log("BUILD: Ascended Symbol Table to Parent!");
                }
                else {
                    // Analyze our AST for Symbol Table Updates
                    this.analyze(this.ast.current);
                }
                this.ast.ascendTree();
            }
        };
        /**
         * seekTerminal(node, set, first?)
         * - seekTerminal has the ability to traverse through our
         *   CST definition from Parse and collect all Terminal Nodes
         *   under the node given from our CST.
         */
        SemanticAnalyzer.prototype.seekTerminal = function (node, set, first) {
            // First is used to avoid collecting Terminals that are a direct child of the Essential Production
            if (first) {
                for (var child in node.children) {
                    if (node.children[child].type == "Non-Terminal" && !(node.children[child].visited)) {
                        //console.log("SEEKTERMINAL: FIRST Non-Terminal Found: " + node.children[child].name);
                        set.push(this.seekTerminal(node.children[child], set));
                    }
                }
            }
            else {
                // We are already past the first set of children, collect all Terminal Nodes found
                for (var child in node.children) {
                    if (node.children[child].type == "Non-Terminal" && !(node.children[child].visted)) {
                        //console.log("SEEKTERMINAL: Non-Terminal Found: " + node.children[child].name);
                        // Validate Child(s) Production doesn't contain Operator Child
                        var operatorFlag = false;
                        for (var c in node.children[child].children) {
                            if ((this.operators.map(function (o) { return o.name; }).indexOf(node.children[child].children[c].name) > -1)) {
                                operatorFlag = true;
                                //console.log("SEEKTERMIAL: Operator Child for " + node.children[child].children[c].name)
                            }
                        }
                        if (!(operatorFlag)) {
                            //console.log("SEEKTERMINAL: SeekTerminal on Non-Terminal Found: " + node.children[child].name);
                            //console.log("SEEKTERMINAL: Node marked as visited " + node.name);
                            node.visited = true;
                            set.push(this.seekTerminal(node.children[child], set));
                        }
                    }
                    else if (!(node.children[child].visited)) {
                        //console.log("SEEKTERMINAL: Push Terminal Found: " + node.children[child].name);
                        //console.log("SEEKTERMINAL: Node marked as visited " + node.name);
                        node.visited = true;
                        set.push(node.children[child]);
                    }
                }
            }
            // Clean Set of Undefined Elements
            set = set.filter(function (s) { return s.name != undefined; });
            return set;
        };
        /**
         * seekTree(node, index)
         * - seekTree is used when an Essential Production has a
         *   child Node that is an Operator (BoolOp or IntOp). When recognized,
         *   this method creates the correct subtree for representing the
         *   Operator subtree and adds it to our AST Definiton.
         */
        SemanticAnalyzer.prototype.seekTree = function (node, index) {
            // Get Operator for Root Node of Subtree + Update Visited Flag
            //console.log("SEEKTREE: Node marked as visited " + node.children[index].name);
            node.children[index].visited = true;
            var root = node.children[index].children[0]; // Get Value of Operator
            // Add Root to Current AST Definition
            this.ast.addNode("Non-Terminal", root.name, { line: root.data.line, col: root.data.col });
            //console.log("SEEKTREE: Non-Terminal added to AST Definition: " + root.name);
            // Collect Terminals
            for (var child in node.children) {
                if (node.children[child].name != root.name) {
                    //console.log("SEEKTREE: Current Child [" + node.children[child].name + "] Visited Marked as " + node.children[child].visited);
                    if (node.children[child].type == "Non-Terminal" && !(node.children[child].visited)) {
                        // Update Visited Flag + Seek Terminal Children (it's not as creepy as it sounds)
                        // node.children[child].visited = true;
                        //console.log("SEEKTREE: Non-Terminal Child [" + node.children[child].name + "] marked as visited");
                        var set;
                        if (node.children[child].children.length > 1) {
                            //console.log("SEEKTREE: Entering SeekTerminal [First]")
                            set = this.seekTerminal(node.children[child], [], true);
                        }
                        else {
                            //console.log("SEEKTREE: Entering SeekTerminal");
                            set = this.seekTerminal(node.children[child], []);
                        }
                        //console.log("SEEKTREE: Set Returned from SeekTerminal:");
                        for (var s in set) {
                            console.log("   -  " + set[s].name);
                        }
                        var stringIndex = null;
                        out: for (var terminal in set) {
                            //console.log("BUILD: Terminal Symbol added to AST: " + set[terminal].name);
                            if (set[terminal].name != "\"") {
                                this.ast.addNode("Terminal", set[terminal].name, { line: set[terminal].data.line, col: set[terminal].data.col });
                            }
                            else {
                                stringIndex = terminal;
                                break out;
                            }
                        }
                        if (stringIndex != null) {
                            // Collect Accurate Location for new Single Node
                            var line = set[stringIndex].data.line;
                            var col = set[stringIndex].data.col;
                            // Combine Set to Single Node [CharList Case]
                            set = set.map(function (n) { return n.name; }).join("");
                            // Add Terminal to AST Defintion
                            this.ast.addNode("Terminal", set.substring(stringIndex), { line: line, col: col });
                        }
                    }
                }
            }
        };
        /**
         * analyze(node) : Boolean
         * - Analyze will be used to update our SymbolTable
         *   based on the AST Node given. Will return a
         *   Boolean flag symbolizing success or fail.
         */
        SemanticAnalyzer.prototype.analyze = function (node, type) {
            console.log("ANALUZE: Current Scope " + this.symbolTable.current.scope);
            console.log("ANALYZE: Current Node " + node.name);
            for (var n in node.children) {
                console.log("ANALYZE: Children [Child]: " + node.children[n].name);
            }
            var valid = false;
            // Update our Symbol Table based on Node
            switch (node.name) {
                case "VarDecl":
                    console.log("ANALYZE: Entering VarDecl");
                    // Get Type + Identifier
                    var type = node.children[0];
                    var id = node.children[1];
                    // Create Identifier Entry
                    var status = this.symbolTable.current.table.set(id.name);
                    if (status) {
                        // Get ID Reference
                        var reference = this.symbolTable.current.table.get(id.name);
                        // Update Type + Declared Attribute
                        reference.type = type.name;
                        reference.declared = { status: true, line: type.data.line, col: type.data.col };
                        // Announce Symbol Table Entry
                        this.emitEntry("DECL", id.name, { type: type.name, line: type.data.line, col: type.data.col });
                        // Update Valid Flag
                        valid = true;
                    }
                    else {
                        // EmitError for Redeclared ID
                        this.emitError("REDECLARED", id.name, { line: id.data.line, col: id.data.col });
                    }
                    break;
                case "AssignmentStatement":
                    console.log("ANALYZE: Entering Assignment Statement");
                    // Get ID + Expr
                    var id = node.children[0];
                    var expr = node.children[1];
                    console.log("Expr is set to [" + node.children[1].name + "]");
                    // Get ID Reference in SymbolTable
                    var reference = this.symbolTable.current.table.get(id.name);
                    console.log("ANALYZE: Reference value returned after SymbolTable GET " + JSON.stringify(reference));
                    if (reference == -1) {
                        while (this.symbolTable.current.parent != null && tempReference == -1) {
                            tempReference = this.symbolTable.current.parent.table.get(expr.name);
                        }
                    }
                    if (reference != -1) {
                        console.log("Reference found in SymbolTable");
                        // Verify Decleration of ID
                        if (reference.declared.status == true) {
                            // Check for Inner-Operator instance
                            if (!(expr.children.length)) {
                                console.log("Found Expr doesn't contain Operator Node!" + expr.name);
                                // Check if Expr is ID
                                var exprType = this.getType(expr);
                                if (exprType == "id") {
                                    // Get ID Reference
                                    var tempReference = this.symbolTable.current.table.get(expr.name);
                                    // Check Parent(s) for ID if not found in Current
                                    if (tempReference == -1) {
                                        while (this.symbolTable.current.parent != null && tempReference == -1) {
                                            tempReference = this.symbolTable.current.parent.table.get(expr.name);
                                        }
                                    }
                                    if (tempReference != -1) {
                                        // Check Decleration Attribute
                                        if (tempReference.declared.status == true) {
                                            // Validate Types
                                            if (reference.type == tempReference.type) {
                                                // Push Initalized Instance for Assignment
                                                // Push New Init Attribute for ID + EmitEntry 
                                                reference.initalized.push({ line: id.data.line, col: id.data.col });
                                                this.emitEntry("INIT", id.name, { type: reference.type,
                                                    line: id.data.line,
                                                    col: id.data.col });
                                                // Push New Used Attribute for ID + EmitEntry 
                                                tempReference.used.push({ line: expr.data.line, col: expr.data.col });
                                                this.emitEntry("USED", expr.name, { action: "Assignment", line: expr.data.line, col: expr.data.col });
                                            }
                                            else {
                                                // EmitError for Type Mismatch
                                                this.emitError("ASSIGNMENT", id.name, { type: reference.type, line: id.data.line, col: id.data.col });
                                            }
                                        }
                                        else {
                                            // EmitError for Unintialized 
                                            this.emitError("UNDECLARED", expr.name, { line: expr.data.line, col: expr.data.col });
                                        }
                                    }
                                    else {
                                        // EmitError for Unintialized 
                                        this.emitError("UNDECLARED", expr.name, { line: expr.data.line, col: expr.data.col });
                                    }
                                }
                                else {
                                    // Validate Types
                                    if (reference.type != exprType) {
                                        // EmitError for Type Mismatch
                                        this.emitError("ASSIGNMENT", id.name, { type: reference.type, line: id.data.line, col: id.data.col });
                                    }
                                    else {
                                        // Push New Init Attribute for ID + EmitEntry 
                                        reference.initalized.push({ line: id.data.line, col: id.data.col });
                                        this.emitEntry("INIT", id.name, { type: reference.type,
                                            line: id.data.line,
                                            col: id.data.col });
                                    }
                                }
                            }
                            else {
                                console.log("Children realized for " + expr.name);
                                if ((expr.name == "==" || expr.name == "!=") && "boolean" == reference.type) {
                                    // EmitEntry for Valid Type Assignment
                                    this.emitEntry("INIT", id.name, { type: reference.type,
                                        line: id.data.line,
                                        col: id.data.col });
                                }
                                else if (this.getType(expr.children[0]) == reference.type) {
                                    // EmitEntry for Valid Type Assignment
                                    this.emitEntry("INIT", id.name, { type: reference.type,
                                        line: id.data.line,
                                        col: id.data.col });
                                }
                                else {
                                    // EmitError for Invalid Type Assignment
                                    this.emitError("ASSIGNMENT", id.name, { type: reference.type,
                                        line: id.data.line, col: id.data.col });
                                }
                            }
                        }
                        else {
                            // EmitError for Undeclared ID
                            this.emitError("UNDECLARED", id.name, { line: id.data.line, col: id.data.col });
                        }
                    }
                    else {
                        // EmitError for Undeclared ID
                        this.emitError("UNDECLARED", id.name, { line: id.data.line, col: id.data.col });
                    }
                    break;
                case "PrintStatement":
                    // Check if Child Node is ID
                    if (this.getType(node.children[0]) == "id") {
                        // Get Reference
                        var reference = this.symbolTable.current.table.get(node.children[0].name);
                        // Check Parent(s) for ID if not found in Current
                        if (reference == -1) {
                            while (this.symbolTable.current.parent != null && reference == -1) {
                                reference = this.symbolTable.current.parent.table.get(node.children[0].name);
                            }
                        }
                        if (reference != -1) {
                            // Verify Decleration of ID
                            if (reference.declared.status == true) {
                                // Check Initalized Attribute of ID
                                if (reference.initalized.length) {
                                    // Update Used Attribute + EmitEntry
                                    reference.used.push({ line: node.children[0].data.line, col: node.children[0].data.col });
                                    this.emitEntry("USED", node.children[0].name, { action: "Print", line: node.children[0].data.line, col: node.children[0].data.col });
                                }
                                else {
                                    // EmitWarning Use of Unintalized Value
                                    this.emitWarning("UNINITALIZED", node.children[0].name, { line: node.children[0].data.line, col: node.children[0].data.col });
                                }
                            }
                            else {
                                // EmitError for Use of Undeclared ID
                                this.emitError("UNDECLARED", node.children[0].name, { line: node.children[0].data.line, col: node.children[0].data.col });
                            }
                        }
                        else {
                            // EmitError for Use of Undeclared ID
                            this.emitError("UNDECLARED", node.children[0].name, { line: node.children[0].data.line, col: node.children[0].data.col });
                        }
                    }
                    break;
                case "==":
                case "!=": // Utilize Waterfall for Operators
                case "+":
                    console.log("ANALYZE: Entering Operator");
                    // Get Exprs
                    var exprs = [node.children[0], node.children[1]];
                    var types = [];
                    // Get Types for Exprs
                    for (var e in exprs) {
                        console.log("ANALYZE: Operator - Current Expr [" + exprs[e].name + "]");
                        console.log("ANALYZE: Operator - Result of Children [" + exprs[e].children + "]");
                        // Check if Expr is Inner-Operator instance
                        if (!(exprs[e].children.length)) {
                            console.log("Recognized Empty List");
                            console.log("Result of Expr Reference [" + exprs[e].name + "]");
                            // Get Type
                            var tempType = this.getType(exprs[e]);
                            if (tempType == "id") {
                                // Get ID Reference
                                var reference = this.symbolTable.current.table.get(exprs[e].name);
                                // Check Parent(s) for ID if not found in Current
                                if (reference == -1) {
                                    while (this.symbolTable.current.parent != null && reference == -1) {
                                        reference = this.symbolTable.current.parent.table.get(expr[e].name);
                                    }
                                }
                                // Validate Reference
                                if (reference != -1) {
                                    // Check Decleration Attribute
                                    if (reference.declared.status == true) {
                                        // Add ID type to Types
                                        types.push(reference.type);
                                        // Update Used Attribute for ID + EmitEntry
                                        reference.used.push({ line: exprs[e].data.line, col: exprs[e].data.col });
                                        this.emitEntry("USED", exprs[e].name, { action: "Operation", line: exprs[e].data.line, col: exprs[e].data.col });
                                    }
                                    else {
                                        // EmitError for Undeclared ID
                                        this.emitError("UNDECLARED", exprs[e].name, { line: exprs[e].data.line, col: exprs[e].data.col });
                                    }
                                }
                                else {
                                    // EmitError for Undeclared ID
                                    this.emitError("UNDECLARED", exprs[e].name, { line: exprs[e].data.line, col: exprs[e].data.col });
                                }
                            }
                            else {
                                // Add Type to Types
                                types.push(this.getType(exprs[e]));
                            }
                        }
                        else {
                            // Check for Boolean Operator -- Override Type on Child Type
                            if (exprs[e].name == "==" || exprs[e].name == "!=") {
                                console.log("Recognized Parent Operator " + exprs[e].name);
                                types.push("boolean");
                            }
                            else if (this.getType(exprs[e].children[0]) == "id") {
                                // Get ID Reference
                                var tempReference = this.symbolTable.current.table.get(exprs[e].children[0].name);
                                // Check Parent(s) for ID if not found in Current
                                if (tempReference == -1) {
                                    while (this.symbolTable.current.parent != null && tempReference == -1) {
                                        tempReference = this.symbolTable.current.parent.table.get(expr[e].children[0].name);
                                    }
                                }
                                if (tempReference != -1) {
                                    // Update Used Attribute for Type + Push Type to Types
                                    tempReference.used.push({ line: exprs[e].data.line, col: exprs[e].data.col });
                                    this.emitEntry("USED", tempReference.name, { action: "Operation", line: exprs[e].data.line, col: exprs[e].data.col });
                                }
                                else {
                                    // EmitError for Undeclared ID
                                    this.emitError("UNDECLARED", exprs[e].name, { line: exprs[e].data.line, col: exprs[e].data.col });
                                }
                            }
                            else {
                                // Add Type to Types
                                types.push(this.getType(exprs[e].children[0]));
                            }
                        }
                    }
                    console.log("OPERATOR: Types Found");
                    for (var t in types) {
                        console.log(" - " + types[t]);
                    }
                    // Compare Types for Operation
                    if (types[0] != types[1]) {
                        console.log("Types did not equal");
                        // EmitError for Operator Type Mismatch
                        this.emitError("OPERATOR", exprs[0].name, { line: exprs[0].data.line, col: exprs[0].data.col });
                    }
                    break;
                default:
                    break;
            }
            return valid;
        };
        /**
         * getType(node)
         * - GetType is used to find the proper data type
         *   based on the node given. Can recognize Boolean,
         *   String, Digit, and ID
         */
        SemanticAnalyzer.prototype.getType = function (node) {
            console.log("GETTYPE: Getting for " + node.name);
            //var type = "";
            if (!isNaN(node.name)) {
                console.log("Int Recognized for " + node.name);
                return "int";
            }
            else {
                if (node.name.indexOf('"') > -1) {
                    console.log("String Recognized for " + node.name);
                    return "string";
                }
                else if (node.name.length == 1) {
                    console.log("ID Recognized for " + node.name);
                    return "id";
                }
                else if (node.name == "true" || node.name == "false" || node.parent.name == "!=" || node.parent.name == "==") {
                    console.log("Boolean Recognized for " + node.name);
                    return "boolean";
                }
                else {
                    return -1;
                }
            }
            //return type;
        };
        SemanticAnalyzer.prototype.emitEntry = function (type, name, info) {
            var data;
            switch (type) {
                case "DECL":
                    data = "Variable Decleration [ " + name + " ] of type [ " + info.type + " ] on line: " + info.line + " on col: " + info.col;
                    break;
                case "INIT":
                    data = "Variable Assignment [ " + name + " ] of type [ " + info.type + " ] matches assignment of type [ " + info.type + " ] on line: " + info.line + " on col: " + info.col;
                    break;
                case "USED":
                    data = "Variable Used [ " + name + " ] for [ " + info.action + " ] on line: " + info.line + " col: " + info.col;
                    break;
                default:
                    break;
            }
            // Output Symbol Table Entry to User
            _Log.output({ level: "DEBUG", data: data });
        };
        /**
         * emitWarning(type, name, info)
         * - EmitWarning handles the creation of our Warning Entry
         *   and generating our message object for Log Output.
         */
        SemanticAnalyzer.prototype.emitWarning = function (type, name, info) {
            var data;
            // Format Message Data Based on Type
            switch (type) {
                case "UNINITALIZED":
                    data = "Variable Used before initalization [ " + name + " ] on line: " + info.line + " col: " + info.col;
                    break;
                case "UNUSED-DEC":
                    data = "Variable Declared but never used [ " + name + " ] on line: " + info.line + " col: " + info.col;
                    break;
                case "UNUSED-INIT":
                    data = "Variable Initalized but never used [ " + name + " ] on line: " + info.line + " col: " + info.col;
                    break;
                default:
                    break;
            }
            // Update Warning List + Output to User
            this.warnings.push({ type: type, name: name, line: info.line, col: info.col });
            _Log.output({ level: "WARN", data: data });
        };
        /**
         * emitError(type, name, info)
         * - EmitError handles the creation of our Error Entry and
         *   generating our message object for Log Output.
         */
        SemanticAnalyzer.prototype.emitError = function (type, name, info) {
            var data;
            // Format Message Date Based on Type
            switch (type) {
                case "REDECLARED":
                    data = "Variable Redecleration [ " + name + " ] on line: " + info.line + " col: " + info.col;
                    break;
                case "UNDECLARED":
                    data = "Variable not declared before use [ " + name + " ] on line: " + info.line + " col: " + info.col;
                    break;
                case "ASSIGNMENT":
                    data = "Assignment Type Mismatch on [ " + name + " ] type [ " + info.type + " ] on line: " + info.line + " col: " + info.col;
                    break;
                case "OPERATOR":
                    data = "Operator Type Mismatch on  [ " + name + " ] on line " + info.line + " col " + info.col;
                    break;
                default:
                    break;
            }
            // Update Error List + Output to User
            this.errors.push({ type: type, name: name, line: info.line, col: info.col });
            _Log.output({ level: "ERROR", data: data });
        };
        /**
         * scan(node)
         * - Scan is used to find any warnings that we need
         *   to notify to our User. This is the final step
         *   of Semantic Analysis. Starts at Root.
         */
        SemanticAnalyzer.prototype.scan = function (node) {
            // Get Table Reference for Node
            var table = node.table;
            console.log("Scan Current Table " + table);
            for (var i = 0; i < table.keys.length; i++) {
                // Get Direct Reference to Table Entry Values
                var entry = table.values[i];
                if (entry.declared.status == true && entry.initalized.length > 1 && entry.used.length < 1) {
                    // EmitWarning for Initalized but Unused Identifier + Update Warnings List
                    this.emitWarning("UNUSED-INIT", table.keys[i], { line: entry.declared.line, col: entry.declared.col });
                }
                else if (entry.declared.status = true && entry.used.length < 1) {
                    // EmitWarning for Undeclared Identifier + Update Warnings List
                    this.emitWarning("UNUSED-DEC", table.keys[i], { line: entry.declared.line, col: entry.declared.col });
                }
            }
            if (node.children != 0) {
                for (var child in node.children) {
                    this.scan(node.children[child]);
                }
            }
        };
        return SemanticAnalyzer;
    }());
    CSCompiler.SemanticAnalyzer = SemanticAnalyzer;
})(CSCompiler || (CSCompiler = {}));
