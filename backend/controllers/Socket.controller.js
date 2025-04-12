import Message from '../models/Message.js'

const users = new Map()

const handleSocketEvents = async io => {
 io.on('connection', socket => {
  console.log(`User Connected: ${socket.id}`)

  // Store user in the map when they connect
  socket.on('userConnected', userId => {
   users.set(userId, socket.id)
   console.log(`User ${userId} is online with Socket ID: ${socket.id}`)
  })

  // Handle sending messages
  socket.on('sendMessage', async ({ senderId, receiverId, message }) => {
   try {
    console.log(`Message from ${senderId} to ${receiverId}: ${message}`)

    const receiverSocket = users.get(receiverId)

    const savedMessage = await Message.create({
     senderId,
     receiverId,
     message,
     status: receiverSocket ? 'delivered' : 'sent',
     timestamp: new Date()
    })

    if (receiverSocket) {
     await Message.findByIdAndUpdate(savedMessage._id, { status: 'delivered' })
    }

    const messagePayload = {
     _id: savedMessage._id,
     senderId,
     receiverId,
     message: savedMessage.message,
     timestamp: savedMessage.timestamp,
     status: receiverSocket ? 'delivered' : 'sent'
    }

    // Emit to sender
    io.to(socket.id).emit('receiveMessage', messagePayload)

    // Emit to receiver if online
    if (receiverSocket) {
     io.to(receiverSocket).emit('receiveMessage', messagePayload)
    }
   } catch (error) {
    console.error('Error sending message:', error)
   }
  })

  // Mark messages as delivered when receiver opens the chat
  socket.on('markMessagesAsDelivered', async ({ receiverId, senderId }) => {
   try {
    // Update message status in DB
    const result = await Message.updateMany({ senderId, receiverId, status: 'sent' }, { $set: { status: 'delivered' } })

    console.log(`Marked ${result.modifiedCount} messages from ${senderId} to ${receiverId} as delivered`)

    // Notify sender in real time
    const senderSocket = users.get(senderId)
    if (senderSocket) {
     io.to(senderSocket).emit('messagesDelivered', {
      senderId,
      receiverId
     })
    }
   } catch (error) {
    console.error('Error marking messages as delivered:', error)
   }
  })

  // Handle disconnection
  socket.on('disconnect', () => {
   users.forEach((socketId, userId) => {
    if (socketId === socket.id) {
     users.delete(userId)
     console.log(`User ${userId} disconnected`)
    }
   })
  })
 })
}

export default handleSocketEvents
