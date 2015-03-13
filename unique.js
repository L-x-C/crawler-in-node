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
	fs.writeFile('goal.json', targetArr);
})
