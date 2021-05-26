/* -----
    CodeGeneration.ts

    Code Generation is used to develop our Executable Image using 6502a Assembly Op Codes. Based on our Intermediate
    Representation (AST) that was developed in Semantic Analysis and our Symbol Table(s). We will be able to execute
    a pre-order traversal of our AST to generate our Machine Code based on our Basic Blocks. One Code Generation is
    completed, we will then execute Stack Allocation and Backpatching to replace all temporary Addresses and Jumps.

----- */
var CSCompiler;
(function (CSCompiler) {
    var CodeGeneration = /** @class */ (function () {
        function CodeGeneration(ast, symbolTable, errors, generating, staticData, jumpData, heapData, scope, textIndex, heapIndex, boolPointers, image) {
            if (ast === void 0) { ast = null; }
            if (symbolTable === void 0) { symbolTable = null; }
            if (errors === void 0) { errors = 0; }
            if (generating === void 0) { generating = true; }
            if (staticData === void 0) { staticData = null; }
            if (jumpData === void 0) { jumpData = null; }
            if (heapData === void 0) { heapData = null; }
            if (scope === void 0) { scope = -1; }
            if (textIndex === void 0) { textIndex = 0; }
            if (heapIndex === void 0) { heapIndex = 256; }
            if (boolPointers === void 0) { boolPointers = { "true": "", "false": "" }; }
            if (image === void 0) { image = []; }
            this.ast = ast;
            this.symbolTable = symbolTable;
            this.errors = errors;
            this.generating = generating;
            this.staticData = staticData;
            this.jumpData = jumpData;
            this.heapData = heapData;
            this.scope = scope;
            this.textIndex = textIndex;
            this.heapIndex = heapIndex;
            this.boolPointers = boolPointers;
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
            this.heapData = [];
            this.textIndex = 0;
            this.heapIndex = 256;
            this.scope = -1;
            this.boolPointers = { "true": "", "false": "" };
            this.image = [];
            // Inititalize Executable Image
            this.initImage();
            // Allocate Boolean Values to Heap (Optimization)
            this.boolPointers["true"] = this.appendHeap("true");
            this.boolPointers["false"] = this.appendHeap("false");
        };
        /**
         * generate(node)
         * - Generate is the primary driver for
         *   developing our Executable Image. Done
         *   through a Preorder Traversal of our
         *   AST.
         */
        CodeGeneration.prototype.generate = function (node) {
            if (this.generating) { // [General Case]
                // Update Visited Flag on Node
                node.visited = true;
                // Check if Current Node is Block
                if (node.name == "Block") {
                    // Increment Scope for New Block
                    this.scope++;
                }
                else {
                    // EmitAction on current Production + Get Basic Block Reference
                    this.emitAction("Production", node.name, node.data);
                    // Get Block Reference for Production
                    var block = _Blocks.filter(function (b) { return b.name == node.name; })[0];
                    if (block) {
                        // Check if we need to Allocate First Segment
                        if (block.first.allocate) {
                            this.allocate(block.register, block.first.action, node.children[block.first.child]);
                        }
                        // Proceed to Children for current Node
                        for (var child in node.children) {
                            if (!(node.children[child].visited)) {
                                // TODO:- Develop Check for Operator Child
                                this.generate(node.children[child]);
                            }
                        }
                        // Check if we need to Allocate for Final Segment
                        if (block.final.allocate) {
                            this.allocate(block.register, block.final.action, node.children[block.final.child]);
                        }
                        else {
                            block.final.generate();
                        }
                    }
                    // Check for JumpFlag + UnconditionalFlag
                    // TODO:- Implement JumpFlag Handeling
                }
            }
            else { // [Base Case]
            }
        };
        /**
         * allocate(reg, action, node)
         * - Allocate is used to generate the
         *   correct text for a specific Action
         *   on a given Register
         */
        CodeGeneration.prototype.allocate = function (reg, action, node) {
            // Update Visited Flag on Child Node
            node.visited = true;
            // Determine Node Type
            var data = this.getType(node);
            switch (reg) {
                case "Acc":
                    this.handleAcc(action, data.type, data.value);
                    break;
                case "XReg":
                    this.handleXReg(action, data.type, data.value);
                    break;
                case "YReg":
                    this.handleYReg(action, data.type, data.value);
                    break;
                default:
                    console.log("Unrecognized Register Allocation Request");
            }
        };
        /**
         * handleAcc(action, type, value)
         * - HandleAcc allows for us to generate
         *   any needed Op Codes regarding the Acc.
         *   Action determines what sequence to follow,
         *   with Type directing on how to handle the
         *   value given.
         */
        CodeGeneration.prototype.handleAcc = function (action, type, value) {
            switch (action) {
                case "load":
                    // Determine Load based on Type
                    if (type == "Memory") {
                        this.appendText("AD");
                        this.appendText(value);
                        this.appendText("00");
                    }
                    else {
                        this.appendText("A9");
                        this.appendText(value);
                    }
                    break;
                case "store":
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
        };
        /**
         * handleYReg(action, type, value)
         * - HandleYReg allows for us to generate
         *   any needed Op Codes regarding the Y Reg.
         *   Action determines what sequence to follow,
         *   with Type directing on how to handle the
         *   value given.
         */
        CodeGeneration.prototype.handleYReg = function (action, type, value) {
            switch (action) {
                case "load":
                    if (type == "Memory") {
                        this.appendText("AC");
                        this.appendText(value);
                        this.appendText("XX");
                    }
                    else {
                        this.appendText("A0");
                        this.appendText(value);
                    }
                    break;
                case "load-print":
                    if (type == "Memory") {
                        this.appendText("AC");
                        this.appendText(value);
                        this.appendText("00");
                        // Load X Reg w/ 02
                        this.handleXReg("load", "Constant", "02");
                    }
                    else {
                        this.appendText("A0");
                        this.appendText(value);
                        // Load X Reg w/ 01
                        this.handleXReg("load", "Constant", "01");
                    }
                    break;
                default:
                    console.log("Unrecognized Action for Y Register");
                    break;
            }
        };
        /**
         * handleXReg(action, type, value)
         * - HandleXReg allows for us to generate
         *   any needed Op Codes regarding the X Reg.
         *   Action determines what sequence to follow,
         *   with Type directing on how to handle the
         *   value given.
         */
        CodeGeneration.prototype.handleXReg = function (action, type, value) {
            switch (action) {
                case "load":
                    if (type == "Memory") {
                        this.appendText("AE");
                        this.appendText(value);
                        this.appendText("00");
                    }
                    else {
                        this.appendText("A2");
                        this.appendText(value);
                    }
                    break;
            }
        };
        CodeGeneration.prototype.generateOperator = function (node) {
            // EmitAction on Current Operator
            this.emitAction("Production", node.name, node.data);
            switch (node.name) {
                case "+":
                    // Get Type of RHS
                    var data = this.getType(node.children[1]);
                    // Load Acc + Store in Memory at Default Location
                    this.handleAcc("load", data.type, data.value);
                    this.handleAcc("store", "Memory", "00");
                    // Load Acc w/ LHS
                    this.handleAcc("load", "Constant", node.children[0].name);
                    // Manually Append Add w/ Carry
                    this.appendText("6D");
                    this.appendText("00");
                    this.appendText("00");
                    // Store Sum at Default Location
                    this.handleAcc("store", "Memory", "00");
                    break;
                case "==":
                case "!=":
                    // Get Type of LHS
                    var data = this.getType(node.children[0]);
                    // Load X Reg w/ LHS
                    this.handleXReg("load", data.type, data.value);
                    // Get Type of RHS
                    data = this.getType(node.children[1]);
                    // Load Acc w/ RHS + Store at Default Location
                    this.handleAcc("load", data.type, data.value);
                    this.handleAcc("store", "Memory", "00");
            }
            // Return Default Location
            return "00";
        };
        /**
         * getType(node) : { type, value }
         * - GetType is used to recognize the
         *   type of Value we are dealing with
         *   (Constant or Memory Pointer)
         */
        CodeGeneration.prototype.getType = function (node) {
            var type = "";
            var value = "";
            // Validate Not Null [Default Value Case]
            if (node != null) {
                if (node.children.length != 0) {
                    // Check for Nested Operator
                    if (node.parent.name != "==" || node.parent.name != "!=") {
                        type = "Memory";
                        value = this.generateOperator(node);
                    }
                    else {
                        // TODO:- Develop EmitError 
                    }
                }
                else if (!isNaN(node.name) || node.name == "true" || node.name == "false") {
                    type = "Constant";
                    if (node.name == "true") {
                        value = this.boolPointers["true"];
                    }
                    else if (node.name == "false") {
                        value = this.boolPointers["false"];
                    }
                    else {
                        value = "0" + node.name;
                    }
                }
                else if (node.name.indexOf("\"") > -1) {
                    type = "Constant";
                    // Get Dynamic Pointer from Heap
                    value = this.appendHeap(node.name);
                }
                else {
                    type = "Memory";
                    // Get Static Pointer from Static Data
                    value = this.appendStack(node.name, this.scope);
                }
            }
            else {
                type = "Constant";
                value = "00"; // Default Value
            }
            return { type: type, value: value };
        };
        /**
         * appendText(text)
         * - AppendText handles entering
         *   text (code) into our Executable
         *   Image.
         */
        CodeGeneration.prototype.appendText = function (text) {
            // Add Byte to Executable Image
            this.image[this.textIndex] == text;
            // EmitAction on Byte
            this.emitAction("Byte", text, { index: this.textIndex });
            // Increment Text Index
            this.textIndex++;
            if (this.textIndex >= this.heapIndex) {
                // EmitError for Text + Heap Collision
                this.emitError("Collision", { first: "Stack", second: "Heap" });
            }
        };
        /**
         * appendStack(id, scope)
         * - AppendStack handles creating new
         *   static entries into our StaticData.
         *   Also can recognize duplicate entries in
         *   which the correct pointer will be returned.
         */
        CodeGeneration.prototype.appendStack = function (id, scope) {
            // Validate Identifer Doesn't Exist
            var pointer = this.getEntry(id, this.staticData, scope);
            if (pointer == "") {
                // Generate Temporary Address + Static Data Object
                var temp = "T" + this.staticData.length;
                var entry = { pointer: temp, value: id, scope: scope, location: "" };
                // Push to staticData
                this.staticData.push(entry);
                return entry.pointer;
            }
            else {
                return pointer;
            }
        };
        /**
         * appendHeap(s) : String
         * - AppendHeap handles creating new
         *   dynamic/reference variables to our Heap.
         *   Also can recognize duplicate entries in
         *   which the correct pointer will be returned.
         */
        CodeGeneration.prototype.appendHeap = function (s) {
            // Trim S of Quotes
            if (s.indexOf("\"") > -1) {
                s = s.substring(1, s.length - 1);
            }
            // Validate Entry Doesn't Exist
            var pointer = this.getEntry(s, this.heapData);
            if (pointer == "") {
                // Create Heap Data Object
                var entry = { pointer: "", value: s };
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
                entry.pointer = (this.heapIndex + 1).toString(16).toLocaleUpperCase();
                this.heapData.push(entry);
                return (this.heapIndex + 1).toString(16).toLocaleUpperCase();
            }
            else {
                return pointer;
            }
        };
        /**
         * getEntry(name, list, scope?)
         * - GetEntry is used to determine if an entry in
         *   the given list exists. If so, returns the Static
         *   Pointer or Empty Pointer to signify no entry.
         */
        CodeGeneration.prototype.getEntry = function (value, list, scope) {
            var pointer = "";
            // Seek Value in List
            if (list.length > 0) {
                for (var entry in list) {
                    if (scope) {
                        if (list[entry].value == value && list[entry].scope == scope) {
                            pointer = list[entry].pointer;
                        }
                    }
                    else {
                        if (list[entry].value == value) {
                            pointer = list[entry].pointer;
                        }
                    }
                }
            }
            return pointer;
        };
        /**
         * emitAction(type, value, data?)
         * - EmitAction is used to format our
         *   messages for Log Output
         */
        CodeGeneration.prototype.emitAction = function (type, value, data) {
            var data;
            switch (type) {
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
            _Log.output({ level: "DEBUG", data: data });
        };
        CodeGeneration.prototype.emitError = function (type, data) {
            var data;
            switch (type) {
                case "Unsupported":
                    data = "Nested Boolean Expressions are currently unsupported";
                    break;
                case "Collision":
                    data = "Collison between [ " + data.first + " ] and [ " + data.second + " ] generation terminated";
                    break;
            }
            // Update Errors Counter + Output to User
            this.errors++;
            _Log.output({ level: "ERROR", data: data });
            // Update Generating Flag to False
            this.generating = false;
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
