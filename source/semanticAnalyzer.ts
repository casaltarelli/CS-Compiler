/* -----
    SemanticAnalysis.ts

    The Semantic Analyzer is used to generate an Abstract Syntax Tree from our Concrete Syntax Tree that was created in Parse.
    Once our AST has been generated, we then execute a pre-order traversal to find any warnings/errors for Semantic Analysis.

----- */

module CSCompiler {
    export class SemanticAnalyzer {
        constructor(public cst = null,
            public operators = null,
            public scope = 0,
            public warnings = [],
            public errors = [],
            public ast = null) {}

        public init(cst: Tree ): void {
            // Announce Parser
            _Log.output({level: "INFO", data: "Starting Semantic Analysis..."});

            // Default Attributes
            this.cst = cst;
            this.scope = 0;
            this.warnings = [];
            this.errors = [];
            this.ast = new Tree();

            // Productions Lists
            this.operators = _Productions.filter((op) => { return op.name.indexOf("Op") !== -1 });
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

            // Update Visited Flag 
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
                    if (this.operators.map((o) => { return o.name }).indexOf(node.children[i].name) > -1) {
                        operationFlag = true;
                        operationIndex = i;
                    }
                }

                if (!(operationFlag)) {
                    // Add Node to AST Definition + Update Visited Flag
                    node.visited = true;
                    this.ast.addNode("Non-Terminal", node.name, {line: node.data.line, col: node.data.col});

                    // Check for Node "Block" -- Update Symbol Table Scope
                    if (node.name == "Block") {
                        //console.log("Create new Symbol Table");
                    }
                }

                // Check if Production requires us to collect Terminal(s) or SubTree
                if (production.seek) {
                    if (operationFlag) {
                        this.seekTree(node, operationIndex);
                    } else {
                        var set = this.seekTerminal(node, [], true);

                        if (production.seek == "Child") {
                            // Collect Accurate Location for new Single Node
                            var line = set[0].data.line;
                            var col = set[0].data.col;

                            // Combine Set to Single Node [CharList Case]
                            set = set.map((n) => { return n.name }).join("");

                            // Add Terminal to AST Defintion
                            this.ast.addNode("Terminal", set, {line: line, col: col});
                            // TODO:- Implement Symbol Table Entry Here
                        } else {
                            for (var terminal in set) {
                                this.ast.addNode("Terminal", set[terminal].name, {line: set[terminal].data.line, col: set[terminal].data.col});
                            }

                            // TODO:- Implement Symbol Table Entry Here
                        }
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

                // TODO:- Implement Check for Production = "Block" -- AscendTree on Symbol Table
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
                        set.push(this.seekTerminal(node.children[child], set));
                    }
                }
            } else {
                // We are already past the first set of children, collect all Terminal Nodes found
                for (var child in node.children) {
                    if (node.children[child].type == "Non-Terminal" && !(node.children[child].visted)) {
                        node.visited = true;
                        set.push(this.seekTerminal(node.children[child], set));
                    } else if (!(node.children[child].visited)) {
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

            // Collect Terminals
            for (var child in node.children) {
                if (node.children[child].name != root.name) {
                    if (node.children[child].type == "Non-Terminal" && !(node.children[child].visited)) {
                        var set = this.seekTerminal(node.children[child], [], true);

                        for (var terminal in set) {
                            this.ast.addNode("Terminal", set[terminal].name, {line: set[terminal].data.line, col: set[terminal].data.col});
                            // TODO:- Implement Update for Symbol Table Terminals
                        }
                    }
                }
            }
        }
    }
} 