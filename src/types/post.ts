export type MediaType = 'image' | 'video' | null;
export type Privacy = 'public' | 'private';

export interface Like {
  user_id: string;
}

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  users: {
    username: string;
  };
  likes?: Like[];
  replies?: Comment[];
}

export interface Post {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  privacy: 'public' | 'private';
  media_url?: string;
  media_type?: MediaType;
  profile?: {
    username: string;
  };
  likes?: Like[];
  comments?: Comment[];
  points?: number;
  unlocked?: boolean;
}

export interface Tip {
  id: string;
  postId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  createdAt: number;
}