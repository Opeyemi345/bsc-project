import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  getDocs,
  getDoc,
  serverTimestamp,
  Timestamp,
  QuerySnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { firebaseErrorHandler } from './firebaseErrorHandler';

// Type definitions for better compatibility
type UnsubscribeFunction = () => void;

// Error handling wrapper for Firebase operations
const handleFirebaseError = (error: any, operation: string) => {
  firebaseErrorHandler.handleError(error, operation, false);
};

// Types
export interface FirebaseMessage {
  id?: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: 'text' | 'image' | 'file';
  timestamp: Timestamp | any;
  readBy: string[];
  edited?: boolean;
  editedAt?: Timestamp;
  replyTo?: string;
}

export interface FirebaseChat {
  id?: string;
  type: 'direct' | 'group';
  name?: string;
  description?: string;
  avatar?: string;
  participants: string[];
  createdBy: string;
  createdAt: Timestamp | any;
  lastMessage?: {
    content: string;
    senderId: string;
    timestamp: Timestamp;
  };
  unreadCount?: { [userId: string]: number };
}

export interface UserPresence {
  userId: string;
  isOnline: boolean;
  lastSeen: Timestamp | any;
}

// Collections
const CHATS_COLLECTION = 'chats';
const MESSAGES_COLLECTION = 'messages';
const PRESENCE_COLLECTION = 'presence';

// Chat Management
export const createChat = async (chatData: Omit<FirebaseChat, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, CHATS_COLLECTION), {
      ...chatData,
      createdAt: serverTimestamp(),
      unreadCount: {}
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating chat:', error);
    throw error;
  }
};

export const getUserChats = (userId: string, callback: (chats: FirebaseChat[]) => void): UnsubscribeFunction => {
  try {
    const q = query(
      collection(db, CHATS_COLLECTION),
      where('participants', 'array-contains', userId),
      orderBy('lastMessage.timestamp', 'desc')
    );

    return onSnapshot(q,
      (snapshot: QuerySnapshot) => {
        try {
          const chats: FirebaseChat[] = [];
          snapshot.forEach((doc) => {
            chats.push({ id: doc.id, ...doc.data() } as FirebaseChat);
          });
          callback(chats);
        } catch (error) {
          handleFirebaseError(error, 'getUserChats snapshot processing');
          callback([]);
        }
      },
      (error) => {
        handleFirebaseError(error, 'getUserChats snapshot listener');
        callback([]);
      }
    );
  } catch (error) {
    handleFirebaseError(error, 'getUserChats setup');
    return () => { }; // Return empty unsubscribe function
  }
};

export const getChatById = async (chatId: string): Promise<FirebaseChat | null> => {
  try {
    const docRef = doc(db, CHATS_COLLECTION, chatId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as FirebaseChat;
    }
    return null;
  } catch (error) {
    console.error('Error getting chat:', error);
    throw error;
  }
};

