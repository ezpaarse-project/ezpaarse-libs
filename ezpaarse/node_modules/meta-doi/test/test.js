/*global describe, it*/
'use strict';

var path    = require('path');
var should  = require('should');
var metaDOI = require('../index.js');
var testSet = [
  {
    "platform" : "ScienceDirect",
    "doi": "10.1016/0735-6757(91)90169-K",
    "year": "1991"
  },
  {
    "platform" : "Springer",
    "doi": "10.1007/BF02478894",
    "year": "1998"
  },
  {
    "platform" : "Wiley",
    "doi": "10.1111/issg.12022",
    "year": "2013"
  },
  {
    "platform" : "Wiley",
    "doi": "10.1111/j.1945-5100.1992.tb00734.x",
    "year": "1992"
  },
  {
    "platform" : "BMJ",
    "doi": "10.1136/bjsm.33.6.426",
    "year": "1999"
  }
];

describe('Crossref doi', function () {
  testSet.forEach(APIcheck);

  it('should correctly handle doi arrays (@03)', function (done) {
    var dois = testSet.map(function (set) { return set.doi; });

    metaDOI.resolve(dois, {}, function (err, list) {
      should.ifError(err);

      list.should.be.instanceof(Array, 'the reponse is not an array');
      list.should.have.lengthOf(dois.length);

      list.forEach(function (item) {
        item.should.have.property('doi-publication-date-year');
        item.should.have.property('doi-DOI');

        item['doi-DOI'].should.be.type('string');

        for (var i = testSet.length - 1; i >= 0; i--) {
          if (testSet[i].doi.toLowerCase() == item['doi-DOI'].toLowerCase()) { break; }
        };

        should.exist(testSet[i], 'the doi ' + item['doi-DOI'] + ' that we didn\'t send ');
        item['doi-publication-date-year'].toString().should.equal(testSet[i].year);
      });

      done();
    });
  });
});

function APIcheck(testCase) {
  describe('API request ', function () {
    it('should be correctly enriched (@02) for ' + testCase.platform, function (done) {
      metaDOI.APIquery(testCase.doi, function (err, doc) {
        should.ifError(err);
        should.equal(metaDOI.APIgetPublicationDateYear(doc), testCase.year);
        done();
      });
    });
  });
}