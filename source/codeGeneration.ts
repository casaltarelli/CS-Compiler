/* -----
    CodeGeneration.ts

    Code Generation is used to develop our Executable Image using 6502a Assembly Op Codes. Based on our Intermediate 
    Representation (AST) that was developed in Semantic Analysis and our Symbol Table(s). We will be able to execute 
    a pre-order traversal of our AST to generate our Machine Code based on our Basic Blocks. One Code Generation is 
    completed, we will then execute Stack Allocation and Backpatching to replace all temporary Addresses and Jumps.

----- */

module CSCompiler {
    export class CodeGeneration {
        constructor(public ast = null,
                    public symbolTable = null,
                    public errors = 0,
                    public generating = true,
                    public comparisonFlag = false,
                    public staticData = null,
                    public jumpData = null,
                    public heapData = null,
                    public scope = -1,
                    public textIndex = 0,
                    public heapIndex = 255,
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
            this.comparisonFlag = false;
            this.staticData = [];
            this.jumpData = [];
            this.heapData = [];
            this.textIndex = 0;
            this.heapIndex = 256;
            this.scope = -1;
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
                console.log("GENERATE: Current Node: " + node.name);
                // Update Visited Flag on Node
                node.visited = true;

                // Check if Current Node is Block
                if (node.name == "Block") {
                    // Increment Scope for New Block
                    this.scope++;

                    // Recursivley Call Children
                    if (node.children.length) {
                        for (var c in node.children) {
                            this.generate(node.children[c]);
                        }
                    }
                } else {
                    // Get Block Reference for Production
                    var block = _Blocks.filter((b) => {return b.name == node.name})[0];

                    if (block) {
                        console.log(node.name + " found in Blocks");
                        // EmitAction on current Node + Get Basic Block Reference
                        this.emitAction("Production", node.name, node.data);

                        // Check if we need to Allocate First Segment
                        if (block.first.allocate) {
                            this.allocate(block.register, block.first.action, node.children[block.first.child]);

                            // Check if Operator Found in First Segement
                            if (this.comparisonFlag) {
                                // Execute Comparison Generation for First Child of Production
                                console.log("GENERATE: Recognized ComparisonFlag!");
                                this.generateComparison(node.name, node.children[block.first.child].name, "00");
                                this.comparisonFlag = false;
                            }
                        }

                        // Proceed to Children for current Node
                        for (var child in node.children) {
                            if (!(node.children[child].visited)) {
                                console.log("Calling Generate on " + node.children[child].name);
                                this.generate(node.children[child]);
                            }
                        }

                        // Check if we need to Allocate for Final Segment
                        if (block.final.allocate) {
                            this.allocate(block.register, block.final.action, node.children[block.final.child]);
                        } else {
                            block.final.generate();
                        }

                    } 
                    
                    // else {
                    //     // Check if Node is Operator
                    //     if (node.name == "+" || node.name == "==" || node.name == "!=") {
                    //         // Generate Operator Text
                    //         var temp = this.generateOperator(node);

                    //         // Execute Comparison Generation
                    //         this.generateComparison(node.parent.name, node, temp);
                    //     }
                    // }

                    

                    // Check for JumpFlag + UnconditionalFlag
                    // TODO:- Implement JumpFlag Handeling
                }

            } else {                // [Base Case]

            }

        }

        /**
         * allocate(reg, action, node) 
         * - Allocate is used to generate the
         *   correct text for a specific Action
         *   on a given Register
         */
        public allocate(reg, action, node) {
            // Determine Node Type
            var data = this.getType(node);

            console.log("ALLOCATE: Action " + action + " for register " + reg);
            if (node != null) {
                console.log("ALLOCATE: Returned from GetType w/ type " + data.type + " for " + node.name);
            }

            if (this.comparisonFlag) {
                //this.generateComparison(node.parent.name, node.name, data.value);
                return; 
            }
            
            switch(reg) {
                case "Acc":
                    console.log("ALLOCATE: Hit on Acc Reg!");
                    this.handleAcc(action, data.type, data.value);
                    break;
                case "XReg":
                    console.log("ALLOCATE: Hit on X Reg!");
                    this.handleXReg(action, data.type, data.value);
                    break;
                case "YReg":
                    console.log("ALLOCATE: Hit on Y Reg!");
                    this.handleYReg(action, data.type, data.value);
                    break;

                default: 
                    console.log("Unrecognized Register Allocation Request");
            }
        }

