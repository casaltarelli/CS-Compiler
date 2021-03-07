/* -----
    Lexer.ts

    The Lexer is used to lex through all programs throughout our compilation and generate a TokenStream for our Parser.
    All Tokens are based on our Grammar List.

----- */

module Compiler {
    export class Lexer { 
        constructor(public TokenStream = [],
                    public Errors = [],
                    public Warnings = [],
                    public line = 0,
                    public col = 0,
                    public inQuote = false,
                    public inComment = false,
                    public foundEOP = false,
                    public program = "") {}

        public lex(program, priority) {}

        public updateProgram(regex) {}

        public generateToken(name, val) {}

        public emitToken(token) {}

        public emitError(value) {}

        public emitWarning() {}
    }
}