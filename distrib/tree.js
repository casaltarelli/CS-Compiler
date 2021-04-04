/* -----
    Tree.ts

    Tree is used to generate our Concrete-Syntax Tree (and eventually our AST), we are able to create Nodes and ascend within
    a respective Tree throughout the Parsing stage of our compilation.

----- */
var CSCompiler;
(function (CSCompiler) {
    var Tree = /** @class */ (function () {
        function Tree(root, current) {
            if (root === void 0) { root = null; }
            if (current === void 0) { current = null; }
            this.root = root;
            this.current = current;
        }
        Tree.prototype.init = function () {
            this.root = null;
            this.current = {};
        };
        /**
         * addNode(name, type)
         * - AddNode gives us the ability to add new nodes
         *   to our Trees. Type is used to determine if we
         *   are dealing with a leaf (terminal) or branch (non-terminal).
         */
        Tree.prototype.addNode = function (name, type) {
            // Create Node Object
            var node = {
                name: name,
                children: [],
                parent: {}
            };
            // Check if New Node is Root
            if (!this.root) {
                this.root = node;
                this.current = node;
            }
            else {
                // Otherwise, we are dealing with a Child so our Current is the Parent
                node.parent = this.current;
                this.current.children.push(node);
                // Validate Type to determine Leaf or Branch
                if (type == "branch") {
                    // Update Current Pointer
                    this.current = node;
                }
            }
        };
        /**
         * ascendTree()
         * - AscendTree allows for us to move up our
         *   tree definition, by accessing our current
         *   node's parent.
         */
        Tree.prototype.ascendTree = function () {
            // Validate our Current Node isn't Root
            if (this.current.name != this.root.name) {
                // Check if Parent Exists on Current Node
                if (this.current.parent) {
                    this.current = this.current.parent;
                }
            }
        };
        /**
         * toString()
         * - ToString gives us the functionality to
         *   convert our Tree definitions into Strings
         *   so that we can output it to our User
         *   through our Log.
         */
        Tree.prototype.toString = function () {
            // Initialize Data for Tree
            var data;
            // Recursively Traverse through the Tree
            function expand(node, depth) {
                for (var i = 0; i < depth; i++) {
                    data += "-";
                }
                // Check if Node contains Children   [Leaf]
                if (node.children.length) {
                    // Add Leaf Node to Data
                    data += " < " + node.name + " > \n";
                    // Recursively Expand Leafs
                    for (var i = 0; i < node.children.length; i++) {
                        expand(node.children[i], depth + 1);
                    }
                }
                else { //                         [Branch]
                    data += " [ " + node.name + " ] \n";
                }
            }
            // Make Initial Call to Expand from our Root Node
            expand(this.root, 0);
            // Return String Representation
            return data;
        };
        return Tree;
    }());
    CSCompiler.Tree = Tree;
})(CSCompiler || (CSCompiler = {}));
