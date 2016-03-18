import Server from 'socket.io';

export default function startServer(store) {
  const io = new Server().attach(8090);

  store.subscribe(() => {
    io.emit('state', store.getState().toJS());
  });

  io.on('connection', socket => {
    io.emit('state', store.getState().toJS());
    socket.on('action', store.dispatch.bind(store)); // does it work without 'bind' as well?
  });
}
