import { Server } from 'socket.io'

const io = new Server(8080, {
  cors: {
    origin: '*',
  },
})

io.on('connection', (socket) => {
  console.log('connect')
  socket.on('disconnect', () => {
    console.log('disconnect')
  })
  socket.on('message', (data) => {
    console.log(data)
  })
})
