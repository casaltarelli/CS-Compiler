/* -----
    Grammar.ts

    Outlines all necessary regular expressions to define the grammar for our language. All attributes of this file 
    follow the same structure:
    
    RegEx Object = [Priority, Name, RegEx, Action]

    We use ^ assertion for all regular expressions to only accept cases in which from index 0 and on satisifes the test case
        - e.g "if " --> Will give a valid match to "/^if/" but " if" will not

    Priority Levels:
       - 0: Space/New Line or Undefined/Reserved Characters
       - 1: Keywords/Constructs/Data Types/Operators
       - 2: ID/Digit/Assign Operator

----- */

var _Grammar = [
    // Constructs
    {priority: 1,  name: "EOP",          regex: "/^\$/", action: 
        function(value) { _Lexer.emitToken(_Lexer.generateToken(this.name, value)); _Lexer.foundEOP = true;}},
    { priority: 1, name: "L_BRACE",     regex: "/^{/", action:
        function(value) { _Lexer.emitToken(_Lexer.generateToken(this.name, value)); }},
    { priority: 1, name: "R_BRACE",     regex: "/^}/", action: 
        function(value) { _Lexer.emitToken(_Lexer.generateToken(this.name, value)); }},
    { priority: 1, name: "L_PARAN",     regex: "/^(/", action: 
        function(value) { _Lexer.emitToken(_Lexer.generateToken(this.name, value)); }},
    { priority: 1, name: "R_PARAN",     regex: "/^)/", action: 
        function(value) { _Lexer.emitToken(_Lexer.generateToken(this.name, value)); }},
    { priority: 1, name: "L_COMM",      regex: "/^\/\/*/", action: 
        function(value) { _Lexer.emitToken(_Lexer.generateToken(this.name, value)); _Lexer.inComment = true; }},
    { priority: 1, name: "R_COMM",      regex: "/^\*\//", action: 
        function(value) { _Lexer.emitToken(_Lexer.generateToken(this.name, value)); _Lexer.inComment = false; }},
    { priority: 1, name: "QUOTE",       regex: '/^"/', action:
        function(value) { _Lexer.emitToken(_Lexer.generateToken(this.name, value)); _Lexer.inQuote = true || false ? false : true; }},
    { priority: 0, name: "BREAK",       regex: "/^\n/", action: 
        function() { _Lexer.line++; }},
    { priority: 0, name: "UNDEFINED",   regex: "/^[A-Z]|[~`!@#%^&:;'-,.<>?/\|\/]/", action: 
        function(value) { _Lexer.emitError(value); }}, // TODO: Finsh Error handeling

    // Operators
    { priority: 2, name: "ASSIGN_OP",   regex: "/^=/", action: 
        function(value) { _Lexer.emitToken(_Lexer.generateToken(this.name, value)); }},
    { priority: 1, name: "BOOL_OP",     regex: "/^==|^!=/", action:
        function(value) { _Lexer.emitToken(_Lexer.generateToken(this.name, value)); }},
    { priority: 1, name: "INT_OP",      regex: "/^+/", action: 
        function(value) { _Lexer.emitToken(_Lexer.generateToken(this.name, value)); }},

    // Statements
    { priority: 1, name: "IF",          regex: "/^if/", action: 
        function(value) { _Lexer.emitToken(_Lexer.generateToken(this.name, value)); }},
    { priority: 1, name: "WHILE",       regex: "/^while/", action: 
        function(value) { _Lexer.emitToken(_Lexer.generateToken(this.name, value)); }},
    { priority: 1, name: "PRINT",       regex: "/^print/", action:
        function(value) { _Lexer.emitToken(_Lexer.generateToken(this.name, value)); }},

    // Data Types
    { priority: 1, name: "INT",         regex: "/^int/", action: 
        function(value) { _Lexer.emitToken(_Lexer.generateToken(this.name, value)); }},
    { priority: 1, name: "STRING",      regex: "/^string/", action: 
        function(value) { _Lexer.emitToken(_Lexer.generateToken(this.name, value)); }},
    { priority: 1, name: "BOOLEAN",     regex: "/^boolean/", action: 
        function(value) { _Lexer.emitToken(_Lexer.generateToken(this.name, value)); }},

    // Utilities
    { priority: 2, name: "ID",          regex: "/^[a-z]/", action: 
        function(name, value) { _Lexer.emitToken(_Lexer.generateToken(name, value)); }},
    { priority: 2, name: "DIGIT",       regex: "/^[0-9]/", action: 
        function(value) { _Lexer.emitToken(_Lexer.generateToken(this.name, value)); }},
    { priority: 1,  name: "BOOL_VAL",   regex: "/^true|^false/", action: 
        function(value) { _Lexer.emitToken(_Lexer.generateToken(this.name, value)); }},
    { priority: 0,  name: "SPACE",      regex: "/[^\S\n\r]/", action: 
        function() { _Lexer.program = _Lexer.program.substring(1); }}
];