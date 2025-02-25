import { AnnouncementData, IAnnouncement } from '../common.interface';

export interface IAnnouncementRepository {
  createAnnouncement(data: AnnouncementData): Promise<IAnnouncement>;
  getAllAnnouncement(): Promise<IAnnouncement[]>;
}
