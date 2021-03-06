/* -----
    Logger.ts

    The Logger is used to output all relative information throughout the compilation of a program.

----- */
var Compiler;
(function (Compiler) {
    var Logger = /** @class */ (function () {
        function Logger(log, mode) {
            if (log === void 0) { log = document.getElementById("log"); }
            if (mode === void 0) { mode = "Verbose"; }
            this.log = log;
            this.mode = mode;
        }
        Logger.prototype.init = function () {
            this.reset();
        };
        /**
         * output(msg)
         * - Output handles writing to our Log within our UI,
         *   it expects a msg Object which allows for us to
         *   properly format data to our User.
         */
        Logger.prototype.output = function (msg) {
            // Determine Msg Type for Output Formatting
            switch (msg.type) {
                case "INFO":
                    this.log.value += "INFO " + msg.data;
                case "DEBUG":
                    this.log.value += "DEBUG - " + _Stage +
                        +" - " + msg.data.token.type
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
    Compiler.Logger = Logger;
})(Compiler || (Compiler = {}));
