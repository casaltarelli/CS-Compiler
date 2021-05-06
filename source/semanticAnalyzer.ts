/* -----
    SemanticAnalysis.ts

    The Semantic Analyzer is used to generate an Abstract Syntax Tree from our Concrete Syntax Tree that was created in Parse.
    Once our AST has been generated, we then execute a pre-order traversal to find any warnings/errors for Semantic Analysis.

----- */

module CSCompiler {
    export class SemanticAnalyzer {
        constructor(public cst = null,
            public operators = null,
            public scope = -1,
            public warnings = [],
            public errors = [],
            public ast = null,
            public symbolTable = null,
            public analyzing = true) {}

        public init(cst: Tree ): void {
            // Announce Parser
            _Log.output({level: "INFO", data: "Starting Semantic Analysis..."});

            // Default Attributes
            this.cst = cst;
            this.scope = -1;
            this.warnings = [];
            this.errors = [];
            this.ast = new Tree();
            this.symbolTable = new Tree();
            this.analyzing = true;

            // Productions Lists
            this.operators = _Productions.filter((op) => { return op.name.indexOf("Op") !== -1 || op.name.indexOf("OP") !== -1});
        }

        /**
         * build(node)
         * - Build is the primary driver for creating our 
         *   AST definition, while simutaneously defining our
         *   Symbol Table for the program.
         */
        public build(node) {
            var essentialFlag = false;
            var operationFlag = false;
            console.log("-------------------------");
            console.log("BUILD: Current Node: " + node.name);

            // Update Visited Flag on Node 
            node.visited = true;
            
            // Get Production Reference 
            var production = _Productions.filter((production) => { return production.name == node.name })[0];

            // Check if current Node is an Essential Production
            if (production.essential) {
                // Update Essential Flag
                essentialFlag = true;

                // Check if Node has Operator Child [Expr Special Case]
                var operationIndex = 0;
                for (var i = 0; i < node.children.length; i++) {
                    if ((this.operators.map((o) => { return o.name }).indexOf(node.children[i].name) > -1)) {
                        operationFlag = true;
                        operationIndex = i;
                        //console.log("BUILD: Operation Production Found!");
                    }
                }

                if (!(operationFlag)) {
                    // Add Node to AST Definition
                    this.ast.addNode("Non-Terminal", node.name, {line: node.data.line, col: node.data.col});
                    //console.log("BUILD: Production Node Created in AST: " + node.name);

                    // Check for Node "Block" -- Update Symbol Table Scope
                    if (node.name == "Block") {
                        this.scope++;
                        this.symbolTable.addTableNode(this.scope);
                    }
                }

                // Check if Production requires us to collect Terminal(s) or SubTree
                if (production.seek) {
                    if (operationFlag) {
                        //console.log("BUILD: Entering SeekTree");
                        this.seekTree(node, operationIndex);
                    } else {
                        //console.log("BUILD: Entering SeekTerminal");
                        var set = this.seekTerminal(node, [], true);

                        //console.log("BUILD: Set Returned from SeekTerminal:");
                        for (var s in set) {
                            console.log("   -  [" + set[s].name + "]");
                        }

                        if (production.seek == "Child") {
                                // Collect Accurate Location for new Single Node
                                var line = set[0].data.line;
                                var col = set[0].data.col;

                                // Combine Set to Single Node [CharList Case]
                                set = set.map((n) => { return n.name }).join("");
                                //console.log("Set For Child: " + set);

                                // Add Terminal to AST Defintion
                                this.ast.addNode("Terminal", set, {line: line, col: col});
                            
                        } else {
                            var stringIndex = null;
                            out:
                            for (var terminal in set) {
                                // console.log("BUILD: Terminal Symbol added to AST: " + set[terminal].name);
                                if (set[terminal].name != "\"") {
                                    this.ast.addNode("Terminal", set[terminal].name, {line: set[terminal].data.line, col: set[terminal].data.col});
                                } else {
                                    stringIndex = terminal;
                                    break out;
                                }
                            }

                            if (stringIndex != null) {
                                // Collect Accurate Location for new Single Node
                                var line = set[stringIndex].data.line;
                                var col = set[stringIndex].data.col;

                                // Combine Set to Single Node [CharList Case]
                                set = set.map((n) => { return n.name }).join("");

                                // Add Terminal to AST Defintion
                                this.ast.addNode("Terminal", set.substring(1), {line: line, col: col});    
                            }
                        }

                        // Analyze our AST for Symbol Table Updates
                        this.analyze(this.ast.current);
                    }
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
        }

        /**
         * seekTerminal(node, set, first?)
         * - seekTerminal has the ability to traverse through our
         *   CST definition from Parse and collect all Terminal Nodes
         *   under the node given from our CST.
         */
        public seekTerminal(node, set, first?) {
            // First is used to avoid collecting Terminals that are a direct child of the Essential Production
            if (first) {
                for (var child in node.children) {
                    if (node.children[child].type == "Non-Terminal" && !(node.children[child].visited)) {
                        //console.log("SEEKTERMINAL: FIRST Non-Terminal Found: " + node.children[child].name);
                        set.push(this.seekTerminal(node.children[child], set));
                    }
                }
            } else {
                // We are already past the first set of children, collect all Terminal Nodes found
                for (var child in node.children) {
                    if (node.children[child].type == "Non-Terminal" && !(node.children[child].visted)) {
                        //console.log("SEEKTERMINAL: Non-Terminal Found: " + node.children[child].name);
                        // Validate Child(s) Production doesn't contain Operator Child
                        var operatorFlag = false;
                        for (var c in node.children[child].children) {
                            if ((this.operators.map((o) => { return o.name }).indexOf(node.children[child].children[c].name) > -1)) {
                                operatorFlag = true;
                                //console.log("SEEKTERMIAL: Operator Child for " + node.children[child].children[c].name)
                            }
                        }

                        if (!(operatorFlag)) {
                            //console.log("SEEKTERMINAL: SeekTerminal on Non-Terminal Found: " + node.children[child].name);
                            node.visited = true;
                            set.push(this.seekTerminal(node.children[child], set));
                        }
                    } else if (!(node.children[child].visited)) {
                        //console.log("SEEKTERMINAL: Push Terminal Found: " + node.children[child].name);
                        node.visited = true;
                        set.push(node.children[child]);    
                    }
                }
            }
            
            // Clean Set of Undefined Elements
            set = set.filter((s) => { return s.name != undefined });

            return set;
        }

        /**
         * seekTree(node, index)
         * - seekTree is used when an Essential Production has a 
         *   child Node that is an Operator (BoolOp or IntOp). When recognized,
         *   this method creates the correct subtree for representing the
         *   Operator subtree and adds it to our AST Definiton.  
         */
        public seekTree(node, index) {
            // Get Operator for Root Node of Subtree + Update Visited Flag
            node.children[index].visited = true;
            var root = node.children[index].children[0]; // Get Value of Operator

            // Add Root to Current AST Definition
            this.ast.addNode("Non-Terminal", root.name, {line: root.data.line, col: root.data.col});
            //console.log("SEEKTREE: Non-Terminal added to AST Definition: " + root.name);

            // Collect Terminals
            for (var child in node.children) {
                if (node.children[child].name != root.name) {
                    //console.log("SEEKTREE: Current Child " + node.children[child].name);
                    if (node.children[child].type == "Non-Terminal" && !(node.children[child].visited)) {
                        // Update Visited Flag + Seek Terminal Children (it's not as creepy as it sounds)
                        node.children[child].visited = true;
                        var set;
                        if (node.children[child].children.length > 1) {
                            set = this.seekTerminal(node.children[child], [], true);
                        } else {
                            set = this.seekTerminal(node.children[child], []);
                        }
                        
                        //console.log("SEEKTREE: Non-Terminal Child Found " + node.children[child].name);
                        //console.log("SEEKTREE: Set Returned from SeekTerminal:");
                        for (var s in set) {
                            console.log("   -  " + set[s].name);
                        }
                        for (var terminal in set) {
                            this.ast.addNode("Terminal", set[terminal].name, {line: set[terminal].data.line, col: set[terminal].data.col});
                        }
                    }
                }
            }

            // Analyze our AST for Symbol Table Updates
            this.analyze(this.ast.current);
        }

        /**
         * analyze(node) : Boolean 
         * - Analyze will be used to update our SymbolTable
         *   based on the AST Node given. Will return a 
         *   Boolean flag symbolizing success or fail.
         */
        public analyze(node, type?) {
            console.log("ANALYZE: Current Node " + node.name);
            var valid = false;

            // Update our Symbol Table based on Node
            switch(node.name) {
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
                        this.symbolTable.current.table.values[index].type = type.name;
                        this.symbolTable.current.table.values[index].declared = {status: true, line: type.data.line, col: type.data.col};

                        // Announce Symbol Table Entry
                        // this.emitEntry("Decl", this.symbolTable.current.table.keys[index], this.symbolTable.current.table.values[index])
                        console.log("Symbol Table Entry on Scope " + this.symbolTable.current.scope);
                        console.log("Variable Added: " + this.symbolTable.current.table.keys[index]);
                        console.log("Variable Type: " + this.symbolTable.current.table.values[index].type);

                        // Update Valid Flag
                        valid = true;
                    } else {
                        // EmitError for Redeclared ID
                        this.emitError("REDECLARED", id.name, {line: id.data.line, col: id.data.col})
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
                            this.symbolTable.current.table.values[index].initalized = {status: true, line: id.data.line, col: id.data.col};
                            
                            if (!(expr.children.length)) {
                                // Validate Expression Type
                                if (this.getType(expr) != this.symbolTable.current.table.values[index].type) {
                                    // EmitError for Invalid Type Assignment
                                    this.emitError("ASSIGNMENT", id.name, {type: this.symbolTable.current.table.values[index].type, 
                                        line: this.symbolTable.current.table.values[index].declared.line,
                                        col: this.symbolTable.current.table.values[index].declared.col});
                                
                                }
                            } else {
                                status = this.analyze(expr);

                                if (status) {
                                    // Compare First Terminal to ID Type
                                    if (this.getType(expr.children[0]) != this.symbolTable.current.table.values[index].type) {
                                        // EmitError for Invalid Type Assignment
                                        this.emitError("ASSIGNMENT", id.name, {type: this.symbolTable.current.table.values[index].type, 
                                            line: this.symbolTable.current.table.values[index].declared.line,
                                            col: this.symbolTable.current.table.values[index].declared.col});
                                    }
                                }
                            }
                            
                        } else {
                            // EmitError for Undeclared ID
                            this.emitError("UNDECLARED", id.name, {line: id.data.line, col: id.data.col})
                        }
                        
                    } else {
                        // EmitError for Undeclared ID
                        this.emitError("UNDECLARED", id.name, {line: id.data.line, col: id.data.col})
                    }

                    break;
                
                case "==":
                case "!=":
                case "+":
                    // Get Exprs
                    var first = node.children[0];
                    var second = node.children[1];

                    // Check Children for Child Nodes
                    if ((!Array.isArray(first.children) || first.children.length == 0) && (!Array.isArray(second.children) || second.children.length == 0)) {
                        // Get Expr Types
                        var exprs = [first, second];
                        var types = [this.getType(first), this.getType(second)];

                        // console.log("types[0]: " + types[0]); 
                        // console.log("types[1]: " + types[1]);
                        
                        // Check if we need to get IDs
                        for (var t in types) {
                            if (types[t] == "id") {
                                // console.log("ID recognized");
                                // Get ID Index in Table
                                var index = this.symbolTable.current.table.get(exprs[t].name);

                                // Verify Decleration
                                if (this.symbolTable.current.table.values[index].declared.status == true) {
                                    // Update Used Attribute
                                    this.symbolTable.current.table.values[index].used = {status: true, line: exprs[t].data.line, col: exprs[t].data.col};
                                } else {
                                    // EmitError for Undeclared ID
                                    this.emitError("UNDECLARED", id.name, {line: exprs[t].data.line, col: exprs[t].data.col})
                                }

                                // Update Types Element
                                types[t] = this.symbolTable.current.table.values[index].type;

                                console.log("Type: " + this.symbolTable.current.table.values[index].type);
                            }
                        }

                        // Compare Types
                        if (types[0] != types[1]) {
                            console.log("a Type: " + types[0] + " b Type: " + types[1]);
                            this.emitError("OPERATOR", node.name, {line: node.data.line, col: node.data.col});
                        }
                    } else if (!Array.isArray(first.children) || first.children.length == 0) {
                        // Test all Operators for Type on First Child
                        if(this.analyze(first)) {
                            exprs = [first.children[0], second];
                            // Get First Child Type
                            types = [this.getType(first.children[0]), this.getType(second)];

                            // Check if we need to get IDs
                            for (var t in types) {
                                if (types[t] == "id") {
                                    // Get ID Index in Table
                                    var index = this.symbolTable.current.table.get(exprs[t].name);

                                    // Verify Decleration
                                    if (this.symbolTable.current.table.values[index].declared.status == true) {
                                        // Update Used Attribute
                                        this.symbolTable.current.table.values[index].used = {status: true, line: exprs[t].data.line, col: exprs[t].data.col};
                                    } else {
                                        // EmitError for Undeclared ID
                                        this.emitError("UNDECLARED", id.name, {line: exprs[t].data.line, col: exprs[t].data.col})
                                    }

                                    // Update Types Element
                                    types[t] = this.symbolTable.current.table.values[index].type;
                                }
                            }

                            // Compare Types
                            if (types[0] != types[1]) {
                                this.emitError("OPERATOR", node.name, {line: node.data.line, col: node.data.col});
                            }
                        }
                    } else {
                        // Test all Operators for Type on First Child
                        if(this.analyze(first)) {
                            exprs = [first, second.children[0]];
                            // Get First Child Type
                            types = [this.getType(first), this.getType(second.children[0])];

                            // Check if we need to get IDs
                            for (var t in types) {
                                if (types[t] == "id") {
                                    // Get ID Index in Table
                                    var index = this.symbolTable.current.table.get(exprs[t].name);

                                    // Verify Decleration
                                    if (this.symbolTable.current.table.values[index].declared.status == true) {
                                        // Update Used Attribute
                                        this.symbolTable.current.table.values[index].used = {status: true, line: exprs[t].data.line, col: exprs[t].data.col};
                                    } else {
                                        // EmitError for Undeclared ID
                                        this.emitError("UNDECLARED", id.name, {line: exprs[t].data.line, col: exprs[t].data.col})
                                    }

                                    // Update Types Element
                                    types[t] = this.symbolTable.current.table.values[index].type;
                                }
                            }

                            // Compare Types
                            if (types[0] != types[1]) {
                                this.emitError("OPERATOR", node.name, {line: node.data.line, col: node.data.col});
                            }
                        }
                    }

                    break;
            }
            // console.log("----------------");
            // console.log("New Call Node given: " + node.name);

            // for (var c in node.children) {
            //     console.log("Child: " + node.children[c].name);
            // }

            return valid;
        }

