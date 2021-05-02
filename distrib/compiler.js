/* -----
    Compiler.ts

    Our Compiler object is used to orchestrate the various stages of our compilation for programs.
    Handeling all the nuances and computing through calls to aspects of its system.

----- */
var CSCompiler;
(function (CSCompiler) {
    var Compiler = /** @class */ (function () {
        function Compiler() {
        }
        Compiler.prototype.init = function () {
            // Initalize our Log
            _Log = new CSCompiler.Logger();
        };
        /**
         * compile()
         * - Called when User hits the Compile Button, handles
         *   input read request to logger as well as passing of information
         *   to the various stages of our compilation.
         */
        Compiler.compile = function () {
            // Clear Log + Get Segmented User Input
            _Log.reset();
            var source = _Log.input();
            // Initalize Compilation Stages
            _Lexer = new CSCompiler.Lexer();
            _Parser = new CSCompiler.Parser();
            // Validate Input from User
            if (source) {
                // Reset PID + TokenStream for new compilation
                _PID = 1;
                _TokenStream = [];
                // Iterate over all Programs
                for (var program = 0; program < source.length; program++) {
                    // Update Current Program + Reset Stage
                    _CurrentProgram = source[program];
                    // Announce Compilation Start
                    _Log.output({ level: "", data: "--------------------" });
                    _Log.output({ level: "", data: "Compiling Program " + _PID + "\n" });
                    out: for (var s in _Stages) {
                        // Update Stage
                        _Stage = _Stages[s];
                        switch (_Stage) {
                            case "Lexer":
                                // Init Lexer for Program + Generate Token Stream
                                _Lexer.init(_CurrentProgram);
                                _Lexer.lex(0);
                                // Announce Completion
                                _Log.output({ level: "INFO", data: "Lexical Analysis Complete. " + _Lexer.warnings.length + " WARNING(S) and "
                                        + _Lexer.errors.length + " ERROR(S)\n" });
                                // Validate Successful Lex -- Output Compilation Stopped for Program
                                if (_Lexer.errors.length > 0) {
                                    _Log.output({ level: "", data: "--------------------" });
                                    _Log.output({ level: "INFO", data: "Compliation Stopped due to Lexer errors..." });
                                    break out;
                                }
                                else {
                                    // Add Validated Token Stream to Global Reference
                                    _TokenStream.push(_Lexer.tokenStream);
                                }
                                break;
                            case "Parser":
                                // Init Parse for New Stream + Get CST
                                _Parser.init(_TokenStream[program]);
                                _Parser.parse("Program");
                                // Announce Completion
                                _Log.output({ level: "INFO", data: "Parse Complete. " + _Parser.errors.length + " ERROR(S)\n" });
                                // Validate Successful Parse -- Output Compilation Stopped for Program
                                if (_Parser.errors.length > 0) {
                                    _Log.output({ level: "", data: "--------------------" });
                                    _Log.output({ level: "INFO", data: "Compliation Stopped due to Parser errors..." });
                                    break out;
                                }
                                else {
                                    // Add Validated CST to Global Reference
                                    _CSTs.push(_Parser.cst);
                                    // Output CST to Log
                                    _Log.output({ level: "", data: "Concrete-Syntax Tree generated for program " + _PID + "\n" });
                                    _Log.output({ level: "", data: _Parser.cst.toString() });
                                }
                                break;
                            case "Semantic Analysis":
                                _Log.output({ level: "", data: "Semantic Analysis Stage Recognized!" });
                                break;
                            default:
                                // This should never happen, but you never know for sure
                                console.log("Compilation Exception -- Invalid Stage for processing");
                                break;
                        }
                    }
                    // Increment PID for next program
                    _PID++;
                }
                // Announce Completion for Compiling Program(s)
                _Log.output({ level: "", data: "--------------------" });
                _Log.output({ level: "INFO", data: "Compilation of Program(s) completed." });
            }
        };
        return Compiler;
    }());
    CSCompiler.Compiler = Compiler;
})(CSCompiler || (CSCompiler = {}));
