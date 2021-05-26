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
         * generate(node)
         * - Generate is the primary driver for
         *   developing our Executable Image. Done 
         *   through a Preorder Traversal of our
         *   AST. 
         */
        public generate(node) {
            
            if (this.generating) {  // [General Case]



            } else {                // [Base Case]

            }

        }

        /**
         * appendStack(id, scope)
         * - AppendStack handles creating new
         *   static entries into our StaticData.
         *   Also can recognize duplicate entries in
         *   which the correct pointer will be returned.
         */
        public appendStack(id, scope) {
            // Validate Identifer Doesn't Exist
            var pointer = this.getEntry(id, this.staticData, scope)

            if (pointer == "") {
                // Generate Temporary Address + Static Data Object
                var temp = "T" + this.staticData.length;
                var entry = {pointer: temp, value: id, scope: scope};

                // Push to staticData
                this.staticData.push(entry);

                return entry.pointer.substr(0, 2);
                
            } else {
                return pointer;
            }
        }

        /**
         * appendHeap(s) : String
         * - AppendHeap handles creating new 
         *   dynamic/reference variables to our Heap.
         *   Also can recognize duplicate entries in
         *   which the correct pointer will be returned. 
         */
        public appendHeap(s) {
            // Trim S of Quotes
            if (s.indexOf("\"") > -1) {
                s = s.substring(1, s.length - 1);
            }

            // Validate Entry Doesn't Exist
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
         * getEntry(name, list, scope?)
         * - GetEntry is used to determine if an entry in 
         *   the given list exists. If so, returns the Static
         *   Pointer or Empty Pointer to signify no entry.
         */
        public getEntry(value, list, scope?) {
            var pointer = "";

            // Seek Value in List
            if (list.length > 0) {
                for (var entry in list) {
                    if (scope) {
                        if (list[entry].value == value && list[entry].scope == scope) {
                            pointer = list[entry].pointer;
                        }
                    } else {
                        if (list[entry].value == value) {
                            pointer = list[entry].pointer;
                        }
                    }
                }
            }

            return pointer; 
        }

        /**
         * emitAction(type, value, data?) 
         * - EmitAction is used to format our 
         *   messages for Log Output
         */
         public emitAction(type, value, data?) {
            var data;

            switch(type) {
                case "Production":
                    data = "Generating for [ " + value + " ] on line: " + data.line + " on col: " + data.col;
                    break;

                case "Entry":
                    data = "Generating " + value;
                    break;

                default: 
                    break;
            }

            // Output Symbol Table Entry to User
            _Log.output({level: "DEBUG", data: data});
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