$(document).on('touchstart', function (e) {
    e.preventDefault();
});

$(function () {
    var socket = new WebSocket("ws://" + location.host + "/socket");
    var canvas = $('canvas')[0];
    var isBlocked = true;
    var touchPosition = {};

    var context = canvas.getContext("2d");
    canvas.addEventListener("touchmove", setPosition);
    canvas.addEventListener("touchstart", setPosition);

    var width = 0;
    var height = 0;
    var padding = 0.1;
    var positionToSend = {x : 0, y : 0};
    var lastSend;
    var arena = {
        x : 0,
        y : 0,
        width: 0,
        height : 0,
        mmWidth : 2000,
        mmHeight: 4000
    };

    $(window).resize(function () {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }).resize();



    socket.onmessage = function (event) {
        switch(event.data) {
            case 'fuckoff':
            default:
                isBlocked = true;
                break;
            case 'welcomehome':
                isBlocked = false;
                break;
        }
    };

    socket.onclose = function () {
        window.location.reload();
    };

    function setPosition(e) {
        var x = e.touches[0].clientX;
        var y = e.touches[0].clientY;
        touchPosition = {
            x : x,
            y : y
        };
        if(!isInside(x, y)) {
            return;
        }
        positionToSend = convertPositionFromMouseToMM(x, y);
    }

    function sendPosition() {
        if(positionToSend != lastSend && socket.readyState == WebSocket.OPEN) {
            lastSend = positionToSend;
            socket.send(positionToSend.x + "," + positionToSend.y);
        }
    }
    setInterval(sendPosition, 30);

    function convertPositionFromMouseToMM(x, y) {
        return {
            x : Math.round((x - arena.x) / arena.width * arena.mmWidth) + 1000,
            y : arena.mmHeight - Math.round((y - arena.y) / arena.height * arena.mmHeight) + 1000
        };
    }




    function drawWalls(context) {
        context.strokeStyle = "#ccc";
        var aspect = 2/1;
        var wallWidth = width * (1 - padding);
        var wallHeight = wallWidth * aspect;
        if(wallHeight > height * (1 - padding)) {
            wallHeight = height * (1 - padding);
            wallWidth = wallHeight * (1 / aspect);
        }
        arena.x = width / 2 - wallWidth / 2;
        arena.y = height / 2 - wallHeight / 2;
        arena.width = wallWidth;
        arena.height = wallHeight;
        context.rect(arena.x, arena.y, arena.width, arena.height);
        context.stroke();
    }

    function draw() {
        context.fillStyle = "#222";
        context.fillRect(0, 0, canvas.width, canvas.height);
        if(!isBlocked) {
            drawWalls(context);
            context.beginPath();
            context.fillStyle = "rgb(255, 165, 0)";
            context.strokeStyle = "rgb(255, 165, 0)";
            context.strokeWidth = 10;
            context.arc(touchPosition.x, touchPosition.y, 10, 0, Math.PI * 2);
            context.fill();
            context.stroke();
            context.closePath();
        } else {
            context.fillStyle = "#ccc";
            context.font = "30px Arial";
            context.textAlign = "center";
            context.fillText("Please wait!", canvas.width / 2,canvas.height / 2);
        }
        requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);

    function isInside(x, y) {
        return x >= arena.x && x <= arena.x + arena.width && y >= arena.y && y <= arena.y + arena.height;
    }

    window.onunload = function () {
        socket.close();
    }
});