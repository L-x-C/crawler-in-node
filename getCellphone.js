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
	var regTel = /\d{11}/gi;
	var telArr = [],
		tempArr = [];

	async.series([
	    function(callback){
	        targetArr.forEach(function(val) {
	        	var telList = JSON.parse(val).tel.toString();
	        	tempArr.push(telList.match(regTel));
	        })
	        callback(null, 'one');
	    },
	    function(callback){
	        // do some more stuff ...
	        telArr = tempArr.toString().match(regTel).unique();

	        async.eachSeries(telArr, function(target, secondCallback) {
	        	fs.appendFile('zlzp_cellphone.xsl', target + '\n', function(err) {
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
