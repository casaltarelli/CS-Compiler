/* -----
    Compiler.ts

    Our Compiler object is used to orchestrate the various stages of our compilation for programs.
    Handeling all the nuances and computing through calls to aspects of its system.

----- */

module Compiler {
    export class Compiler {
        constructor () {}

        init(): void {
            // Initalize our Log
            _Log = new Logger();

            // Initalize Stages
            //_Lexer = new Lexer();

        }
    }
}