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
            // Get User Input
            var source = _Log.input();
            // Validate Input from User
            if (source) {
            }
        };
        return Compiler;
    }());
    CSCompiler.Compiler = Compiler;
})(CSCompiler || (CSCompiler = {}));
