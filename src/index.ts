import express from "express";
import http from "http";
import socket from "socket.io";
import cors from "cors";
import { protect } from "../middleware/protect";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import router from "./routes/user.routes";

const app = express();

const server = http.createServer(app);

app.use(express.json());
app.use(cors());

const { Server } = socket;

const io = new Server(server, {
  cors: { origin: "*" },
});

let connectedUsers: {
  socket: socket.Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
  userId: string;
  userName: string;
  currentlyChatWith: string | undefined;
  currentLocation:{latitude:number,longitude:number}|undefined
}[] = [];

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
      return { userId: user.userId, userName: user.userName,currentLocation:user.currentLocation };
    });
  //console.log(modArr);
  return modArr;
};

io.on("connection", (socket) => {
  const userId: string = socket.handshake.query.userId as string;
  const userName: string = socket.handshake.query.userName as string;
  console.log(`User connected with ID: ${userId}`);
  connectedUsers.push({ socket, userId: userId, userName: userName, currentlyChatWith: undefined,currentLocation:undefined });


  // Send the list of connected users to the newly connected user
  io.emit("connectedUsers", allUsersResponse());

  socket.on("showUsers", (msg) => {
    console.log(connectedUsers);
  });

  socket.on("startConversation", ({ initializingUserId, receivingUserId }) => {
    if (initializingUserId && receivingUserId) {
      connectedUsers = connectedUsers.map((user) => {
        if (user.userId == initializingUserId) {
          return { ...user, currentlyChatWith: receivingUserId };
        }
        if (user.userId == receivingUserId) {
          return { ...user, currentlyChatWith: initializingUserId };
        }
        return user;
      });
      const receiver = connectedUsers.find((user) => user.userId === receivingUserId);
      const initializingUser = connectedUsers.find((user) => user.userId === initializingUserId);
      if (receiver) {
        receiver.socket.emit("conversationStarted", {
          userId: initializingUser?.userId,
          userName: initializingUser?.userName,
          currentlyChatWith: initializingUser?.currentlyChatWith,
        });
      }
      io.emit("connectedUsers", allUsersResponse());
    }
  });

  socket.on("conversationEnded", ({ initializingUserId, receivingUserId }) => {
    if (initializingUserId && receivingUserId) {
      connectedUsers = connectedUsers.map((user) => {
        if (user.userId == initializingUserId) {
          return { ...user, currentlyChatWith: undefined };
        }
        if (user.userId == receivingUserId) {
          return { ...user, currentlyChatWith: undefined };
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

  socket.on("setLocation", ({ userId, latitude, longitude }) => {
    console.log(userId);
    console.log(latitude, longitude);

    connectedUsers = connectedUsers.map((user) => {
      if (user.userId == userId) {
        return { ...user, currentLocation:{latitude:latitude,longitude:longitude} };
      }
      return user;
    });
    console.log(connectedUsers);
    io.emit("connectedUsers", allUsersResponse());
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected with ID: ${userId}`);
    const otherUser = connectedUsers.find((user) => user.currentlyChatWith == userId);
    connectedUsers = connectedUsers.filter((user) => user.userId != userId);
    connectedUsers = connectedUsers.map((user) => {
      if (user.currentlyChatWith == userId) {
        return { ...user, currentlyChatWith: undefined };
      }
      return user;
    });
 
    if(otherUser){
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
app.use("/",router)

app.get("/test", async (req, res) => {
  res.send("Hi I am test");
});

server.listen(8080, () => {
  console.log("listening on *:8080");
});
