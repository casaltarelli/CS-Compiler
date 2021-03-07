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
         * (Not sure if this is the right place to handle this)
         */
        Logger.prototype.input = function () {
            // Get Input Textarea Referenece
            var inputElement = document.getElementById("user-input");
            // Verify Input
            if (inputElement.value.trim() != "") {
                // Reset Self for new Compilation Request
                this.reset();
                // Collect Program(s) + Split on End Marker
                var sourceData = inputElement.value.trim().split(/(?<=[$])/g); // Use ?<=[] assertion to keep our $ delimeter
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
            // Determine Msg Type for Output Formatting
            switch (msg.level) {
                case "INFO":
                    this.log.value += "INFO - " + msg.data + "\n";
                    break;
                case "DEBUG":
                    this.log.value += "DEBUG - " + _Stage +
                        +" - " + msg.data.token.type
                        + " [ " + msg.data.token.value + " ] "
                        + " at line: " + msg.data.token.loc.line
                        + " col: " + msg.data.token.loc.col + "\n";
                    break;
                case "WARN":
                    this.log.value += "WARN - " + _Stage + " - " + msg.data + "\n";
                    break;
                case "ERROR":
                    this.log.value += "ERROR - " + _Stage + " - " + msg.data + "\n";
                    break;
                default:
                    console.log("Log exception: Invalid Message Type");
                    break;
            }
        };
        /**
         * setMode(m)
         * - Allows User to decide Log Level for Output.
         */
        Logger.prototype.setMode = function (m) {
            this.mode = m; // Doesn't need to be validated due to hardcoded Param Given
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
