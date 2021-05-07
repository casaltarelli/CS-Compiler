/* -----
    SymbolTable.ts

    SymbolTable is used to represent the Symbol Table for a specific scope, this object is used to contain all information
    about the variables that have been declared, intialized, and used for a respective scope. Uses a variables value as the key
    to getting all information relevant to that variable. 

----- */
module CSCompiler {
    export class SymbolTable {
        constructor(public keys = [], 
                    public values = []) {
        }

        /**
         * get(key)
         * - Get handles finding the respective index
         *   for the key value given. Which will give us
         *   the location about that variable in our values. 
         */
        public get(key) {
            var value = -1; 

            // Get Index of Key from Key List
            for (var i = 0; i < this.keys.length; i++) {
                if (key === this.keys[i]) {
                    value = this.values[i];
                }
            }

            return value;
        }

        /**
         * set(key) 
         * - Set handles creating a new entry
         *   for a variable found during Semantic
         *   Analysis. Will return True or False
         *   based on if variable exists or not
         *   for a respective SymbolTable Node.
         */
        public set(key) {
            var status = false;

            // Check if Key already exists
            if (this.get(key) === -1) {
                this.keys.push(key);
                this.values.push(this.createValue());
                status = true;
            }

            // Clean Keys of Undefined
            this.keys = this.keys.filter((k) => { return k != undefined });
            this.values = this.values.filter((v) => { return v != undefined})

            return status;
        }

        /**
         * createValue()
         * - Create Value allows for us to generate an empty
         *   object that we can use to store all relative 
         *   information about a specific variable.
         */
        public createValue() {
            return {
                type: null,
                declared: null,
                initalized: [],
                used: []
            }
        }

        public toString() {
            var data = "";
            for (var k = 0; k < this.keys.length; k++) {
                // Format Values
                data += "| " + padEnd(this.keys[k], 5, " ") 
                    + "| " + padEnd(this.values[k].type, 8, " ")
                    + "| " + padEnd(this.values[k].declared.line.toString(), 5, " ")
                    + "| " + padEnd(this.values[k].declared.col.toString(), 4, " ") + "|\n";
            }

            return data;
        }
    }
}