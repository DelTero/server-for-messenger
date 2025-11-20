export interface ChatMessageView {
  id: string;
  content: string;
  userId: string;
  roomId: string;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
  };
}
