"use strict";

const express = require("express");
const socketIO = require("socket.io");
const path = require("path");
const fs = require("fs");
const util = require("util")

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, "../../index.html");

const server = express()
    .use(express.static("public"))
    .use((req, res) => res.sendFile(INDEX))
    .listen(PORT, () => console.log(`Listening on ${PORT}`));

const io = socketIO(server);

const map = JSON.parse(fs.readFileSync(path.join(__dirname,"data/map.json"), "utf8"));

io.on("connection", (socket) => {
    console.log("Client connected");
    socket.on("disconnect", () => console.log("Client disconnected"));
    socket.on("client_ready", function (msg) {
        console.log("client_ready" + msg);
        socket.emit("load_map", map);
    });
});

setInterval(() => io.emit("time", new Date().toTimeString()), 1000);