/* -----
    Lexer.ts

    The Lexer is used to lex through all programs throughout our compilation and generate a TokenStream for our Parser.
    All Tokens are based on our Grammar List.

----- */
var CSCompiler;
(function (CSCompiler) {
    var Lexer = /** @class */ (function () {
        function Lexer(TokenStream, Errors, Warnings, line, col, inQuote, inComment, foundEOP, program) {
            if (TokenStream === void 0) { TokenStream = []; }
            if (Errors === void 0) { Errors = []; }
            if (Warnings === void 0) { Warnings = []; }
            if (line === void 0) { line = 0; }
            if (col === void 0) { col = 0; }
            if (inQuote === void 0) { inQuote = false; }
            if (inComment === void 0) { inComment = false; }
            if (foundEOP === void 0) { foundEOP = false; }
            if (program === void 0) { program = ""; }
            this.TokenStream = TokenStream;
            this.Errors = Errors;
            this.Warnings = Warnings;
            this.line = line;
            this.col = col;
            this.inQuote = inQuote;
            this.inComment = inComment;
            this.foundEOP = foundEOP;
            this.program = program;
        }
        Lexer.prototype.lex = function (program, priority) { };
        Lexer.prototype.updateProgram = function (regex) { };
        Lexer.prototype.generateToken = function (name, val) { };
        Lexer.prototype.emitToken = function (token) { };
        Lexer.prototype.emitError = function (value) { };
        Lexer.prototype.emitWarning = function () { };
        return Lexer;
    }());
    CSCompiler.Lexer = Lexer;
})(CSCompiler || (CSCompiler = {}));
