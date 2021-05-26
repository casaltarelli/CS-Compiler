/* -----
    CodeGeneration.ts

    Code Generation is used to develop our Executable Image using 6502a Assembly Op Codes. Based on our Intermediate
    Representation (AST) that was developed in Semantic Analysis and our Symbol Table(s). We will be able to execute
    a pre-order traversal of our AST to generate our Machine Code based on our Basic Blocks. One Code Generation is
    completed, we will then execute Stack Allocation and Backpatching to replace all temporary Addresses and Jumps

----- */
var CSCompiler;
(function (CSCompiler) {
    var CodeGeneration = /** @class */ (function () {
        function CodeGeneration(ast, symbolTable, errors, generating, staticData, jumpData, textIndex, heapIndex, image) {
            if (ast === void 0) { ast = null; }
            if (symbolTable === void 0) { symbolTable = null; }
            if (errors === void 0) { errors = 0; }
            if (generating === void 0) { generating = true; }
            if (staticData === void 0) { staticData = null; }
            if (jumpData === void 0) { jumpData = null; }
            if (textIndex === void 0) { textIndex = 0; }
            if (heapIndex === void 0) { heapIndex = 256; }
            if (image === void 0) { image = []; }
            this.ast = ast;
            this.symbolTable = symbolTable;
            this.errors = errors;
            this.generating = generating;
            this.staticData = staticData;
            this.jumpData = jumpData;
            this.textIndex = textIndex;
            this.heapIndex = heapIndex;
            this.image = image;
        }
        CodeGeneration.prototype.init = function (ast, symbolTable) {
            // Announce Code Generation
            _Log.output({ level: "INFO", data: "Starting Code Generation..." });
            // Default Attributes
            this.ast = ast;
            this.symbolTable = symbolTable;
            this.errors = 0;
            this.generating = true;
            this.staticData = [];
            this.jumpData = [];
            this.textIndex = 0;
            this.heapIndex = 256;
            this.image = [];
            // Inititalize Executable Image
            this.initImage();
            // Allocate Heap for Boolean Values (Optimization)
            // TODO:- Develop appendHeap() -- Consider Creating BooleanPointer Object for Ref
        };
        /**
         * initImage
         * - InitImage is used to initialize all bytes in
         *   our Executable Image to 00
         */
        CodeGeneration.prototype.initImage = function () {
            for (var i = 0; i < 256; i++) {
                this.image[i] = "00";
            }
        };
        return CodeGeneration;
    }());
    CSCompiler.CodeGeneration = CodeGeneration;
})(CSCompiler || (CSCompiler = {}));
