function Chat(io) {
    this.io = io;
    this.clients = [];
}

Chat.prototype.handleClient = function (socket) {
    var that = this;
    this.addClient(socket.id, socket.id);
    socket.on("chat_client_rename", function (name) {
        var client = that.getClientById(socket.id);
        that.io.emit("chat_broadcast_message", client.name + " renamed to " + name);
        client.name = name;
    });
    socket.on("chat_send_message", function (msg) {
        var client = that.getClientById(socket.id);
        that.io.emit("chat_broadcast_message", client.name + ": " + msg);
    });
}

Chat.prototype.getClientById = function (id) {
    for (var client of this.clients) {
        if (client.id == id) return client;
    }
    return null;
}

Chat.prototype.getClientByName = function (name) {
    for (var client of this.clients) {
        if (client.name == name) return client;
    }
    return null;
}

Chat.prototype.addClient = function (id, name) {
    if (!this.getClientById(id)) {
        this.clients.push({ id: id, name: name });
    }
}

module.exports = Chat;