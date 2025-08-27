import React, { useState, useEffect } from 'react';
import { FaPlus, FaUsers, FaUserPlus } from 'react-icons/fa';
import Chat from '../components/Chat';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { chatApi, communityApi, userApi, type Chat as ChatType, type Community } from '../services/api';
import { toast } from 'react-toastify';

const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showCommunitiesModal, setShowCommunitiesModal] = useState(false);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newChatData, setNewChatData] = useState({
    type: 'direct' as 'direct' | 'group',
    participantEmail: '',
    groupName: '',
    groupDescription: ''
  });
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch communities
  const fetchCommunities = async () => {
    setIsLoading(true);
    try {
      const response = await communityApi.getAllCommunities({
        page: 1,
        limit: 20,
        search: searchQuery
      });
      if (response.success) {
        setCommunities(response.data);
      }
    } catch (error) {
      toast.error('Failed to load communities');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch users for direct chat
  const fetchUsers = async () => {
    try {
      const response = await userApi.getAllUsers(1, 50);
      if (response.success) {
        setUsers(response.data.filter((u: any) => u._id !== user?.id));
      }
    } catch (error) {
      toast.error('Failed to load users');
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchCommunities();
    fetchUsers();
  }, []);

  // Search communities
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchCommunities();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleCreateChat = async () => {
    if (!user) return;

    setIsCreating(true);
    try {
      if (newChatData.type === 'direct') {
        if (!newChatData.participantEmail.trim()) {
          toast.error('Please enter a participant email');
          return;
        }

        // Find user by email
        const participant = users.find(u => u.email === newChatData.participantEmail.trim());
        if (!participant) {
          toast.error(`User not found with email: ${newChatData.participantEmail.trim()}`);
          console.log('Available users:', users.map(u => ({ id: u._id, email: u.email })));
          return;
        }

        if (participant._id === user.id) {
          toast.error('You cannot create a chat with yourself');
          return;
        }

        console.log('Creating chat with participant:', participant);
        const response = await chatApi.createChat({
          participantIds: [participant._id],
          chatType: 'direct'
        });

        if (response.success) {
          toast.success('Direct chat created successfully!');
          // Close modal and reset form
          setShowNewChatModal(false);
          setNewChatData({
            type: 'direct',
            participantEmail: '',
            groupName: '',
            groupDescription: ''
          });
          // The Chat component will automatically refresh its chat list
        } else {
          toast.error(response.message || 'Failed to create chat');
        }
      } else {
        // Group chat creation
        if (!newChatData.groupName.trim()) {
          toast.error('Please enter a group name');
          return;
        }

        // For group chats, we'll add the creator as the only initial participant
        // In a real app, you'd have a user selection interface for group members
        const response = await chatApi.createChat({
          participantIds: [], // Backend will add the creator automatically
          chatType: 'group',
          chatName: newChatData.groupName,
          chatDescription: newChatData.groupDescription
        });

        if (response.success) {
          toast.success('Group chat created successfully!');
          // Close modal and reset form
          setShowNewChatModal(false);
          setNewChatData({
            type: 'direct',
            participantEmail: '',
            groupName: '',
            groupDescription: ''
          });
          // The Chat component will automatically refresh its chat list
        } else {
          toast.error(response.message || 'Failed to create group chat');
        }
      }
    } catch (error: any) {
      console.error('Error creating chat:', error);
      toast.error(error.message || 'Failed to create chat');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinCommunity = async (communityId: string) => {
    try {
      const response = await communityApi.joinCommunity(communityId);
      if (response.success) {
        toast.success('Successfully joined community!');
        fetchCommunities(); // Refresh communities
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to join community');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
              <p className="text-gray-600 mt-1">
                Connect and chat with your university community
              </p>
            </div>

            <button
              onClick={() => setShowNewChatModal(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaPlus className="w-4 h-4" />
              <span>New Chat</span>
            </button>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <Chat className="h-[600px]" />
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <FaUserPlus className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Start Direct Chat</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Connect directly with classmates, professors, or university staff for private conversations.
            </p>
            <button
              onClick={() => {
                setNewChatData(prev => ({ ...prev, type: 'direct' }));
                setShowNewChatModal(true);
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Start Chat →
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-green-100 rounded-full">
                <FaUsers className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Create Group</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Create group chats for study groups, project teams, or social circles.
            </p>
            <button
              onClick={() => {
                setNewChatData(prev => ({ ...prev, type: 'group' }));
                setShowNewChatModal(true);
              }}
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Create Group →
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <FaUsers className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Join Communities</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Join community chats based on your interests, courses, or departments.
            </p>
            <button
              onClick={() => setShowCommunitiesModal(true)}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              Browse Communities →
            </button>
          </div>
        </div>
      </div>

      {/* New Chat Modal */}
      <Modal
        openModal={showNewChatModal}
        closeModal={() => setShowNewChatModal(false)}
        title={newChatData.type === 'direct' ? 'Start Direct Chat' : 'Create Group Chat'}
        size="md"
      >
        <div className="space-y-4">
          {/* Chat Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chat Type
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="direct"
                  checked={newChatData.type === 'direct'}
                  onChange={(e) => setNewChatData(prev => ({ ...prev, type: e.target.value as 'direct' | 'group' }))}
                  className="mr-2"
                />
                Direct Chat
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="group"
                  checked={newChatData.type === 'group'}
                  onChange={(e) => setNewChatData(prev => ({ ...prev, type: e.target.value as 'direct' | 'group' }))}
                  className="mr-2"
                />
                Group Chat
              </label>
            </div>
          </div>

          {newChatData.type === 'direct' ? (
            <div>
              <Input
                text="Participant Email"
                type="email"
                value={newChatData.participantEmail}
                onChange={(e) => setNewChatData(prev => ({ ...prev, participantEmail: e.target.value }))}
                placeholder="Enter email address"
              />
              {users.length > 0 && (
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Or select from available users:
                  </label>
                  <div className="max-h-32 overflow-y-auto border rounded-md">
                    {users.map((user) => (
                      <div
                        key={user._id}
                        className="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                        onClick={() => setNewChatData(prev => ({ ...prev, participantEmail: user.email }))}
                      >
                        <div className="font-medium">{user.firstname} {user.lastname}</div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Input
                text="Group Name"
                value={newChatData.groupName}
                onChange={(e) => setNewChatData(prev => ({ ...prev, groupName: e.target.value }))}
                placeholder="Enter group name"
              />
              <Input
                text="Group Description (Optional)"
                value={newChatData.groupDescription}
                onChange={(e) => setNewChatData(prev => ({ ...prev, groupDescription: e.target.value }))}
                placeholder="Describe the purpose of this group"
              />
            </>
          )}

          <div className="flex space-x-3 pt-4">
            <div className="flex-1">
              <Button
                onClick={() => setShowNewChatModal(false)}
                styles="bg-gray-500 hover:bg-gray-600"
                loading={false}
              >
                Cancel
              </Button>
            </div>
            <div className="flex-1">
              <Button
                onClick={handleCreateChat}
                loading={isCreating}
                styles=""
              >
                {isCreating ? 'Creating...' : 'Create Chat'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Communities Modal */}
      <Modal
        openModal={showCommunitiesModal}
        closeModal={() => setShowCommunitiesModal(false)}
        title="Browse Communities"
        size="lg"
      >
        <div className="space-y-4">
          {/* Search */}
          <Input
            text="Search Communities"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or tags..."
          />

          {/* Communities List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="text-gray-600">Loading communities...</div>
              </div>
            ) : communities.length > 0 ? (
              <div className="space-y-3">
                {communities.map((community) => (
                  <div key={community._id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{community.name}</h3>
                        <p className="text-gray-600 text-sm mt-1">{community.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>{community.memberCount} members</span>
                          {community.tags.length > 0 && (
                            <div className="flex gap-1">
                              {community.tags.slice(0, 3).map((tag, index) => (
                                <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="ml-4">
                        <Button
                          onClick={() => handleJoinCommunity(community._id)}
                          styles="bg-green-600 hover:bg-green-700 text-sm px-4 py-2"
                          loading={false}
                        >
                          Join
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-500">No communities found</div>
                <p className="text-gray-400 text-sm mt-1">Try adjusting your search terms</p>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ChatPage;
