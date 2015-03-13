var http = require("http");
var fs = require('fs');
var cheerio = require('cheerio');
var MongoClient = require('mongodb').MongoClient;
var async = require('async');
var dbUrl = 'mongodb://localhost/resume';
http.globalAgent.maxSockets = 10000;
var urlArr = []; //all the name of universities
var DB,
	collection;
var proxyArr = [];
var index;

Array.prototype.unique = function() {
	var res = [],
		hash = {};
	for (var i = 0, elem;
		(elem = this[i]) != null; i++) {
		if (!hash[elem]) {
			res.push(elem);
			hash[elem] = true;
		}
	}
	return res;
};

MongoClient.connect(dbUrl, function(err, db) {
	DB = db;
	collection = db.collection('universities');

	//get school name
	findJobUrl(db, function() {
		searchJobInfo();
	});
});

var findJobUrl = function(db, cb) {
	collection.find({
		country_id: 'CHS'
	}).toArray(function(err, results) {
		if (err) {
			console.log(err);
		}
		results.forEach(function(val) {
			urlArr.push(val.job_url);
		});
		cb();
	});
};

var searchJobInfo = function() {
	async.eachSeries(urlArr.slice(3259), function(val, callback) {
		if (val) {
			http.get(val, function(response) {
				var stack = '';
				response.on('data', function(chunk) {
					stack += chunk;
				});

				response.on('end', function(err) {
					if (err) {
						console.log(err);
					}

					var $ = cheerio.load(stack);
					var subAList = $('a');
					var subUrlList = [];
					//find all url
					subAList.each(function(index, el) {
						var url = $(el).attr('href');
						subUrlList.push(url);
					});
					//filter url
					subUrlList = subUrlList.filter(function(element, pos) {
						if (element) {
							return element.charAt(0) === 'h' || element.charAt(0) === '/';
						}
					});
					var filterSubUrlList = [];
					subUrlList.forEach(function(url) {
						if (url) {
							if (url.charAt(0) === 'h' && url.charAt(4) !== 's' && url.charAt(1) === 't' && url.charAt(2) === 't') {
								filterSubUrlList.push(url);
							} else if (url.charAt(0) === '/') {
								filterSubUrlList.push(val + url);
							}
						}
					});
					filterSubUrlList = filterSubUrlList.unique();
					console.log('a' + urlArr.indexOf(val) + ' ' + val + ' ' + filterSubUrlList.length);
					//find tel or email 
					// async.eachSeries([filterSubUrlList[14]], function(url, innerCallback) {
					async.eachSeries(filterSubUrlList, function(url, innerCallback) {
						var request_timer = null,
							req = null;
						// 请求5秒超时
						request_timer = setTimeout(function() {
							innerCallback();
						}, 5000);

						req = http.get(url, function(res) {
							clearTimeout(request_timer);
							var stack = '';
							res.on('data', function(chunk) {
								stack += chunk;
							});

							res.on('end', function(err) {
								if (err) {
									console.log(err);
								}
								var $ = cheerio.load(stack);
								var content = $('body *').not('script').text();
								console.log('b' + filterSubUrlList.indexOf(url) + ' ' + url);
								var telArr = [],
									emailArr = [];
								var regTel = /\d{3}-\d{8}|\d{4}-\d{7}|[1][3,4,5,8]\d{9}|[2-9]\d{7}|\d{4}-\d{8}/gi,
									regEmail = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/gi;
								telArr = content.match(regTel) ? content.match(regTel).unique() : [];
								emailArr = content.match(regEmail) ? content.match(regEmail).unique() : [];
								if (telArr.length !== 0 || emailArr.length !== 0) {
									var saveObj = {
										url: url,
										tel: telArr,
										email: emailArr
									};
									fs.appendFile('data.json', JSON.stringify(saveObj) + '\n');
								}
								innerCallback();
							});
						}).on('error', function(err) {
							innerCallback();
						});
					}, function() {
						console.log("innerdone");
						callback();
					});
				});
			}).on('error', function(err) {
				callback();
			});
		} else {
			callback();
		}

	}, function() {
		console.log('done');
	});
};
