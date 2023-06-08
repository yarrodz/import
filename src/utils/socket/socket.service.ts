// const socketIO = require("socket.io");
// let ioInstance;

// class SocketService {
//     constructor() {
//         if (!ioInstance) {
//             ioInstance = this;
//         }
//         return ioInstance;
//     }

//     listen(server) {
//         this.io = socketIO(server, {
//             cors: {
//                 origin: "*",
//             },
//         });

//         this.io.on("connection", async (socket) => {
//         console.log("User connected");

//         socket.on("chat message", (msg) => {
//             this.io.emit("chat message", msg);
//         });

//         socket.on("sync", (unitID) => {
//             socket.leaveAll();
//             socket.join(unitID);
//             this.io.to(unitID).emit("connected", "Connected");

//             socket.on("update", (msg) => {
//                 this.io.to(unitID).emit("update", msg);
//             });
//         });

//         socket.on("unsubscribe", (data) => {
//             socket.leaveAll();
//         });
//     });
//         return this.io;
//     }
// }

// module.exports = new SocketService();
