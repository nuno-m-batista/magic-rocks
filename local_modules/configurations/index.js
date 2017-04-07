/**
 * Module configurations
 */

// imports dependencies
exports.imports = {};
exports.imports.fs = require('fs');
exports.conf = new Array();
exports.loadConfig = (file) => {
	exports.imports.fs.readFile(file, 'utf8', (err, data) => {
		if (err) {
			exports.conf = new Array();
			console.log("No configurations' file found !");
		} else {
			exports.conf = JSON.parse(data);
			console.log(exports.conf);
		}
	});
}
exports.putFile = (path, content) => {
	exports.imports.fs.writeFile(path, content, 'utf8', function(err) {
		if(err) {
			return console.log(err);
		}

		console.log("The file was saved!");
	}); 
}