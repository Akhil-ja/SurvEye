import { INotificationRepository } from '../interfaces/IRepositoryInterface/INotificationRepository';
import Notification from '../models/notificationModal';
import { Types } from 'mongoose';

export class NotificationRepository implements INotificationRepository {
  async create(Data: any): Promise<any> {
    const newAnnouncement = new Notification({
      title: Data.title,
      message: Data.message,
      user: new Types.ObjectId(Data.user),
      type: Data.type || 'announcement',
      createdAt: new Date(),
    });

    await newAnnouncement.save();
  }

  async getByUser(userId: string): Promise<any> {
    return await Notification.find({ user: new Types.ObjectId(userId) });
  }
}
