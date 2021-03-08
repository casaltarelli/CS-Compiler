/* -----
    Token.ts

    The Token object is used to create a defined structure for all of the Tokens recognized by our languages 
    Grammar. 

----- */

module CSCompiler {
    export class Token {
        constructor(public name: string, 
                    public value: string,
                    public line: number,
                    public col: number) {}
    }
}