/* ------------
   Globals.ts

   Global CONSTANTS and _Variables.

   This code references page numbers in our text book:
   Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
   ------------ */
//
// Global CONSTANTS
//
var APP_NAME = "CSCompiler";
var APP_VERSION = "0.1";
var _Stages = ["Lexer", "Parser", "Semantic Analysis", "Code Generation"];
var _Stage = "Lexer"; // Preset to Lexer for first stage of Compilation
var _PID = 1; // ID for Current Program
var _Verbose = true;
// Compiler 
var _Compiler;
var _CST;
var _CurrentProgram;
// Logger
var _Log;
// Lexer
var _Lexer;
var _TokenStream = [];
// Parser
var _Parser;
var _CSTs = [];
// Semantic Analyzer
var _SemanticAnalyzer;
var _ASTs = [];
var _SymbolTables = [];
// Code Generation
var _CodeGeneration;
var _Images = [];
// OnLoad
var onDocumentLoad = function () {
    // Instantiate our Compiler
    _Compiler = new CSCompiler.Compiler;
    _Compiler.init();
};
