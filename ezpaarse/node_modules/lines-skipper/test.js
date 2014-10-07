'use strict';

var assert = require('assert');
var skip   = require('./index.js');

describe('The skipper', function () {
  it('should correctly skip lines of a given array', function (done) {
    var skipper = skip([2,4,6]);

    var result = '';
    skipper.on('readable', function () { result += skipper.read(); });
    skipper.on('error', function (err) { throw err; })
    skipper.on('finish', function () {
      assert.equal(result, '1\n3\n5\n7');
      done();
    });

    skipper.write('1\n2\n3\n4\n5\n6\n7');
    skipper.end();
  });

  it('should throw an error if argument is not an array', function (done) {
    assert.throws(function () { return skip('string'); });
    assert.throws(function () { return skip({ an: 'object' }); });
    done();
  });
});
