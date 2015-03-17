var fs = require('fs');
var async = require('async');

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
var targetArr = [];
fs.readFile('zlzp.json', 'utf-8', function(err, data) {
	targetArr = data.split('$%').superUnique();
	var regEmail = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/gi;
	var emailArr = [],
		tempArr = [];

	async.series([
	    function(callback){
	        targetArr.forEach(function(val) {
	        	var emailList = JSON.parse(val).email.toString();
	        	tempArr.push(emailList.match(regEmail));
	        })
	        callback(null, 'one');
	    },
	    function(callback){
	        // do some more stuff ...
	        emailArr = tempArr.toString().match(regEmail).unique();

	        async.eachSeries(emailArr, function(target, secondCallback) {
	        	fs.appendFile('zlzp_email.xsl', target + '\n', function(err) {
					if (err) {
						console.log(err);
					}
					secondCallback();
				});
	        }, function() {
	            callback();
	        });
	        callback(null, 'two');
	    }
	],
	// optional callback
	function(err, results){
	    // results is now equal to ['one', 'two']
	});
})
