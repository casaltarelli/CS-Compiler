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
         * parse(production)
         * - Parse handles parsing over a given Token Stream.
         *   Tests all Tokens against our Grammar's Productions,
         *   while simutaneously generating our Concrete-Syntax Tree.
         */
        public parse(production) {

        }

        /**
         * peek(production, original?): string
         * - Peek is used to determine the next production
         *   we should follow. We keep searching inner-productions
         *   until a terminal symbol is found matching our
         *   Current Token. Which then we return the name of
         *   the production to follow and continue parsing.
         */
        public peek() {}

        /**
         * match(prodution, expected)
         * - Match is used as the primary pilot for our Parser,
         *   when we expect a terminal symbol, we use match to 
         *   determine if our Current Token matches the expected 
         *   Token according to our Productions.
         */
        public match(production, expected) {}

        /**
         * emitError(type, value)
         * - EmitError handles the creation of our Error Entry and
         *   our generating our message object for Log Output.
         */
        public emitError(type, value) {}
    }
}