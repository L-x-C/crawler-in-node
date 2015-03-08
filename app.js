var http = require("http");
var fs = require('fs');
var cheerio = require('cheerio');
var url = "xxx";
var data = "";
var list = [];

var baseOptions = {
	host: 'xxx',
	path: 'xxx'
};

http.get(baseOptions, function(response) {
	var stack = '';
	response.on('data', function(chunk) {
		stack += chunk;
	});

	response.on('end', function() {
		var $ = cheerio.load(stack);
		var stackList = $('.hot_pos_l .mb10 a');
		stackList.each(function(index, el) {
			list.push($(el).attr('href'));
		});
		handleFn(list)
	});
})
var handleFn = function(data) {
	var listLength = data.length;
	for (var i = 0; i < listLength; i++) {
		var currentUrl =  data[i];
		http.get(currentUrl, function(response) {
			var stack = '';
			response.on('data', function(chunk) {
				stack += chunk;
			});

			response.on('end', function() {
				var $ = cheerio.load(stack);
				var aaa = $('.job_detail dt h1 div').text();;
				console.log(aaa);
			});
		}).on('error', function(e) {
			console.log(e.message);
		})
	}

}
