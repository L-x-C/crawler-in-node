var http = require("http");
var fs = require('fs');
var cheerio = require('cheerio');
var MongoClient = require('mongodb').MongoClient;
var async = require('async');

var dbUrl = 'mongodb://192.168.1.222:27017/resume';

var nameArr = [];
var baiduUrlArr = [];
var urlArr = [];

MongoClient.connect(dbUrl, function(err, db) {
	//get school name
	findSchool(db, function() {
		searchSchool();
	});
});
var findSchool = function(db, cb) {
	var collection = db.collection('universities');
	collection.find({country_id: 'CHS'}).toArray(function(err, results) {
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
	var i = 0;
	async.each(['复旦大学','华东师范大学'], function(val, callback) {
		http.get('http://www.baidu.com/s?wd=' + val + '就业网', function(response) {
			var stack = '';
			response.on('data', function(chunk) {
				stack += chunk;
			});

			response.on('end', function(err) {
				if (err) {
					console.log("err" + err);
				}
				var $ = cheerio.load(stack);
				var baiduUrl = $('#1 .t a').attr('href');
				baiduUrlArr.push(baiduUrl)
				callback();
			});
		})
	}, function(err) {
		getRealUrl(baiduUrlArr);
	})
}
var getRealUrl = function(baiduUrlArr) {
	console.log(baiduUrlArr);
	// async.each(baiduUrlArr, function(val, callback) {
	// 	http.get(val, function(res) {
	// 		console.log(JSON.stringify(res.headers));
	// 	})
	// })
}
