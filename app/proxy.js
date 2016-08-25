var WebSocket = require('ws');
var WebSocketServer = WebSocket.Server;

var wss = new WebSocketServer({ port: 3000 });



wss.on('connection', function connection(robotToProxySocket) {
    console.log("Actual robot connected");
    handleConnection(robotToProxySocket);
});

function handleConnection(robotToProxySocket) {
    var proxyToServerSocket = new WebSocket('ws://niarc-robot-control.herokuapp.com');
    proxyToServerSocket.on('open', function () {
        proxyToServerSocket.send("iamrobot");
    });
    proxyToServerSocket.on('message', function (data) {
        robotToProxySocket.send(data);
    });
}