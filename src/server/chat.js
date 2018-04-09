class Chat {

    constructor(io) {
        this.io = io;
        this.clients = [];
    }

    handleClient(socket) {
        this.addClient(socket.id, socket.id);
        socket.on("chat_client_rename", (name) => {
            let client = this.getClientById(socket.id);
            this.io.emit("chat_broadcast_message", client.name + " renamed to " + name);
            client.name = name;
        });
        socket.on("chat_send_message", (msg) => {
            let client = this.getClientById(socket.id);
            this.io.emit("chat_broadcast_message", client.name + ": " + msg);
        });
    }

    getClientById(id) {
        for (let client of this.clients) {
            if (client.id == id) return client;
        }
        return null;
    }
    
    getClientByName(name) {
        for (let client of this.clients) {
            if (client.name == name) return client;
        }
        return null;
    }
    
    addClient(id, name) {
        if (!this.getClientById(id)) {
            this.clients.push({ id: id, name: name });
        }
    }
}

module.exports = Chat;