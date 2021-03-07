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

var _Stage = "Lexer";   // Preset to Lexer for first stage of Compilation
var _PID = 1;           // ID for Current Program

// Compiler 
var _Compiler: Compiler.Compiler;

// Logger
var _Log: Compiler.Logger;

// Lexer
var _Lexer: Compiler.Lexer;