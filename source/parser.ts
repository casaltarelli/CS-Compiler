/* -----
    Parser.ts

    The Parser is used to parse through all programs throughout our compilation and generate a Concrete-Syntax Tree.
    All Productions are based on our Productions List.

----- */

module CSCompiler {
    export class Parser { 
        constructor(public parsing = true,
                    public tokenStream = [],
                    public currentToken = 0,
                    public errors = [],
                    public cst = null) {}

        public init(tokenStream: Array<Token> ): void {
            // Announce Parser
            _Log.output({level: "INFO", data: "Starting Parse..."});

            // Default Attributes
            this.parsing = true;
            this.tokenStream = tokenStream;
            this.currentToken = 0;
            this.errors = [];
            this.cst = new Tree();
        }

        /**
         * parse(p)
         * - Parse handles parsing over a given Token Stream.
         *   Tests all Tokens against our Grammar's Productions,
         *   while simutaneously generating our Concrete-Syntax Tree.
         */
        public parse(p) {
            // Get Production Reference + Index of Production Rule
            var production = _Productions.filter((production) => {return production.name == p})[0];
            var index = this.getRule(production.first);
            var epsilon = false;    // Epsilon Flag for ascendTree

            // Check if we have consumed all Tokens from Stream
            if (this.parsing && this.tokenStream.length == 0) {
                // Return generated CST
                return this.cst;
            } else {
                // Validate that Parse hasn't found any Errors
                if (this.parsing) {
                    // Create new Node for Non-Terminal
                    if (!production.peek) {
                        this.cst.addNode(production.name, "branch");
                    } else if (this.peek(production.inner[index]) != null) {
                        this.cst.addNode(production.name, "branch");    
                    }

                    // Check First Set for Terminal Symbols
                    if (production.first.length) {
                        // Consume Terminals for Respective First Set
                        if (production.ambiguous) {
                            this.match(production.name, production.first[index], true);
                        } else {
                            for (var terminal in production.first[index]) {
                                if (_Productions.filter((p) => {return p.name == production.first[index][terminal]}).length
                                && production.name != production.first[index][terminal]) {
                                    this.parse(production.first[index][terminal]);
                                } else {
                                    this.match(production.name, production.first[index][terminal]);
                                }
                            }
                        }
                    }

                    // Check for Inner-Production(s)
                    if (production.inner.length) {
                        // Verify if we need to Seek for the correct Inner-Production
                        if (production.peek) {  // Special Case [Block, StatementList, Statement, Expr]
                            // Get Correct Production
                            var next = this.peek(production.inner[index]);

                            if (next != null) {
                                for (var i = 0; i < next.length; i++) {
                                    this.emitMatch(production.name, next[i]);
                                    this.parse(next[i]);
                                }
                            } else {
                                // Epsilon Case + EmitMatch
                                epsilon = true;
                                this.emitMatch(production.inner[0][0], "\u03B5");
                            }
                        } else {                // General Case
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
                            this.match(production.name, production.follow[index][terminal]);
                        }
                    }

                    // Return back to Parent Node of Current Child
                    if (!epsilon || (production.name != "Statement" && production.name != "StatementList")) {
                        this.cst.ascendTree();
                    }
                } else {
                    // Error Found in Parse -- Exit
                    return null;
                }
            }
        }

        /**
         * peek(production, original?): string
         * - Peek is used to determine the next production
         *   we should follow. We keep searching inner-productions
         *   until a terminal symbol in a Productions First Set
         *   is found matching our Current Token. Which then
         *   we return the name of the production to follow
         *   and continue parsing.
         */
        public peek(productions: Array<String>, original?) {
            // Iterate over Potential Productions
            for (var p in productions) {
                // Get Reference to Respective Production
                var production = _Productions.filter((production) => {return production.name == productions[p]})[0];

                // Check First Set for Terminals that can aid in our Decision
                if (production.first.length) {
                    for (var i = 0; i < production.first.length; i++) {
                        for (var j = 0; j < production.first[i].length; j++) {
                            if (production.first[i][j] == this.tokenStream[this.currentToken].name) {
                                if (original) {
                                    if (original == "Statement") {              // Really annoying special case
                                        return [original, "StatementList"]      // regarding when predicting StatementList
                                    } else {                                    // peek is nice because when nothing 
                                        return [original];                      // matches in specific circumstances 
                                    }                                           // peek is able to recognize epsilon
                                                                                // However, for StatementList if it isn't null
                                } else {                                        // We have to return both Statement & StatementList productions.
                                    if (production.name == "Statement") {
                                        return [production.name, "StatementList"]
                                    } else {
                                        return [production.name];
                                    }
                                }
                            }
                        }
                    }
                    
                } else {
                    // If there is no First Set, we are most likely looking at another Production, we use original to track the 
                    // current Production we are in before diving into its inner-prouctions.
                    if (original) {
                        return this.peek(production.inner[0], original);
                    } else {
                        return this.peek(production.inner[0], production.name);
                    }
                }
            }

            // Return null for Epsilon Case
            return null;
        }

