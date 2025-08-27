import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaPaperPlane, FaSmile, FaPaperclip, FaPhone, FaVideo, FaEllipsisV, FaCircle, FaUsers } from 'react-icons/fa';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { chatApi, type Chat as ChatType, type Message } from '../services/api';
import { toast } from 'react-toastify';
import Modal from './Modal';
import GroupMemberManager from './GroupMemberManager';

interface ChatProps {
  className?: string;
}

const Chat: React.FC<ChatProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [chats, setChats] = useState<ChatType[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatType | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showGroupMembersModal, setShowGroupMembersModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load user's chats
  const loadChats = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const response = await chatApi.getUserChats();
      if (response.success) {
        setChats(response.data);

        // If no chat is selected and there are chats, select the first one
        if (!selectedChat && response.data.length > 0) {
          setSelectedChat(response.data[0]);
        }
      }
    } catch (error) {
      console.error('Error loading chats:', error);
      toast.error('Failed to load chats');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, selectedChat]);

  useEffect(() => {
    loadChats();
  }, [user]);

  // Periodically refresh chats to pick up new ones
  useEffect(() => {
    if (!user?.id) return;

    const interval = setInterval(() => {
      loadChats();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [user, loadChats]);

  // Load messages for selected chat
  const loadMessages = useCallback(async () => {
    if (!selectedChat?._id) return;

    setIsLoading(true);
    try {
      const response = await chatApi.getChatById(selectedChat._id);
      if (response.success) {
        setMessages(response.data.messages || []);

        // Mark messages as read
        await chatApi.markMessagesAsRead(selectedChat._id);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  }, [selectedChat?._id]);

  useEffect(() => {
    loadMessages();
  }, [selectedChat, loadMessages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat?._id || !user) return;

    setIsLoading(true);
    try {
      const response = await chatApi.sendMessage(selectedChat._id, {
        content: newMessage.trim(),
        messageType: 'text'
      });

      if (response.success) {
        setNewMessage('');
        // Reload messages to show the new message
        loadMessages();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleChatUpdate = (updatedChat: ChatType) => {
    // Update the selected chat
    setSelectedChat(updatedChat);

    // Update the chat in the chats list
    setChats(prevChats =>
      prevChats.map(chat =>
        chat._id === updatedChat._id ? updatedChat : chat
      )
    );
  };

  const formatMessageTime = (timestamp: string) => {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    return format(date, 'HH:mm');
  };

  const getChatName = (chat: ChatType) => {
    if (chat.chatType === 'group') {
      return chat.chatName || 'Group Chat';
    }

    // For direct chats, show the other participant's name
    const otherParticipant = chat.participants.find(p => p.id !== user?.id);
    return otherParticipant ? `${otherParticipant.firstname} ${otherParticipant.lastname}` : 'Direct Chat';
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Please log in to access chat</p>
      </div>
    );
  }

  return (
    <div className={`flex h-96 bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Chat List */}
      <div className="w-1/3 border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Messages</h3>
        </div>

        <div className="overflow-y-auto h-full">
          {chats.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p>No conversations yet</p>
              <p className="text-sm mt-1">Start a new chat to begin messaging</p>
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat._id}
                onClick={() => setSelectedChat(chat)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${selectedChat?._id === chat._id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {getChatName(chat).charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {chat.chatType === 'direct' && (
                      <div className="absolute -bottom-1 -right-1">
                        <FaCircle
                          className="w-3 h-3 text-gray-400"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {getChatName(chat)}
                    </p>
                    {chat.lastMessage && (
                      <p className="text-xs text-gray-500 truncate">
                        {chat.lastMessage.content}
                      </p>
                    )}
                  </div>

                  {chat.lastMessage && (
                    <div className="text-xs text-gray-400">
                      {formatMessageTime(chat.lastMessage.timestamp)}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {getChatName(selectedChat).charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    {getChatName(selectedChat)}
                  </h4>
                  {selectedChat.chatType === 'direct' ? (
                    <p className="text-xs text-gray-500">
                      Active
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500">
                      {selectedChat.participants?.length || 0} members
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {selectedChat.chatType === 'group' && (
                  <button
                    onClick={() => setShowGroupMembersModal(true)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                    title="Manage Members"
                  >
                    <FaUsers className="w-4 h-4" />
                  </button>
                )}
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                  <FaPhone className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                  <FaVideo className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                  <FaEllipsisV className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`flex ${message.senderId.id === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.senderId.id === user?.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800'
                      }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${message.senderId.id === user?.id ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                      {formatMessageTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                  <FaPaperclip className="w-4 h-4" />
                </button>

                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type a message..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                </div>

                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                  <FaSmile className="w-4 h-4" />
                </button>

                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isLoading}
                  className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaPaperPlane className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* Group Members Modal */}
      {selectedChat?.chatType === 'group' && (
        <Modal
          title={`Manage Members - ${selectedChat.chatName}`}
          openModal={showGroupMembersModal}
          closeModal={() => setShowGroupMembersModal(false)}
          size="md"
        >
          <GroupMemberManager
            chat={selectedChat}
            onChatUpdate={handleChatUpdate}
          />
        </Modal>
      )}
    </div>
  );
};

export default Chat;
