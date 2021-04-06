Browser-based Compiler in TypeScript
=================================================

This is Christian Saltarelli's Design of Compiler's class project.
See https://www.labouseur.com/courses/compilers/ for details.

Setup TypeScript
================

1. Install the [npm](https://www.npmjs.org/) package manager if you don't already have it.
1. Run `npm install -g typescript` to get the TypeScript Compiler. (You may need to do this as root.)


Workflow
=============

Some IDEs (e.g., Visual Studio Code, IntelliJ, others) natively support TypeScript-to-JavaScript compilation 
and have tools for debugging, syntax highlighting, and more.
If your development environment lacks these then you'll need to automate the compilation process with something like Gulp.

- Setup Gulp
1. `npm install -g gulp` to get the Gulp Task Runner.
1. `npm install -g gulp-tsc` to get the Gulp TypeScript plugin.

Run `gulp` at the command line in the root directory of this project.
Edit your TypeScript files in the source/scripts directory.

Gulp will automatically:

* Watch for changes in your source/scripts/ directory for changes to .ts files and run the TypeScript Compiler on them.
* Watch for changes to your source/styles/ directory for changes to .css files and copy them to the distrib/ folder if you have them there.


I find Gulp annoying, so consider use a compile script from the command line.

A Few Notes
===========

**Prof. Labouseur**
Please grade my Project Two on the master branch of this project. Safari seems to hate assertions (working on that one), please run my project in Google Chrome to avoid any issues. 

**TypeScript Resources**
[Right this way!](http://www.typescriptlang.org/)
