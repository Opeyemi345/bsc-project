import React, { useState } from 'react';
import { FaUserPlus, FaUserMinus, FaCrown, FaUser } from 'react-icons/fa';
import Modal from './Modal';
import Button from './Button';
import UserSearch from './UserSearch';
import { useAuth } from '../contexts/AuthContext';
import { chatApi, type Chat, type User } from '../services/api';
import { toast } from 'react-toastify';

interface GroupMemberManagerProps {
  chat: Chat;
  onChatUpdate: (updatedChat: Chat) => void;
  className?: string;
}

const GroupMemberManager: React.FC<GroupMemberManagerProps> = ({
  chat,
  onChatUpdate,
  className = ""
}) => {
  const { user } = useAuth();
  const [showAddMembersModal, setShowAddMembersModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Check if current user is admin
  const isAdmin = user && (
    chat.adminUsers?.some(admin => admin.id === user.id) || 
    chat.createdBy.id === user.id
  );

  const handleUserSelect = (selectedUser: User) => {
    setSelectedUsers(prev => [...prev, selectedUser]);
  };

  const handleUserDeselect = (deselectedUser: User) => {
    setSelectedUsers(prev => prev.filter(u => u.id !== deselectedUser.id));
  };

  const handleAddMembers = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one user to add');
      return;
    }

    setIsLoading(true);
    try {
      const response = await chatApi.addMembersToGroup(
        chat._id, 
        selectedUsers.map(u => u.id)
      );

      if (response.success) {
        toast.success(response.message || 'Members added successfully');
        onChatUpdate(response.data);
        setSelectedUsers([]);
        setShowAddMembersModal(false);
      } else {
        toast.error(response.message || 'Failed to add members');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to add members');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!window.confirm('Are you sure you want to remove this member?')) {
      return;
    }

    try {
      const response = await chatApi.removeMemberFromGroup(chat._id, memberId);
      
      if (response.success) {
        toast.success('Member removed successfully');
        onChatUpdate(response.data);
      } else {
        toast.error(response.message || 'Failed to remove member');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove member');
    }
  };

  const handleLeaveGroup = async () => {
    if (!user) return;
    
    if (!window.confirm('Are you sure you want to leave this group?')) {
      return;
    }

    try {
      const response = await chatApi.removeMemberFromGroup(chat._id, user.id);
      
      if (response.success) {
        toast.success('Left group successfully');
        // The parent component should handle navigation away from this chat
        onChatUpdate(response.data);
      } else {
        toast.error(response.message || 'Failed to leave group');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to leave group');
    }
  };

  // Get current participant IDs to exclude from search
  const participantIds = chat.participants?.map(p => p.id) || [];

  return (
    <div className={className}>
      {/* Group Members List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900">
            Members ({chat.participants?.length || 0})
          </h4>
          {isAdmin && (
            <button
              onClick={() => setShowAddMembersModal(true)}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
            >
              <FaUserPlus className="w-3 h-3" />
              <span>Add Members</span>
            </button>
          )}
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {chat.participants?.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  {member.avater ? (
                    <img
                      src={member.avater}
                      alt={member.firstname}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <FaUser className="w-4 h-4 text-gray-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {member.firstname} {member.lastname}
                  </p>
                  <p className="text-xs text-gray-500">@{member.username}</p>
                </div>
                {chat.createdBy.id === member.id && (
                  <FaCrown className="w-3 h-3 text-yellow-500" title="Group Creator" />
                )}
                {chat.adminUsers?.some(admin => admin.id === member.id) && 
                 chat.createdBy.id !== member.id && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Admin
                  </span>
                )}
              </div>

              {/* Remove member button (only for admins, can't remove creator) */}
              {isAdmin && 
               member.id !== chat.createdBy.id && 
               member.id !== user?.id && (
                <button
                  onClick={() => handleRemoveMember(member.id)}
                  className="text-red-600 hover:text-red-700 p-1"
                  title="Remove member"
                >
                  <FaUserMinus className="w-3 h-3" />
                </button>
              )}

              {/* Leave group button (for current user, except creator) */}
              {member.id === user?.id && 
               member.id !== chat.createdBy.id && (
                <button
                  onClick={handleLeaveGroup}
                  className="text-red-600 hover:text-red-700 text-xs"
                >
                  Leave
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Members Modal */}
      <Modal
        title="Add Members to Group"
        openModal={showAddMembersModal}
        closeModal={() => {
          setShowAddMembersModal(false);
          setSelectedUsers([]);
        }}
        size="md"
      >
        <div className="space-y-4">
          <UserSearch
            onUserSelect={handleUserSelect}
            onUserDeselect={handleUserDeselect}
            selectedUsers={selectedUsers}
            excludeUserIds={participantIds}
            placeholder="Search users to add..."
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              styles="bg-gray-500 hover:bg-gray-600"
              onClick={() => {
                setShowAddMembersModal(false);
                setSelectedUsers([]);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              loading={isLoading}
              onClick={handleAddMembers}
              disabled={selectedUsers.length === 0}
            >
              Add {selectedUsers.length} Member{selectedUsers.length !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GroupMemberManager;
