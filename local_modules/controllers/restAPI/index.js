/**
 * Module restAPI
 */

// imports dependencies
exports.imports = {};
exports.imports.fs = require('fs');
exports.imports.log = require('../../log');
exports.imports.conf = require('../../configurations');

exports.local = {};
exports.local.app = null;

exports.local.getJSONBody = ( req ) => {
	if(req && req.body) {
		var res = null;
		var jsonStringObj = JSON.stringify(req.body);
		exports.imports.log.debug("Before replacement : " + jsonStringObj);
		jsonStringObj = 
			jsonStringObj
				.replace(new RegExp('^\{[ ]*"[ ]+' ,'g') ,'')
				.replace(new RegExp('"\:""\}$'     ,'g') ,'')
				.replace(new RegExp('\\\\"'        ,'g') ,'"')
				;
		exports.imports.log.debug("After replacement : " + jsonStringObj);
		res = JSON.parse(jsonStringObj);
		return res;
	}
	return {};
};

exports.local.exists = ( objectRef ) => {
	return (typeof (objectRef) !== 'undefined');
}

exports.local.validators = new Array();

exports.local.validators['/addConfig'] = function (req) {
	if(req && req.body) {
		var body = exports.local.getJSONBody(req);
		
		if (
				   exports.local.exists(body)
				&& exports.local.exists(body.common)
			    && exports.local.exists(body.common.name)
			    && exports.local.exists(body.common.URI)
			    && exports.local.exists(body.common.groupID)
			    && exports.local.exists(body.common.isGroupHead)
			    && exports.local.exists(body.common.status)
			    && exports.local.exists(body.common.type)
			    && exports.local.exists(body.specific)
		) {
			return { status : 'OK', message : 'Request has valid structure!', body : body };
		} else {
			return { status : 'KO', message : 'Request has invalid structure!'};
		}
	} else {
		return { status : 'KO', message : 'Request has no body!'};
	}
};

exports.local.sendResponse = ( response, jsonData, returnCode ) => {
	response.setHeader('Content-Type', 'application/json');
	response.writeHead(returnCode);
	response.write(JSON.stringify(jsonData));
	response.end();
};

exports.local.methods = {};
exports.local.methods.get = new Array();
exports.local.methods.post = new Array();
exports.local.methods.update = new Array();
exports.local.methods.delete = new Array();

exports.local.methods.get['/listConfigs'] =  function (req,res) {
	res.send(exports.imports.conf.conf);		
};

exports.local.methods.post['/addConfig'] =  function (req,res) {
	var validate = exports.local.validators['/addConfig'](req);
	if(validate.status == 'OK') {
		exports.imports.conf.addConfig(validate.body);
		exports.imports.conf.saveConfigDefaultFile();
		exports.local.sendResponse( res, { status : 'OK', message : 'Added configuration for ' + validate.body.common.name}, 200);
	} else {
		exports.local.sendResponse( res, { status : 'KO', message : validate.message}, 400);
	}
};





exports.setUpService = ( app, bodyParser ) => {
	exports.local.app = app;
	exports.local.bodyParser = bodyParser;
	var key;
	for(key in exports.local.methods.get) {
		app.get(key,exports.local.methods.get[key]);
	}
	for(key in exports.local.methods.post) {
		app.post(key,exports.local.methods.post[key]);
	}
	for(key in exports.local.methods.update) {
		app.update(key,exports.local.methods.update[key]);
	}
	for(key in exports.local.methods.delete) {
		app.delete(key,exports.local.methods.delete[key]);
	}
	exports.imports.log.debug('exit');
};

