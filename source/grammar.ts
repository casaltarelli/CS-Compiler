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
    {priority: 1,  name: "EOP",          regex: /^\$/, action:
        function(lexeme) { _Lexer.emitToken(_Lexer.generateToken(this.name, lexeme)); _Lexer.foundEOP = true;}},
    { priority: 1, name: "L_BRACE",     regex: /^\{/, action:
        function(lexeme) { _Lexer.emitToken(_Lexer.generateToken(this.name, lexeme)); }},
    { priority: 1, name: "R_BRACE",     regex: /^\}/, action: 
        function(lexeme) { _Lexer.emitToken(_Lexer.generateToken(this.name, lexeme)); }},
    { priority: 1, name: "L_PARAN",     regex: /^\(/, action: 
        function(lexeme) { _Lexer.emitToken(_Lexer.generateToken(this.name, lexeme)); }},
    { priority: 1, name: "R_PARAN",     regex: /^\)/, action: 
        function(lexeme) { _Lexer.emitToken(_Lexer.generateToken(this.name, lexeme)); }},
    { priority: 1, name: "L_COMM",      regex: /^\/\*/, action: 
        function(lexeme) { _Lexer.tokenStream.push(_Lexer.generateToken(this.name, lexeme)); _Lexer.inComment = true; }},
    { priority: 1, name: "R_COMM",      regex: /^\*\//, action: 
        function(lexeme) {  _Lexer.tokenStream.push(_Lexer.generateToken(this.name, lexeme)); _Lexer.inComment = false; }},
    { priority: 1, name: "QUOTE",       regex: /^"/, action:
        function(lexeme) { _Lexer.emitToken(_Lexer.generateToken(this.name, lexeme)); _Lexer.inQuote = _Lexer.inQuote ? false : true; }},
    { priority: 0, name: "BREAK",       regex: /^\n/, action: 
        function(lexeme) { 
            if (!_Lexer.inQuote) {
                _Lexer.update(this.regex, true); _Lexer.line++; _Lexer.col = 0; 
            } else {
                _Lexer.emitError(this.name, lexeme);
            } 
        }},
    { priority: 0, name: "UNDEFINED",   regex: /^([A-Z]|[\~\`\@\#\%\^\&\:\;\'\-\,\.\<\>\?\|]|\!(?!=))/, action: 
        function(lexeme) { _Lexer.emitError(this.name, lexeme); }},
    { priority: 4, name: "RESERVED",   regex: /^([0-9]|[{}!=+()\/])/, action: 
        function(lexeme) { _Lexer.emitError(this.name, lexeme); }}, // Priority -1 for Special Case [in quote]

    // Operators
    { priority: 2, name: "ASSIGN_OP",   regex: /^=/, action: 
        function(lexeme) { _Lexer.emitToken(_Lexer.generateToken(this.name, lexeme)); }},
    { priority: 1, name: "BOOL_OP",     regex: /^==|^!=/, action:
        function(lexeme) { _Lexer.emitToken(_Lexer.generateToken(this.name, lexeme)); }},
    { priority: 1, name: "INT_OP",      regex: /^\+/, action: 
        function(lexeme) { _Lexer.emitToken(_Lexer.generateToken(this.name, lexeme)); }},

    // Statements
    { priority: 1, name: "IF",          regex: /^if/, action: 
        function(lexeme) { _Lexer.emitToken(_Lexer.generateToken(this.name, lexeme)); }},
    { priority: 1, name: "WHILE",       regex: /^while/, action: 
        function(lexeme) { _Lexer.emitToken(_Lexer.generateToken(this.name, lexeme)); }},
    { priority: 1, name: "PRINT",       regex: /^print/, action:
        function(lexeme) { _Lexer.emitToken(_Lexer.generateToken(this.name, lexeme)); }},

    // Data Types
    { priority: 1, name: "INT",         regex: /^int/, action: 
        function(lexeme) { _Lexer.emitToken(_Lexer.generateToken(this.name, lexeme)); }},
    { priority: 1, name: "STRING",      regex: /^string/, action: 
        function(lexeme) { _Lexer.emitToken(_Lexer.generateToken(this.name, lexeme)); }},
    { priority: 1, name: "BOOLEAN",     regex: /^boolean/, action: 
        function(lexeme) { _Lexer.emitToken(_Lexer.generateToken(this.name, lexeme)); }},

    // Utilities
    { priority: 2, name: "ID",          regex: /^[a-z]/, action: 
        function(lexeme) { 
            if (_Lexer.inQuote) {
                _Lexer.emitToken(_Lexer.generateToken("CHAR", lexeme)); 
            } else {
                _Lexer.emitToken(_Lexer.generateToken(this.name, lexeme));
            }}},
    { priority: 2, name: "DIGIT",       regex: /^[0-9]/, action: 
        function(lexeme) { _Lexer.emitToken(_Lexer.generateToken(this.name, lexeme)); }},
    { priority: 1,  name: "BOOL_VAL",   regex: /^true|^false/, action: 
        function(lexeme) { _Lexer.emitToken(_Lexer.generateToken(this.name, lexeme)); }},
    { priority: 0,  name: "SPACE",      regex: /^\s/, action: 
        function(lexeme) { if (_Lexer.inQuote) { _Lexer.emitToken(_Lexer.generateToken(this.name, lexeme))}}}
];