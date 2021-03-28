#! /usr/bin/env node

/**
 * @see https://www.hackerrank.com/challenges/simple-text-editor/problem
 *
 * @consider https://github.com/nheisterkamp/hackerrank
 *
 * @author Artūrs Gailītis
 * @email  arturs.gailitis@gmail.com
 */

// TODO: an enum in TypeScript

// Nice names for command codes
const CMD_APPEND = '1';
const CMD_DELETE = '2';
const CMD_PRINT_AT = '3';
const CMD_UNDO = '4';

// MARK: state (sorry, it's global for simplicity)
// ---------------------------------------------------------------------------

let editsExpected = 0;
let linesReceived = 0;

// Holds current contents of the text editor.
// NOTE: memory-inefficient, as JavaScript (v8) engine keeps every character as
//       UTF-16 symbol.
// As constraint (5) states that "All input characters are lowercase English letters"
// a single byte (Uint8Array or Buffer) could be used instead
// (both requires fixed, opre-allocated size)
let contents = "";

// A simple stack (based on array for simplicity) which accumulates inverse
// commands to undo the last operation.
//
// As soon as we get a command on STDIN, which is:
// * text editin (append | delete(N)) -> inverse command is generated and pushed
//   onto undo stack
//   -> inversion of append(suffix) is the same as delete(suffix.length)
//   -> to undo delete(N) command, we can store append(last_n_symbols) cmd on stack
// * print(k) -> is executed immediately
// * undo -> pops last inversed command from undo stack and adjusts editor
//   contents accordingly
let undoStack = [];

// MARK: processing I/O (main entry point)
// ---------------------------------------------------------------------------

process.stdin.setEncoding("ascii");
process.stdin.resume();

readline = require("readline");
const lineReader = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
});

lineReader.on('line', line => {
    linesReceived++;

    if (1 == linesReceived) {
        editsExpected = parseInt(line);
        // zero edits is valid
        if (isNaN(editsExpected) || editsExpected < 0) {
            throw new Error(`Assertion failed: 1st line should contain non-negative int`);
        }

        return; // on to next line..
    }

    // a command received
    if (linesReceived - 1 > editsExpected) {
        lineReader.close();
        process.exit(); // all is said and done
    }

    const command = parseLine(line);
    if (! command) {
        throw new Error("Bad command on line " + linesReceived + ":", line);
    }

    const undoCmd = inverseOf(command);
    if (undoCmd) {
        undoStack.push(undoCmd);
    }

    execute(command);
});

// MARK: process commands
// ---------------------------------------------------------------------------

/**
 * @param string line consist of "[1-4] arg?"
 * @return array typle of [COMMAND_CODE, OPTIONAL_ARGUMENT]
 */
function parseLine(line) {
    let cmd, arg;
    [cmd, arg = null] = line.split(' ');

    if (CMD_DELETE == cmd || CMD_PRINT_AT == cmd) {
        // print(k) and delete(k) expects arg to be positive integer
        arg = parseInt(arg);
        if (isNaN(arg)) {
            throw new Error(`Assertion failed: integer argument expected for operation: ${op}`);
        }

        if (arg < 1) {
            throw new Error(`Assertion failed: arg for operation: ${op} should be >= 1`);
        }
    }

    return [cmd, arg];
}

/**
 * Takes and destructures already parsed editor command
 * @returns command which would reverse effects of given edit, or null if
 *    given command is not append/delete
 */
function inverseOf([cmd, arg]) {
    if (CMD_APPEND == cmd) {
        // Inverse of append(str) is to delete the same number of chars from end of string
        return [ CMD_DELETE, (arg || "").length ];
    }

    if (CMD_DELETE == cmd) {
        // Inverse of delete(k) is to append back last k characters from
        // the current contents string
        const suffix = contents.slice(-arg);
        return [ CMD_APPEND, suffix ];
    }

    return null;
}

/**
 * @param string cmd (1..4: append, delete, print, undo)
 * @param arg
 */
function execute([cmd, arg = null]) {
    if (CMD_PRINT_AT == cmd) {
        const charAt = contents.substring(arg - 1, arg);
        process.stdout.write(charAt + "\n");
        return;
    }

    if (CMD_UNDO == cmd) {
        const reverseCmd = undoStack.pop();
        if (reverseCmd) {
            _doEdit(...reverseCmd);
        }

        // Empty undo stack is OK
        return;
    }

    // append or delete
    _doEdit(cmd, arg);
}

function _doEdit(cmd, arg) {
    if (CMD_APPEND == cmd) {
        contents += arg;
    } else if (CMD_DELETE == cmd) {
        contents = contents.slice(0, -arg);
    }
}
