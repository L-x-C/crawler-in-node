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
	var statusArr = ['7001000','7002000','4000000','4082000','4084000','7004000','2060000','5002000','3010000','201300','2023405','1050000','160000','160300','160200','160400','200500','200300','5001000','141000','140000','142000','2071000','2070000','7006000','200900','4083000','4010300','4010400','121100','7003000','7003100','5003000','7005000','5004000','121300','120500','2120000','2100708','2140000','2090000','2080000','2120500','5005000','4040000','201100','2050000','2051000','6270000','130000','2023100','100000','200100','5006000','200700','300100','300200'];
	// collection.find({
	// 	country_id: 'CHS'
	// }).toArray(function(err, results) {
	// 	if (err) {
	// 		console.log(err);
	// 	}
	// 	results.forEach(function(val) {
	// 		urlArr.push(val.job_url);
	// 	});
	// 	cb();
	// });
	for (var i = 0; i < statusArr.length; i++) {
		for (var j = 1; j <= 90; j++) {
			var thisUrl = 'http://sou.zhaopin.com/jobs/searchresult.ashx?bj='+statusArr[i]+'&jl=%E4%B8%8D%E9%99%90&isadv=0&sg=bcf2ab3b22d5467eb7141f3f44870a52&p=' + j;
			urlArr.push(thisUrl);
		}
	}
	cb();
};

var searchJobInfo = function() {
	async.eachSeries(urlArr.slice(2565,3846), function(val, callback) {
		if (val && val !== 'http://www.yjbys.com') {
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
					// var subAList = $('a');
					var subAList = $('.zwmc').find('a');
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
						if (url && url !== 'http://www.yjbys.com') {
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
								console.log('a' + urlArr.indexOf(val) + 'b' + filterSubUrlList.indexOf(url) + ' ' + url);
								var telArr = [],
									emailArr = [];
								var regTel = /\d{3}-\d{8}|\d{4}-\d{7}|[1][3,4,5,8]\d{9}|[2-9]\d{7}|\d{4}-\d{8}/gi,
									regEmail = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/gi;
								telArr = content.match(regTel) ? content.match(regTel).unique() : [];
								emailArr = content.match(regEmail) ? content.match(regEmail).unique() : [];


								var address = $('.terminal-ul li').eq(1).find('strong').text() || '';
								var education = $('.terminal-ul li').eq(5).find('strong').text() || '';
								var jobType = $('.terminal-ul li').eq(7).find('strong').text() || '';
								var jobDes = $('.tab-inner-cont div').text() || '';
								var jobTitle = $('.inner-left h1').text() || '';
								var companyName = $('.company-name-t a').text() || '';
								var companyAddress = $('.terminal-company li').last().find('strong').text() || '';

								if (telArr.length !== 0 || emailArr.length !== 0) {
									var saveObj = {
										url: url,
										tel: telArr,
										email: emailArr,
										address: address,
										education: education,
										jobType: jobType,
										jobDes: jobDes,
										jobTitle: jobTitle,
										companyName: companyName,
										companyAddress: companyAddress
									};
									fs.appendFile('zlzp2.json', JSON.stringify(saveObj) + '$%\n');
								}
								innerCallback();
								//提高一个量级
								// var thirdAList = $('a');
								// var thirdUrlList = [];
								// //find all url
								// thirdAList.each(function(index, el) {
								// 	var url = $(el).attr('href');
								// 	thirdUrlList.push(url);
								// });
								// //filter url
								// thirdUrlList = thirdUrlList.filter(function(element, pos) {
								// 	if (element) {
								// 		return element.charAt(0) === 'h' || element.charAt(0) === '/';
								// 	}
								// });
								// var filterthirdUrlList = [];
								// thirdUrlList.forEach(function(url) {
								// 	if (url && url !== 'http://www.yjbys.com') {
								// 		if (url.charAt(0) === 'h' && url.charAt(4) !== 's' && url.charAt(1) === 't' && url.charAt(2) === 't') {
								// 			filterthirdUrlList.push(url);
								// 		} else if (url.charAt(0) === '/') {
								// 			filterthirdUrlList.push(val + url);
								// 		}
								// 	}
								// });
								// filterthirdUrlList = filterthirdUrlList.unique();
								// async.eachSeries(filterthirdUrlList, function(url, thirdCallback) {
								// 	var request_timer = null,
								// 		req = null;
								// 	// 请求5秒超时
								// 	request_timer = setTimeout(function() {
								// 		thirdCallback();
								// 	}, 5000);

								// 	req = http.get(url, function(res) {
								// 		clearTimeout(request_timer);
								// 		var stack = '';
								// 		res.on('data', function(chunk) {
								// 			stack += chunk;
								// 		});

								// 		res.on('end', function(err) {
								// 			if (err) {
								// 				console.log(err);
								// 			}
								// 			var $ = cheerio.load(stack);
								// 			var content = $('body *').not('script').text();
								// 			console.log('c' + filterthirdUrlList.indexOf(url) + ' ' + url);
								// 			var telArr = [],
								// 				emailArr = [];
								// 			var regTel = /\d{3}-\d{8}|\d{4}-\d{7}|[1][3,4,5,8]\d{9}|[2-9]\d{7}|\d{4}-\d{8}/gi,
								// 				regEmail = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/gi;
								// 			telArr = content.match(regTel) ? content.match(regTel).unique() : [];
								// 			emailArr = content.match(regEmail) ? content.match(regEmail).unique() : [];
								// 			if (telArr.length !== 0 || emailArr.length !== 0) {
								// 				var saveObj = {
								// 					url: url,
								// 					tel: telArr,
								// 					email: emailArr
								// 				};
								// 				fs.appendFile('data.json', JSON.stringify(saveObj) + '$\n');
								// 			}
								// 			thirdCallback();
								// 		});
								// 	}).on('error', function(err) {
								// 		thirdCallback();
								// 	});
								// }, function() {
								// 	console.log("thirddone");
								// 	innerCallback();
								// });
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
