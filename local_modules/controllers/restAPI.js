/**
 * Module restAPI
 */

// imports dependencies
exports.imports = {};
exports.imports.fs = require('fs');
exports.imports.log = require('../log');
exports.imports.conf = require('../configurations');

exports.local = {};
exports.local.app = null;

exports.local.contract = {};

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

exports.local.sendResponse = ( response, jsonData, returnCode ) => {
	response.setHeader('Content-Type', 'application/json');
	response.writeHead(returnCode);
	response.write(JSON.stringify(jsonData));
	response.end();
};

exports.local.exists = ( objectRef ) => {
	return (typeof (objectRef) !== 'undefined');
}

exports.local.defineContractDataTemplate = () => {
	return {
		  common : {
			  name : "<string>"
			, URI : "<string>"
			, groupId : "<string>"
			, isGroupHead : "<boolean>"
			, status : "<string>"
			, type : "<type>"
		  }
		, specific : "<object>"
	};
}

exports.local.defineContractResponseTemplate = () => {
	return {
		  status : "<string>"
		, message : "<string>"
		, value : "<object>"
	};
}

// defining addConfig service
exports.local.contract.addConfig = {
	public : {
		  serviceId : 'addConfig'
		, path : '/rest/addConfig'
		, method : 'post'
		, input : exports.local.defineContractDataTemplate()
		, output : exports.local.defineContractResponseTemplate()
	}
  , private : {
	  	  handler : function(req,res) {
	  		var validate = exports.local.contract.addConfig.private.validator(req);
	  		var data = exports.local.defineContractResponseTemplate();
	  		if(validate.status == 'OK') {
	  			exports.imports.conf.addConfig(validate.body);
	  			exports.imports.conf.saveConfigDefaultFile();

	  			data.status = 'OK';
	  			data.message = 'Added configuration for ' + validate.value.common.name;
	  			data.value = null;
	  			
	  			exports.local.sendResponse( res, data, 200 );
	  		} else {
	  			
	  			data.status = 'KO';
	  			data.message = validate.message;
	  			data.value = null;

	  			exports.local.sendResponse( res, data, 400 );
	  		}	  		  
	  	  }
  		, validator : function(req) {
  			if(req && req.body) {
  				var body = exports.local.getJSONBody(req);
  				var res = exports.local.defineContractResponseTemplate();
  				
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
  					res.status = 'OK';
  					res.message = 'Request has valid structure!';
  					res.value = body;
  					return res;
  				} else {
  					res.status = 'KO';
  					res.message = 'Request has invalid structure!';
  					res.value = null;
  					return res;
  				}
  			} else {
				res.status = 'KO';
				res.message = 'Request has no body!';
				res.value = null;
				return res;
  			}
  		}
  }
};

// defining listConfigs service
exports.local.contract.listConfigs = {
		public : {
			  serviceId : 'listConfigs'
			, path : '/rest/listConfigs'
			, method : 'get'
			, input : {}
			, output : exports.local.defineContractResponseTemplate()
		}
	  , private : {
		  	  handler : function(req,res) {
		  		var data = exports.local.defineContractResponseTemplate();
		  		
	  			data.status = 'OK';
	  			data.message = 'Configurations\' list';
	  			data.value = exports.imports.conf.conf;

	  			exports.local.sendResponse( res, data, 200 );
		  	  }
	  		, validator : function(req) {}
	  }
};

// defining contract service -- exposing rest services
exports.local.contract.contract = {
		public : {
			  serviceId : 'contract'
			, path : '/rest/contract'
			, method : 'get'
			, input : {}
			, output : exports.local.defineContractResponseTemplate()
		}
	  , private : {
		  	  handler : function(req,res) {
		  		var data = exports.local.defineContractResponseTemplate();
		  		
	  			data.status = 'OK';
	  			data.message = 'Service contracts list';
	  			data.value = new Array();
	  			
	  			for(var key in exports.local.contract) {
	  				if(exports.local.contract.hasOwnProperty(key)) {
	  					var contract = exports.local.contract[key].public;
	  					data.value[data.value.length] = contract;
	  				}
	  			}

	  			exports.local.sendResponse( res, data, 200 );
		  	  }
	  		, validator : function(req) {}
	  }
};

exports.setUpService = ( app, bodyParser ) => {
	exports.imports.log.info("Setting up service for restAPI ...");
	exports.local.app = app;
	exports.local.bodyParser = bodyParser;
	var key;
	for(key in exports.local.contract) {
		if(exports.local.contract.hasOwnProperty(key)) {
			var contract = exports.local.contract[key];
			if(contract.public.method == 'get') {
				app.get(contract.public.path, contract.private.handler);
				exports.imports.log.info("Setting up handler for [get   ] : " + contract.public.path);
			} else
			if(contract.public.method == 'post') {
				app.post(contract.public.path, contract.private.handler);				
				exports.imports.log.info("Setting up handler for [post  ] : " + contract.public.path);
			} else
			if(contract.public.method == 'put') {
				app.put(contract.public.path, contract.private.handler);
				exports.imports.log.info("Setting up handler for [put   ] : " + contract.public.path);
			} else
			if(contract.public.method == 'delete') {
				app.delete(contract.public.path, contract.private.handler);
				exports.imports.log.info("Setting up handler for [delete] : " + contract.public.path);
			}
		}
	}
	exports.imports.log.info('Ended service setting up for restAPI !');
};

