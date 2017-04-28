/**
 * logger module -- uses winston for logging
 * https://github.com/winstonjs/winston
 */
exports.imports = {};
exports.imports.winston = require('winston');

exports.local = {};
exports.local.getTimestamp = () => {
	return (new Date()).getTime();
};

exports.addLogFile = ( logFile ) => {
	exports.imports.winston.add(exports.imports.winston.transports.File, {filename : logFile});
};

exports.setLogLevel = ( logLevel )  => {
	exports.log(logLevel, '--------------------- Start logging events with ' + logLevel + ' --------------------------');
	exports.imports.winston.level = logLevel;
};

exports.getLogLevel = ()  => {
	return exports.imports.winston.level;
};

exports.log = ( logLevel, stringObject ) => {
	exports.imports.winston.log( logLevel, '[' + exports.local.getTimestamp() + '] : ' + stringObject );
};

exports.debug = ( stringObject ) => {
	exports.imports.winston.debug( '[' + exports.local.getTimestamp() + '] : ' + stringObject );
};

exports.info = ( stringObject ) => {
	exports.imports.winston.info( '[' + exports.local.getTimestamp() + '] : ' + stringObject );
};

exports.warn = ( stringObject ) => {
	exports.imports.winston.warn( '[' + exports.local.getTimestamp() + '] : ' + stringObject );
};

exports.error = ( stringObject ) => {
	exports.imports.winston.error( '[' + exports.local.getTimestamp() + '] : ' + stringObject );
};


