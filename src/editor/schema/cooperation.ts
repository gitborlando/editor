import { io } from 'socket.io-client'

export const socket = io('ws://localhost:8080')

socket.on('connect', () => {
  console.log('connect')
})

socket.on('disconnect', () => {
  console.log('disconnect')
})

socket.on('message', (data) => {
  console.log(data)
})
