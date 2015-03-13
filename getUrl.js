var http = require("http");
var fs = require('fs');
var cheerio = require('cheerio');
var MongoClient = require('mongodb').MongoClient;
var async = require('async');
var dbUrl = 'mongodb://localhost/resume';
http.globalAgent.maxSockets = 4000;
var nameArr = []; //all the name of universities
var DB,
	collection;
var proxyArr = [];
var index;


MongoClient.connect(dbUrl, function(err, db) {
	DB = db;
	collection = db.collection('universities');

	//get school name
	findSchool(db, function() {
		searchSchool();
	});
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
	async.eachSeries(nameArr, function(val, callback) {
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
				var baiduUrl = $('#1 .t').find('a').eq(0).attr('href') ? $('#1 .t').find('a').eq(0).attr('href') : $('#2 .t').find('a').eq(0).attr('href');
				console.log('a' + val + nameArr.indexOf(val));

				http.get(baiduUrl, function(res) {
					console.log('b' + val + nameArr.indexOf(val));
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
			});
		})
	}, function() {
		console.log('done');
		DB.close();
	})
}
