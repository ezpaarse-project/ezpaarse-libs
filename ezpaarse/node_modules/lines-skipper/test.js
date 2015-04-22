'use strict';

var assert = require('assert');
var skip   = require('./index.js');

describe('The skipper', function () {
  it('should behave like a pass-through if given no argument', function (done) {
    var skipper = skip();

    var result = '';
    skipper.on('readable', function () { result += skipper.read(); });
    skipper.on('error', function (err) { throw err; })
    skipper.on('finish', function () {
      assert.equal(result, '1\n2\n3\n4\n5\n6\n7');
      done();
    });

    skipper.write('1\n2\n3\n4\n5\n6\n7');
    skipper.end();
  });

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

  it('should correctly skip lines if given a function', function (done) {
    var skipper = skip(function (number) { return number % 2; });

    var result = '';
    skipper.on('readable', function () { result += skipper.read(); });
    skipper.on('error', function (err) { throw err; })
    skipper.on('finish', function () {
      assert.equal(result, '2\n4\n6\n');
      done();
    });

    skipper.write('1\n2\n3\n4\n5\n6\n7');
    skipper.end();
  });

  it('should throw an error if argument is not an array or a function', function (done) {
    assert.doesNotThrow(function () { return skip([1, 2, 3]); });
    assert.doesNotThrow(function () { return skip(function () {}); });
    assert.throws(function () { return skip('string'); });
    assert.throws(function () { return skip({ an: 'object' }); });
    done();
  });
});
