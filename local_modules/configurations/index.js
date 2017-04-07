/**
 * Module configurations
 */

// imports dependencies
exports.imports = {};
exports.imports.fs = require('fs');

/**
 * configurations' array
 */
exports.conf = new Array();

/**
 * getConfigAsString method
 * @returns JSON object as a string
 */
exports.getConfigAsString = () => {
	return JSON.stringify(exports.conf);
};

/**
 * setConfigAsString method
 * @file path to file with configurations in JSON format
 * @stringObject the string object to be saved
 */
exports.setConfigAsString = (stringObject) => {
	exports.conf = JSON.parse(stringObject);
};


/**
 * loadConfig method
 * @file path to file with configurations in JSON format
 * @return JSON object
 */
exports.loadConfig = (file) => {
	exports.imports.fs.readFile(file, 'utf8', (err, data) => {
		if (err) {
			exports.conf = new Array();
			console.log("The configurations' file [ " + file + " ] was not found !");
		} else {
			exports.setConfigAsString(data);
			console.log("The configurations' file [ " + file + " ] was found and loaded :\n" + exports.getConfigAsString());
		}
	});
};

/**
 * saveConfig method
 * @file path to file with configurations in JSON format
 */
exports.saveConfig = (file) => {
	exports.imports.fs.writeFile(file, exports.getConfigAsString(), 'utf8', function(err) {
		if(err) {
			return console.log(err);
		}
		console.log("The configurations' file [ " + file + " ] was saved!");
	}); 
};

