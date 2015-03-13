var fs = require('fs');

Array.prototype.unique = function() {
    var res = [], hash = {};
    for(var i=0, elem; (elem = this[i]) != null; i++)  {
        if (!hash[elem])
        {
            res.push(elem);
            hash[elem] = true;
        }
    }
    return res;
};
var targetArr = [];
fs.readFile('data.json', 'utf-8', function(err,data) {
	targetArr = data.split(';').unique();
    fs.writeFile('target.json', targetArr);
})
