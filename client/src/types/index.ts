// Shared types for the client application

export interface User {
  id: string;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  bio?: string;
  avatar?: string;
  token?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface SignupData {
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  password: string;
  bio?: string;
}

export interface Comment {
  _id: string;
  userId: User;
  comment: string;
  upvotes: number;
  downvotes: number;
  createdAt: string;
  replies?: Comment[];
}

export interface Content {
  _id: string;
  title: string;
  content: string;
  userId: User;
  tags: string[];
  media: Array<{
    url: string;
    type: 'image' | 'video' | 'file';
    filename: string;
  }>;
  upvotes: number;
  downvotes: number;
  views: number;
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Community {
  _id: string;
  name: string;
  description: string;
  organizer: User;
  moderators: User[];
  members: User[];
  memberCount: number;
  avatar?: string;
  banner?: string;
  rules: string[];
  tags: string[];
  isPrivate: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Note: ApiResponse is temporarily defined in api.ts to resolve import issues
