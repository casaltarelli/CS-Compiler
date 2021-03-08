/* -----
    Compiler.ts

    Our Compiler object is used to orchestrate the various stages of our compilation for programs.
    Handeling all the nuances and computing through calls to aspects of its system.

----- */

module CSCompiler {
    export class Compiler {
        constructor () {}

        init(): void {
            // Initalize our Log
            _Log = new Logger();

            // Initalize Stages
            _Lexer = new Lexer();
        }

        /**
         * compile()
         * - Called when User hits the Compile Button, handles
         *   input read request to logger as well as passing of information 
         *   to the various stages of our compilation.
         */
        public static compile():void {
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
                    _Log.output({level: "NONE", data: "--------------------"});
                    _Log.output({level: "INFO", data: "Compiling Program " + _PID});

                    // Init Lexer for New Token Stream
                    _Lexer.init(_CurrentProgram);

                    // Get Token Stream
                    _TokenStream.push(_Lexer.lex(program));

                    // Validate 0 Errors
                    _Log.output({level: "INFO", data: "Lexical Analysis Complete! " + _PID});
                }

            }

        }
    }
}