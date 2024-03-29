/* -----
    Tree.ts

    Tree is used to generate our Concrete-Syntax Tree (and eventually our AST), we are able to create Nodes and ascend within
    a respective Tree throughout the Parsing stage of our compilation.

----- */
module CSCompiler {
    export class Tree {
        constructor(public root = null,
                    public current = null) {}

        public init(): void {
            this.root = null;
            this.current = null;
        }

        /**
         * addNode(name, type)
         * - AddNode gives us the ability to add new nodes
         *   to our Trees. Type is used to determine if we 
         *   are dealing with a leaf (terminal) or branch (non-terminal).
         */
        public addNode(type, name, data) {
            // Create Node Object
            var node = {
                type: type,
                name: name,
                children: [],
                parent: {},
                data: data,
                visited: false
            };

            // Check if New Node is Root
            if (!this.root) {
                this.root = node; 
                this.current = node;
            } else {
                // Otherwise, we are dealing with a Child so our Current is the Parent
                node.parent = this.current;
                this.current.children.push(node);

                // Validate Type to determine if we need to update our Current
                if (type == "Non-Terminal") {
                    // Update Current Pointer
                    this.current = node;
                }
            }
        }

        /**
         * addTableNode(scope)
         * - AddTableNode allows for us to create a new symbol table
         *   according to the respective scope we are on while
         *   producing our AST definitions.
         */
        public addTableNode(scope) {
            // Create Table Node Object
            var node = {
                scope: scope,
                table: new SymbolTable(),
                parent: {},
                children: []
            }

            // Check for Root
            if (!this.root) {
                this.root = node;
                this.current = node;
            } else {
                // Otherwise, we are dealing with an inner-scope so our Current is the Parent
                node.parent = this.current; 
                this.current.children.push(node);
            }

            // Update Current Pointer for new scope
            this.current = node;
        }

        /**
         * ascendTree()
         * - AscendTree allows for us to move up our
         *   tree definition, by accessing our current
         *   node's parent.
         */
        public ascendTree() {
            // Check if Parent Exists on Current Node
            if (this.current.parent) {
                this.current = this.current.parent;
            }
        }

        /**
         * descendTree()
         * - DescendTree allows for us to move down
         *   our SymbolTable definitions. By accessing
         *   either the nodes children or siblings
         */
        public descendTree() {
            // Check if Child or Sibling Exist
            if (this.current.children != undefined) {
                if (this.current.children.length > 0) {
                    this.current = this.current.children[0];
                } else {
                    var parent = this.current.parent;
    
                    // Get Parent Reference
                    var parent = this.current.parent; 
                    
                    // Find Sibling -- If any
                    var currentScope = this.current.scope
    
                    // Filter Children on Scope -- Get Next Child (Sibling)
                    var sibling = parent.children.map(child => child.scope).indexOf(currentScope);
    
                    if (sibling + 1 < parent.children.length) {
                        return parent.children[sibling + 1];
                    } else {
                        return -1; // Not Found -- Should Never Happen Hopefully
                    }
                }
            }
        }

        /**
         * descendTable(table)
         * - Used to perform a DFS of our
         *   SymbolTables in aiding to find
         *   Used instance.
         */
        public descendTable(table) {
            if (table.children.length > 0) {
                return table.children[0];
            } else {
                // Get Parent Reference
                var parent = table.parent; 
                
                // Find Sibling -- If any
                var currentScope = table.scope

                // Filter Children on Scope -- Get Next Child (Sibling)
                var sibling = parent.children.map(child => child.scope).indexOf(currentScope);

                if (sibling + 1 < parent.children.length) {
                    return parent.children[sibling + 1];
                } else {
                    return -1; // Not Found -- Should Never Happen Hopefully
                }
            }
        }

        // public getParentTable(table) {
        //     if (table.parent != undefined) {
        //         return table.parent; 
        //     } else {
        //         return undefined;
        //     }
        // }

        public seekTableEntry(t, key, scope, action) {
            if (t.table != undefined) {
                // Get Table Reference -- Start at Root 
                var reference = t.table.get(key);

                if (reference != -1) {
                    switch(action) {
                        case "Used":
                            // Check for Used Instance at Scope
                            for (var entry in reference.used) {
                                if (reference.used[entry].scope == scope) {
                                    return reference.declared.scope;
                                }
                            }
                        case "Used-Type":
                            // Check for Used Instance at Scope
                            for (var entry in reference.used) {
                                if (reference.used[entry].scope == scope) {
                                    return reference.type;
                                }
                            }
                    }
                } else {
                    // Descend Table to next Child or Sibling
                    return this.seekTableEntry(this.descendTable(t), key, scope, action); 
                    //return this.seekTableEntry(this.getParentTable(t), key, scope, action);
                }
            }
            
            return -1;
        }

        /**
         * ascendTable()
         * - Extension of ascendTree used for our Symbol
         *   Table definition.
         */
        public ascendTable() {
            // Validate our Current Table isn't Root
            if (this.current.scope != this.root.scope) {
                // Check if Parent Exists on Current Table
                if (this.current.parent) {
                    this.current = this.current.parent;
                }
            } else {
                console.log("Attempt to ascend when on Table Root");
            }
        }

        /**
         * toString()
         * - ToString gives us the functionality to 
         *   convert our Tree definitions into Strings
         *   so that we can output it to our User 
         *   through our Log.
         */
        public toString() {
            // Initialize Data for Tree
            var data = "";

            // Recursively Traverse through the Tree
            function expand(node, depth) {
                for (var i = 0; i < depth; i++) {
                    data += "-";
                }

                // Check if Node contains Children   [Terminal]
                if (node.children.length) {
                    // Add Terminal Node to Data
                    data += "<" + node.name + ">\n";

                    // Recursively Expand Non-Terminals + Terminals
                    for (var i = 0; i < node.children.length; i++) {
                        expand(node.children[i], depth + 1);
                    }
                } else {  //                         [Non-Terminal]
                    data += "[" + node.name + "]\n"
                }
            }

            // Make Initial Call to Expand from our Root Node
            expand(this.root, 0);

            // Return String Representation
            return data;
        }

        public toStringTable() {
            // Initalize Data for Symbol Table(s)
            var data = "";

            function collect(node) {
                // Validate Keys in Current Symbol Table
                if (node.table.keys.length != 0) {
                    // Create Symbol Table Header
                    data += "\n|----------    " + padEnd(node.scope.toString(), 3, " ") + "  ----------|\n";
                    data += "|-----------------------------|\n";
                    data += "| " + padEnd("key", 5, " ") + "| " 
                        + padEnd("type", 8, " ") + "| " 
                        + padEnd("line", 5, " ") + "| " 
                        + padEnd("col", 4, " ") + "|\n";

                    data+= node.table.toString()
                        + "|-----------------------------|\n";
                }

                // Check for Children Tables
                if (node.children.length != 0) {
                    for (var c in node.children) {
                        collect(node.children[c]); 
                    }
                }
            }
            
            // Make Initial Call to Collect
            collect(this.root);

            data += "|-----------------------------|\n";
            
            return data;
        }
    }
}