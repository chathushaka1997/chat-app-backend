const protect = async (name: string, socket:any) => {
    if (!name) {
      return false;
    }
    if (socket.handshake.query && name) {
      try {
        socket.name = name;
        return socket.name;
      } catch (err) {
        console.log(err);
        return false;
      }
    }
    return false;
  };
  export { protect };