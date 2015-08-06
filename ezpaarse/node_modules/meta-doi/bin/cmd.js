#!/usr/bin/env node
'use strict';

/**
 * Command used to enrich csv source with meta info from a doi identifi
 *
 */
var metadoi = require('../index.js');
var fs      = require('fs');
var path    = require('path');
var csv     = require('csv');
var yargs   = require('yargs')
  .usage('Enrich a csv with meta information requested from a doi.' +
    '\n  Usage: $0 [-es] [-f file_name | -k doi_key_name | --doi doi_string]')
  .alias('file', 'f')
  .alias('doikey', 'k')
  .alias('extended', 'e')
  .alias('delimiter', 'd')
  .alias('wait', 'w')
  .alias('silent', 's')
  .describe('doikey', 'the field name containing doi (default "doi").')
  .describe('delimiter', 'delimiter of the csv file. Defaults to ";".')
  .describe('file', 'A csv file to parse. If absent, will read from standard input.')
  .describe('wait', 'minimum time to wait between queries, in milliseconds. Defaults to 200.')
  .describe('doi', 'A single doi to resolve.');
var argv = yargs.argv;

// show usage if --help option is used
if (argv.help || argv.h) {
  yargs.showHelp();
  process.exit(0);
}

var fields   = [];
var doikey   = argv.doikey || 'doi';
var waitTime = parseInt(argv.wait) || 200;
var options  = { extended: argv.extended || false };

if (argv.doi) {
  // request for a single doi
  return metadoi.resolve(argv.doi, options, function (err, meta) {
    if (err) { throw err; }
    console.log(meta);
  });
}

var parser     = csv.parse({ delimiter: argv.delimiter || ';', columns: true });
var stream     = argv.file ? fs.createReadStream(argv.file) : process.stdin;
var buffer     = [];
var first      = true;
var busy       = false;
var ended      = false;
var bufferSize = 20;

var doiFields  = Object.keys(metadoi.APIgetInfo(null, true));
var baseFields = [];

function writeLine(record, meta) {
  if (!record) { return; }

  var values = [];

  baseFields.forEach(function (f) {
    values.push(record[f] || '');
  });

  if (typeof meta === 'object') {
    doiFields.forEach(function (f) {
      values.push(meta[f] || '');
    });
  }

  process.stdout.write(values.join(';') + '\n');
}

function resolve(callback) {
  if (buffer.length === 0) { return callback(); }
  if (buffer.length < bufferSize && !ended) { return callback(); }

  var records = buffer.splice(0, bufferSize);
  var dois    = records.map(function (r) { return r[doikey]; })

  metadoi.resolve(dois, options, function (err, list) {
    if (err) { console.error(err); }
    if (!Array.isArray(list)) {
      console.error(new Error('meta-doi did not return an array'));
      return records.forEach(function (r) { writeLine(r); });
    }

    records.forEach(function (record) {
      var item;

      for (var i = list.length - 1; i >= 0; i--) {
        if (typeof list[i]['doi-DOI'] !== 'string') { continue; }

        if (record[doikey].toLowerCase() == list[i]['doi-DOI'].toLowerCase()) {
          item = list[i];
          break;
        }
      };

      writeLine(record, item);
    });

    setTimeout(function() { resolve(callback); }, options.waitTime);
  });
}

stream.pipe(parser)
.on('readable', function () {
  var row = parser.read();
  if (!row) { return; }

  if (first) {
    for (var p in row) { baseFields.push(p); }
    process.stdout.write(baseFields.concat(doiFields).join(';') + '\n');
    first = false;
  }

  if (!row[doikey]) {
    console.error("Error : doi key field ", doikey, " not found");
    return writeLine(row);
  }

  buffer.push(row);

  if (!busy) {
    busy = true;
    resolve(function () {
      busy = false;
    });
  }

}).on('end', function () {
  ended = true;
  if (!busy) { resolve(function () {}); }
}).on('error', function (err) {
  console.error(err);
});
