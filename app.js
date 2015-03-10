var http = require("http");
var fs = require('fs');
var cheerio = require('cheerio');
var MongoClient = require('mongodb').MongoClient;
var async = require('async');

var dbUrl = 'mongodb://localhost/resume';

var nameArr = []; //all the name of universities
var baiduUrlObj = {},
	baiduUrlArr = []; //since baidu will encrypt url
var urlObj = {},
	urlArr = []; //real target url
var DB,
	collection;
var proxyArr = [];
var index;


MongoClient.connect(dbUrl, function(err, db) {
	DB = db;
	collection = db.collection('universities');

	// async.series([
	// 	//get proxyArr
	// 	function(callback) {
	// 		http.get('http://pachong.org/', function(response) {
	// 			var stack = '';
	// 			response.on('data', function(chunk) {
	// 				stack += chunk;
	// 			});

	// 			response.on('end', function(err) {
	// 				if (err) {
	// 					console.log(err);
	// 				}
	// 				var $ = cheerio.load(stack);
	// 				var data = $('.tb tr').each(function(i, ele) {
	// 					var host = $(this).find('td').eq(1).text();
	// 					var port = eval($(this).find('td').eq(2).find('script').text().substring(14).replace(/calf/, 7213).replace(/snake/, 13352).replace(/hen/, 15948).replace(/cock/, 11063).replace(/dog/, 8453));
	// 					var temp = {
	// 						host: host,
	// 						port: port
	// 					}
	// 					proxyArr.push(JSON.stringify(temp));
	// 				})
	// 				proxyArr = proxyArr.slice(1);
	// 				callback(null, 'one');
	// 			});
	// 		})

	// 	}
	// ],
	// // optional callback
	// function(err, results) {
		// setInterval(function() {
		// 	index = Math.floor(Math.random() * proxyArr.length);
		// }, 5000);
		//get school name
		findSchool(db, function() {
			searchSchool();
		});
	// });
});

var findSchool = function(db, cb) {

	collection.find({
		country_id: 'CHS'
	}).toArray(function(err, results) {
		if (err) {
			console.log(err);
		}
		results.forEach(function(val) {
			nameArr.push(val.name);
		});
		cb();
	});

}
var searchSchool = function() {
	//search url
	async.mapSeries(nameArr, function(val, callback) {
		// var index = Math.floor(Math.random() * proxyArr.length);
		http.get('http://www.baidu.com/s?wd=' + val + '就业网', function(response) {
			var stack = '';
			response.on('data', function(chunk) {
				stack += chunk;
			});

			response.on('end', function(err) {
				if (err) {
					console.log(err);
				}
				var $ = cheerio.load(stack);
				var baiduUrl = $('#1 .t').find('a').eq(0).attr('href');
				console.log('a'+val+nameArr.indexOf(val));
				http.get(baiduUrl, function(res) {
					console.log('b'+val+nameArr.indexOf(val));

					collection.update({
						name: val
					}, {
						$set: {
							job_url: res.headers.location
						}
					}, function(err, result) {
						callback();
					});
					
				})
				// baiduUrlObj[val] = baiduUrl;
				// baiduUrlArr.push(baiduUrl);
				// console.log("b" + baiduUrlArr.length);
				// callback();
			});
		})
	}, function() {
		console.log('done');
		DB.close();
		// getRealUrl(baiduUrlArr);
	})
}
var getRealUrl = function(baiduUrlArr) {
	async.each(baiduUrlArr, function(val, callback) {
		// var index = Math.floor(Math.random() * proxyArr.length);
		http.get(val, function(res) {
			urlObj[val] = res.headers.location;
			urlArr.push(res.headers.location);
			console.log("a" + urlArr.length);
			callback();
		})
	}, function() {
		writeFile();
	})
}
var writeFile = function() {
	async.each(['北京大学','东华大学'], function(val, callback) {
		collection.update({
			name: val
		}, {
			$set: {
				job_url: urlObj[baiduUrlObj[val]]
			}
		}, function(err, result) {
			callback();
		});
	}, function() {
		console.log('done');
		DB.close();
	})
}
