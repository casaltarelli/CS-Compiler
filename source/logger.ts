/* -----
    Logger.ts

    The Logger is used to output all relative information to our User throughout the compilation of a program. 

----- */

    module Compiler {
        export class Logger {
            
            constructor(public log = <HTMLTextAreaElement>document.getElementById("log-output"),
                        public mode = "verbose") {}

            public init(): void {
                this.reset(); // Clear Log for New Compiler Process
            }

            /**
             * input()
             * - Input handles reading all data for a respective
             *   compililation request. Breaksdown Source Data for
             *   each seperate program contained in our Input Field. 
             */
            public input(): string[] {
                // Get Input Textarea Refernece
                var inputElement = <HTMLTextAreaElement>document.getElementById("user-input");

                // Collect Program(s) + Split
                var sourceData = inputElement.value.split("$");

                return sourceData;
            }

            /**
             * output(msg)
             * - Output handles writing to our Log within our UI,
             *   it expects a msg Object which allows for us to 
             *   properly format data to our User.
             */
            public output(msg): void {
                // Determine Msg Type for Output Formatting
                switch(msg.level) {
                    case "INFO":
                        this.log.value += "INFO " + msg.data;

                    case "DEBUG":
                        this.log.value += "DEBUG - " + _Stage +  
                                            + " - " + msg.data.token.type 
                                            + " [ " + msg.data.token.value + " ] "
                                            + " at line: " + msg.data.token.loc.line
                                            + " col: " + msg.data.token.loc.col;
                        break;

                    case "WARN":
                        // Update Color for WARN Type
                        this.log.style.color = "#FCBF49";

                        this.log.value += "WARN - " + _Stage + msg.data;

                        // Reset Color
                        this.log.style.color = "000000";

                        break;

                    case "ERROR":
                        // Update Color for ERROR Type
                        this.log.style.color = "#D62828";

                        this.log.value += "ERROR - " + _Stage + msg.data;

                        // Reset Color
                        this.log.style.color = "000000";

                        break;

                    default: 
                        console.log("Log exception: Invalid Message Type");
                }

            }

            /**
             * setMode(m)
             * - Allows User to decide Log Level for Output.
             */
            public setMode(m): void {
                this.mode = m; // Doesn't need to be validated due to hardcoded Param Given
            }

            /**
             * reset()
             * - Resets our Log doesn't contain any
             *   information from previous compilations.
             */
            public reset(): void {
                this.log.value = "";
            }
        }
    }