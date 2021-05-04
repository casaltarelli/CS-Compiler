/* -----
    SemanticAnalysis.ts

    The Semantic Analyzer is used to generate an Abstract Syntax Tree from our Concrete Syntax Tree that was created in Parse. 

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

            // TODO: Add Essential Attribute to Essential Productions
            // var productions = _Productions.filter(p => { p.essential });
            var productions = _Productions;

            // Check if Node is Essential
            for (var p in productions) {
                if (node.name == productions[p].name) {
                    essentialFlag = true;

                    // Check if Node has Operator Child [Expr Special Case]
                    var operationIndex = 0;
                    for (var i = 0; i < node.children.length; i++) {
                        if (this.operators.map(o => { return o.name }).indexOf(node.children[i].name) > -1) {
                            operationFlag = true;
                            operationIndex = i;
                        }
                    }

                    if (!operationFlag) {
                        // Add Node to AST Definition
                        this.ast.addNode("Non-Terminal", node.name, {line: node.data.line, col: node.data.col});

                        // Check for Node "Block" -- Update Symbol Table Scope
                        if (node.name == "Block") {
                            this.scope++ // Increment Scope for New Block
                            // TODO: New Symbol Table Creation
                            // this.symbolTable.addSymbolNode("Table", this.scope)
                        }
                    }

                    // Check if Production requires us to collect Terminals or Subtree
                    // TODO: Add Seek Flag to Essential Productions

                    // if (productions[p].seek) {
                    //     if (operationFlag) {
                    //         //this.seekTree(node, operationIndex);
                    //     } else {
                    //         var set = this.seekTerminal(node, [], true);

                    //         if (productions[p].seek == "child") {
                    //             set = set.map(n => n.name).reduce();

                    //             this.ast.addNode("Terminal", set, {line: node.data.line, col: node.data.col});
                    //             // TODO: Symbol Table Variable Entry
                    //         } else {
                    //             for (var terminal in set) {
                    //                 this.ast.addNode("Terminal", set[terminal].name, {line: set[terminal].data.line, col: set[terminal].data.line});
                    //             }

                    //             // TODO: Symbol Table Variable Entry
                    //         }
                    //     }
                    // }
                } 
            }

            // Proceed to Children for current Node
            for (var child in node.children) {
                this.build(node.children[child]);
            }

            // If essential found ascendTree
            if (essentialFlag) {
                this.ast.ascentTree();
            }
        }

        // TODO: Implement seekTerminal()

        // TODO: Implement seekTree()
    }
} 