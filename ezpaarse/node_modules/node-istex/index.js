'use strict';

var request = require('request').defaults({
	proxy: process.env.http_proxy ||
	process.env.HTTP_PROXY ||
	process.env.https_proxy ||
	process.env.HTTPS_PROXY
	});

/**
* @param {Object} search
* @param {Object} options
* @param {Function} callback(err, result)
*/
exports.find = function (search,  callback) {

	if (!search && search.length != 40)  {
		return callback(new Error("index istex is incorrect"));
	}
	var urlistex = 'https://api.istex.fr/document/' + search ;
	var options = {
	  url: urlistex,
	  headers: {
	    'User-Agent': 'ezpaarse'
	  }
	};

	request.get(options, function (err , req , body){
		if (err) { return callback(err); }
		
			
		try {
			var result = JSON.parse(body);
		} catch (e) {
			return callback(e);
		}

		if (result.error) {
			return callback(new Error(result.error));
		}
		 callback(null, result);
	
	});
};

