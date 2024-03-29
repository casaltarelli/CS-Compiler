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
            _SemanticAnalyzer = new SemanticAnalyzer();
            _CodeGeneration = new CodeGeneration();

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
                    _Log.output({level: "", data: "--------------------"});
                    _Log.output({level: "", data: "Compiling Program " + _PID + "\n"});

                    out:
                    for (var s in _Stages) {
                        // Update Stage
                        _Stage = _Stages[s];

                        switch(_Stage) {
                            case "Lexer":
                                // Init Lexer for Program + Generate Token Stream
                                _Lexer.init(_CurrentProgram);
                                _Lexer.lex(0);

                                // Announce Completion
                                _Log.output({level: "INFO", data: "Lexical Analysis Complete. " + _Lexer.warnings.length + " WARNING(S) and " 
                                + _Lexer.errors.length + " ERROR(S)\n"});

                                // Validate Successful Lex -- Output Compilation Stopped for Program
                                if (_Lexer.errors.length > 0) {
                                    _Log.output({level: "", data: "--------------------"});
                                    _Log.output({level: "INFO", data: "Compliation Stopped due to Lexer error(s)..."});
                                    break out; 
                                } else {
                                    // Add Validated Token Stream to Global Reference
                                    _TokenStream.push(_Lexer.tokenStream);  
                                }
                                break;
                            
                            case "Parser":
                                // Init Parse for New Stream + Get CST
                                _Parser.init(_TokenStream[program]);
                                _Parser.parse("Program");

                                // Announce Completion
                                _Log.output({level: "INFO", data: "Parse Complete. " + _Parser.errors.length + " ERROR(S)\n"});

                                // Validate Successful Parse -- Output Compilation Stopped for Program
                                if (_Parser.errors.length > 0) {
                                    _Log.output({level: "", data: "--------------------"});
                                    _Log.output({level: "INFO", data: "Compliation Stopped due to Parser error(s)..."});
                                    break out;   
                                } else {
                                    // Add Validated CST to Global Reference
                                    _CSTs.push(_Parser.cst);

                                    // Output CST to Log
                                    _Log.output({level: "", data: "Concrete-Syntax Tree generated for program " + _PID + "\n" });
                                    _Log.output({level: "", data: _Parser.cst.toString()});
                                }
                                break;

                            case "Semantic Analysis":
                                // Init Semantic Analyzer for AST + Semantic Analysis
                                _SemanticAnalyzer.init(_Parser.cst);
                                _SemanticAnalyzer.build(_SemanticAnalyzer.cst.root);

                                // Add Validated AST to Global Reference + Scan for Warnings
                                _ASTs.push(_SemanticAnalyzer.ast);
                                _SemanticAnalyzer.scan(_SemanticAnalyzer.symbolTable.root);
                                
                                // Announce Completion
                                _Log.output({level: "INFO", data: "Semantic Analysis Complete. " + _SemanticAnalyzer.warnings.length + " WARNING(S) and " 
                                    + _SemanticAnalyzer.errors.length + " ERROR(S)\n"});

                                // Output AST to Log
                                if (_SemanticAnalyzer.analyzing) {
                                    _Log.output({level: "", data: "Abstract Syntax Tree generated for program " + _PID + "\n" });
                                    _Log.output({level: "", data: _SemanticAnalyzer.ast.toString()});
                                }

                                // Validate Successful Semantic Analysis -- Output Symbol Table
                                if (_SemanticAnalyzer.errors.length > 0) {
                                    _Log.output({level: "", data: "--------------------"});
                                    _Log.output({level: "INFO", data: "Compliation Stopped due to Semantic Analysis error(s)..."});
                                    break out;   
                                } else {
                                    // Add Validated Symbol Table to Global Reference
                                    _SymbolTables.push(_SemanticAnalyzer.ast);

                                    // Output Symbol Table to Log
                                    _Log.output({level: "", data: "Symbol Table generated for program " + _PID });
                                    _Log.output({level: "", data: _SemanticAnalyzer.symbolTable.toStringTable()});
                                }
                                break;

                            case "Code Generation":
                                // Init Code Generation for Executable Image
                                _CodeGeneration.init(_SemanticAnalyzer.ast, _SemanticAnalyzer.symbolTable)
                                _CodeGeneration.generate(_CodeGeneration.ast.root)

                                // Backpatch Executable Image
                                _CodeGeneration.backpatch();

                                // Announce Completion
                                _Log.output({level: "INFO", data: "Code Generation Complete. " + _CodeGeneration.errors + " ERROR(S)\n"});

                                // Validate Successful Code Generation -- Output Executable Image
                                if (_CodeGeneration.errors > 0) {
                                    _Log.output({level: "", data: "--------------------"});
                                    _Log.output({level: "INFO", data: "Compliation Stopped due to Code Generation error(s)..."});
                                    break out;
                                } else {
                                    // Add Validated Executable Image to Global Reference
                                    _Images.push(_CodeGeneration.image);

                                    // Output Executable Image to Log
                                    _Log.output({level: "", data: "--------------------"});
                                    _Log.output({level: "", data: _CodeGeneration.image.join(" ")}, true);
                                }

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
                _Log.output({level: "", data: "--------------------"});
                _Log.output({level: "INFO", data: "Compilation of Program(s) completed."});
            }
        }
    }
}