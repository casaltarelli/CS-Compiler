/* -----
    Lexer.ts

    The Lexer is used to lex through all programs throughout our compilation and generate a TokenStream for our Parser.
    All Tokens are based on our Grammar List.

----- */
var CSCompiler;
(function (CSCompiler) {
    var Lexer = /** @class */ (function () {
        function Lexer(tokenStream, errors, warnings, line, col, inQuote, inComment, foundEOP, program) {
            if (tokenStream === void 0) { tokenStream = []; }
            if (errors === void 0) { errors = []; }
            if (warnings === void 0) { warnings = []; }
            if (line === void 0) { line = 1; }
            if (col === void 0) { col = 0; }
            if (inQuote === void 0) { inQuote = false; }
            if (inComment === void 0) { inComment = false; }
            if (foundEOP === void 0) { foundEOP = false; }
            if (program === void 0) { program = ""; }
            this.tokenStream = tokenStream;
            this.errors = errors;
            this.warnings = warnings;
            this.line = line;
            this.col = col;
            this.inQuote = inQuote;
            this.inComment = inComment;
            this.foundEOP = foundEOP;
            this.program = program;
        }
        Lexer.prototype.init = function (program) {
            // Announce Lexical Analyzer
            _Log.output({ level: "INFO", data: "Starting Lexical Analysis..." });
            // Default Attributes
            this.tokenStream = [];
            this.errors = [];
            this.warnings = [];
            this.col = 0;
            this.inQuote = false;
            this.inComment = false;
            this.foundEOP = false;
            this.program = program;
        };
        /**
         * lex(priority)
         * - Lex handles scanning a given program to
         *   generate our TokenStream. Tests all programs
         *   against our defined Grammar List. Uses priority to
         *   determine Rule Order for Longest Match excluding
         *   special cases.
         */
        Lexer.prototype.lex = function (priority) {
            var current;
            if (this.foundEOP) { // [Base]
                // Clean TokenStream before Returning
                this.tokenStream = this.tokenStream.filter(function (token) { return token.name != "L_COMM" && token.name != "R_COMM"; });
                return this.tokenStream;
            }
            else { // [General]
                var foundToken = false;
                if (!(this.program === "")) {
                    // Get RegEx Cases Matching Priority
                    var cases = _Grammar.filter(function (regex) { return regex.priority == priority; });
                    if (this.inQuote || this.inComment) { // [General-Special Cases]
                        // Override Cases based on Special Case Type
                        if (this.inQuote) {
                            // Get Subset RegEx for Quote
                            cases = _Grammar.filter(function (regex) {
                                return regex.priority == 0
                                    || regex.name == "RESERVED" || regex.name == "ID" || regex.name == "QUOTE";
                            });
                        }
                        else if (this.inComment) {
                            // Get Subset RegEx for Comment
                            cases = _Grammar.filter(function (regex) { return regex.name == "R_COMM" || regex.name == "BREAK"; });
                        }
                    }
                    // Test Cases against Program String
                    out: for (var i in cases) {
                        // Create RegExp Object
                        current = new RegExp(cases[i].regex);
                        if (current.test(this.program)) {
                            // Get Lexeme for Match
                            var lexeme = this.program.match(current);
                            // Get Token Action
                            cases[i]['action'](lexeme[0]);
                            // Update Flag
                            foundToken = true;
                            break out;
                        }
                    }
                    if (foundToken) {
                        if (!(this.inComment) && current.toString() != /^\n/) {
                            this.update(current);
                        }
                        this.lex(0); // Reset Priority
                    }
                    else {
                        if (this.inComment) {
                            this.update(/./);
                            this.lex(0);
                        }
                        else {
                            if (priority < 3) {
                                this.lex(priority + 1);
                            }
                        }
                    }
                }
                else {
                    // Clean TokenStream before emiting Warning
                    this.tokenStream = this.tokenStream.filter(function (token) { return token.name != "L_COMM" && token.name != "R_COMM"; });
                    // Check for Special Cases
                    if (this.inQuote || this.inComment) {
                        if (this.inQuote) {
                            this.emitWarning("QUOTE", '"');
                        }
                        else {
                            this.emitWarning("COMMENT", "*/");
                        }
                    }
                    else {
                        // Missing EOP Error
                        this.emitWarning("EOP", "$");
                        // Add End of Program Marker for Current Program
                        _CurrentProgram = _CurrentProgram + "$";
                        this.emitToken(this.generateToken("EOP", "$"));
                    }
                    return this.tokenStream;
                }
            }
        };
        /**
         * update()
         * - Update is used to aid our Lexer throughout
         *   its analysis. It updates the current program
         *   removing any identified tokens as well as our
         *   line and char attributes for accurate location.
         */
        Lexer.prototype.update = function (regex, flag) {
            // Update Program based on match
            var lexeme = this.program.match(regex)[0].length;
            this.program = this.program.substring(lexeme);
            // Update Column Count based on Match Length
            if (!(flag)) { // Flag for BREAK TOKEN
                this.col = this.col + lexeme;
            }
            else {
                this.col = 0;
            }
        };
        /**
         * generateToken(name, value): Token
         * - GenerateToken is used to create our Token
         *   object for a lexeme.
         */
        Lexer.prototype.generateToken = function (name, value) {
            // Create Token Object
            return new CSCompiler.Token(name, value, this.line, this.col);
        };
        /**
         * emitToken(token)
         * - Emit Token allows us to add a found Token
         *   to our Token Stream. Also handles Outputting
         *   to our Log.
         */
        Lexer.prototype.emitToken = function (token) {
            // Emit to TokenStream
            this.tokenStream.push(token);
            // Output to Log for Registered Token
            _Log.output({ level: "DEBUG", data: { token: token, loc: { line: token.line, col: token.col } } });
        };
        /**
         * emitError(type, value)
         * - EmitError handles the creation of our Error Entry and
         *   generating our message object for Log Output.
         */
        Lexer.prototype.emitError = function (type, value) {
            var data;
            // Format Message Date Based on Type
            switch (type) {
                case "UNDEFINED":
                    if (this.inQuote) {
                        data = "Invalid Character in String [ " + value + " ] on line: " + this.line + " col: " + this.col;
                    }
                    else {
                        data = "Unrecognized or Invalid Token [ " + value + " ] on line: " + this.line + " col: " + this.col;
                    }
                    break;
                case "RESERVED":
                    data = "Reserved Character in String [ " + value + " ] on line: " + this.line + " col: " + this.col;
                    break;
                case "BREAK":
                    data = "Illegal Character in String [ \\n ] on line: " + this.line + " col: " + this.col;
                    break;
                default:
                    break;
            }
            // Update Error List + Output to User
            this.errors.push({ type: type, value: value, line: this.line, col: this.col });
            _Log.output({ level: "ERROR", data: data });
            // Update found EOP Flag to End Lexing
            this.foundEOP = true;
        };
        /**
         * emitWarning(type, value)
         * - EmitWarning handles the creation of our Warning Entry
         *   and generating our message object for Log Output.
         */
        Lexer.prototype.emitWarning = function (type, value) {
            var data;
            // Format Message Date Based on Type
            switch (type) {
                case "EOP":
                    data = "No EOP [ " + value + " ] detected at end-of-file. Adding to end-of-file...";
                    break;
                case "COMMENT":
                    // Get Right Most Occurance of L_COMM
                    var start = this.tokenStream[this.tokenStream.map(function (regex) { return regex.name === "L_COMM"; }).lastIndexOf(true)];
                    data = "Missing end comment brace [ " + value + " ] for comment starting on line " + start.line + " col " + start.col;
                    break;
                case "QUOTE":
                    // Get Right Most Occurance of QUOTE
                    var start = this.tokenStream[this.tokenStream.map(function (regex) { return regex.name === type; }).lastIndexOf(true)];
                    data = "Missing end quote marker [ " + value + " ] for quote starting on line " + start.line + " col " + start.col;
                    break;
                default:
                    break;
            }
            // Update Error List + Output to User
            this.warnings.push({ type: type, value: value, line: this.line, col: this.col });
            _Log.output({ level: "WARN", data: data });
        };
        return Lexer;
    }());
    CSCompiler.Lexer = Lexer;
})(CSCompiler || (CSCompiler = {}));
