var express = require('express');
var app = express();
var formidable = require('formidable');
var util = require('util');
var fs = require('fs');
var A2H = require('ansi-to-html');
var a2h = new A2H();
var execSync = require('child_process').execSync;
var execAsync = require('child_process').exec;
var http = require('http');
var confs = require('./local_modules/configurations');
var configurations = confs.conf;

var sessions = new Array();
var lastSessionId=0;

var curr_dir = (execSync("bash -c 'pwd'") + "").trim();
curr_dir = curr_dir.replace("/","").replace("/",":/");


confs.loadConfig('./.configurations');
/*
var configurations = null;

fs.readFile('./.configurations', 'utf8', (err, data) => {
	if (err) {
		configurations = new Array();
		console.log("No configurations' file found !");
	} else {
		configurations = JSON.parse(data);
		console.log(configurations);
	}
});
*/

app.use('/static', express.static('static'));

function getFile(path) {
	var content = execSync("bash -c 'cat " + path + "'");
	return ""+content;
}

function putFile(path, content) {
	fs.writeFile(path, content, 'utf8', function(err) {
		if(err) {
			return console.log(err);
		}

		console.log("The file was saved!");
	}); 
}

function setLight(source,position,color) {
	var res = source.replace(new RegExp('\{' + position +'\}', 'g'), color);
	return res;
}

var optionsArray = {
	finished : 0,
	array : new Array()
};

function generateCallbackFor(obj,response) {
	return function (response) { 
	   var str="";  
	   response.on("data", function(chunk) { 
	      str += chunk; 
	   }); 
	   response.on("end", function() { 
		  var tbody_002 = document.getElementById("tbody-002");
	      var content = tbody_002.innerHtml; 
	      var key = response.connection._host + response.connection._httpMessage.path; 
    		 if(response.statusCode == "200") { 
    		    console.log(key + ": OK "); 
    		    content += buildCheckLine("' + obj.name + '","' + obj.host + '","' + obj.path +'","green"); 
    		 } else { 
    		 	console.log(key + ": NOK "); 
    		    content += buildCheckLine("' + obj.name + '","' + obj.host + '","' + obj.path +'","red"); 
    		 } 
		  tbody_002.innerHtml = content;
	   }); 
	}; 
}

function lightsCallback(response) {
	var str = '';

	//another chunk of data has been received, so append it to `str`
	response.on('data', function (chunk) {
		str += chunk;
	});

	//the whole response has been received, so we just print it out here
	response.on('end', function () {
		var content = getFile("static/choose.html");
		var key = response.connection._host + response.connection._httpMessage.path;
		console.log(key + ": statusCode = " + response.statusCode);
		if(response.statusCode == '200') {
			console.log(key + ": OK ");
			content = setLight(content,'top','grey');
			content = setLight(content,'middle','grey');
			content = setLight(content,'bottom','green');			
		} else {
			console.log(key + ": NOK ");
			content = setLight(content,'top','red');
			content = setLight(content,'middle','grey');
			content = setLight(content,'bottom','grey');		
		}
		console.log(key);
		optionsArray.array[key].result = content;
		console.log(optionsArray.array[key].result);
		optionsArray.finished++;
		console.log(Date.now() + ':' + optionsArray.finished);
	})
}


function whichStoplightCB(response) {
	var str = '';

	//another chunk of data has been received, so append it to `str`
	response.on('data', function (chunk) {
		str += chunk;
	});

	//the whole response has been received, so we just print it out here
	response.on('end', function () {
		var content = "";
		var key = response.connection._host + response.connection._httpMessage.path;
		console.log(key + ": statusCode = " + response.statusCode);
		if(response.statusCode == '200') {
			console.log(key + ": OK ");
			content = '<img src="static/images/green.png"/>';
		} else {
			console.log(key + ": NOK ");
			content = '<img src="static/images/red.png"/>';
		}
		console.log(key);
		optionsArray.array[key].result = content;
		console.log(optionsArray.array[key].result);
		response.send(content);
	})
}

