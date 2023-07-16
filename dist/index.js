"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = __importDefault(require("socket.io"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
app.use(express_1.default.json());
app.use((0, cors_1.default)());
const { Server } = socket_io_1.default;
const io = new Server(server, {
    cors: { origin: "*" },
});
let connectedUsers = [];
/* io.use(async (socket,next)=>{
    const clientName = socket.handshake.headers.authorization;
    if(clientName ===undefined || clientName ===null) return;

    const name = await protect(clientName, socket);
    if (name) {
      // put clientName into connectedUsers Object
      connectedUsers[name] = socket;
    } else {
      return;
    }
    await next();
}).on("connection",(socket)=>{
    console.log("Socket conected",socket.id);
    console.log(connectedUsers);
    
}) */
const allUsersResponse = () => {
    const modArr = connectedUsers
        .filter((user) => user.currentlyChatWith == undefined)
        .map((user) => {
        return { userId: user.userId, userName: user.userName };
    });
    //console.log(modArr);
    return modArr;
};
io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    const userName = socket.handshake.query.userName;
    console.log(`User connected with ID: ${userId}`);
    connectedUsers.push({ socket, userId: userId, userName: userName, currentlyChatWith: undefined });
    // Send the list of connected users to the newly connected user
    io.emit("connectedUsers", allUsersResponse());
    socket.on("showUsers", (msg) => {
        console.log(connectedUsers);
    });
    socket.on("startConversation", ({ initializingUserId, receivingUserId }) => {
        if (initializingUserId && receivingUserId) {
            connectedUsers = connectedUsers.map((user) => {
                if (user.userId == initializingUserId) {
                    return Object.assign(Object.assign({}, user), { currentlyChatWith: receivingUserId });
                }
                if (user.userId == receivingUserId) {
                    return Object.assign(Object.assign({}, user), { currentlyChatWith: initializingUserId });
                }
                return user;
            });
            const receiver = connectedUsers.find((user) => user.userId === receivingUserId);
            const initializingUser = connectedUsers.find((user) => user.userId === initializingUserId);
            if (receiver) {
                receiver.socket.emit("conversationStarted", {
                    userId: initializingUser === null || initializingUser === void 0 ? void 0 : initializingUser.userId,
                    userName: initializingUser === null || initializingUser === void 0 ? void 0 : initializingUser.userName,
                    currentlyChatWith: initializingUser === null || initializingUser === void 0 ? void 0 : initializingUser.currentlyChatWith,
                });
            }
            io.emit("connectedUsers", allUsersResponse());
        }
    });
    socket.on("conversationEnded", ({ initializingUserId, receivingUserId }) => {
        if (initializingUserId && receivingUserId) {
            connectedUsers = connectedUsers.map((user) => {
                if (user.userId == initializingUserId) {
                    return Object.assign(Object.assign({}, user), { currentlyChatWith: undefined });
                }
                if (user.userId == receivingUserId) {
                    return Object.assign(Object.assign({}, user), { currentlyChatWith: undefined });
                }
                return user;
            });
            const receiver = connectedUsers.find((user) => user.userId === receivingUserId);
            if (receiver) {
                receiver.socket.emit("conversationEnded");
            }
            io.emit("connectedUsers", allUsersResponse());
        }
    });
    socket.on("sendMessage", ({ receiverId, message }) => {
        const receiver = connectedUsers.find((user) => user.userId === receiverId);
        if (receiver) {
            receiver.socket.emit("receiveMessage", message);
        }
    });
    socket.on("disconnect", () => {
        console.log(`User disconnected with ID: ${userId}`);
        const otherUser = connectedUsers.find((user) => user.currentlyChatWith == userId);
        connectedUsers = connectedUsers.filter((user) => user.userId != userId);
        connectedUsers = connectedUsers.map((user) => {
            if (user.currentlyChatWith == userId) {
                return Object.assign(Object.assign({}, user), { currentlyChatWith: undefined });
            }
            return user;
        });
        if (otherUser) {
            otherUser.socket.emit("conversationEnded");
        }
        io.emit("connectedUsers", allUsersResponse());
    });
});
/* export const sendNotification = (friendName: string, name: string, text: string) => {
  if (!connectedUsers[friendName]) {
    return false;
  }
  io.to(connectedUsers[friendName].id).emit("notification", `${text}`);
  return true;
}; */
// a http route uses to receive post request that user want to send the other user request
/* app.post("/notification", async (req, res) => {
  const { name, friendName, text } = req.body;
  const result = sendNotification(friendName, name, text);
  if (result) {
    res.send("notification successfully");
  } else {
    res.send("notification failed");
  }
}); */
app.get("/test", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send("Hi I am test");
}));
server.listen(8080, () => {
    console.log("listening on *:8080");
});
