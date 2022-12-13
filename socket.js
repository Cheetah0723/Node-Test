const SocketIO = require('socket.io');
const uuid = require('uuid');
let _sIO, _sInstance;

let data = [];
// data store all user's socket, ex: 
/**
  { 
    token: // user verify,
    socket: // user socket
  }
*/
module.exports = {
  init: (server) => {
    const io = SocketIO(server, {
      serveClient: false,
      connectTimeout: 24 * 60 * 60 * 1000,
      maxHttpBufferSize: 1e8,
      cors: {
        origin: "*"
      }
    });

    io.engine.generateId = (reqeust) => {
      return uuid.v4();
    }

    io.on('connection', socket => {
      _sIO = io;
      _sInstance = socket;
      
      // init user info
      socket.on('connected', payload => {
        const user = {
          token: payload.token,
          socket: socket.id
        };
        data.push(user);
      });

      socket.on("disconnect", () => {
        console.log(`${socket.id} Client disconnected`);
      });

      socket.conn.on("close", (reason) => {
        // called when the underlying connection is closed
        console.log(`${socket.id} is closed, reason is ${reason}`);
      });

      socket.on('connect_error', (error) => {
        console.log('Connect Error: ', error);
      });
    });
  },

  sendUser: (token, data) => {
    const userData = data.find(user => user.token == token);
    if (data.error) {
      return _sIO.sockets.to(userData.socket).emit("Error", { message: data.error });
    }

    // send url info to user
    _sIO.sockets.to(userData.socket).emit("Shortened", data);
  }
}