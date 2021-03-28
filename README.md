# A simple text editor challenge

Please, see the problem statement in full [on HackerRank](https://www.hackerrank.com/challenges/simple-text-editor/problem)
or [here locally](problem/statement.pdf).

## Ensure it works

To run a [simple test case](problem/test-cases/input00.txt), open a terminal using a **bash**-like shell
and execute the following command from the project root:

```bash
cat problem/test-cases/input00.txt | ./solution.js | diff --ignore-space-change ./problem/test-cases/output00.txt -
```

*(please, be sure to have an up to date [node.js](https://nodejs.org/en/download/) installed and accessible in the environment path).*

## Proposed solution

Out of pure curiosity, [this solution](solution.js) keeps a stack of operations
to be performed in order to undo previous edits in the correct order, and is
based on the simple observation that:

* taking back an `append(str)` operation is equivalent to removing of as many characters from the string as the appended `str` contains;
* `delete(N)` command can be undone by `append(last N symbols)` of the current editor contents.

*(Another popular solution for supporting undo seems to be just pushing to a history stack editor contents as they were before performing the next edit operation).*

## Optimisations

In a memory constrained environment (and to overcomplicate things as much as possible :) ),
we could take into account that editor would contain only English lowercased characters
and store both the current string and it's alterations as a byte buffer, allocating 5 bits per character.
