/* eslint no-console: 0 */
import socketIo from 'socket.io';
import { InvestEvents } from '../api/invest/invest.controller';
import { PostEvents } from '../api/post/post.controller';
import { CommentEvents } from '../api/comment/comment.controller';
import { NotificationEvents } from '../api/notification/notification.controller';
import { MessageEvents } from '../api/message/message.controller';
import User from '../api/user/user.model';
import Post from '../api/post/post.model';
import Earnings from '../api/earnings/earnings.model';
import Invest from '../api/invest/invest.model';
import Notification from '../api/notification/notification.model';

// TODO store list of clients in Mongo;
const clients = {};

const events = {
  comment: CommentEvents,
  invest: InvestEvents,
  post: PostEvents,
  notification: NotificationEvents,
  message: MessageEvents,
  postEvent: Post.events,
  earningsEvent: Earnings.events,
  investEvents: Invest.events,
  notificationEvent: Notification.events,
  userEvent: User.events
};

function removeClient(socket, currentUser) {
  if (!currentUser || !clients[currentUser]) return;

  const userSockets = clients[currentUser];
  delete userSockets[socket.id];

  if (Object.keys(userSockets).length === 0) {
    delete clients[currentUser];

    User.findOneAndUpdate({ _id: currentUser }, { online: false })
    .exec()
    .catch(err => console.log(err));
  }
  console.log('socket disconnected');
}

function addClient(socket, currentUser) {
  console.log('user connected ', currentUser);

  const userSockets = clients[currentUser] || {};
  userSockets[socket.id] = socket;

  // update online status and send socket
  if (Object.keys(userSockets).length === 1) {
    User.findOneAndUpdate({ _id: currentUser }, { online: true })
    .exec()
    .catch(err => console.log(err));
  }
}

function createListener(io) {
  return data => {
    if (data._id) {
      const sockets = clients[data._id];
      if (!sockets) return;
      Object.keys(sockets).forEach(id => {
        const socket = sockets[id];
        console.log('emit to ', data._id, ' ', data.type);
        socket.emit('action', data);
      });
    } else {
      console.log('emit to all ', data.type);
      io.emit('action', data);
    }
  };
}

function registerEvents(io) {
  Object.keys(events).forEach(event => {
    const eventListener = events[event];
    const listener = createListener(io);
    eventListener.on(event, listener);
  });
}

// When the user connects.. perform this
function onConnect(socket) {
  // When the client emits 'info', this listens and executes
  socket.on('info', data => {
    socket.log(JSON.stringify(data, null, 2));
  });
}

export default function(server) {
  const io = socketIo();
  io.attach(server);

  registerEvents(io);

  function sendHeartbeat() {
    setTimeout(sendHeartbeat, 30000);
    io.sockets.emit('pingKeepAlive', { beat: 1 });
  }
  setTimeout(sendHeartbeat, 30000);

  io.on('connection', socket => {
    socket.address =
      socket.request.connection.remoteAddress +
      ':' +
      socket.request.connection.remotePort;

    socket.connectedAt = new Date();

    socket.log = (...data) => {
      console.log(`SocketIO ${socket.nsp.name} [${socket.address}]`, ...data);
    };

    onConnect(socket, io);

    let currentUser = null;
    socket.emit('action', { type: 'socketId', payload: socket.id });

    socket.on('pingResponse', () => {
      // console.log('Pong received from client');
    });

    socket.on('action', action => {
      if (action.type === 'server/storeUser') {
        currentUser = action.payload;
        addClient(socket, currentUser);
      }
      if (action.type === 'server/logout') {
        currentUser = action.payload;
        removeClient(socket, currentUser);
      }
    });

    socket.on('disconnect', () => {
      removeClient(socket, currentUser);
    });
  });
}
