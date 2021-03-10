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
            // Validate Input from User
            if (source) {
                // Reset PID for new compilation
                _PID = 1;
                // Iterate over all Programs
                for (var program in source) {
                    // Update Current Program
                    _CurrentProgram = source[program];
                    // Announce Compilation Start
                    _Log.output({ level: "", data: "--------------------" });
                    _Log.output({ level: "", data: "Compiling Program " + _PID + "\n" });
                    // Init Lexer for New Token Stream
                    _Lexer.init(_CurrentProgram);
                    // Get Token Stream
                    _TokenStream.push(_Lexer.lex(0));
                    // Output Lexer Results + Check for Errors
                    _Log.output({ level: "INFO", data: "Lexical Analysis Complete. " + _Lexer.warnings.length + " WARNING(S) and "
                            + _Lexer.errors.length + " ERROR(S)\n" });
                    if (_Lexer.errors.length > 0) {
                        _Log.output({ level: "", data: "--------------------" });
                        _Log.output({ level: "INFO", data: "Compliation Stopped due to Lexer errors..." });
                    }
                    else {
                        // Increment PID
                        _PID++;
                    }
                }
                _Log.output({ level: "", data: "--------------------" });
                _Log.output({ level: "INFO", data: "Completion of Program(s) completed." });
            }
        };
        return Compiler;
    }());
    CSCompiler.Compiler = Compiler;
})(CSCompiler || (CSCompiler = {}));
