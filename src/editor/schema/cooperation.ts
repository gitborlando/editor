import { io } from 'socket.io-client'
import { Schema } from './schema'

export const socket = io('ws://103.103.201.42:17935')

socket.on('connect', () => {
  console.log('connect')
})

socket.on('disconnect', () => {
  console.log('disconnect')
})

socket.on('message', ({ patches }) => {
  Schema.applyPatches(patches)
  Schema.nextSchema()
})
