'use strict';

var util      = require('util');
var Transform = require('stream').Transform || require('readable-stream').Transform;

function LinesSkipper(toRemove) {
  Transform.call(this);

  if (!toRemove) {
    this._filter = function () { return false; };
  } else if (typeof toRemove == 'function') {
    this._filter = toRemove;
  } else if (Array.isArray(toRemove)) {
    this._linesToRemove = toRemove.sort(function (a, b) { return a - b; });
    this._filter = function (number) {
      return number == this._linesToRemove[0];
    };
  } else {
    throw new Error('argument should be either an array or a function');
  }

  this._nextLineToPush = 1;
  this._buffer         = '';
}

util.inherits(LinesSkipper, Transform);

LinesSkipper.prototype._transform = function (chunk, encoding, done) {
  this._buffer += chunk.toString();

  var index = this._buffer.indexOf('\n');

  while (index !== -1) {
    var line = this._buffer.substr(0, index + 1);
    this._buffer = this._buffer.substr(index + 1);

    if (this._filter(this._nextLineToPush)) {
      if (this._linesToRemove) { this._linesToRemove.shift(); }
    } else {
      this.push(line);
    }

    this._nextLineToPush++;

    index = this._buffer.indexOf('\n');
  }

  done();
};

LinesSkipper.prototype._flush = function (done) {
  if (!this._filter(this._nextLineToPush)) { this.push(this._buffer); }
  done();
};

module.exports = function (toRemove) {
  return new LinesSkipper(toRemove);
};