        public getType(node) {
            var type = "";

            if (!isNaN(node.name)) {
                type ="int";
            } else {
                if (node.name == "true" || node.name == "false") {
                    type = "boolean";
                } else if (node.name.indexOf('"') > -1) {
                    type = "string";
                } else {
                    type = "id";
                }
            }

            return type;
        }

        public emitError(type, name, info) {
            // Check Analyzing Flag to prevent output of Additional Messages after initial Error
            var data;

            // Format Message Date Based on Type
            switch(type) {
                case "REDECLARED":
                    data = "Variable Redecleration [ " + name + " ] on line: " + info.line + " col: " + info.col;
                    break;

                case "UNDECLARED":
                    data = "Variable not declared before use [ " + name + " ] on line: " + info.line + " col: " + info.col;
                    break;

                case "ASSIGNMENT":
                    data = "Initialized Type Mismatch on [ " + name + " ] type [ " + info.type + " ] on line: " + info.line + " ] col: " + info.col;
                    break;

                case "OPERATOR":
                    data = "Operator Type Mismatch on  [ " + name + " ] on line " + info.line + " col " + info.col;
                    break;

                default:
                    break;
            }

            // Update Error List + Output to User
            this.errors.push({type: type, name: name, line: info.line, col: info.col})
            _Log.output({level: "ERROR", data: data});
        }
    }
} 