/* -----
    Cases.ts

    Cases is used to populate our Editor with Test Cases chosen from our test cases modal. Handles populating 
    the user's editor.

----- */

var _SetTest = function(index, name) {
    var cases = [
        "{\n int a\n a = 4\n string b\n a = b\n}$",
        "{}$\n{{{{{{}}}}}}$\n{{{{{{}}} /* comments are ignored */ }}}}$",
        '/* There might be a quote\n  coming soon*/\n{ string a a="this is a quote " \n}$',
        "{ boolean b c = true\n$\n\n{ string w }$\n {}$",
        "{ /* this test \n\n is meant to be very long. \n*/ boolean\n a\n int c string h\n}\n$",
        '{ string a a ="compilersarefun" b = (a != false) }',
        '{ string c c = "i think this is a string ',
        '{ string a != /* this is a comment ',
        "{\n int @\n }$",
        '{ string\n c\n     "is bad {"\n}$',
        '{\n    int a\n    a = 1\n    print(a)\n    boolean b\n    b = true\n    print(b)\n\n'
        + '    {\n        int a\n        a = 2\n        print(a)\n    }\n\n'
        + '    {\n        int a\n        a = 3\n        print(a)\n    }\n\n'
        + '    string s\n    s = "str"\n    print(s)\n\n    s = "strb"\n    print(s)\n'
        + '    if (a != 5) {\n        print("true")\n    }\n\n    if (a == 5) {\n'
        + '        print("false")\n    }\n  }$',
        '{\n    string s\n    int q\n    q = 8\n    {\n        h = "hello"\n'
        + '        int z\n        z = 1\n        print(z)\n    }\n'
        + '    {\n        while (a == 3) {\n            a = 7 + a\n            print(a)\n        }\n'
        + '   }\n  }$',
        '{\n    int a\n    a = 1\n    int b\n    b = 1\n    b = 1 + a\n'
        + '    while (2 + a != 3 + b) {\n        a = 1 + a\n        print("int b is ")\n'
        + '        print("hello world")\n    }\n\n  }$',
        '{}$\n\n  {\n    string b\n    string c\n    if (b != c) {\n'
        + '        b = 2 + c\n\n    }\n        }$\n    {\n  print("whats up doc") \n }$',
        '{\n    int c\n    c = 7 +\n    print(c)\n  }$',
        '{\n    string c c = "hello"\n    print(\nc\n}$',
        '\n{\n    int a\n    string c\n    if (a != c) {\n        print("false")\n    }\n\n$'
    ];

    // Populate Editor + Output to Log
    this.document.getElementById("user-input").value = cases[index];
    _Log.output({level: "", data: "Inserted Program " + name + "..."});

    // Close Modal on User Choice
    closeModal();
}