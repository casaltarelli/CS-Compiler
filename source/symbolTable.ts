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

            console.log("SYMBOLTABLE: GET Seeking " + key);

            // Get Index of Key from Key List
            console.log("Keys length: " + this.keys.length);
            for (var i = 0; i < this.keys.length; i++) {
                console.log("SYMBOLTABLE: GET Current Key " + this.keys[i]);
                if (key === this.keys[i]) {
                    console.log("SYMBOLTABLE: GET Found Key");
                    value = this.values[i];
                }
            }

            console.log("Value Found in Set: " + JSON.stringify(value));

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

            console.log("SYMBOLTABLE: SET attempt for key given " + key);

            // Check if Key already exists
            if (this.get(key) === -1) {
                console.log("SYMBOLTABLE: SET New Key added to Keys List + Values Object Created");
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

        public toString(s) {
            var data = "";
            for (var k = 0; k < this.keys.length; k++) {
                // Format Values
                var scope = s.padEnd(5, " ");
                var key = this.keys[k].padEnd(5, " ");
                var type = this.values[k].type.padEnd(5, " ");
                var line = this.values[k].declared.line.padEnd(5, " ");
                var col = this.values[k].declared.col.padEnd(5, " ");

                data += "| " + scope + "| " + key + "| " + type + "| " + line + "| " + col + "| ";
            }

            return data;
        }
    }
}