import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

import chatSocket from "./sockets/chat.scokets";
import databaseSetup from "./config/database.config";
import dotenv from 'dotenv';
import { initRoutes } from "./routes/index.routes";


dotenv.config();


const app = express();
databaseSetup();

const server = http.createServer(app);

app.use(express.json());
app.use(cors());


const io = new Server(server, {
  cors: { origin: "*" },
});
chatSocket(io)


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
app.use("/", initRoutes())

app.get("/test", async (req, res) => {
  res.send("Hi I am test");
});

server.listen(8080, () => {
  console.log("listening on *:8080");
});
