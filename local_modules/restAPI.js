/**
 * Module restAPI
 */

// imports dependencies
exports.imports = {};
exports.imports.fs = require('fs');
exports.imports.log = require('./log');

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

exports.exists = ( objectRef ) => {
	return (typeof (objectRef) !== 'undefined');
}

exports.defineContractDataTemplate = () => {
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

exports.defineContractResponseTemplate = () => {
	return {
		  status : "<string>"
		, message : "<string>"
		, value : "<object>"
	};
}

exports.declareContract = ( contractId, contract ) => {
	exports.local.contract[contractId] = contract;
}

exports.declareContract('contract', {
		public : {
			  serviceId : 'contract'
			, path : '/rest/contract'
			, method : 'get'
			, input : {}
			, output : exports.defineContractResponseTemplate()
		}
	  , private : {
		  	  handler : function(req,res) {
		  		var data = exports.defineContractResponseTemplate();
		  		
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
});

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

