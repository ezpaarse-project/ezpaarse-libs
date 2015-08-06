'use strict';

var cfg     = require('./config.json');
var parser  = require('xml2json');
var request = require('request').defaults({
  proxy: process.env.http_proxy ||
         process.env.HTTP_PROXY ||
         process.env.https_proxy ||
         process.env.HTTPS_PROXY
});
var config = require('./lib/config.js');
var pid;

// load credentials for DOI requests
if (config.pid) {
  pid = config.pid;
} else {
  console.error("Pid undefined ! needed for DOI requests");
  console.error("You can only use API requests");
}

exports.resolve = function (doi, options, cb) {
  var r = {};

  exports.APIquery(doi, function (err, response) {
    if (err) {
      console.error("Error : " + err);
      return cb(err);
    }

    if (response === null) { return cb(null, {}); }
    if (!response) { return cb(new Error('no response')); }
    if (typeof response !== 'object') {
      return cb(new Error('response is not a valid object'));
    }
    if (!response.message) {
      return cb(new Error('response object has no message'));
    }

    if (response['message-type'] === 'work') {
      return cb(null, exports.APIgetInfo(response.message, options.extended))
    }

    if (response['message-type'] === 'work-list' && Array.isArray(response.message.items)) {
      var list = response.message.items.map(function (item) {
        return exports.APIgetInfo(item, options.extended);
      });
      return cb(null, list);
    }

    return cb(null, {});
  });
};

/**
 * Query Crossref and get results
 * @param  {Object}   search   the actual query parameters
 * @param  {Object}   doi : doi to search metadata for
 * @param  {Function} callback(err, result)
 */
exports.DOIquery = function (doi, callback) {

  // query link
  // CrossRef https://doi.crossref.org/search/doi?pid=inis:inis708&format=unixsd&doi=10.1016/0735-6757(91)90169-K
  //

  var url = 'https://doi.crossref.org/search/doi?pid=' + pid + '&format=unixsd&doi=' + encodeURIComponent(doi);

  request.get(url, function (err, res, body) {
    if (err) { return callback(err); }

    if (res.statusCode === 401) {
      return callback(new Error('Unauthorized status code (' + res.statusCode + ') check your credentials'));
    } else if (res.statusCode !== 200) {
      console.error(url);
      return callback(new Error('Unexpected status code : ' + res.statusCode));
    }

    var info;

    try {
      //console.log(parser.toJson(body));
      info = JSON.parse(parser.toJson(body));
    } catch(e) {
      //console.log(body);
      return callback(e);
    }

    // if an error is thown, the json should contain the status code and a detailed message
    if (info.error) {
      var error = new Error(info.error.msg || 'got an unknown error from the API');
      error.code = info.error.code;
      return callback(error) ;
    }

    callback(null , info);
  });
};

/**
 * Query Crossref and get results
 * @param  {Object}   search   the actual query parameters
 * @param  {Object}   doi : doi to search metadata for
 * @param  {Function} callback(err, result)
 */
exports.APIquery = function (doi, callback) {

  var url = 'http://api.crossref.org/works';

  if (Array.isArray(doi)) {
    url += '?rows=' + doi.length + '&filter=doi:' + doi.join(',doi:');
  } else {
    url += '/' + encodeURIComponent(doi);
  }
  request.get(url, function (err, res, body) {
    if (err) { return callback(err); }

    if (res.statusCode === 404) {
      // doi not found
      return callback(null, null);
    } else if (res.statusCode !== 200) {
      var error = new Error('Unexpected status code : ' + res.statusCode);
      error.url = url;
      return callback(error);
    }

    var info;

    try {
      info = JSON.parse(body);
    } catch(e) {
      return callback(e);
    }

    // if an error is thrown, the json should contain the status code and a detailed message
    if (info.status !== 'ok') {
      var error = new Error('got an unknown error from the API');
      error.message = info.message;
      return callback(error) ;
    }

    callback(null , info);
  });
};

exports.APIgetPublicationDateYear = function(apiResult) {
  if (apiResult.message !== undefined
    && apiResult.message.issued !== undefined) {
    return apiResult.message.issued['date-parts'][0][0];
  }
  return {};
};

exports.APIgetPublicationTitle = function(apiResult) {
  if (apiResult.message !== undefined
   && typeof apiResult.message['container-title'] !== undefined) {
    return apiResult.message['container-title'][0];
  }
  return {};
};

exports.APIgetInfo = function(doc, extended) {
  var info = {
    'doi-publication-title': '',
    'doi-publication-date-year': '',
    'doi-publisher': '',
    'doi-type': '',
    'doi-ISSN': '',
    'doi-subject': ''
  };

  if (extended) {
    info['doi-license-content-version'] = '';
    info['doi-license-URL'] = '';
  }

  if (typeof doc !== 'object' || doc === null) { return info; }

  // search standard information
  info['doi-publication-title'] = doc['container-title'];
  info['doi-publisher']         = doc['publisher'];
  info['doi-type']              = doc['type'];
  info['doi-ISSN']              = doc['ISSN'];
  info['doi-DOI']               = doc['DOI'];
  info['doi-subject']           = doc['subject'];

  if (typeof doc.issued === 'object' &&
    doc.issued['date-parts'] &&
    doc.issued['date-parts'][0] &&
    doc.issued['date-parts'][0][0]) {

    info['doi-publication-date-year'] = doc.issued['date-parts'][0][0];
  }

  // search licence informations
  if (extended && doc['license'] && doc['license'][0]) {
    info['doi-license-content-version'] = doc['license'][0]['content-version'];
    info['doi-license-URL']             = doc['license'][0]['URL'];
  }

  return info;
};


exports.DOIgetPublicationDateYear = function(doc) {
  var publication_date = doc.crossref_result.query_result.body.query.doi_record.crossref.journal.journal_article.publication_date;
  var publication_date_year;
  if (typeof publication_date === 'object') {
    if (typeof publication_date[0] === 'object') {
      publication_date_year = publication_date[0].year;
    } else if (publication_date.year === undefined) {
      publication_date_year = "unknown";
    } else {
      publication_date_year = publication_date.year;
    }
  } else {
    publication_date_year = "unknown";
  }
  return publication_date_year;
};
