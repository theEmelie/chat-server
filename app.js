const express = require('express');
const app = express();
const cors = require('cors');
const servers = require('http').createServer(app);
const io = require('socket.io')(servers);
const time = require('./time.js');
const bodyParser = require("body-parser");

const Chat = require("./models/chatSchema");
const connect = require("./dbconnection");

const socketPort = 9595;

app.use(cors());
app.use(bodyParser.json());

io.origins(['https://emelieaslund.me:443']);


io.on('connection', function (socket) {
    console.log("User connected");

    msg = {timestamp: time.getTimeOfDay(), user: "", message: "En ny användare har anlänt till chatten!"};

    io.emit("msgReceived", msg);

    socket.on('msgSend', function (clientData) {
        msg = {timestamp: time.getTimeOfDay(), user: clientData.user, message: clientData.message};
        io.emit('msgReceived', msg);

        connect.then(db  =>  {
            console.log("Saving chat message");

            let chatMsg = new Chat({ message: clientData.message, user: clientData.user, timeMsg: time.getTimeOfDay()});
            chatMsg.save();
        });
    });

    socket.on('getHistory', function (clientData) {
        connect.then(db  =>  {
            console.log("Getting chat history");
            Chat.find({}).then(chat => {
                socket.emit('chatHistory', chat)
            });
        });
    });

    socket.on('disconnect', function() {
        console.log('user disconnected');
    });
});

servers.listen(socketPort);
