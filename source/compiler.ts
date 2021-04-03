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

            // Initalize Compilation Stages
            _Lexer = new Lexer();
            _Parser = new Parser();

            // Validate Input from User
            if (source) {
                // Reset PID for new compilation
                _PID = 1;

                out:
                // Iterate over all Programs
                for (var program in source) {
                    // Update Current Program
                    _CurrentProgram = source[program];

                    // Announce Compilation Start
                    _Log.output({level: "", data: "--------------------"});
                    _Log.output({level: "", data: "Compiling Program " + _PID + "\n"});

                    // Init Lexer for New Token Stream
                    _Lexer.init(_CurrentProgram);

                    // Get Token Stream
                    _Lexer.lex(0);
                    _TokenStream.push(_Lexer.tokenStream);

                    // Announce Stage Completion for Respective Process + Results
                    _Log.output({level: "INFO", data: "Lexical Analysis Complete. " + _Lexer.warnings.length + " WARNING(S) and " 
                        + _Lexer.errors.length + " ERROR(S)\n"});

                    if (_Lexer.errors.length > 0) {
                        _Log.output({level: "", data: "--------------------"});
                        _Log.output({level: "INFO", data: "Compliation Stopped due to Lexer errors..."});
                        break out;
                    }
                    
                    // Init Parser for New CST
                    _Parser.init(_TokenStream[program]);

                    // Generate CST
                    _Parser.parse("Program");

                    // Announce Stage Completion for Respective Process + Results
                    _Log.output({level: "INFO", data: "Parse Complete. " + _Parser.errors.length + " ERROR(S)\n"});

                    if (_Parser.errors.length > 0) {
                        _Log.output({level: "", data: "--------------------"});
                        _Log.output({level: "INFO", data: "Compliation Stopped due to Parser errors..."});
                        break out;
                    }

                    // Increment PID
                    _PID++; 
                }

                _Log.output({level: "", data: "--------------------"});
                _Log.output({level: "INFO", data: "Completion of Program(s) completed."});
            }
        }
    }
}