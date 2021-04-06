/* -----
    Logger.ts

    The Logger is used to output all relative information to our User throughout the compilation of a program.

----- */
var CSCompiler;
(function (CSCompiler) {
    var Logger = /** @class */ (function () {
        function Logger(log, mode) {
            if (log === void 0) { log = document.getElementById("log-output"); }
            if (mode === void 0) { mode = "verbose"; }
            this.log = log;
            this.mode = mode;
        }
        Logger.prototype.init = function () {
            this.reset(); // Clear Log for New Compiler Process
        };
        /**
         * input()
         * - Input handles reading all data for a respective
         *   compililation request. Breaksdown Source Data for
         *   each seperate program contained in our Input Field.
         *
         * (Not sure if this is the right place to handle this.)
         */
        Logger.prototype.input = function () {
            // Get Input Textarea Referenece
            var inputElement = document.getElementById("user-input");
            // Verify Input
            if (inputElement.value.trim() != "") {
                // Reset Self for new Compilation Request
                this.reset();
                // Collect Program(s) + Split on End Marker
                var sourceData = inputElement.value.split(/(?<=[$])/g); // Use ?<=[] assertion to keep our $ delimeter
                return sourceData;
            }
            else {
                // Prompt User for Empty Input
                this.output({ level: "INFO", data: "What in tarnation? Don't waste my time..." });
                return null;
            }
        };
        /**
         * output(msg)
         * - Output handles writing to our Log within our UI,
         *   it expects a msg Object which allows for us to
         *   properly format data to our User.
         */
        Logger.prototype.output = function (msg) {
            // Validate Verbose Mode
            if (!_Verbose && msg.level != "INFO") {
                console.log("Case hit!");
                return;
            }
            // Determine Msg Type for Output Formatting
            switch (msg.level) {
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
                    }
                    else if (_Stage == "Parser") {
                        this.log.value += "DEBUG - " + _Stage
                            + " - Expecting [ " + msg.data.expected + " ],"
                            + " found [ " + msg.data.found + " ] "
                            + "on line: " + msg.data.loc.line
                            + " col: " + msg.data.loc.col + "\n";
                    }
                    break;
                case "WARN":
                    this.log.value += "WARN - " + _Stage + " - " + msg.data + "\n";
                    break;
                case "ERROR":
                    this.log.value += "ERROR - " + _Stage + " - " + msg.data + "\n";
                    break;
                default:
                    this.log.value += msg.data + "\n";
                    break;
            }
            // Automatically Scroll to Bottom if overflow
            this.log.scrollTop = this.log.scrollHeight;
        };
        /**
         * reset()
         * - Resets our Log doesn't contain any
         *   information from previous compilations.
         */
        Logger.prototype.reset = function () {
            this.log.value = "";
        };
        return Logger;
    }());
    CSCompiler.Logger = Logger;
})(CSCompiler || (CSCompiler = {}));
