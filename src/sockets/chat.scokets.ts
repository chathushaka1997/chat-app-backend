import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

let connectedUsers: {
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
    userId: string;
    userName: string;
    currentlyChatWith: string | undefined;
    currentLocation:{latitude:number,longitude:number}|undefined
  }[] = [];
const allUsersResponse = () => {
    const modArr = connectedUsers
      .filter((user) => user.currentlyChatWith == undefined)
      .map((user) => {
        return { userId: user.userId, userName: user.userName,currentLocation:user.currentLocation };
      });
    //console.log(modArr);
    return modArr;
  };

const chatSocket = (io:Server)=>{
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
}

export default chatSocket