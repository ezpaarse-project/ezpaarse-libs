# node-sudoc
A wrapper around sudoc web services

## Installation
```shell
  npm install sudoc
```

## Usage

### Callback-style
```javascript
  let sudoc = require('sudoc');
  
  sudoc.issn2ppn('0182-2012', (err, result) => {
    console.log(result); // { query: { issn: '0182-2012', result: { ppn: '001014692' } } }
  });
  
  sudoc.issn2ppn(['0182-2012', '0774-3122'], (err, result) => {
    console.log(result);
    // [
    //   { query: { issn: '0182-2012', result: { ppn: '001014692'} } },
    //   { query: { issn: '0774-3122', result: { ppn: '000928151'} } }
    // ]
  });
```

### Promise-style
```javascript
  let sudoc = require('sudoc');

  sudoc.issn2ppn('0182-2012').then(result => {
    console.log(result); // { query: { issn: '0182-2012', result: { ppn: '001014692' } } }
  })
  .catch(err => {
    console.error(err);
  });
  
  sudoc.issn2ppn(['0182-2012', '0774-3122'])
  .then(result => {
    console.log(result);
    // [
    //   { query: { issn: '0182-2012', result: { ppn: '001014692'} } },
    //   { query: { issn: '0774-3122', result: { ppn: '000928151'} } }
    // ]
  }).catch(err => {
    console.error(err);
  });
```

## Methods
All the available methods work the same way, they accept either a single string or an array, and support promises as well as callbacks.

- issn2ppn(issn[, callback])
- isbn2ppn(isbn[, callback])
- ean2ppn(ean[, callback])
