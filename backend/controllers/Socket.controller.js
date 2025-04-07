import Message from "../models/Message.js";

const users = new Map(); 

const handleSocketEvents = async (io) => {
  io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    // Store user in the map when they connect
    socket.on("userConnected", (userId) => {
      users.set(userId, socket.id);
      console.log(`User ${userId} is online with Socket ID: ${socket.id}`);
    });

    // Handle sending messages
    socket.on("sendMessage", async ({ senderId, receiverId, message }) => {
      try {
        console.log(`Message from ${senderId} to ${receiverId}: ${message}`);

        // Save message in MongoDB
        await Message.create({ senderId: senderId, receiverId: receiverId, message });

        const receiverSocket = users.get(receiverId); // Get receiver's socket ID

        // Emit message to the sender (so they see their own message instantly)
        io.to(socket.id).emit("receiveMessage", { senderId, message });

        // Emit the message to the receiver if they are online
        if (receiverSocket) {
          io.to(receiverSocket).emit("receiveMessage", { senderId, message });
        }
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      users.forEach((socketId, userId) => {
        if (socketId === socket.id) {
          users.delete(userId);
          console.log(`User ${userId} disconnected`);
        }
      });
    });
  });
};
export default handleSocketEvents;


