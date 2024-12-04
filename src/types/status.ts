export interface Status {
  id: string;
  userId: string;
  username: string;
  imageUrl: string;
  createdAt: number;
  expiresAt: number; // 24 hours after creation
}