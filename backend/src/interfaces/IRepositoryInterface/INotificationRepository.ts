export interface INotificationRepository {
  create(Data: any): Promise<any>;
  getByUser(userId: string): Promise<any>;
}
