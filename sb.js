var http = require('http');
var parseURL = require('url').parseURL;
http.get({
	path: parseURL('http://www.sina.com')
}, function(res) {
	console.log(res);
}).on('err',function(e) {
	console.log("Got error: " + e.message);
})
