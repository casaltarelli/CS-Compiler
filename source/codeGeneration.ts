/* -----
    CodeGeneration.ts

    Code Generation is used to develop our Executable Image using 6502a Assembly Op Codes. Based on our Intermediate 
    Representation (AST) that was developed in Semantic Analysis and our Symbol Table(s). We will be able to execute 
    a pre-order traversal of our AST to generate our Machine Code based on our Basic Blocks. One Code Generation is 
    completed, we will then execute Stack Allocation and Backpatching to replace all temporary Addresses and Jumps 

----- */

module CSCompiler {
    export class CodeGeneration {
        constructor(public ast = null,
                    public symbolTable = null,
                    public errors = 0,
                    public generating = true,
                    public staticData = null,
                    public jumpData = null,
                    public textIndex = 0,
                    public heapIndex = 256,
                    public image = []) {}

        public init(ast: Tree, symbolTable: Tree) {
            // Announce Code Generation
            _Log.output({level: "INFO", data: "Starting Code Generation..."});

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
        }

        /**
         * initImage
         * - InitImage is used to initialize all bytes in
         *   our Executable Image to 00
         */
        public initImage() {
            for (var i = 0; i < 256; i++) {
                this.image[i] = "00";
            }
        }
    }
}