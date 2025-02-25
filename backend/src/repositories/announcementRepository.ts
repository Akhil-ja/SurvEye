import Announcement from '../models/annnouncementModal';
import {
  IAnnouncement,
  AnnouncementData,
} from '../interfaces/common.interface';
import { AppError } from '../utils/AppError';
import { IAnnouncementRepository } from '../interfaces/IRepositoryInterface/IAnnouncementRepository';

export class AnnouncementRepository implements IAnnouncementRepository {
  async createAnnouncement(data: AnnouncementData): Promise<IAnnouncement> {
    try {
      const newAnnouncement = new Announcement({
        ...data,
        status: 'active',
      });

      const savedAnnouncement = await newAnnouncement.save();

      if (!savedAnnouncement) {
        throw new AppError('Failed to save announcement', 500);
      }

      return savedAnnouncement.toObject();
    } catch (error) {
      console.error('Repository Error:', error);
      if (error instanceof Error) {
        throw new AppError(error.message, 400);
      }
      throw new AppError('An unexpected error occurred', 500);
    }
  }

  async getAllAnnouncement(): Promise<IAnnouncement[]> {
    const Announcements = await Announcement.find().sort({ timeStamp: -1 });

    return Announcements;
  }
}
