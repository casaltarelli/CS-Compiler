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
                    public heapData = null,
                    public textIndex = 0,
                    public heapIndex = 256,
                    public boolPointers = {true: "", false: ""},
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
            this.heapData = [];
            this.textIndex = 0;
            this.heapIndex = 256;
            this.boolPointers = {true: "", false: ""};
            this.image = [];

            // Inititalize Executable Image
            this.initImage();

            // Allocate Boolean Values to Heap (Optimization)
            this.boolPointers.true = this.appendHeap("true");
            this.boolPointers.false = this.appendHeap("false");
        }

        /**
         * appendHeap(s) : String
         * - AppendHeap is used to add new 
         *   dynamic/reference variables to our Heap.
         *   Also can recognize duplicate entries in
         *   which the correct pointer will be returned. 
         */
        public appendHeap(s) {
            // Trim S of Quotes
            if (s.indexOf("\"") > -1) {
                s = s.substring(1, s.length - 1);
            }

            // Validate String doesn't already exist in Heap
            var pointer = this.getEntry(s, this.heapData);

            if (pointer == "") {
                // Create Heap Data Object
                var entry = {pointer: "", value: s};

                // Add Delimeter to Heap
                this.image[this.heapIndex] = "00";
                this.heapIndex--;

                // Split for Single Char Entry + Append Chars to Heap
                s = s.split("");

                for (var i = s.length; i > 0; i--) {
                    // Convert CharCode to Hex
                    this.image[this.heapIndex] = s[i - 1].charCodeAt(0).toString(16).toLocaleUpperCase();
                    this.heapIndex--; 
                } 

                // Update Pointer in Heap Data + Push to heapData
                entry.pointer = (this.heapIndex + 1).toString(16).toLocaleUpperCase()
                this.heapData.push(entry);

                return (this.heapIndex + 1).toString(16).toLocaleUpperCase();
                
            } else {
                return pointer
            }
        }

        /**
         * getEntry(name, list)
         * - GetEntry is used to determine if an entry in 
         *   the given list exists. If so, returns the static
         */
        public getEntry(value, list) {
            var pointer = "";

            // Seek Value in List
            if (list.length > 0) {
                for (var entry in list) {
                    if (list[entry].value == value) {
                        pointer = list[entry].pointer;
                    }
                }
            }

            return pointer; 
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