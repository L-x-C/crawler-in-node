var fs = require('fs');

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
		var compareEle = JSON.parse(this[i]).tel.toString() + JSON.parse(this[i]).email.toString();
		if (!hash[compareEle]) {
			res.push(elem);
			hash[compareEle] = true;
		}
	}
	return res;
};
var targetArr = [];
fs.readFile('data.json', 'utf-8', function(err, data) {
	targetArr = data.split('$').superUnique();
	var regTel = /\d{3}-\d{8}|\d{4}-\d{7}|[2-9]\d{7}|\d{4}-\d{8}/gi;
	targetArr.forEach(function(val) {
		var telList = JSON.parse(val).tel.toString();
		var tempArr = telList.match(regTel);
		if (tempArr) {
			tempArr.unique().forEach(function(target) {
				fs.appendFile('phone.xsl', target + '\n', function(err) {
					if (err) {
						console.log(err);
					}
				});
			})
		}
	})
})
