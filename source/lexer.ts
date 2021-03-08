/* -----
    Lexer.ts

    The Lexer is used to lex through all programs throughout our compilation and generate a TokenStream for our Parser.
    All Tokens are based on our Grammar List.

----- */

module CSCompiler {
    export class Lexer { 
        constructor(public tokenStream = [],
                    public errors = [],
                    public warnings = [],
                    public line = 0,
                    public col = 0,
                    public inQuote = false,
                    public inComment = false,
                    public foundEOP = false,
                    public program = "") {}

        public init(program: string):void {
            // Announce Lexical Analyzer
            _Log.output({level: "INFO", data: "Starting Lexical Analysis..."});

            // Default Attributes
            this.tokenStream = [];
            this.errors = [];
            this.warnings = [];
            this.line = 0;
            this.col = 0;
            this.inQuote = false;
            this.inComment = false;
            this.foundEOP = false;
            this.program = program;
        }

        /**
         * lex(priority)
         * - Lex handles scanning a given program to
         *   generate our TokenStream. Tests all programs
         *   against our defined Grammar List. Uses priority to
         *   determine Rule Order for Longest Match.
         */
        public async lex(priority) {
            console.log("-----------------");
            console.log("CURRENT PROGRAM STRING: " + this.program);
            var current;

            if (this.foundEOP) {  // [Base]
                return this.tokenStream;

            } else { // Keep Searching for Tokens [General]
                var foundToken = false;

                if (!(this.program === "")) {
                    // if (this.inQuote || this.inComment) {
                    //     priority = 0;

                    //     // Seek End of Quote or Comment
                    // }

                    // Get RegEx Cases Matching Priority
                    var cases = _Grammar.filter((regex) => { return regex.priority == priority});

                    console.log("CURRENT PRIORITY: " + priority);

                    // Test Cases against Program String
                    out:
                    for (var i in cases) {
                        // Create RegExp Object
                        current = new RegExp(cases[i].regex);
                        console.log("CURRENT REGEX: " + cases[i].regex);

                        if (current.test(this.program)) {
                            // Get Lexeme for Match
                            var lexeme = this.program.match(current);

                            // Get Token Action
                            cases[i]['action'](lexeme);

                            console.log("TOKEN FOUND - Name: " + cases[i].name);

                            // Update Program
                            foundToken = true; 

                            break out;
                        }
                    } 

                    // Check if Hit Found
                    if (foundToken) {
                        this.update(current);
                        this.lex(0); // Reset Priority
                    } else {
                        foundToken = false;
                        this.lex(priority + 1);
                    }  

                } else {
                    // Missing EOP Error
                    console.log("Missing EOP!");

                    // Add End of Program Marker
                    _CurrentProgram = _CurrentProgram + "$";
                }
            } 
        }

        /**
         * update()
         * - Update is used to aid our Lexer throughout
         *   its analysis. It updates the current program 
         *   removing any identified tokens as well as our 
         *   line and char attributes for accurate location.
         */
        public update(regex) {
            // Update Program based on match
            var match = this.program.match(regex)[0].length;
            this.program = this.program.substring(match);

            // Update Column Count based on Match Length
            this.col = this.col + match;
        }

        public seek() {

        }

        /**
         * generateToken(name, value): Token
         * - GenerateToken is used to create our Token
         *   object for a lexeme. 
         */
        public generateToken(name, value): Token {
            console.log("TOKEN CREATED");
            // Create Token Object
            return new Token(name, value, this.line, this.col);    
        }

        /**
         * emitToken(token)
         * - Emit Token allows us to add a found Token
         *   to our Token Stream. Also handles Outputting
         *   to our Log.
         */
        public emitToken(token) {
            // Emit to TokenStream
            this.tokenStream.push(token);

            // Output to Log for Registered Token
            _Log.output({level: "DEBUG", data: {token: token, loc: {line: token.line, col: token.col}}});
        }

        public emitError(value) {
            // Output Error to User
            _Log.output({level: "ERROR", data: "Undefined Token [ " + value + " ] on line " + this.line + "col " + this.col});
        }

        public emitWarning() {

        }
    }
}