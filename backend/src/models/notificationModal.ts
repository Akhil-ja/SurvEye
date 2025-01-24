import { Schema, model } from 'mongoose';
import { INotification } from '../interfaces/common.interface';

const notificationSchema = new Schema<INotification>({
  title: { type: String, required: true },
  message: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, default: 'announcement' },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Notification = model<INotification>('Notification', notificationSchema);
export default Notification;
