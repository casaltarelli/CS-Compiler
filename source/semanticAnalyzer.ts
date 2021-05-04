/* -----
    SemanticAnalysis.ts

    The Semantic Analyzer is used to generate an Abstract Syntax Tree from our Concrete Syntax Tree that was created in Parse. 

----- */

module CSCompiler {
    export class SemanticAnalyzer {
        constructor(public cst = null,
            public currentNode = null,
            public warnings = [],
            public errors = [],
            public ast = null) {}

        public init(cst: Tree ): void {
            // Announce Parser
            _Log.output({level: "INFO", data: "Starting Semantic Analysis..."});

            // Default Attributes
            this.cst = cst;
            this.currentNode = this.cst.root;
            this.warnings = [];
            this.errors = [];
            this.ast = new Tree();
        }
    }
} 