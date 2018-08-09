 var WebServer = require("WebServer");
 var webs = new WebServer({
		port: 80, // Default
		default_type: 'text/html',
		default_index: 'index.html',
		file_system: 'some/path',
		memory: {
			'info.html': { 
				'content': '<html>Hello World!</html>',
				'type': 'text/html'
			},
			'info.txt': { 
				'content': 'Hello World!'
			}
		}
    });

 webs.on('start', function(request, WebServer){
 	console.log('WebServer listening on port ' + WebServer.port);
 });
 webs.on('request', function(request, response, parsedUrl, WebServer){
 	console.log('WebServer requested', parsedUrl);
 });
 webs.on('error', function(error, WebServer){
 	console.log('WebServer Error', error);
 });