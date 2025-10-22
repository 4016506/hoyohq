export type GameTag = "Genshin Impact" | "Honkai: Star Rail" | "Ticket";

export interface BlogPost {
  id: string;
  userId: string;
  userName: string;
  game: GameTag;
  title: string;
  content: string;
  timestamp: number;
  likes: string[]; // Array of user IDs who liked the post
  replyCount: number;
}

export interface BlogReply {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: number;
  likes: string[]; // Array of user IDs who liked the reply
}

export interface BlogUser {
  id: string;
  name: string;
  game: GameTag;
}

