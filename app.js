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
		searchSchool(db);
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
		cb(db);
	});

}
var searchSchool = function(db) {
	//search url
	var i = 0;
	async.each(['东华大学','清华大学'], function(val, callback) {
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
				var baiduUrl = $('#1 .t a').attr('href');
				baiduUrlArr.push(baiduUrl)
				callback();
			});
		})
	}, function() {
		getRealUrl(baiduUrlArr);
	})
}
var getRealUrl = function(baiduUrlArr) {
	async.each(baiduUrlArr, function(val, callback) {
		http.get(val, function(res) {
			urlArr.push(res.headers.location);
			callback();
		})
	}, function(){
		console.log(urlArr);
	})
}