// Message Management
export const sendMessage = async (messageData: Omit<FirebaseMessage, 'id' | 'timestamp' | 'readBy'>): Promise<string> => {
  try {
    // Add message to messages collection
    const docRef = await addDoc(collection(db, MESSAGES_COLLECTION), {
      ...messageData,
      timestamp: serverTimestamp(),
      readBy: [messageData.senderId] // Sender has read their own message
    });

    // Update chat's last message
    const chatRef = doc(db, CHATS_COLLECTION, messageData.chatId);
    await updateDoc(chatRef, {
      'lastMessage.content': messageData.content,
      'lastMessage.senderId': messageData.senderId,
      'lastMessage.timestamp': serverTimestamp()
    });

    return docRef.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const getChatMessages = (
  chatId: string,
  limitCount: number = 50,
  callback: (messages: FirebaseMessage[]) => void
): UnsubscribeFunction => {
  try {
    const q = query(
      collection(db, MESSAGES_COLLECTION),
      where('chatId', '==', chatId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    return onSnapshot(q,
      (snapshot: QuerySnapshot) => {
        try {
          const messages: FirebaseMessage[] = [];
          snapshot.forEach((doc) => {
            messages.push({ id: doc.id, ...doc.data() } as FirebaseMessage);
          });
          // Reverse to show oldest first
          callback(messages.reverse());
        } catch (error) {
          handleFirebaseError(error, 'getChatMessages snapshot processing');
          callback([]);
        }
      },
      (error) => {
        handleFirebaseError(error, 'getChatMessages snapshot listener');
        callback([]);
      }
    );
  } catch (error) {
    handleFirebaseError(error, 'getChatMessages setup');
    return () => { }; // Return empty unsubscribe function
  }
};

export const markMessageAsRead = async (messageId: string, userId: string): Promise<void> => {
  try {
    const messageRef = doc(db, MESSAGES_COLLECTION, messageId);
    const messageDoc = await getDoc(messageRef);

    if (messageDoc.exists()) {
      const messageData = messageDoc.data() as FirebaseMessage;
      if (!messageData.readBy.includes(userId)) {
        await updateDoc(messageRef, {
          readBy: [...messageData.readBy, userId]
        });
      }
    }
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
};

export const editMessage = async (messageId: string, newContent: string): Promise<void> => {
  try {
    const messageRef = doc(db, MESSAGES_COLLECTION, messageId);
    await updateDoc(messageRef, {
      content: newContent,
      edited: true,
      editedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error editing message:', error);
    throw error;
  }
};

export const deleteMessage = async (messageId: string): Promise<void> => {
  try {
    const messageRef = doc(db, MESSAGES_COLLECTION, messageId);
    await deleteDoc(messageRef);
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

// User Presence
export const updateUserPresence = async (userId: string, isOnline: boolean): Promise<void> => {
  try {
    const presenceRef = doc(db, PRESENCE_COLLECTION, userId);
    await updateDoc(presenceRef, {
      isOnline,
      lastSeen: serverTimestamp()
    });
  } catch (error) {
    // If document doesn't exist, create it
    try {
      await addDoc(collection(db, PRESENCE_COLLECTION), {
        userId,
        isOnline,
        lastSeen: serverTimestamp()
      });
    } catch (createError) {
      console.error('Error updating user presence:', createError);
    }
  }
};

export const getUserPresence = (userId: string, callback: (presence: UserPresence | null) => void): UnsubscribeFunction => {
  const presenceRef = doc(db, PRESENCE_COLLECTION, userId);

  return onSnapshot(presenceRef, (doc) => {
    if (doc.exists()) {
      callback({ userId, ...doc.data() } as UserPresence);
    } else {
      callback(null);
    }
  });
};

// Utility functions
export const createDirectChat = async (userId1: string, userId2: string): Promise<string> => {
  // Check if direct chat already exists
  const q = query(
    collection(db, CHATS_COLLECTION),
    where('type', '==', 'direct'),
    where('participants', 'array-contains', userId1)
  );

  const querySnapshot = await getDocs(q);
  let existingChatId: string | null = null;

  querySnapshot.forEach((doc) => {
    const chatData = doc.data() as FirebaseChat;
    if (chatData.participants.includes(userId2)) {
      existingChatId = doc.id;
    }
  });

  if (existingChatId) {
    return existingChatId;
  }

  // Create new direct chat
  return await createChat({
    type: 'direct',
    participants: [userId1, userId2],
    createdBy: userId1
  });
};

export const addParticipantToChat = async (chatId: string, userId: string): Promise<void> => {
  try {
    const chatRef = doc(db, CHATS_COLLECTION, chatId);
    const chatDoc = await getDoc(chatRef);

    if (chatDoc.exists()) {
      const chatData = chatDoc.data() as FirebaseChat;
      if (!chatData.participants.includes(userId)) {
        await updateDoc(chatRef, {
          participants: [...chatData.participants, userId]
        });
      }
    }
  } catch (error) {
    console.error('Error adding participant to chat:', error);
    throw error;
  }
};

export const removeParticipantFromChat = async (chatId: string, userId: string): Promise<void> => {
  try {
    const chatRef = doc(db, CHATS_COLLECTION, chatId);
    const chatDoc = await getDoc(chatRef);

    if (chatDoc.exists()) {
      const chatData = chatDoc.data() as FirebaseChat;
      const updatedParticipants = chatData.participants.filter(id => id !== userId);
      await updateDoc(chatRef, {
        participants: updatedParticipants
      });
    }
  } catch (error) {
    console.error('Error removing participant from chat:', error);
    throw error;
  }
};
