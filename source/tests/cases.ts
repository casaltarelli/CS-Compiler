/* -----
    Cases.ts

    Cases is used to populate our Editor with Test Cases chosen from our test cases modal. Handles populating 
    the user's editor.

----- */

var _SetTest = function(index, name) {
    var cases = [
        "{\n int a\n a = a\n string b\n a = b\n}$",
        "{}$\n{{{{{{}}}}}}$\n{{{{{{}}} /* comments are ignored */ }}}}$",
        '/* There might be a quote\n  coming soon*/\n{ int a "this is a quote " \n}$',
        "{ a boolean bca = true\n$\n\n{ string }$\n {}$",
        "{ /* this test \n\n is meant to be very long. \n*/ boolean\n a\n int string \n}\n$",
        "{\n int @\n }$",
        '{ string\n c\n     "is bad {"\n}$',
        "{ boolean compilersarefun != false ()"
    ];

    // Populate Editor + Output to Log
    this.document.getElementById("user-input").value = cases[index];
    _Log.output({level: "NONE", data: "Inserted Program " + name + "..."});

    // Close Modal on User Choice
    closeModal();
}