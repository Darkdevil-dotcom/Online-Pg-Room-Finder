const Notification = require('../models/Notification');

const createAndEmitNotification = async ({ io, userId, type, title, message, payload = {} }) => {
  const notification = await Notification.create({ userId, type, title, message, payload });

  if (io) {
    io.to(`user:${userId.toString()}`).emit('notification:new', {
      _id: notification._id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      payload: notification.payload,
      read: notification.read,
      createdAt: notification.createdAt
    });
  }

  return notification;
};

module.exports = {
  createAndEmitNotification
};