        /**
         * getType(node) : { type, value }
         * - GetType is used to recognize the
         *   type of Value we are dealing with
         *   (Constant or Memory Pointer)
         */
        public getType(node) {
        var type = "";
        var value = "";

        // Validate Not Null [Default Value Case]
        if (node != null) {
            // Update Visited Flag on Child Node
            node.visited = true;

            if (node.children.length != 0) {
                // Check for Nested Operator
                if (node.parent.name != "==" || node.parent.name != "!=") {
                    type = "Memory";
                    value = this.generateOperator(node);
                    this.comparisonFlag = true;
                } else {
                    this.emitError("Unsupported");
                }
            } else if (!isNaN(node.name) || node.name == "true" || node.name == "false") {
                type = "Constant";
                if (node.name == "true") {
                    value = this.boolPointers.true;
                } else if (node.name == "false") {
                    value = this.boolPointers.false;
                } else {
                    value = "0" + node.name;
                }
            } else if (node.name.indexOf("\"") > -1) {
                type = "Constant";

                // Get Dynamic Pointer from Heap
                value = this.appendHeap(node.name);
            } else {
                type = "Memory";

                // Get Static Pointer from Static Data
                value = this.appendStack(node.name, this.scope);
            }

            } else {
                type = "Constant";
                value = "00" // Default Value
            }

            return {type: type, value: value};
        }

        public generateOperator(node) {
            // EmitAction on Current Operator
            this.emitAction("Production", node.name, node.data);

            switch(node.name) {
                case "+":
                    // Get Type of RHS
                    var data = this.getType(node.children[1]);

                    // Load Acc + Store in Memory at Default Location
                    this.handleAcc("Load", data.type, data.value);
                    this.handleAcc("Store", "Memory", "00");

                    // Load Acc w/ LHS
                    this.handleAcc("Load", "Constant", "0" + node.children[0].name);

                    // Manually Append Add w/ Carry
                    this.appendText("6D");
                    this.appendText("00");
                    this.appendText("00");

                    // Store Sum at Default Location
                    this.handleAcc("Store", "Memory", "00");

                    break;
                case "==":
                case "!=":
                    // Get Type of LHS Value
                    var data = this.getType(node.children[0]);

                    // Load X Reg w/ LHS Value
                    this.handleXReg("Load", data.type, data.value);

                    // Get Type of RHS Value
                    data = this.getType(node.children[1]);

                    // Load Acc w/ RHS Value + Store at Default Location
                    this.handleAcc("Load", data.type, data.value);
                    this.handleAcc("Store", "Memory", "00");
            }

            // Return Default Location
            return "00";
        }

        public generateComparison(parent, node, address) {
            console.log("GENCOMPARISON: Entered!");
            switch(parent) {
                case "AssignmentStatement":
                    console.log("GENCOMPARISON: Recognized Parent AssignStatement");
                    if (node == "==") {
                        console.log("GENCOMPARISON: Recognized Child ==");
                        this.handleXReg("Compare", "Memory", address);

                        this.handleAcc("Load", "Constant", this.boolPointers.false);

                        // BNE 2 Bytes
                        this.appendText("D0");
                        this.appendText("02");

                        this.handleAcc("Load", "Constant", this.boolPointers.true);
                    } else if (node == "!=") {
                        console.log("GENCOMPARISON: Recognized Child !=");
                        this.handleXReg("Compare", "Memory", address);
                        this.handleAcc("Load", "Constant", "00");

                        // BNE 2 Bytes
                        this.appendText("D0");
                        this.appendText("02");

                        this.handleAcc("Load", "Constant", "01");
                        this.handleXReg("Load", "Constant", "00");

                        this.handleAcc("Store", "Memory", "00");

                        this.handleXReg("Compare", "Memory", "00");

                        this.handleAcc("Load", "Constant", this.boolPointers.false);

                        this.appendText("D0");
                        this.appendText("02");

                        this.handleAcc("Load", "Constant", this.boolPointers.true);
                    } 
                    break;

                case "PrintStatement":
                    if (node == "==") {
                        this.handleXReg("Compare", "Memory", address);

                        this.appendText("D0");
                        this.appendText("0A");

                        this.handleYReg("Load", "Constant", this.boolPointers.true);
                        this.handleXReg("Load", "Memory", "FF");

                        this.handleXReg("Compare", "Memory", "FE");

                        this.appendText("D0");
                        this.appendText("02");

                        this.handleYReg("Load", "Constant", this.boolPointers.false);
                        this.handleXReg("Load", "Constant", "02");
                    } else if (node == "!=") {
                        this.handleXReg("Compare", "Memory", address);

                        this.appendText("D0");
                        this.appendText("0A");

                        this.handleYReg("Load", "Constant", this.boolPointers.false);
                        this.handleXReg("Load", "Memory", "FF");

                        this.handleXReg("Compare", "Memory", "FE");

                        this.appendText("D0");
                        this.appendText("02");

                        this.handleYReg("Load", "Constant", this.boolPointers.true);
                        this.handleXReg("Load", "Constant", "02");
                    } else {
                        this.handleYReg("Load", "Memory", address);
                    }
                    break;

                default:
                    console.log("Unrecognized Node for Generate Comparison");
                    break;
            }
        }

