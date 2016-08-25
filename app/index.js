var http = require('http');

var server = http.createServer(function (request, response) {
    response.end("Hello world!");
}).listen(3000);