function buildConfigLine(object,nr) {
	var line = "";
	line += "<tr id='line_" + nr + "' name='line_" + nr + "' >";
	line += "<td><input style='width: 100%;' type='text' name='name_" + nr + "' value='";
	if(object && object.name) {
		line += object.name;
	} else {
		line += "";
	}
	line +="' placeholder='[Insert Name Here]'></td>";
	line += "<td><input style='width: 100%;' type='text' name='host_" + nr + "' value='";
	if(object && object.host) {
		line += object.host;
	} else {
		line += "";
	}
	line +="' placeholder='[Insert Host Here]'></td>";
	line += "<td><input style='width: 100%;' type='text' name='path_" + nr + "' value='";
	if(object && object.path) {
		line += object.path;
	} else {
		line += "";
	}
	line +="' placeholder='[Insert Path Here]'></td>";
	line += "<td><input style='width: 100%;' type='text' name='group_" + nr + "' value='";
	if(object && object.group) {
		line += object.group;
	} else {
		line += "";
	}
	line +="' placeholder='[Insert Group Here]'></td>";
	line += "<td><input style='width: 100%;' type='checkbox' name='isGroupHead_" + nr + "' value='true";
	if(object && object.isGroupHead && object.isGroupHead == 'true') {
		line += "' checked='checked";
	} else {
		line += "";
	}
	line +="'></td>";
	line += "<td style='text-align: center;'><input type='hidden' id='remove_" + nr + "' name='remove_" + nr + "' value=''>";
	line += "<input type='button' title='Remove line' value='-' onclick='javascript:removeLine(" + nr +");'></td>";
	line += "</tr>";
	return line;
}

function tstamp() {
	return new Date().toLocaleString();
}
function buildCheckLine(name, host, path, color, nr) {
	var line = "";
	line += "<tr id='checkline_" + nr + "'>";
	line += "<td><span style='width: 100%;' >";
	if(name) {
		line += name;
	} else {
		line += "";
	}
	line +="</span></td>";
	line += "<td><span style='width: 100%;' >";
	if(host) {
		line += host;
	} else {
		line += "";
	}
	line +="</span></td>";
	line += "<td><span style='width: 100%;' >";
	if(path) {
		line += path;
	} else {
		line += "";
	}
	line +="</span></td>";
	line += "<td id='stoplight_" + nr + "' width='25%'>@" + tstamp() + "<img src='static/images/" + color + ".png'/>Waiting ...";
	line +="</td>";
	line += "</tr>";
	return line;
}
		
app.get('/', function (req, res) {
	console.log('get("/")');
	var content = getFile("static/console.html");
	var configs = "";
	var i = 0;
	if(configurations && configurations.length) {
		for(var el in configurations) {
			configs += buildConfigLine(configurations[el],i);
			i++;
		}
	} else {
		configs = buildConfigLine(null,0);
	}
	content = content.replace(new RegExp('\{configurationBody\}', 'g'), configs);
	content = content.replace(new RegExp('\{nrValue\}', 'g'), i);
	res.send(content);
});

app.get('/ajaxBuildLine', function(req, res) {
	console.log('get("/ajaxBuildLine")');
	var content = buildConfigLine(null, req.query.lineNr);
	res.send(content);
});


var cbArray = new Array();


var _global_response_ = null;
var timeOutDescriptor = null;
var globalLength  =0;

function check_for_all_answers() {
	console.log(Date.now() + ':' +optionsArray.finished);
	console.log(Date.now() + ':' +optionsArray.array.length);		
	if(optionsArray.finished ==globalLength) {
		var content = '';
		for (opt in optionsArray.array) {
			content += optionsArray.array[opt].result;
		}
		clearTimeout(timeOutDescriptor);
		timeOutDescriptor = null;
		console.log(Date.now() + ':' +'sent');
		_global_response_.send(content);		
	}
}

function buildNewOptionsArray() {
	optionsArray = {
		finished : 0,
		array : new Array()
	};
	if(configurations && configurations.length) {
		for(var el in configurations) {
			var conf = configurations[el];
			console.log('['+el +'] : ' + conf.name);
			var key = conf.host + conf.path;
			optionsArray.array[key] = conf;
		}
	}
}

