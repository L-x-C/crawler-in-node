var fs = require('fs');
var async = require('async');
var i = 0;
fs.readFile('zlzp_superGoal.json', 'utf-8', function(err, data) {
	var	targetArr = data.split('$%');

	async.eachSeries(targetArr, function(target, callback) {
		var targetObj = JSON.parse(target);
		var jobTitle = targetObj.jobTitle,
			companyName = targetObj.companyName,
			address = targetObj.address,
			companyAddress = targetObj.companyAddress.replace(/[\r\n]/g, '').trim(),
			jobType = targetObj.jobType,
			education = targetObj.education,
			email = targetObj.email,
			jobDes = targetObj.jobDes.replace(/[\r\n]/g, '').trim();
			// console.log(i++);
			fs.appendFile('a.xls', jobTitle + '\t' + companyName + '\t' + address + '\t' +companyAddress + '\t' + jobType + '\t' + education + '\t' + email + '\t' + jobDes + '\n', function() {
				callback();
			});
			
	}, function() {
		console.log("done");
	});
});


