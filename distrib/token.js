/* -----
    Token.ts

    The Token object is used to create a defined structure for all of the Tokens recognized by our languages
    Grammar.

----- */
var CSCompiler;
(function (CSCompiler) {
    var Token = /** @class */ (function () {
        function Token(name, value, line, col) {
            this.name = name;
            this.value = value;
            this.line = line;
            this.col = col;
        }
        return Token;
    }());
    CSCompiler.Token = Token;
})(CSCompiler || (CSCompiler = {}));
