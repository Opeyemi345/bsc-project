// API service layer for frontend-backend communication

// Local type definitions to resolve import issues
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

export interface Chat {
  _id: string;
  participants: User[];
  chatType: 'direct' | 'group';
  chatName?: string;
  chatDescription?: string;
  createdBy: string;
  adminUsers?: string[];
  lastMessage?: {
    content: string;
    senderId: string;
    timestamp: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  chatId: string;
  senderId: User;
  content: string;
  messageType: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
  readBy: Array<{
    userId: string;
    readAt: string;
  }>;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
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

// Types are now defined locally above

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';



// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Helper function to make API requests
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const token = getAuthToken();

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// Authentication API
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<ApiResponse<User>> => {
    const response = await apiRequest<User>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Store token in localStorage
    if (response.success && response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }

    return response;
  },

  signup: async (userData: SignupData): Promise<ApiResponse<User>> => {
    return apiRequest<User>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  logout: () => {
    localStorage.removeItem('authToken');
  },

  forgotPassword: async (email: string): Promise<ApiResponse<any>> => {
    return apiRequest<any>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (token: string, newPassword: string): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/auth/reset-password/${token}`, {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    });
  },
};

// User API
export const userApi = {
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    return apiRequest<User>('/users/me');
  },

  getUserById: async (id: string): Promise<ApiResponse<User>> => {
    return apiRequest<User>(`/users/${id}`);
  },

  updateProfile: async (userData: Partial<User>): Promise<ApiResponse<User>> => {
    return apiRequest<User>('/users', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  getAllUsers: async (page = 1, limit = 10): Promise<ApiResponse<User[]>> => {
    return apiRequest<User[]>(`/users?page=${page}&limit=${limit}`);
  },

  changePassword: async (oldPassword: string, newPassword: string): Promise<ApiResponse<any>> => {
    return apiRequest<any>('/users/change-password', {
      method: 'PUT',
      body: JSON.stringify({ oldPassword, newPassword }),
    });
  },

  searchUsers: async (query: string): Promise<ApiResponse<User[]>> => {
    return apiRequest<User[]>(`/users/search?q=${encodeURIComponent(query)}`);
  },
};

// Content API
export const contentApi = {
  getAllContent: async (params: {
    page?: number;
    limit?: number;
    tags?: string;
    userId?: string;
    communityId?: string;
    sortBy?: 'createdAt' | 'upvotes' | 'views' | 'comments';
  } = {}): Promise<ApiResponse<Content[]>> => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value.toString());
    });

    return apiRequest<Content[]>(`/content?${queryParams.toString()}`);
  },

  getContentById: async (id: string): Promise<ApiResponse<Content>> => {
    return apiRequest<Content>(`/content/${id}`);
  },

  createContent: async (contentData: {
    title: string;
    content: string;
    tags?: string[];
    media?: any[];
    communityId?: string;
    isPublic?: boolean;
  }): Promise<ApiResponse<Content>> => {
    return apiRequest<Content>('/content', {
      method: 'POST',
      body: JSON.stringify(contentData),
    });
  },

  updateContent: async (id: string, contentData: Partial<Content>): Promise<ApiResponse<Content>> => {
    return apiRequest<Content>(`/content/${id}`, {
      method: 'PUT',
      body: JSON.stringify(contentData),
    });
  },

  deleteContent: async (id: string): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/content/${id}`, {
      method: 'DELETE',
    });
  },

  voteContent: async (id: string, voteType: 'upvote' | 'downvote' | 'remove'): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/content/${id}/upvote`, {
      method: 'POST',
      body: JSON.stringify({ voteType }),
    });
  },

  getUserContent: async (userId: string, page = 1, limit = 20): Promise<ApiResponse<Content[]>> => {
    return apiRequest<Content[]>(`/content/user/${userId}?page=${page}&limit=${limit}`);
  },
};

// Comment API
export const commentApi = {
  getComments: async (contentId: string, page = 1, limit = 10): Promise<ApiResponse<Comment[]>> => {
    return apiRequest<Comment[]>(`/content/${contentId}/comments?page=${page}&limit=${limit}`);
  },

  createComment: async (contentId: string, comment: string, parentComment?: string): Promise<ApiResponse<Comment>> => {
    return apiRequest<Comment>(`/content/${contentId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ comment, parentComment }),
    });
  },

  updateComment: async (id: string, comment: string): Promise<ApiResponse<Comment>> => {
    return apiRequest<Comment>(`/content/comments/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ comment }),
    });
  },

  deleteComment: async (id: string): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/content/comments/${id}`, {
      method: 'DELETE',
    });
  },

  voteComment: async (id: string, voteType: 'upvote' | 'downvote' | 'remove'): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/content/comments/${id}/vote`, {
      method: 'POST',
      body: JSON.stringify({ voteType }),
    });
  },
};

// Community API
export const communityApi = {
  getAllCommunities: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    tags?: string;
    sortBy?: 'createdAt' | 'members' | 'name';
  } = {}): Promise<ApiResponse<Community[]>> => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value.toString());
    });

    return apiRequest<Community[]>(`/communities?${queryParams.toString()}`);
  },

  getCommunityById: async (id: string): Promise<ApiResponse<Community>> => {
    return apiRequest<Community>(`/communities/${id}`);
  },

  createCommunity: async (communityData: {
    name: string;
    description: string;
    rules?: string[];
    tags?: string[];
    isPrivate?: boolean;
    avatar?: string;
    banner?: string;
  }): Promise<ApiResponse<Community>> => {
    return apiRequest<Community>('/communities', {
      method: 'POST',
      body: JSON.stringify(communityData),
    });
  },

  updateCommunity: async (id: string, communityData: Partial<Community>): Promise<ApiResponse<Community>> => {
    return apiRequest<Community>(`/communities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(communityData),
    });
  },

  deleteCommunity: async (id: string): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/communities/${id}`, {
      method: 'DELETE',
    });
  },

  joinCommunity: async (id: string, message?: string): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/communities/${id}/join`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  leaveCommunity: async (id: string): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/communities/${id}/leave`, {
      method: 'POST',
    });
  },
};

// Chat API
export const chatApi = {
  getUserChats: async (): Promise<ApiResponse<Chat[]>> => {
    return apiRequest<Chat[]>('/chat');
  },

  createChat: async (chatData: {
    participantIds: string[];
    chatType?: 'direct' | 'group';
    chatName?: string;
    chatDescription?: string;
  }): Promise<ApiResponse<Chat>> => {
    return apiRequest<Chat>('/chat', {
      method: 'POST',
      body: JSON.stringify(chatData),
    });
  },

  getChatById: async (chatId: string, page = 1, limit = 50): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/chat/${chatId}?page=${page}&limit=${limit}`);
  },

  sendMessage: async (chatId: string, messageData: {
    content?: string;
    messageType?: 'text' | 'image' | 'file';
    fileUrl?: string;
    fileName?: string;
  }): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/chat/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  },

  markMessagesAsRead: async (chatId: string): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/chat/${chatId}/read`, {
      method: 'POST',
    });
  },

  deleteMessage: async (messageId: string): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/chat/messages/${messageId}`, {
      method: 'DELETE',
    });
  },

  addMembersToGroup: async (chatId: string, userIds: string[]): Promise<ApiResponse<Chat>> => {
    return apiRequest<Chat>(`/chat/${chatId}/members`, {
      method: 'POST',
      body: JSON.stringify({ userIds }),
    });
  },

  removeMemberFromGroup: async (chatId: string, userId: string): Promise<ApiResponse<Chat>> => {
    return apiRequest<Chat>(`/chat/${chatId}/members/${userId}`, {
      method: 'DELETE',
    });
  },
};
