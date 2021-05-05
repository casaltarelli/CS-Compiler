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
            var index = -1; 

            // Get Index of Key from Key List
            for (var i = 0; i < this.keys.length; i++) {
                if (key == this.keys[i]) {
                    index = i;
                }
            }

            return index;
        }

        /**
         * set(key) 
         * - Set handles creating a new entry
         *   for a variable found during Semantic
         *   Analysis. Will return True or False
         *   based on if variable exists or not.
         */
        public set(key) {
            var status = false;

            // Check if Key already exists
            if (this.get(key) == -1) {
                this.keys.push(key);
                this.values.push(this.createValue());
                status = true;
            }

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
                initalized: null,
                used: null
            }
        }
    }
}