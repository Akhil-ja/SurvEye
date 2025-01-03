import { Schema, model } from 'mongoose';
import { IAnnouncement } from '../interfaces/common.interface';

const announcementSchema = new Schema<IAnnouncement>({
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  target: {
    type: String,
    enum: ['all', 'users', 'creators'],
    default: 'all',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  type: {
    type: String,
    default: 'announcement',
  },
});

const Announcement = model<IAnnouncement>('Announcement', announcementSchema);
export default Announcement;
