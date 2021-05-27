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
        function CodeGeneration(ast, symbolTable, errors, generating, comparisonFlag, staticData, jumpData, heapData, scope, textIndex, heapIndex, activeJumps, boolPointers, whilePointers, image) {
            if (ast === void 0) { ast = null; }
            if (symbolTable === void 0) { symbolTable = null; }
            if (errors === void 0) { errors = 0; }
            if (generating === void 0) { generating = true; }
            if (comparisonFlag === void 0) { comparisonFlag = false; }
            if (staticData === void 0) { staticData = null; }
            if (jumpData === void 0) { jumpData = null; }
            if (heapData === void 0) { heapData = null; }
            if (scope === void 0) { scope = -1; }
            if (textIndex === void 0) { textIndex = 0; }
            if (heapIndex === void 0) { heapIndex = 255; }
            if (activeJumps === void 0) { activeJumps = []; }
            if (boolPointers === void 0) { boolPointers = { "true": "", "false": "" }; }
            if (whilePointers === void 0) { whilePointers = { start: 0, branch: 0 }; }
            if (image === void 0) { image = []; }
            this.ast = ast;
            this.symbolTable = symbolTable;
            this.errors = errors;
            this.generating = generating;
            this.comparisonFlag = comparisonFlag;
            this.staticData = staticData;
            this.jumpData = jumpData;
            this.heapData = heapData;
            this.scope = scope;
            this.textIndex = textIndex;
            this.heapIndex = heapIndex;
            this.activeJumps = activeJumps;
            this.boolPointers = boolPointers;
            this.whilePointers = whilePointers;
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
            this.comparisonFlag = false;
            this.staticData = [];
            this.jumpData = [];
            this.heapData = [];
            this.scope = -1;
            this.textIndex = 0;
            this.heapIndex = 256;
            this.activeJumps = [];
            this.boolPointers = { "true": "", "false": "" };
            this.whilePointers = { start: 0, branch: 0 };
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
            var _this = this;
            if (this.generating) { // [General Case]
                // Update Visited Flag on Node
                node.visited = true;
                // Check if Current Node is Block
                if (node.name == "Block") {
                    // Increment Scope for New Block
                    this.scope = this.scope + 1;
                    // Recursivley Call Children
                    if (node.children.length) {
                        for (var c in node.children) {
                            this.generate(node.children[c]);
                        }
                    }
                }
                else {
                    // Get Block Reference for Production
                    var block = _Blocks.filter(function (b) { return b.name == node.name; })[0];
                    if (block) {
                        // EmitAction on current Node + Get Basic Block Reference
                        this.emitAction("Production", node.name, node.data);
                        // Check for White Statement Block -- Collect Start Point
                        if (block.name == "WhileStatement") {
                            this.whilePointers.start = this.textIndex;
                        }
                        // Check if we need to Allocate First Segment
                        if (block.first.allocate) {
                            this.allocate(block.register, block.first.action, node.children[block.first.child]);
                            // Check if Operator Found in First Segement
                            if (this.comparisonFlag) {
                                // Execute Comparison Generation for First Child of Production
                                this.generateComparison(node.name, node.children[block.first.child].name, "00");
                                this.comparisonFlag = false;
                            }
                        }
                        // Proceed to Children for current Node
                        for (var child in node.children) {
                            if (!(node.children[child].visited)) {
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
                }
                // On Block Exit -- Check if Distance can be Calculated for Active Jumps
                if (node.name == "Block") {
                    if (this.activeJumps.length > 0) {
                        // Check Parent of Current Nose to Determine Calculation
                        if (node.parent.name == "WhileStatement") {
                            this.appendJump(this.activeJumps[1].pointer, padHex((((this.image.length - this.textIndex) + this.whilePointers.start).toString(16).toLocaleUpperCase())));
                            this.appendJump(this.activeJumps[0].pointer, padHex((this.textIndex - (this.activeJumps[0].start + 2).toString(16).toLocaleUpperCase())));
                            // Remove Jumps from Active List
                            this.activeJumps.filter(function (j) { return j.pointer != _this.activeJumps[0].pointer || j.pointer != _this.activeJumps[1].pointer; });
                        }
                        else {
                            // Calculate Distance for Jump
                            this.appendJump(this.activeJumps[0].pointer, padHex(((this.textIndex - (this.activeJumps[0].start + 2)).toString(16).toLocaleUpperCase())));
                            // Remove Jump from Active List
                            this.activeJumps.filter(function (j) { return j.pointer != _this.activeJumps[0].pointer; });
                        }
                    }
                }
            }
            else { // [Base Case] - Exit
                return;
            }
        };
        /**
         * allocate(reg, action, node)
         * - Allocate is used to generate the
         *   correct text for a specific Action
         *   on a given Register.
         */
        CodeGeneration.prototype.allocate = function (reg, action, node) {
            // Determine Node Type
            var data = this.getType(node);
            // Don't Execute Action on Operator Node
            if (node != null) {
                if (this.comparisonFlag || node.parent.name == "IfStatement" || node.parent.name == "WhileStatement") {
                    return;
                }
            }
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
         * getType(node) : { type, value }
         * - GetType is used to recognize the
         *   type of Value we are dealing with
         *   (Constant or Memory Pointer).
         */
        CodeGeneration.prototype.getType = function (node) {
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
                    }
                    else {
                        this.emitError("Unsupported");
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
                    type = "Memory";
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
        CodeGeneration.prototype.generateOperator = function (node) {
            // EmitAction on Current Operator
            this.emitAction("Production", node.name, node.data);
            switch (node.name) {
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
        };
        CodeGeneration.prototype.generateComparison = function (parent, node, address) {
            switch (parent) {
                case "AssignmentStatement":
                    console.log("GENCOMPARISON: Recognized Parent AssignStatement");
                    if (node == "==") {
                        console.log("GENCOMPARISON: Recognized Child ==");
                        this.handleXReg("Compare", "Memory", address);
                        this.handleAcc("Load", "Constant", this.boolPointers["false"]);
                        // BNE 2 Bytes
                        this.appendText("D0");
                        this.appendText("02");
                        this.handleAcc("Load", "Constant", this.boolPointers["true"]);
                    }
                    else if (node == "!=") {
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
                        this.handleAcc("Load", "Constant", this.boolPointers["false"]);
                        // BNE 2 Bytes
                        this.appendText("D0");
                        this.appendText("02");
                        this.handleAcc("Load", "Constant", this.boolPointers["true"]);
                    }
                    break;
                case "PrintStatement":
                    if (node == "==") {
                        this.handleXReg("Compare", "Memory", address);
                        // BNE 10 Bytes
                        this.appendText("D0");
                        this.appendText("0A");
                        this.handleYReg("Load", "Constant", this.boolPointers["true"]);
                        this.handleXReg("Load", "Memory", "FF");
                        this.handleXReg("Compare", "Memory", "FE");
                        // BNE 2 Bytes
                        this.appendText("D0");
                        this.appendText("02");
                        this.handleYReg("Load", "Constant", this.boolPointers["false"]);
                        this.handleXReg("Load", "Constant", "02");
                    }
                    else if (node == "!=") {
                        this.handleXReg("Compare", "Memory", address);
                        // BNE 10 Bytes
                        this.appendText("D0");
                        this.appendText("0A");
                        this.handleYReg("Load", "Constant", this.boolPointers["false"]);
                        this.handleXReg("Load", "Memory", "FF");
                        this.handleXReg("Compare", "Memory", "FE");
                        // BNE 2 Bytes
                        this.appendText("D0");
                        this.appendText("02");
                        this.handleYReg("Load", "Constant", this.boolPointers["true"]);
                        this.handleXReg("Load", "Constant", "02");
                    }
                    else if (node == "+") {
                        this.handleYReg("Load", "Memory", address);
                        this.handleXReg("Load", "Constant", "01");
                    }
                    break;
                case "IfStatement":
                case "WhileStatement":
                    if (node == "true" || node == "false") {
                        // Load X Reg w/ Respective Bool Value
                        if (node == "true") {
                            this.handleXReg("Load", "Memory", this.boolPointers["true"]);
                        }
                        else {
                            this.handleXReg("Load", "Memory", this.boolPointers["false"]);
                        }
                        // Compare to True Pointer
                        this.handleXReg("Compare", "Memory", this.boolPointers["true"]);
                    }
                    else if (node == "==") {
                        // Compare X Reg to Default Address
                        this.handleXReg("Compare", "Memory", address);
                    }
                    else if (node == "!=") {
                        // Compare X Reg to Default Address
                        this.handleXReg("Compare", "Memory", address);
                        this.handleAcc("Load", "Constant", "00");
                        // BNE 2 Bytes
                        this.appendText("D0");
                        this.appendText("02");
                        // Flip Outcome for NOT
                        this.handleAcc("Load", "Constant", "01");
                        this.handleXReg("Load", "Constant", "00");
                        this.handleAcc("Store", "Memory", "00");
                        this.handleXReg("Compare", "Memory", "00");
                    }
                    // Additional Instuctions for If before Inner-Block Generation
                    if (parent == "IfStatement") {
                        this.appendText("D0");
                        this.appendText(this.appendJump(this.jumpData.length));
                    }
                    // Additional Instructions for While before Inner-Block Generation
                    if (parent == "WhileStatement") {
                        this.handleAcc("Load", "Constant", "01");
                        this.appendText("D0");
                        this.appendText("02");
                        this.handleAcc("Load", "Constant", "00");
                        this.handleXReg("Load", "Constant", "00");
                        this.handleAcc("Store", "Memory", "00");
                        this.handleXReg("Compare", "Memory", "00");
                        this.appendText("D0");
                        this.appendText(this.appendJump(this.jumpData.length));
                    }
                    break;
                default:
                    console.log("Unrecognized Node for Generate Comparison");
                    break;
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
                case "Load":
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
                case "Load":
                    if (type == "Memory") {
                        this.appendText("AC");
                        this.appendText(value);
                        this.appendText("00");
                    }
                    else {
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
                    }
                    else {
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
                case "Load":
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
                case "Compare":
                    if (type == "Memory") {
                        this.appendText("EC");
                        this.appendText(value);
                        this.appendText("00");
                    }
                    break;
                default:
                    console.log("Unrecognized Action for X Register");
                    break;
            }
        };
        /**
         * appendText(text)
         * - AppendText handles entering
         *   text (code) into our Executable
         *   Image.
         */
        CodeGeneration.prototype.appendText = function (text) {
            // Add Byte to Executable Image
            this.image[this.textIndex] = text;
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
         * appendStack(id, scope) : String
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
         * appendJump(id, dist?)
         * - AppendJump is used to create entries
         *   to our JumpData. It will return a new
         *   temporary jump ID. Dist is used for sitautions
         *   when we want to update the distance of
         *   a entry.
         */
        CodeGeneration.prototype.appendJump = function (id, dist) {
            console.log("APPENDJUMP: id given: " + id);
            // Check if Entry Exists
            var value = this.getEntry(id, this.jumpData);
            if (value == "") {
                // Generate New Jump Object
                var entry = { pointer: "J" + this.jumpData.length, distance: 0, start: this.textIndex - 1 }; // -1 could fuck up while
                // Check if Distance is already known
                if (dist) {
                    entry.distance = dist;
                    console.log("APPENDJUMP: Distance " + entry.distance);
                }
                // Push Entry to Jump Data + ActiveJumps
                this.jumpData.push(entry);
                this.activeJumps.push(entry);
                return entry.pointer;
            }
            else {
                for (var j in this.jumpData) {
                    if (this.jumpData[j].pointer == id) {
                        if (dist) {
                            this.jumpData[j].distance = dist;
                            return dist;
                        }
                    }
                }
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
            out: if (list.length > 0) {
                for (var entry in list) {
                    if (scope) {
                        if (list[entry].value == value && list[entry].scope == scope) {
                            pointer = list[entry].pointer;
                            break out;
                        }
                    }
                    else {
                        if (list[entry].pointer == value) {
                            pointer = list[entry].pointer;
                            break out;
                        }
                    }
                }
            }
            return pointer;
        };
        /**
         * backpatch()
         * - Backpatch is used to define our Stack
         *   and update all temporary values for
         *   our Static Data and Jumps in our
         *   Executable Image.
         */
        CodeGeneration.prototype.backpatch = function () {
            var _this = this;
            // Define StaticArea
            var staticIndex = this.textIndex + 2; // Include 00 Delimeter for Source Program
            // Check for Collision
            if (staticIndex + this.staticData.length >= this.heapIndex) {
                // EmitError
                this.emitError("Collision", { first: "Stack", second: "Heap" });
            }
            else {
                // Populate Addresses
                for (var i = 0; i < this.staticData.length; i++) {
                    var address = padHex(staticIndex.toString(16).toLocaleUpperCase());
                    // Update Location Attribute + Increment StaticIndex
                    this.staticData[i].location = address;
                    staticIndex++;
                }
            }
            // Update Image for Address + Distance
            for (var i = 0; i < this.image.length; i++) {
                if (this.image[i].charAt(0) == "T") {
                    // Find Temp in Static Data
                    var entry = this.staticData.filter(function (s) { return s.pointer == _this.image[i]; })[0];
                    // Update Byte
                    this.image[i] = entry.location;
                    // EmitAction
                    this.emitAction("Byte-Address", entry.pointer, { address: entry.location, index: i });
                }
                else if (this.image[i].charAt(0) == "J") {
                    // Find Temp in Jump Data
                    var entry = this.jumpData.filter(function (j) { return j.pointer == _this.image[i]; })[0];
                    // Update Byte
                    this.image[i] = entry.distance;
                    // EmitAction
                    this.emitAction("Byte-Jump", entry.pointer, { distance: entry.distance, index: i });
                }
            }
        };
        /**
         * emitAction(type, value, data?)
         * - EmitAction is used to format our
         *   messages for Log Output.
         */
        CodeGeneration.prototype.emitAction = function (type, value, data) {
            var data;
            if (this.generating) {
                switch (type) {
                    case "Production":
                        data = "Generating for [ " + value + " ] on line: " + data.line + " on col: " + data.col;
                        break;
                    case "Byte":
                        data = "Generating [ " + value + " ] at index: " + data.index;
                        break;
                    case "Byte-Address":
                        data = "Backpatched [ " + value + " ] with Static Address [ " + data.address + " ] at index: " + data.index;
                        break;
                    case "Byte-Jump":
                        data = "Backpatched [ " + value + " ] with Distance [ " + data.address + " ] at index: " + data.index;
                        break;
                    default:
                        break;
                        ;
                }
                // Output Image Entry to User
                _Log.output({ level: "DEBUG", data: data });
            }
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
         *   our Executable Image to 00.
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
