/* -----
    SymbolTable.ts

    SymbolTable is used to represent the Symbol Table for a specific scope, this object is used to contain all information
    about the variables that have been declared, intialized, and used for a respective scope. Uses a variables value as the key
    to getting all information relevant to that variable.

----- */
var CSCompiler;
(function (CSCompiler) {
    var SymbolTable = /** @class */ (function () {
        function SymbolTable(keys, values) {
            if (keys === void 0) { keys = []; }
            if (values === void 0) { values = []; }
            this.keys = keys;
            this.values = values;
        }
        /**
         * get(key)
         * - Get handles finding the respective index
         *   for the key value given. Which will give us
         *   the location about that variable in our values.
         */
        SymbolTable.prototype.get = function (key) {
            var index = -1;
            // Get Index of Key from Key List
            for (var i = 0; i < this.keys.length; i++) {
                if (key == this.keys[i]) {
                    index = i;
                }
            }
            return index;
        };
        /**
         * set(key)
         * - Set handles creating a new entry
         *   for a variable found during Semantic
         *   Analysis. Will return True or False
         *   based on if variable exists or not
         *   for a respective SymbolTable Node.
         */
        SymbolTable.prototype.set = function (key) {
            var status = false;
            // Check if Key already exists
            if (this.get(key) == -1) {
                this.keys.push(key);
                this.values.push(this.createValue());
                status = true;
            }
            return status;
        };
        /**
         * createValue()
         * - Create Value allows for us to generate an empty
         *   object that we can use to store all relative
         *   information about a specific variable.
         */
        SymbolTable.prototype.createValue = function () {
            return {
                type: null,
                declared: null,
                initalized: null,
                used: []
            };
        };
        return SymbolTable;
    }());
    CSCompiler.SymbolTable = SymbolTable;
})(CSCompiler || (CSCompiler = {}));
