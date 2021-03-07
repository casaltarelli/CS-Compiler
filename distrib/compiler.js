/* -----
    Compiler.ts

    Our Compiler object is used to orchestrate the various stages of our compilation for programs.
    Handeling all the nuances and computing through calls to aspects of its system.

----- */
var Compiler;
(function (Compiler_1) {
    var Compiler = /** @class */ (function () {
        function Compiler() {
        }
        Compiler.prototype.init = function () {
            // Initalize our Log
            _Log = new Compiler_1.Logger();
            // Initalize Stages
            //_Lexer = new Lexer();
        };
        return Compiler;
    }());
    Compiler_1.Compiler = Compiler;
})(Compiler || (Compiler = {}));
