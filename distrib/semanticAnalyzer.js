/* -----
    SemanticAnalysis.ts

    The Semantic Analyzer is used to generate an Abstract Syntax Tree from our Concrete Syntax Tree that was created in Parse.
    Once our AST has been generated, we then execute a pre-order traversal to find any warnings/errors for Semantic Analysis.

----- */
var CSCompiler;
(function (CSCompiler) {
    var SemanticAnalyzer = /** @class */ (function () {
        function SemanticAnalyzer(cst, operators, scope, warnings, errors, ast, symbolTable) {
            if (cst === void 0) { cst = null; }
            if (operators === void 0) { operators = null; }
            if (scope === void 0) { scope = -1; }
            if (warnings === void 0) { warnings = []; }
            if (errors === void 0) { errors = []; }
            if (ast === void 0) { ast = null; }
            if (symbolTable === void 0) { symbolTable = null; }
            this.cst = cst;
            this.operators = operators;
            this.scope = scope;
            this.warnings = warnings;
            this.errors = errors;
            this.ast = ast;
            this.symbolTable = symbolTable;
        }
        SemanticAnalyzer.prototype.init = function (cst) {
            // Announce Parser
            _Log.output({ level: "INFO", data: "Starting Semantic Analysis..." });
            // Default Attributes
            this.cst = cst;
            this.scope = 0;
            this.warnings = [];
            this.errors = [];
            this.ast = new CSCompiler.Tree();
            this.symbolTable = new CSCompiler.Tree();
            // Productions Lists
            this.operators = _Productions.filter(function (op) { return op.name.indexOf("Op") !== -1; });
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
            // Update Visited Flag 
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
                    if (this.operators.map(function (o) { return o.name; }).indexOf(node.children[i].name) > -1) {
                        operationFlag = true;
                        operationIndex = i;
                    }
                }
                if (!(operationFlag)) {
                    // Add Node to AST Definition + Update Visited Flag
                    node.visited = true;
                    this.ast.addNode("Non-Terminal", node.name, { line: node.data.line, col: node.data.col });
                    // Check for Node "Block" -- Update Symbol Table Scope
                    if (node.name == "Block") {
                        this.scope++;
                        this.symbolTable.addTableNode(this.scope);
                    }
                }
                // Check if Production requires us to collect Terminal(s) or SubTree
                if (production.seek) {
                    if (operationFlag) {
                        this.seekTree(node, operationIndex);
                    }
                    else {
                        var set = this.seekTerminal(node, [], true);
                        if (production.seek == "Child") {
                            // Collect Accurate Location for new Single Node
                            var line = set[0].data.line;
                            var col = set[0].data.col;
                            // Combine Set to Single Node [CharList Case]
                            set = set.map(function (n) { return n.name; }).join("");
                            // Add Terminal to AST Defintion
                            this.ast.addNode("Terminal", set, { line: line, col: col });
                        }
                        else {
                            for (var terminal in set) {
                                this.ast.addNode("Terminal", set[terminal].name, { line: set[terminal].data.line, col: set[terminal].data.col });
                            }
                        }
                    }
                    // Analyze our AST for Symbol Table Updates
                    this.analyze(this.ast.current);
                }
            }
            // Proceed to Children for current Node
            for (var child in node.children) {
                if (node.children[child].type == "Non-Terminal" && !(node.children[child].visited)) {
                    this.build(node.children[child]);
                }
            }
            // If Essential Production found ascendTree on our AST
            if (essentialFlag) {
                this.ast.ascendTree();
                // Ascend to Parent Table
                if (node.name == "Block") {
                    this.symbolTable.ascendTree();
                }
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
                        set.push(this.seekTerminal(node.children[child], set));
                    }
                }
            }
            else {
                // We are already past the first set of children, collect all Terminal Nodes found
                for (var child in node.children) {
                    if (node.children[child].type == "Non-Terminal" && !(node.children[child].visted)) {
                        node.visited = true;
                        set.push(this.seekTerminal(node.children[child], set));
                    }
                    else if (!(node.children[child].visited)) {
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
            node.children[index].visited = true;
            var root = node.children[index].children[0]; // Get Value of Operator
            // Add Root to Current AST Definition
            this.ast.addNode("Non-Terminal", root.name, { line: root.data.line, col: root.data.col });
            // Collect Terminals
            for (var child in node.children) {
                if (node.children[child].name != root.name) {
                    if (node.children[child].type == "Non-Terminal" && !(node.children[child].visited)) {
                        var set = this.seekTerminal(node.children[child], [], true);
                        for (var terminal in set) {
                            this.ast.addNode("Terminal", set[terminal].name, { line: set[terminal].data.line, col: set[terminal].data.col });
                        }
                        // Analyze our AST for Symbol Table Updates
                        this.analyze(this.ast.current);
                    }
                }
            }
        };
        /**
         * analyze(node) : Boolean
         * - Analyze will be used to update our SymbolTable
         *   based on the AST Node given. Will return a
         *   Boolean flag symbolizing success or fail
         */
        SemanticAnalyzer.prototype.analyze = function (node, type) {
            var valid = false;
            // Update our Symbol Table based on Node
            switch (node.name) {
                case "VarDecl":
                    // Get Type + Identifier
                    var type = node.children[0];
                    var id = node.children[1];
                    // Create Identifier Entry
                    var status = this.symbolTable.current.table.set(id.name);
                    if (status) {
                        // Get ID Index in Table
                        var index = this.symbolTable.current.table.get(id.name);
                        // Update Type + Declared Attributes
                        this.symbolTable.current.table.values[index].type = type;
                        this.symbolTable.current.table.values[index].declared = { status: true, line: type.data.line, col: type.data.col };
                        // Update Valid Flag
                        valid = true;
                        console.log("ID added to Symbol Table");
                    }
                    else {
                        // EmitError for Redeclared ID
                        // TODO:- Implement EmitError + Create Object Structure for Data
                        // this.emitError("Redeclared", id.name, {line: id.data.line, col: id.data.col})
                        console.log("Error Found Redeclared Variable: " + id.name);
                    }
                    break;
                case "AssignmentStatement":
                    // Get ID + Expr
                    var id = node.children[0];
                    var expr = node.children[1];
                    // Get ID Reference in SymbolTable
                    var status = this.symbolTable.current.table.get(id.name);
                    if (status != -1) {
                        // Get ID Index in Table
                        var index = this.symbolTable.current.table.get(id.name);
                        // Verify Decleration of ID
                        if (this.symbolTable.current.table.values[index].declared.status == true) {
                            // Update Initalized Attribute
                            this.symbolTable.current.table.values[index].initalized = { status: true, line: id.data.line, col: id.data.col };
                            if (!(expr.children.length)) {
                                // Validate Expression Type
                                if (this.getType(expr) != this.symbolTable.current.table.values[index].type) {
                                    // EmitError for Invalid Type Assignment
                                    // TODO:- Implement EmitError + Create Object Structure Data
                                    /* this.emitError("Type Assignment", id.name, {type: this.symbolTable.current.table.values[index].type,
                                            line: this.symbolTable.current.table.values[index].declared.line,
                                            col: this.symbolTable.current.table.values[index].declared.col});
                                    */
                                }
                            }
                            else {
                                status = this.analyze(expr);
                                if (status) {
                                    // Compare First Terminal to ID Type
                                    if (this.getType(expr.children[0]) != this.symbolTable.current.table.values[index].type) {
                                        // EmitError for Invalid Type Assignment
                                        // TODO:- Implement EmitError + Create Object Structure Data 
                                        /* this.emitError("Assignment Mismatch", id.name, {type: this.symbolTable.current.table.values[index].type,
                                            line: this.symbolTable.current.table.values[index].declared.line,
                                            col: this.symbolTable.current.table.values[index].declared.col});
                                        */
                                    }
                                }
                            }
                        }
                        else {
                            // EmitError for Undeclared ID
                            // TODO:- Implement EmitError + Create Object Structure for Data
                            // this.emitError("Undeclared", id.name, {line: id.data.line, col: id.data.col})
                        }
                    }
                    else {
                        // EmitError for Undeclared ID
                        // TODO:- Implement EmitError + Create Object Structure for Data
                        //this.emitError("Undeclared", id.name, {line: id.data.line, col: id.data.col})
                    }
                    break;
                case "==":
                case "!=":
                case "+":
                    // Get Exprs
                    var first = node.children[0];
                    var second = node.children[1];
                    // Check for Children
                    if (first.children || second.children) {
                        if (first.children.length && second.children.length) {
                            var firstStatus = this.analyze(first);
                            var secondStatus = this.analyze(second);
                            if (firstStatus != secondStatus) {
                                // EmitError for Type Operation Mismatch
                                if (!firstStatus) {
                                    // this.emitError("Operator Mismatch", node.name, {line: node.data.line, col: node.data.col})
                                }
                                else {
                                    // this.emitError("Operator Mismatch", second.name, {line: node.data.line, col: node.data.col})
                                }
                            }
                        }
                        else if (first.children) {
                            status = this.analyze(first);
                            if (status) {
                                // Get First Terminal Child Type
                                if (this.getType(first.children[0] != this.getType(second))) {
                                    // EmitError for Type Operation Mismatch
                                    // this.emitError("Operator Mismatch", second.name, {line: node.data.line, col: node.data.col})
                                }
                            }
                        }
                        else {
                            status = this.analyze(second);
                            if (status) {
                                // Get Second Terminal Child Type
                                if (this.getType(second.children[0] != this.getType(first))) {
                                    // EmitError for Type Operation Mismatch
                                    // this.emitError("Operator Mismatch", second.name, {line: node.data.line, col: node.data.col})
                                }
                            }
                        }
                    }
                    else {
                        if (this.getType(first) != this.getType(second)) {
                            // EmitError for Type Operation Mismatch
                            // TODO:- Implement EmitError + Create Object Structure for Data
                            // this.emitError("Operator Mismatch", second.name, {line: node.data.line, col: node.data.col})
                        }
                        else {
                        }
                    }
                    break;
            }
            console.log("----------------");
            console.log("New Call Node given: " + node.name);
            for (var c in node.children) {
                console.log("Child: " + node.children[c].name);
            }
            return valid;
        };
        SemanticAnalyzer.prototype.getType = function (node) {
            var type = "";
            if (!isNaN(node.name)) {
                type = "int";
            }
            else {
                if (node.name == "true" || node.name == "false") {
                    type = "boolean";
                }
                else if (node.name.indexOf('"') > -1) {
                    type = "string";
                }
                else {
                    type = "id";
                    // We are looking at an ID -- Get Type from Symbol Table
                    var status = this.symbolTable.table.get(node.name);
                    if (status && this.symbolTable.table.get(node.name).declared == true) {
                        type = this.symbolTable.table.get(node.name).type;
                    }
                    else {
                        // EmitError for Undeclared Variable Use
                        //this.emitError("Undeclared", node.name, {line: node.data.line, col: node.data.col})
                    }
                }
            }
            return type;
        };
        return SemanticAnalyzer;
    }());
    CSCompiler.SemanticAnalyzer = SemanticAnalyzer;
})(CSCompiler || (CSCompiler = {}));
