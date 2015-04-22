lines-skipper
=============

A small node module to skip lines.
It's basically a transform stream that counts lines and doesn't push those whose number is in a given list.

## Installation

```
npm install lines-skipper
```

## Usage

### With an array of integers
```javascript
  var skip = require('lines-skipper');

  readStream
  .pipe(skip([2,4,6])) // skip lines 2, 4 and 6
  .pipe(writeStream);
```

### With a filtering function
```javascript
  var skip = require('lines-skipper');

  readStream
  .pipe(skip(function (n) { return n % 2 })) // skip lines whose number is odd
  .pipe(writeStream);
```

## Example

```javascript
  var skip = require('lines-skipper');
  var skipper = skip([2,4,6]);

  var result = '';
  
  skipper.on('readable', function () {
    result += skipper.read();
  });
  
  skipper.on('error', function (err) {
    throw err;
  });
  
  skipper.on('finish', function () {
    console.log(result) // output '1\n3\n5\n7'
  });

  skipper.write('1\n2\n3\n4\n5\n6\n7');
  skipper.end();
```
