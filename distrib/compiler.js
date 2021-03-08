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
            // Initalize Stages
            _Lexer = new CSCompiler.Lexer();
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
            // Validate Input from User
            if (source) {
                // Iterate over all Programs
                for (var program in source) {
                    // Update Current Program
                    _CurrentProgram = source[program];
                    // Announce Compilation Start
                    _Log.output({ level: "NONE", data: "--------------------" });
                    _Log.output({ level: "INFO", data: "Compiling Program " + _PID });
                    // Init Lexer for New Token Stream
                    _Lexer.init(_CurrentProgram);
                    // Get Token Stream
                    _TokenStream.push(_Lexer.lex(program));
                    // Validate 0 Errors
                    _Log.output({ level: "INFO", data: "Lexical Analysis Complete! " + _PID });
                }
            }
        };
        return Compiler;
    }());
    CSCompiler.Compiler = Compiler;
})(CSCompiler || (CSCompiler = {}));
