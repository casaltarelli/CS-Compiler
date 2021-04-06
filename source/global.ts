/* ------------
   Globals.ts

   Global CONSTANTS and _Variables.

   This code references page numbers in our text book:
   Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
   ------------ */

//
// Global CONSTANTS
//
const APP_NAME: string    = "CSCompiler";
const APP_VERSION: string = "0.1";

var _Stage = "Lexer";    // Preset to Lexer for first stage of Compilation
var _PID = 1;            // ID for Current Program
var _Verbose = true;

// Compiler 
var _Compiler: CSCompiler.Compiler;
var _TokenStream = [];
var _CST: CSCompiler.Tree;
var _CurrentProgram;

// Logger
var _Log: CSCompiler.Logger;

// Lexer
var _Lexer: CSCompiler.Lexer;

// Parser
var _Parser: CSCompiler.Parser;

// OnLoad
var onDocumentLoad = function() {
   // Instantiate our Compiler
   _Compiler = new CSCompiler.Compiler; 
   _Compiler.init();
}