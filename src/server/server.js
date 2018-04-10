// Libs
const express = require("express");
const socketIO = require("socket.io");
const path = require("path");
const fs = require("fs");
const util = require("util")

// Local modules
const Chat = require("./chat.js");

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, "../../index.html");
const TEST = path.join(__dirname, "../../test.html");

const server = express()
    .use(express.static("public"))
    .use("/test",(req, res) => res.sendFile(TEST))
    .use((req, res) => res.sendFile(INDEX))
    .listen(PORT, () => console.log("Listening on " + PORT));

const io = socketIO(server);

const map = JSON.parse(fs.readFileSync(path.join(__dirname, "data/map.json"), "utf8"));
const objectives = JSON.parse(fs.readFileSync(path.join(__dirname, "data/objectives.json"), "utf8"));
const cards = JSON.parse(fs.readFileSync(path.join(__dirname, "data/cards.json"), "utf8"));
const gameState = JSON.parse(fs.readFileSync(path.join(__dirname, "data/game_state.json"), "utf8"));

const chat = new Chat(io);

io.on("connection", (socket) => {
    console.log("Client connected");
    socket.on("disconnect", () => console.log("Client disconnected"));
    socket.on("client_ready", () => {
        console.log("client_ready: " + socket.id);
        socket.emit("load_map", map);
    });
    chat.handleClient(socket);
});