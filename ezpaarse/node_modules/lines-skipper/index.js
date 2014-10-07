'use strict';

var util      = require('util');
var Transform = require('stream').Transform || require('readable-stream').Transform;

function LinesSkipper(linesToRemove) {
  Transform.call(this);
  if (linesToRemove && !Array.isArray(linesToRemove)) {
    throw new Error('argument should be an array');
  }

  this._linesToRemove  = (linesToRemove || []).sort(function (a, b) { return a - b; });
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

    if (this._nextLineToPush != this._linesToRemove[0]) {
      this.push(line);
    } else {
      this._linesToRemove.shift();
    }

    this._nextLineToPush++;

    index = this._buffer.indexOf('\n');
  }

  done();
};

LinesSkipper.prototype._flush = function (done) {
  this.push(this._buffer);
  done();
};

module.exports = function (linesToRemove) {
  return new LinesSkipper(linesToRemove);
};
