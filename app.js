const express = require('express');
const app = express();
const cors = require('cors');
const servers = require('http').createServer(app);
const io = require('socket.io')(servers, );
const time = require('./time.js');

const socketPort = 9595;

// io.origins(['http://localhost:' + socketPort.toString()]);

app.use(cors());

io.on('connection', function (socket) {
    console.log("User connected");

    msg = {timestamp: time.getTimeOfDay(), user: "", message: "En ny användare har anlänt till chatten!"};

    io.emit("msgReceived", msg);

    socket.on('msgSend', function (clientData) {
        msg = {timestamp: time.getTimeOfDay(), user: clientData.user, message: clientData.message};
        io.emit('msgReceived', msg);
    });

    socket.on('disconnect', function() {
        console.log('user disconnected');
    });
});

servers.listen(socketPort);