        /**
         * getRule(productions): int
         * - GetRule is used to determine which Rule our Parser
         *   needs to follow for a respective Production. Based
         *   on that Productions First Set. Defaults to 0
         */
        public getRule(first) {
            var rule = 0;
            
            // Only Seek for Correct Rule if Production conatins multiple rules
            if (first.length) {
                out:
                // Iterate over nested Terminal Symbols to determine Rule
                for (var i = 0; i < first.length; i++) {
                    var valid = false;
                    for (var j = 0; j < first[i].length; j++) {
                        // Verify that for all Terminals in the respective Set that they Match
                        if (first[i][j] == this.tokenStream[this.currentToken + j].name) {
                            valid = true;
                        } else {
                            valid = false;
                        }
                    }

                    if (valid) {
                        rule = i;
                        break out;
                    }
                }
            }

            return rule;
        }

        /**
         * match(production, expected, ambiguous?)
         * - Match is used as the primary pilot for our Parser,
         *   when we expect a terminal symbol, we use match to 
         *   determine if our Current Token matches the expected 
         *   Token according to our Productions.
         */
        public match(production, expected, ambiguous?) {
            var match = false;

            // Check if Expected could be multiple values, otherwise compare as normal
            out:
            if (ambiguous) {
                for (var term in expected) {
                    if (this.tokenStream[this.currentToken].name == expected[term]) {
                        expected = production;
                        match = true;
                        break out;
                    }   
                }
            } else if (this.tokenStream[this.currentToken].name == expected) {
                match = true;
            }

            // Valid Match Found for Token
            if (match) {
                // Create New Node for Terminal
                this.cst.addNode(this.tokenStream[this.currentToken].value, "leaf");

                // Output to Log for Successful Match
                this.emitMatch(expected);

                // Consume Current Token + Ascend Tree to Parent
                this.tokenStream.shift();
            } else {
               // emitError for incorrect Token
               this.emitError(expected); 
            }
        }

        /**
         * emitMatch(expected, production?) 
         * - EmitMatch handles generating our message object
         *   for Log Output.
         */
        public emitMatch(expected, production?) {
            // Determine Output Structure based on Production or Token Flag
            if (this.parsing) {
                if (production) {
                    _Log.output({level: "DEBUG", data: {expected: expected, 
                        found: production, 
                        loc: {line: this.tokenStream[this.currentToken].line, 
                        col: this.tokenStream[this.currentToken].col}}});   
                } else {
                    _Log.output({level: "DEBUG", data: {expected: expected, 
                        found: this.tokenStream[this.currentToken].value, 
                        loc: {line: this.tokenStream[this.currentToken].line, 
                        col: this.tokenStream[this.currentToken].col}}});
                }
            }
        }

        /**
         * emitError(expected)
         * - EmitError handles the creation of our Error Entry and
         *   generating our message object for Log Output.
         */
        public emitError(expected) {
            // Check Parsing Flag to prevent output of Additional Messages after initial Error
            if (this.parsing) {
                // Update Parsing Flag
                this.parsing = false;

                // Format Data Message
                var data = "Expected [ " + expected + " ], found [ " + this.tokenStream[this.currentToken].value + " ] "
                + " on line: " + this.tokenStream[this.currentToken].line 
                + " col: " + this.tokenStream[this.currentToken].col;

                // Update Error List + Output to User
                this.errors.push({expected: expected, value: this.tokenStream[this.currentToken].value, 
                    line: this.tokenStream[this.currentToken].line, col: this.tokenStream[this.currentToken].col})
                _Log.output({level: "ERROR", data: data});
            }
        }
    }
}