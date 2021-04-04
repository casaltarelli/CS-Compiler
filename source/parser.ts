/* -----
    Parser.ts

    The Parser is used to parse through all programs throughout our compilation and generate a Concrete-Syntax Tree.
    All Productions are based on our Productions List.

----- */

module CSCompiler {
    export class Parser { 
        constructor(public tokenStream = [],
                    public currentToken = null,
                    public errors = []) {}

        public init(tokenStream: Array<Token> ): void {
            // Announce Parser
            _Log.output({level: "INFO", data: "Starting Parse..."});

            // Default Attributes
            this.tokenStream = tokenStream;
            this.currentToken = tokenStream[0];
        }

        /**
         * parse(p)
         * - Parse handles parsing over a given Token Stream.
         *   Tests all Tokens against our Grammar's Productions,
         *   while simutaneously generating our Concrete-Syntax Tree.
         */
        public parse(p) {
            // Get Production Reference
            var production = _Productions.filter((production) => {return production.name == p})[0];

            // TODO: Create new Node for all New Productions - match() will handle creating Nodes for Terminals

            // Store Index of Respective Production Rule
            var index = 0;

            // Check First Set for Terminal Symbols
            if (production.first.length) {
                outer:
                // Iterate over nested Terminal Symbols to determine Rule
                for (var i = 0; i < production.first.length; i++) {
                    var valid = false;
                    inner:
                    for (var j = 0; j < production.first[i].length; j++) {
                        // Verify that for all Terminals in the respective Set that they Match
                        if (production.first[i][j] == this.tokenStream[this.currentToken + j]) {
                            valid = true;
                            break inner;
                        } else {
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
                if (production.peek) {  // Special Case [StatementList, Statement, Expr]
                    // Get Correct Production
                    var next = this.peak(production.inner[index]);

                    if (next != null) {
                        for (var i = 0; i < next.length; i++) {
                            this.parse(next[i]);
                        }
                    } else {
                        // TODO: Define epsilon functionality
                    }
                } else {                // General Case
                    for (var i = 0; i < production.inner[index].length; i++) {
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
            // TODO: Implement Tree for CST - ascendTree()
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
        public peak(productions: Array<String>, original?) {
            // Iterate over Potential Productions
            for (var p in productions) {
                // Get Reference to Respective Production
                var production = _Productions.filter((production) => {return production.name == p})[0];

                // Check First Set for Terminals that can aid in our Decision
                if (production.first.length) {
                    for (var i = 0; i < production.first.length; i++) {
                        for (var j = 0; j < production.first[i].length; j++) {
                            if (production.first[i][j] == this.tokenStream[this.currentToken].name) {
                                if (original) {
                                    if (original == "Statment") {               // Really annoying special case
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
                    // If there is no First Set, we are most likely looking at another Production
                    if (original) {
                        return this.peak(production.inner[0], original);
                    } else {
                        return this.peak(production.inner[0], production.name);
                    }
                }
            }

            return null;
        }

        /**
         * match(prodution, expected)
         * - Match is used as the primary pilot for our Parser,
         *   when we expect a terminal symbol, we use match to 
         *   determine if our Current Token matches the expected 
         *   Token according to our Productions.
         */
        public match(expected) {
            // Validate Current Token against Expected
            if (this.tokenStream[this.currentToken].name == expected) {
                // Create New Node for Terminal
                // TODO: Add Node for Tree - createChild()

                // Output to Log for Successful Match
                _Log.output({level: "DEBUG", data: {expected: expected, 
                            found: this.tokenStream[this.currentToken].name, 
                            loc: {line: this.tokenStream[this.currentToken].line, 
                                  col: this.tokenStream[this.currentToken].col}}});

                // Consume Current Token
                this.tokenStream.shift()

                // Ascend Tree to Parent Node of Child
                // TODO: Implement Tree for CST - ascendTree()
            } else {
                // emitError
                this.emitError(expected);
            }
        }

        /**
         * emitError(type, value)
         * - EmitError handles the creation of our Error Entry and
         *   generating our message object for Log Output.
         */
        public emitError(expected) {
            // Format Data Message
            var data = "Expected [ " + expected + " ], found [ " + this.tokenStream[this.currentToken].name + " ] "
                        + " on line: " + this.tokenStream[this.currentToken].line 
                        + " col: " + this.tokenStream[this.currentToken].col;

            // Update Error List + Output to User
            this.errors.push({expected: expected, value: this.tokenStream[this.currentToken].name, 
                line: this.tokenStream[this.currentToken].line, col: this.tokenStream[this.currentToken].col})
            _Log.output({level: "ERROR", data: data});
        }
    }
}