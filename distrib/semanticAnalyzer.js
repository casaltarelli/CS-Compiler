/* -----
    SemanticAnalysis.ts

    The Semantic Analyzer is used to generate an Abstract Syntax Tree from our Concrete Syntax Tree that was created in Parse.

----- */
var CSCompiler;
(function (CSCompiler) {
    var SemanticAnalyzer = /** @class */ (function () {
        function SemanticAnalyzer(cst, operators, scope, warnings, errors, ast) {
            if (cst === void 0) { cst = null; }
            if (operators === void 0) { operators = null; }
            if (scope === void 0) { scope = 0; }
            if (warnings === void 0) { warnings = []; }
            if (errors === void 0) { errors = []; }
            if (ast === void 0) { ast = null; }
            this.cst = cst;
            this.operators = operators;
            this.scope = scope;
            this.warnings = warnings;
            this.errors = errors;
            this.ast = ast;
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
                if (!operationFlag) {
                    // Add Node to AST Definition + Update Visited Flag
                    node.visited = true;
                    this.ast.addNode("Non-Terminal", node.name, { line: node.data.line, col: node.data.col });
                    // Check for Node "Block" -- Update Symbol Table Scope
                    if (node.name == "Block") {
                        console.log("Create new Symbol Table");
                    }
                }
                // Check if Production requires us to collect Terminal(s) or SubTree
                if (production.seek) {
                    if (operationFlag) {
                        //this.seekTree(node, operationIndex);
                    }
                    else {
                        //var set = this.seekTerminal(node, [], true);
                        var set;
                        if (production.seek == "Child") {
                            // Collect Accurate Location for new Single Node
                            var line = set[0].data.line;
                            var col = set[0].data.col;
                            // Combine Set to Single Node [CharList Case]
                            set = set.map(function (n) { return n.name; }).reduce();
                            // Add Terminal to AST Defintion
                            this.ast.addNode("Terminal", set, { line: line, col: col });
                            // TODO: Implement Symbol Table Entry Here
                        }
                        else {
                            for (var terminal in set) {
                                this.ast.addNode("Terminal", set[terminal].name, { line: set[terminal].data.line, col: set[terminal].data.col });
                            }
                            // TODO: Implement Symbol Table Entry Here
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
            // // If essential found ascendTree
            // if (essentialFlag) {
            //     this.ast.ascentTree();
            // }
        };
        return SemanticAnalyzer;
    }());
    CSCompiler.SemanticAnalyzer = SemanticAnalyzer;
})(CSCompiler || (CSCompiler = {}));
