var http = require("http");
var fs = require('fs');
var cheerio = require('cheerio');
var async = require('async');
http.globalAgent.maxSockets = 10000;
var urlArr = []; //all the name of universities
var proxyArr = [];
var index;
var urlList = [];

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
Array.prototype.superUnique = function() {
	var res = [],
		hash = {};
	for (var i = 0; i < this.length - 1; i++) {
		var elem = this[i];
		var compareEle = JSON.parse(this[i]).tel.toString() + JSON.parse(this[i]).email.toString() + JSON.parse(this[i]).jobDes.toString();
		if (!hash[compareEle]) {
			res.push(elem);
			hash[compareEle] = true;
		}
	}
	return res;
};
Array.prototype.filterEmail = function() {
	var res = [],
		hash = {};
	for (var i = 0; i < this.length - 1; i++) {
		var elem = this[i];
		if (JSON.parse(elem).email.length !== 0) {
			res.push(elem);
		}
	}
	return res;
};


fs.readFile('zlzp.json', 'utf-8', function(err, data) {
	targetArr = data.split('$%').unique().filterEmail();

	async.series([
	    function(callback){
	        targetArr.forEach(function(val) {
	        	var url = JSON.parse(val).url.toString();
	        	urlList.push(url);
	        })
	        callback(null, 'one');
	    },
	    function(callback){
	        // do some more stuff ...

	        async.eachSeries(urlList.slice(46081,61437), function(url, innerCallback) {

	        	var request_timer = null,
	        		req = null;
	        	// 请求5秒超时
	        	request_timer = setTimeout(function() {
	        		innerCallback();
	        	}, 5000);

	        	req = http.get(url, function(response) {
	        		clearTimeout(request_timer);
					var stack = '';
					response.on('data', function(chunk) {
						stack += chunk;
					});

					response.on('end', function(err) {
						if (err) {
							console.log(err);
						}
						var $ = cheerio.load(stack);
						var content = $('body *').not('script').text();
						console.log('a' + urlList.indexOf(url));
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
							fs.appendFile('zlzp_superGoal.json', JSON.stringify(saveObj) + '$%\n');
						}
						innerCallback();
					});
				})
	        }, function() {
	            callback();
	        });
	        callback(null, 'two');
	    }
	],
	function(err, results){
	    // results is now equal to ['one', 'two']
	    console.log("done");
	});
})
