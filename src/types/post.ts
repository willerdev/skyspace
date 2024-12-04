export type MediaType = 'image' | 'video' | null;
export type Privacy = 'public' | 'private';

export interface Comment {
  id: string;
  userId: string;
  content: string;
  createdAt: number;
  users: {
    username: string;
  };
  likes?: { user_id: string }[];
  replies?: Comment[];
}

export interface Post {
  id: string;
  userId: string;
  username: string;
  content: string;
  mediaUrl?: string;
  mediaType?: MediaType;
  privacy: Privacy;  // New field
  createdAt: number;
  likes: string[];  // Array of userIds who liked the post
  comments: Comment[];
}

export interface Tip {
  id: string;
  postId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  createdAt: number;
}