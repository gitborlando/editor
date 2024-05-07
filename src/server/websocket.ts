import { Server } from 'socket.io'

const io = new Server(8080, {
  cors: {
    origin: '*',
  },
})

io.on('connection', (socket) => {
  socket.on('disconnect', () => {
    console.log('disconnect')
  })
  socket.on('message', (data) => {
    socket.broadcast.emit('message', data)
  })
})
