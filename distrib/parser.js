/* -----
    Parser.ts

    The Parser is used to parse through all programs throughout our compilation and generate a Concrete-Syntax Tree.
    All Productions are based on our Productions List.

----- */
var CSCompiler;
(function (CSCompiler) {
    var Parser = /** @class */ (function () {
        function Parser(tokenStream, currentToken, errors) {
            if (tokenStream === void 0) { tokenStream = []; }
            if (currentToken === void 0) { currentToken = null; }
            if (errors === void 0) { errors = []; }
            this.tokenStream = tokenStream;
            this.currentToken = currentToken;
            this.errors = errors;
        }
        Parser.prototype.init = function (tokenStream) {
            // Announce Parser
            _Log.output({ level: "INFO", data: "Starting Parse..." });
            // Default Attributes
            this.tokenStream = tokenStream;
            this.currentToken = tokenStream[0];
        };
        /**
         * parse(production)
         * - Parse handles parsing over a given Token Stream.
         *   Tests all Tokens against our Grammar's Productions,
         *   while simutaneously generating our Concrete-Syntax Tree.
         */
        Parser.prototype.parse = function (production) {
        };
        /**
         * peek(production, original?): string
         * - Peek is used to determine the next production
         *   we should follow. We keep searching inner-productions
         *   until a terminal symbol is found matching our
         *   Current Token. Which then we return the name of
         *   the production to follow and continue parsing.
         */
        Parser.prototype.peek = function () { };
        /**
         * match(prodution, expected)
         * - Match is used as the primary pilot for our Parser,
         *   when we expect a terminal symbol, we use match to
         *   determine if our Current Token matches the expected
         *   Token according to our Productions.
         */
        Parser.prototype.match = function (production, expected) { };
        /**
         * emitError(type, value)
         * - EmitError handles the creation of our Error Entry and
         *   our generating our message object for Log Output.
         */
        Parser.prototype.emitError = function (type, value) { };
        return Parser;
    }());
    CSCompiler.Parser = Parser;
})(CSCompiler || (CSCompiler = {}));
