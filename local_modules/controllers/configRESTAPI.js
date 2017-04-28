/**
 * Module configRESTAPI
 */

// imports dependencies
exports.imports = {};
exports.imports.fs = require('fs');
exports.imports.log = require('../log');
exports.imports.conf = require('../configurations');
exports.imports.restAPI = require('../restAPI');


// defining addConfig service
exports.imports.restAPI.declareContract( 'addConfig' , {
	public : {
		  serviceId : 'addConfig'
		, path : '/rest/addConfig'
		, method : 'post'
		, input : exports.imports.restAPI.defineContractDataTemplate()
		, output : exports.imports.restAPI.defineContractResponseTemplate()
	}
  , private : {
	  	  handler : function(req,res) {
	  		var validate = exports.local.contract.addConfig.private.validator(req);
	  		var data = exports.imports.restAPI.defineContractResponseTemplate();
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
  				var body = exports.imports.restAPI.getJSONBody(req);
  				var res = exports.imports.restAPI.defineContractResponseTemplate();
  				
  				if (
  						   exports.imports.restAPI.exists(body)
  						&& exports.imports.restAPI.exists(body.common)
  					    && exports.imports.restAPI.exists(body.common.name)
  					    && exports.imports.restAPI.exists(body.common.URI)
  					    && exports.imports.restAPI.exists(body.common.groupID)
  					    && exports.imports.restAPI.exists(body.common.isGroupHead)
  					    && exports.imports.restAPI.exists(body.common.status)
  					    && exports.imports.restAPI.exists(body.common.type)
  					    && exports.imports.restAPI.exists(body.specific)
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
});

// defining listConfigs service
exports.imports.restAPI.declareContract('listConfigs', {
		public : {
			  serviceId : 'listConfigs'
			, path : '/rest/listConfigs'
			, method : 'get'
			, input : {}
			, output : exports.imports.restAPI.defineContractResponseTemplate()
		}
	  , private : {
		  	  handler : function(req,res) {
		  		var data = exports.imports.restAPI.defineContractResponseTemplate();
		  		
	  			data.status = 'OK';
	  			data.message = 'Configurations\' list';
	  			data.value = exports.imports.conf.conf;

	  			exports.local.sendResponse( res, data, 200 );
		  	  }
	  		, validator : function(req) {}
	  }
});

