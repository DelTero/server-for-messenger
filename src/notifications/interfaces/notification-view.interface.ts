export interface NotificationView {
  id: string;
  type: string;
  payload: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
}
