/**
 * Module configurations
 */

// imports dependencies
exports.imports = {};
exports.imports.fs = require('fs');
exports.imports.log = require('../log');

exports.local = {};
exports.local.defaultFile = null;

/**
 * configurations' array
 */
exports.conf = new Array();


exports.setDefaultFile = (file) => {
	exports.local.defaultFile = file;
};

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
 * addConfig method
 * @jsonObject configuration to be stored
 */
exports.addConfig = ( jsonObject ) => {
	exports.conf[exports.conf.length] = jsonObject;
}

/**
 * loadConfig method
 * @file path to file with configurations in JSON format
 * @return JSON object
 */
exports.loadConfig = (file) => {
	exports.imports.fs.readFile(file, 'utf8', (err, data) => {
		if (err) {
			exports.conf = new Array();
			exports.imports.log.error("The configurations' file [ " + file + " ] was not found !");
		} else {
			exports.setConfigAsString(data);
			exports.imports.log.info("The configurations' file [ " + file + " ] was found and loaded :\n" + exports.getConfigAsString());
		}
	});
};

exports.loadConfigDefaultFile = () => {
	exports.loadConfig(exports.local.defaultFile);
};
/**
 * saveConfig method
 * @file path to file with configurations in JSON format
 */
exports.saveConfig = (file) => {
	exports.imports.fs.writeFile(file, exports.getConfigAsString(), 'utf8', function(err) {
		if(err) {
			exports.imports.log.error("The configurations' file [ " + file + " ] was not saved ! Error : " + err);
			return;
		}
		exports.imports.log.info("The configurations' file [ " + file + " ] was saved!");
	}); 
};
exports.saveConfigDefaultFile = () => {
	exports.saveConfig(exports.local.defaultFile);
};

