/* -----
    Parser.ts

    The Parser is used to parse through all programs throughout our compilation and generate a Concrete-Syntax Tree.
    All Productions are based on our Productions List.

----- */
var CSCompiler;
(function (CSCompiler) {
    var Parser = /** @class */ (function () {
        function Parser(tokenStream, currentToken, errors, cst) {
            if (tokenStream === void 0) { tokenStream = []; }
            if (currentToken === void 0) { currentToken = 0; }
            if (errors === void 0) { errors = []; }
            if (cst === void 0) { cst = null; }
            this.tokenStream = tokenStream;
            this.currentToken = currentToken;
            this.errors = errors;
            this.cst = cst;
        }
        Parser.prototype.init = function (tokenStream) {
            // Announce Parser
            _Log.output({ level: "INFO", data: "Starting Parse..." });
            // Default Attributes
            this.tokenStream = tokenStream;
            this.currentToken = 0;
            this.cst = new CSCompiler.Tree();
        };
        /**
         * parse(p)
         * - Parse handles parsing over a given Token Stream.
         *   Tests all Tokens against our Grammar's Productions,
         *   while simutaneously generating our Concrete-Syntax Tree.
         */
        Parser.prototype.parse = function (p) {
            // Get Production Reference
            var production = _Productions.filter(function (production) { return production.name == p; })[0];
            console.log("---------------------");
            console.log("Current Production: " + production.name);
            var epsilon = false;
            // Create new Node for Non-Terminal
            this.cst.addNode(production.name, "branch");
            // Store Index of Respective Production Rule
            var index = 0;
            // Check First Set for Terminal Symbols
            if (production.first.length) {
                outer: 
                // Iterate over nested Terminal Symbols to determine Rule
                for (var i = 0; i < production.first.length; i++) {
                    var valid = false;
                    inner: for (var j = 0; j < production.first[i].length; j++) {
                        // Verify that for all Terminals in the respective Set that they Match
                        if (production.first[i][j] == this.tokenStream[this.currentToken + j].name) {
                            valid = true;
                            break inner;
                        }
                        else {
                            valid = false;
                        }
                    }
                    if (valid) {
                        index = i;
                        break outer;
                    }
                }
                // Consume Terminals for Respective First Set
                for (var terminal in production.first[index]) {
                    this.match(production.first[index][terminal]);
                }
            }
            // Check for Inner-Production(s)
            if (production.inner.length) {
                // Verify if we need to Seek for the correct Inner-Production
                if (production.peek) { // Special Case [Block, StatementList, Statement, Expr]
                    // Get Correct Production
                    var next = this.peek(production.inner[index]);
                    if (next != null) {
                        for (var i = 0; i < next.length; i++) {
                            this.emitMatch(production.name, next[i]);
                            this.parse(next[i]);
                        }
                    }
                    else {
                        // Epsilon Case + EmitMatch
                        console.log("Epsilon Case Hit!");
                        epsilon = true;
                        this.emitMatch(production.inner[0], "\u03B5");
                    }
                }
                else { // General Case
                    for (var i = 0; i < production.inner[index].length; i++) {
                        this.emitMatch(production.name, production.inner[index][i]);
                        this.parse(production.inner[index][i]);
                    }
                }
            }
            // Check Follow Set for Terminal Symbols
            if (production.follow.length) {
                // Consume Terminals for Respective Follow Set
                for (var terminal in production.follow[index]) {
                    this.match(production.follow[index][terminal]);
                }
            }
            // Return back to Parent Node of Current Child
            console.log("Production Calling Ascend: " + production.name);
            this.cst.ascendTree();
        };
        /**
         * peek(production, original?): string
         * - Peek is used to determine the next production
         *   we should follow. We keep searching inner-productions
         *   until a terminal symbol in a Productions First Set
         *   is found matching our Current Token. Which then
         *   we return the name of the production to follow
         *   and continue parsing.
         */
        Parser.prototype.peek = function (productions, original) {
            // Iterate over Potential Productions
            for (var p in productions) {
                // Get Reference to Respective Production
                var production = _Productions.filter(function (production) { return production.name == productions[p]; })[0];
                // Check First Set for Terminals that can aid in our Decision
                if (production.first.length) {
                    for (var i = 0; i < production.first.length; i++) {
                        for (var j = 0; j < production.first[i].length; j++) {
                            if (production.first[i][j] == this.tokenStream[this.currentToken].name) {
                                if (original) {
                                    if (original == "Statment") { // Really annoying special case
                                        return [original, "StatementList"]; // regarding when predicting StatementList
                                    }
                                    else { // peek is nice because when nothing 
                                        return [original]; // matches in specific circumstances 
                                    } // peek is able to recognize epsilon
                                    // However, for StatementList if it isn't null
                                }
                                else { // We have to return both Statement & StatementList productions.
                                    if (production.name == "Statement") {
                                        return [production.name, "StatementList"];
                                    }
                                    else {
                                        return [production.name];
                                    }
                                }
                            }
                        }
                    }
                }
                else {
                    // If there is no First Set, we are most likely looking at another Production, we use original to track the 
                    // current Production we are in before diving into its inner-prouctions.
                    if (original) {
                        return this.peek(production.inner[0], original);
                    }
                    else {
                        return this.peek(production.inner[0], production.name);
                    }
                }
            }
            return null;
        };
        /**
         * match(prodution, expected)
         * - Match is used as the primary pilot for our Parser,
         *   when we expect a terminal symbol, we use match to
         *   determine if our Current Token matches the expected
         *   Token according to our Productions.
         */
        Parser.prototype.match = function (expected) {
            // Validate Current Token against Expected
            if (this.tokenStream[this.currentToken].name == expected) {
                // Create New Node for Terminal
                this.cst.addNode(this.tokenStream[this.currentToken].value, "leaf");
                // Output to Log for Successful Match
                this.emitMatch(expected);
                // Consume Current Token + Ascend Tree to Parent
                this.tokenStream.shift();
                //console.log("Match Calling Ascend: " + expected);
                //this.cst.ascendTree();
            }
            else {
                // emitError for incorrect Token
                this.emitError(expected);
            }
        };
        /**
         * emitMatch(expected, production?)
         * - EmitMatch handles generating our message object
         *   for Log Output.
         */
        Parser.prototype.emitMatch = function (expected, production) {
            if (production) {
                _Log.output({ level: "DEBUG", data: { expected: expected,
                        found: production,
                        loc: { line: this.tokenStream[this.currentToken].line,
                            col: this.tokenStream[this.currentToken].col } } });
            }
            else {
                _Log.output({ level: "DEBUG", data: { expected: expected,
                        found: this.tokenStream[this.currentToken].value,
                        loc: { line: this.tokenStream[this.currentToken].line,
                            col: this.tokenStream[this.currentToken].col } } });
            }
        };
        /**
         * emitError(type, value)
         * - EmitError handles the creation of our Error Entry and
         *   generating our message object for Log Output.
         */
        Parser.prototype.emitError = function (expected) {
            // Format Data Message
            var data = "Expected [ " + expected + " ], found [ " + this.tokenStream[this.currentToken].value + " ] "
                + " on line: " + this.tokenStream[this.currentToken].line
                + " col: " + this.tokenStream[this.currentToken].col;
            // Update Error List + Output to User
            this.errors.push({ expected: expected, value: this.tokenStream[this.currentToken].value,
                line: this.tokenStream[this.currentToken].line, col: this.tokenStream[this.currentToken].col });
            _Log.output({ level: "ERROR", data: data });
        };
        return Parser;
    }());
    CSCompiler.Parser = Parser;
})(CSCompiler || (CSCompiler = {}));
