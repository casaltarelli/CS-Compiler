/* -----
    SemanticAnalysis.ts

    The Semantic Analyzer is used to generate an Abstract Syntax Tree from our Concrete Syntax Tree that was created in Parse.

----- */
var CSCompiler;
(function (CSCompiler) {
    var SemanticAnalyzer = /** @class */ (function () {
        function SemanticAnalyzer(cst, currentNode, warnings, errors, ast) {
            if (cst === void 0) { cst = null; }
            if (currentNode === void 0) { currentNode = null; }
            if (warnings === void 0) { warnings = []; }
            if (errors === void 0) { errors = []; }
            if (ast === void 0) { ast = null; }
            this.cst = cst;
            this.currentNode = currentNode;
            this.warnings = warnings;
            this.errors = errors;
            this.ast = ast;
        }
        SemanticAnalyzer.prototype.init = function (cst) {
            // Announce Parser
            _Log.output({ level: "INFO", data: "Starting Semantic Analysis..." });
            // Default Attributes
            this.cst = cst;
            this.currentNode = this.cst.root;
            this.warnings = [];
            this.errors = [];
            this.ast = new CSCompiler.Tree();
        };
        return SemanticAnalyzer;
    }());
    CSCompiler.SemanticAnalyzer = SemanticAnalyzer;
})(CSCompiler || (CSCompiler = {}));
