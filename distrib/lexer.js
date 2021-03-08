/* -----
    Lexer.ts

    The Lexer is used to lex through all programs throughout our compilation and generate a TokenStream for our Parser.
    All Tokens are based on our Grammar List.

----- */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var CSCompiler;
(function (CSCompiler) {
    var Lexer = /** @class */ (function () {
        function Lexer(tokenStream, errors, warnings, line, col, inQuote, inComment, foundEOP, program) {
            if (tokenStream === void 0) { tokenStream = []; }
            if (errors === void 0) { errors = []; }
            if (warnings === void 0) { warnings = []; }
            if (line === void 0) { line = 0; }
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
            this.line = 0;
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
         *   determine Rule Order for Longest Match.
         */
        Lexer.prototype.lex = function (priority) {
            return __awaiter(this, void 0, void 0, function () {
                var current, foundToken, cases, i, lexeme;
                return __generator(this, function (_a) {
                    console.log("-----------------");
                    console.log("CURRENT PROGRAM STRING: " + this.program);
                    if (this.foundEOP) { // [Base]
                        return [2 /*return*/, this.tokenStream];
                    }
                    else { // Keep Searching for Tokens [General]
                        foundToken = false;
                        if (!(this.program === "")) {
                            cases = _Grammar.filter(function (regex) { return regex.priority == priority; });
                            console.log("CURRENT PRIORITY: " + priority);
                            // Test Cases against Program String
                            out: for (i in cases) {
                                // Create RegExp Object
                                current = new RegExp(cases[i].regex);
                                console.log("CURRENT REGEX: " + cases[i].regex);
                                if (current.test(this.program)) {
                                    lexeme = this.program.match(current);
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
                            }
                            else {
                                foundToken = false;
                                this.lex(priority + 1);
                            }
                        }
                        else {
                            // Missing EOP Error
                            console.log("Missing EOP!");
                            // Add End of Program Marker
                            _CurrentProgram = _CurrentProgram + "$";
                        }
                    }
                    return [2 /*return*/];
                });
            });
        };
        /**
         * update()
         * - Update is used to aid our Lexer throughout
         *   its analysis. It updates the current program
         *   removing any identified tokens as well as our
         *   line and char attributes for accurate location.
         */
        Lexer.prototype.update = function (regex) {
            // Update Program based on match
            var match = this.program.match(regex)[0].length;
            this.program = this.program.substring(match);
            // Update Column Count based on Match Length
            this.col = this.col + match;
        };
        Lexer.prototype.seek = function () {
        };
        /**
         * generateToken(name, value): Token
         * - GenerateToken is used to create our Token
         *   object for a lexeme.
         */
        Lexer.prototype.generateToken = function (name, value) {
            console.log("TOKEN CREATED");
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
        Lexer.prototype.emitError = function (value) {
            // Output Error to User
            _Log.output({ level: "ERROR", data: "Undefined Token [ " + value + " ] on line " + this.line + "col " + this.col });
        };
        Lexer.prototype.emitWarning = function () {
        };
        return Lexer;
    }());
    CSCompiler.Lexer = Lexer;
})(CSCompiler || (CSCompiler = {}));
