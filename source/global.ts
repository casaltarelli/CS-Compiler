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

var _Stages = ["Lexer", "Parser", "Semantic Analysis"];
var _Stage = "Lexer";    // Preset to Lexer for first stage of Compilation
var _PID = 1;            // ID for Current Program
var _Verbose = true;

// Compiler 
var _Compiler: CSCompiler.Compiler;
var _CST: CSCompiler.Tree;
var _CurrentProgram;

// Logger
var _Log: CSCompiler.Logger;

// Lexer
var _Lexer: CSCompiler.Lexer;
var _TokenStream = [];

// Parser
var _Parser: CSCompiler.Parser;
var _CSTs = [];

// Semantic Analyzer
var _SemanticAnalyzer: CSCompiler.SemanticAnalyzer;
var _ASTs = [];
var _SymbolTables = [];

// OnLoad
var onDocumentLoad = function() {
   // Instantiate our Compiler
   _Compiler = new CSCompiler.Compiler; 
   _Compiler.init();
}