var app = require('express')();
var http = require('http').Server(app);
var path = require('path');
var socketServer = new require('ws').Server({server : http});
var timer;
var sockets = [];
var robotSocket = null;
var currentPerson = -1;
var port = process.env.PORT || 3000;


app.get(['/', '/static/*'], function (req, response) {
    if(req.url == '/') {
        response.redirect('/static/index.html');
        return;
    }
    response.sendFile(path.join(__dirname, req.url));
});



socketServer.on('connection', function (socket) {
    console.log("Client connected");
    socket.on('close', disconnect.bind(this, socket));
    socket.on('message', dataReceived.bind(this, socket));
    sockets.push(socket);
    if(!isReady(sockets[currentPerson])) {
        resetInterval();
    }
});

function disconnect(socket) {
    var isInControl = currentPerson == sockets.indexOf(socket);
    sockets[sockets.indexOf(socket)] = null;
    if(isInControl) {
        resetInterval();
    }
}


function resetInterval() {
    if(timer) {
        clearInterval(timer);
    }
    timer = setInterval(selectPerson, process.env.TURN_LENGTH || 15000);
    selectPerson();
}

function isReady(s) {
    return s && s.readyState == 1;
}

function dataReceived(socket, e) {
    if(e == 'iamrobot') {
        sockets[sockets.indexOf(socket)] = null;
        robotSocket = socket;
        return;
    }
    if(sockets.indexOf(socket) == currentPerson && isReady(robotSocket)) {
        robotSocket.send(e);
    }
}


function selectPerson() {
    console.log("selecting person");
    var oldPerson = sockets[currentPerson];
    if(!sockets.some(isReady)) {
        return;
    }
    while(true) {
        currentPerson = (currentPerson + 1) % sockets.length;
        if(isReady(sockets[currentPerson])) {
            break;
        }
    }
    var newPerson = sockets[currentPerson];
    console.log("New person selected");
    if(isReady(oldPerson)) {
        oldPerson.send("fuckoff");
    }
    if(isReady(newPerson)) {
        newPerson.send("welcomehome");
    }
}




http.listen(port, function(){});


