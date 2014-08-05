appender
========

A node module to append files

## Installation

```
npm install -g appender
```

## Usage

### Using node.js
```javascript
  var Appender = require('appender');
  new Appender(['path/to/file', 'path/to/other/file']).pipe(process.stdout);
```

### Using the global command
```
  append path/to/file path/to/other/file > result
```
Use `append -h` to get the command usage.

## Documentation

### Class: Appender

Create an Appender object. It's a `transform stream` that can be read to get the result.

```javascript
var Appender = require('appender');
var stream   = new Appender(paths, options);
```

**paths** is an array of paths that can be files and/or directories.

#### Options

* `skip` {integer} number of lines to skip at the beginning of each file (defaults to `0`).
* `filter` {regexp} only files matching the given regexp (string or litteral) are appended.
* `sort` {string} sort files by name before appending them (`ASC` or `DESC`).
* `case-sensitive` {boolean} use a case-sensitive sort for files, ie. a > Z (defaults to `false`).
* `inline` {boolean} disable linebreak insertion between files (defaults to `false`).
* `list` {boolean} only list matching files, no appending (defaults to `false`).
* `verbose` {boolean} print process steps in stderr (defaults to `false`).