        /**
         * handleAcc(action, type, value)
         * - HandleAcc allows for us to generate
         *   any needed Op Codes regarding the Acc.
         *   Action determines what sequence to follow,
         *   with Type directing on how to handle the
         *   value given.
         */
        public handleAcc(action, type, value) {
            switch(action) {
                case "Load":
                    // Determine Load based on Type
                    if (type == "Memory") {
                        this.appendText("AD");
                        this.appendText(value);
                        this.appendText("00");
                    } else {
                        this.appendText("A9");
                        this.appendText(value)
                    }
                    break;

                case "Store":
                    // Determine Store based on Type
                    if (type == "Memory") {
                        this.appendText("8D");
                        this.appendText(value);
                        this.appendText("00");
                    }
                    break;

                default: 
                    console.log("Unrecognized Action for Acc");
                    break;
            }
        }

        /**
         * handleYReg(action, type, value)
         * - HandleYReg allows for us to generate
         *   any needed Op Codes regarding the Y Reg.
         *   Action determines what sequence to follow,
         *   with Type directing on how to handle the
         *   value given.
         */
        public handleYReg(action, type, value) {
            switch(action) {
                case "Load":
                    if (type == "Memory") {
                        this.appendText("AC");
                        this.appendText(value);
                        this.appendText("XX");
                    } else {
                        this.appendText("A0");
                        this.appendText(value);
                    }
                    break;
                
                case "Load-print":
                    console.log("HANDLEYREG: Recognized Load Print!");
                    if (type == "Memory") {
                        this.appendText("AC");
                        this.appendText(value);
                        this.appendText("00");

                        // Load X Reg w/ 02
                        this.handleXReg("Load", "Constant", "02");
                    } else {
                        this.appendText("A0");
                        this.appendText(value);

                        // Load X Reg w/ 01
                        this.handleXReg("Load", "Constant", "01");
                    }
                    break;

                default:
                    console.log("Unrecognized Action for Y Register");
                    break;
            }
        }

        /**
         * handleXReg(action, type, value)
         * - HandleXReg allows for us to generate
         *   any needed Op Codes regarding the X Reg.
         *   Action determines what sequence to follow,
         *   with Type directing on how to handle the
         *   value given.
         */
        public handleXReg(action, type, value) {
            switch(action) {
                case "Load":
                    if (type == "Memory") {
                        this.appendText("AE");
                        this.appendText(value);
                        this.appendText("00");
                    } else {
                        this.appendText("A2");
                        this.appendText(value);
                    }
                    break;

                case "Compare":
                    if (type == "Memory") {
                        this.appendText("EC");
                        this.appendText(value);
                        this.appendText("00");
                    }
                    break;

                default:
                    console.log("Unrecognized Action for X Register");
            }
        }

        /**
         * appendText(text)
         * - AppendText handles entering
         *   text (code) into our Executable
         *   Image. 
         */
        public appendText(text) {
            console.log("APPENDTEXT: text sent " + text + " at index " + this.textIndex);

            // Add Byte to Executable Image
            this.image[this.textIndex] = text;

            // EmitAction on Byte
            this.emitAction("Byte", text, {index: this.textIndex});

            // Increment Text Index
            this.textIndex++;

            if (this.textIndex >= this.heapIndex) {
                // EmitError for Text + Heap Collision
                this.emitError("Collision", {first: "Stack", second: "Heap"});
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
                var entry = {pointer: temp, value: id, scope: scope, location: ""};

                // Push to staticData
                this.staticData.push(entry);

                return entry.pointer;
                
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

                case "Byte":
                    data = "Generating [ " + value + " ] at index " + data.index;
                    break;

                default: 
                    break;
            }

            // Output Image Entry to User
            _Log.output({level: "DEBUG", data: data});
        }

        public emitError(type, data?) {
            var data;

            switch(type) {
                case "Unsupported":
                    data = "Nested Boolean Expressions are currently unsupported";
                    break;

                case "Collision":
                    data = "Collison between [ " + data.first + " ] and [ " + data.second + " ] generation terminated";
                    break;
            }

            // Update Errors Counter + Output to User
            this.errors++;
            _Log.output({level: "ERROR", data: data});

            // Update Generating Flag to False
            this.generating = false;
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