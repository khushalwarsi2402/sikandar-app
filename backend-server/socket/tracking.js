module.exports = function(io) {
  io.on('connection', (socket) => {
    console.log('📡 Client connected:', socket.id);

    // Join order room for real-time updates
    socket.on('joinOrder', (orderId) => {
      socket.join(`order_${orderId}`);
      console.log(`  → Joined room: order_${orderId}`);
    });

    // Leave order room
    socket.on('leaveOrder', (orderId) => {
      socket.leave(`order_${orderId}`);
    });

    socket.on('disconnect', () => {
      console.log('📡 Client disconnected:', socket.id);
    });
  });
};