app.get('/ajaxLoadConfigurations', function (req,res) {
	console.log('get("/ajaxLoadConfigurations")');
	var content = "";
	var trigger = "";
	if(configurations && configurations.length) {
		var i = 0;
		for(var el in configurations) {
			var obj = configurations[el];
			content += buildCheckLine(obj.name, obj.host, obj.path, "grey", i);
			trigger += "checkSite('" + obj.host + obj.path+"'," + i + ");";
			i++;
		}
		buildNewOptionsArray();
	}
	var timeout = 30000; 
	if(req.query.nextRefresh) {
		timeout = req.query.nextRefresh;
	}
	res.send(content+"\n<script>"+trigger+";setTimeout(loadConfigurations," + timeout + ");</script>");
});


app.get('/ajaxLoadConfigurationsForGroups', function (req,res) {
	console.log('get("/ajaxLoadConfigurations")');
	var content = "";
	var trigger = "";
	if(configurations && configurations.length) {
		var i = 0;
		for(var el in configurations) {
			var obj = configurations[el];
			content += buildCheckLine(obj.name, obj.host, obj.path, "grey", i);
			trigger += "checkSite('" + obj.host + obj.path+"'," + i + ");";
			i++;
		}
		buildNewOptionsArray();
	}
	var timeout = 30000; 
	if(req.query.nextRefresh) {
		timeout = req.query.nextRefresh;
	}
	res.send(content+"\n<script>"+trigger+";setTimeout(loadConfigurations," + timeout + ");</script>");
});

app.get('/ajaxCheckSite', function (req,res) {
	console.log('get("/ajaxCheckSite")');
	var key = req.query.key;
	http.request(optionsArray.array[key], function (response) {
		var str = '';

		//another chunk of data has been received, so append it to `str`
		response.on('data', function (chunk) {
			str += chunk;
		});

		//the whole response has been received, so we just print it out here
		response.on('end', function () {
			var content = "";
			var key = response.connection._host + response.connection._httpMessage.path;
			console.log(key + ": statusCode = " + response.statusCode);
			if(response.statusCode == '200') {
				console.log(key + ": OK ");
				content = '@' + tstamp() + '<img src="static/images/green.png"/> OK [200]';
			} else {
				console.log(key + ": NOK ");
				content = '@' + tstamp() + '<img src="static/images/red.png"/> NOK [' + response.statusCode + ']';
			}
			console.log(key);
			optionsArray.array[key].result = content;
			console.log(optionsArray.array[key].result);
			res.send(content);
		})
	}).end();
});
	
app.post('/updateConfigs', function(req, res) {
	console.log('post("/updateConfigs")');
	
	var form = new formidable.IncomingForm();
	form.parse(req, function (err, fields, files) {
		var obj = "[ \n";
		var i;
		var cnt = 0;
		for(i = 0; i <= fields.nr; i++) {
			if(eval("fields.remove_"+i) == "") {
				if( cnt != 0 ) {
					obj +="    ,"
				} else {
					obj +="     "
				}
				obj += " { \"name\" : \"" + eval("fields.name_"+i) + "\" ";
				obj += " , \"host\" : \"" + eval("fields.host_"+i) + "\" ";
				obj += " , \"path\" : \"" + eval("fields.path_"+i) + "\" ";
				obj += " , \"group\" : \"" + eval("fields.group_"+i) + "\" ";
				var val = eval("fields.isGroupHead_"+i) == 'true' ? 'true' : 'false';
				obj += " , \"isGroupHead\" : \"" + val + "\" ";
				obj += " , \"status\" : null } \n";
				cnt++;
			} 
		}
		obj += "]\n";
		confs.putFile('./.configurations',obj);

		configurations = JSON.parse(obj);
		
		var content = getFile("static/console.html");
		var configs = "";
		var i = 0;
		if(configurations && configurations.length) {
			for(var el in configurations) {
				configs += buildConfigLine(configurations[el],i);
				i++;
			}
		} else {
			configs = buildConfigLine(null,0);
		}
		content = content.replace(new RegExp('\{configurationBody\}', 'g'), configs);
		content = content.replace(new RegExp('\{nrValue\}', 'g'), i);
		res.send(content);
		});
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
});

