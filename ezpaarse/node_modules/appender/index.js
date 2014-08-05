#!/usr/bin/env node
'use strict';

var fs        = require('fs');
var path      = require('path');
var util      = require('util');
var Transform = require('stream').Transform || require('readable-stream').Transform;

function Appender(sources, options) {

  options  = options || {};
  Transform.call(this);

  var self           = this;
  this._nbSkip       = parseInt(options.skip) || 0;
  this._inline       = options.inline;
  this._verbose      = options.verbose;
  this._files        = [];
  this._next         = 0;
  this._skippedLines = 0;
  var filter;

  if (options.filter) {
    if (options.filter instanceof RegExp) { filter = options.filter; }
    else { filter = new RegExp(options.filter); }
  }

  sources.forEach(function (source) {
    if (!fs.existsSync(source)) { return; }

    var stat = fs.statSync(source);
    if (stat.isDirectory()) {
      fs.readdirSync(source).forEach(function (file) {
        var filepath = path.join(source, file);
        if (fs.statSync(filepath).isFile()) {
          if (filter && !filter.test(file)) { return; }
          self._files.push(filepath);
        }
      });
    } else {
      if (filter && !filter.test(source)) { return; }
      self._files.push(source);
    }
  });

  if (options.sort) {
    switch (options.sort.toLowerCase()) {
    case 'asc':
      // Sort files by names from Z to A (then we pop them from A to Z)
      self._files.sort(function (a, b) {
        if (!options['case-sensitive']) {
          a = a.toLowerCase();
          b = b.toLowerCase();
        }
        if (path.basename(a) < path.basename(b)) { return -1; }
        if (path.basename(a) > path.basename(b)) { return 1;  }
        return 0;
      });
      break;
    case 'desc':
      // Sort files by names from A to Z (then we pop them from Z to A)
      self._files.sort(function (a, b) {
        if (!options['case-sensitive']) {
          a = a.toLowerCase();
          b = b.toLowerCase();
        }
        if (path.basename(a) > path.basename(b)) { return -1; }
        if (path.basename(a) < path.basename(b)) { return 1;  }
        return 0;
      });
      break;
    }
  }

  if (options.list) {
    this._files.forEach(function (file) { self.push(file + '\n'); });
    this.end();
    return;
  }

  this.appendNextFile();
}

util.inherits(Appender, Transform);
module.exports = Appender;

Appender.prototype._transform = function (chunk, encoding, done) {
  var data = chunk.toString();

  if (this._skippedLines >= this._nbSkip) {
    this.push(data);
  } else {
    this.push(this.checkLineBreaks(data));
  }

  done();
};

/**
 * Remove line breaks in a string until we reach the asked number of skipped lines
 * Returns the resulting string
 */
Appender.prototype.checkLineBreaks = function (data) {
  var index = data.indexOf('\n');
  if (index != -1) {
    ++this._skippedLines;
    if (this._verbose) { console.error('Skipping line ' + this._skippedLines); }

    data = data.substr(++index);
    if (this._skippedLines >= this._nbSkip) {
      return data;
    } else {
      return this.checkLineBreaks(data);
    }
  } else if (this._skippedLines < this._nbSkip) {
    return '';
  }
  return data;
};

Appender.prototype.appendNextFile = function () {
  var self = this;
  var file = this._files[this._next++];
  if (!file) {
    if (this._verbose) { console.error('Done'); }
    this.end();
    return;
  }

  if (this._verbose) { console.error('Appending: ' + file); }

  var stream = fs.createReadStream(file);
  stream.on('end', function () {
    self._skippedLines = 0;
    if (!self._inline) { self.push('\n'); }
    self.appendNextFile();
  });

  stream.pipe(this, { end: false });
};
