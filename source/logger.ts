/* -----
    Logger.ts

    The Logger is used to output all relative information to our User throughout the compilation of a program. 

----- */

    module CSCompiler {
        export class Logger {
            
            constructor(public log = <HTMLTextAreaElement>document.getElementById("log-output"),
                        public code = <HTMLTextAreaElement>document.getElementById("code-output"),
                        public mode = "verbose") {}

            public init(): void {
                this.reset(); // Clear Log for New Compiler Process
            }

            /**
             * input()
             * - Input handles reading all data for a respective
             *   compililation request. Breaksdown Source Data for
             *   each seperate program contained in our Input Field. 
             * 
             * (Not sure if this is the right place to handle this.)
             */
            public input(): string[] {
                // Get Input Textarea Referenece
                var inputElement = <HTMLTextAreaElement>document.getElementById("user-input");

                // Verify Input
                if (inputElement.value.trim() != "") {
                    // Reset Self for new Compilation Request
                    this.reset();

                    // Collect Program(s) + Split on End Marker
                    var sourceData = inputElement.value.split(/(?<=[$])/g); // Use ?<=[] assertion to keep our $ delimeter

                    return sourceData;

                } else {
                    // Prompt User for Empty Input
                    this.output({level: "INFO", data: "What in tarnation? Don't waste my time..."})

                    return null;
                }
            }

            /**
             * output(msg, flag?)
             * - Output handles writing to our Log within our UI,
             *   it expects a msg Object which allows for us to 
             *   properly format data to our User. Flag is used
             *   to signifiy population of our Code Output 
             */
            public output(msg, flag?): void {
                // Validate Verbose Mode
                if (!_Verbose && (msg.level != "INFO" || msg.level != "")) {
                    return; 
                }

                // Determine Msg Type for Output Formatting
                switch(msg.level) {
                    case "INFO":
                        this.log.value += "INFO - " + msg.data + "\n";
                        break;

                    case "DEBUG":
                        // Format DEBUG Message Depending on Stage
                        if (_Stage == "Lexer") {
                            this.log.value += "DEBUG - " + _Stage   
                                            + " - " + msg.data.token.name 
                                            + " [ " + msg.data.token.value + " ] "
                                            + "at line: " + msg.data.loc.line
                                            + " col: " + msg.data.loc.col + "\n";
                        } else if (_Stage == "Parser") {
                            this.log.value += "DEBUG - " + _Stage
                                            + " - Expecting [ " + msg.data.expected +" ],"
                                            + " found [ " + msg.data.found + " ] "
                                            + "on line: " + msg.data.loc.line
                                            + " col: " + msg.data.loc.col + "\n";
                        } else if (_Stage == "Semantic Analysis") {
                            this.log.value += "DEBUG - " + _Stage + " - " + msg.data + "\n";
                        } else if (_Stage == "Code Generation") {
                            this.log.value += "DEBUG - " + _Stage + " - " + msg.data + "\n";
                        }
                        
                        break;

                    case "WARN":
                        this.log.value += "WARN - " + _Stage + " - " + msg.data + "\n";
                        break;

                    case "ERROR":
                        this.log.value += "ERROR - " + _Stage + " - " + msg.data + "\n";
                        break;

                    default: 
                        if (flag) {
                            this.code.value += msg.data + "\n\n";
                        } else {
                            this.log.value += msg.data + "\n";
                        }
                        break;
                }

                // Automatically Scroll to Bottom if overflow
                this.log.scrollTop = this.log.scrollHeight;
            }

            /**
             * reset()
             * - Resets our Log doesn't contain any
             *   information from previous compilations.
             */
            public reset(): void {
                this.log.value = "";
                this.code.value = "";
            }
        }
    }