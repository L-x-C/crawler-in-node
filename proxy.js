var http = require("http");
var fs = require('fs');
var cheerio = require('cheerio');
var MongoClient = require('mongodb').MongoClient;
var async = require('async');
var proxyArr = [];
http.get('http://pachong.org/', function(response) {
	var stack = '';
	response.on('data', function(chunk) {
		stack += chunk;
	});

	response.on('end', function(err) {
		if (err) {
			console.log(err);
		}
		var $ = cheerio.load(stack);
		var data = $('.tb tr').each(function(i, ele) {
			var host = $(this).find('td').eq(1).text();
			var port = eval($(this).find('td').eq(2).find('script').text().substring(14).replace(/calf/, 7213).replace(/snake/, 13352).replace(/hen/, 15948).replace(/cock/, 11063).replace(/dog/, 8453));
			var temp = {
				host: host,
				port: port
			}
			proxyArr.push(JSON.stringify(temp));
		})
		proxyArr = proxyArr.slice(1);
	});
})
