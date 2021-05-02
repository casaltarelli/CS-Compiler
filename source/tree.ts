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
                name: name,
                children: [],
                parent: {},
                data: {line: data.line, col: data.col}
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
                if (type == "branch") {
                    // Update Current Pointer
                    this.current = node;
                }
            }
        }

        /**
         * ascendTree()
         * - AscendTree allows for us to move up our
         *   tree definition, by accessing our current
         *   node's parent.
         */
        public ascendTree() {
            // Validate our Current Node isn't Root
            if (this.current.name != this.root.name) {
                // Check if Parent Exists on Current Node
                if (this.current.parent) {
                    this.current = this.current.parent;
                }
            } else {
                console.log("Attempt to ascend when on Root Node");
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

                // Check if Node contains Children   [Leaf]
                if (node.children.length) {
                    // Add Leaf Node to Data
                    data += "<" + node.name + ">\n";

                    // Recursively Expand Leafs
                    for (var i = 0; i < node.children.length; i++) {
                        expand(node.children[i], depth + 1);
                    }
                } else {  //                         [Branch]
                    data += "[" + node.name + "]\n"
                }
            }

            // Make Initial Call to Expand from our Root Node
            expand(this.root, 0);

            // Return String Representation
            return data;
        }
    }
}