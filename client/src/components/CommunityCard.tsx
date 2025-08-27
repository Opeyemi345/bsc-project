import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { FaUsers, FaLock, FaGlobe } from 'react-icons/fa';
import { type Community } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { communityApi } from '../services/api';
import { toast } from 'react-toastify';

interface CommunityCardProps {
  community: Community;
  onJoin?: (communityId: string) => void;
  onLeave?: (communityId: string) => void;
  showJoinButton?: boolean;
}

const CommunityCard: React.FC<CommunityCardProps> = ({
  community,
  onJoin,
  onLeave,
  showJoinButton = true
}) => {
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isMember, setIsMember] = useState(
    user ? community.members.some(member => member._id === user.id) : false
  );

  // Update membership state when community or user changes
  useEffect(() => {
    setIsMember(user ? community.members.some(member => member._id === user.id) : false);
  }, [community.members, user]);

  const handleJoinLeave = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to join communities');
      return;
    }

    setIsLoading(true);
    try {
      if (isMember) {
        const response = await communityApi.leaveCommunity(community._id);
        if (response.success) {
          setIsMember(false);
          toast.success('Left community successfully');
          if (onLeave) onLeave(community._id);
        }
      } else {
        const response = await communityApi.joinCommunity(community._id);
        if (response.success) {
          setIsMember(true);
          toast.success(response.message || 'Joined community successfully');
          if (onJoin) onJoin(community._id);
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to join/leave community');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateDescription = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Banner */}
      {community.banner && (
        <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative">
          <img
            src={community.banner}
            alt={`${community.name} banner`}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {community.avatar ? (
              <img
                src={community.avatar}
                alt={`${community.name} avatar`}
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                {community.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <Link
                to={`/community/${community._id}`}
                className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
              >
                {community.name}
              </Link>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                {community.isPrivate ? (
                  <FaLock className="w-3 h-3" />
                ) : (
                  <FaGlobe className="w-3 h-3" />
                )}
                <span>{community.isPrivate ? 'Private' : 'Public'}</span>
              </div>
            </div>
          </div>

          {/* Privacy indicator */}
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <span>Created {formatDate(community.createdAt)}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-700 mb-4 leading-relaxed">
          {truncateDescription(community.description)}
        </p>

        {/* Tags */}
        {community.tags && community.tags.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {community.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
              {community.tags.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{community.tags.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-gray-600">
              <FaUsers className="w-4 h-4" />
              <span className="text-sm font-medium">{community.memberCount}</span>
              <span className="text-sm">members</span>
            </div>
          </div>

          {/* Organizer */}
          <div className="text-xs text-gray-500">
            by{' '}
            <Link
              to={`/user/${community.organizer.id}`}
              className="text-blue-600 hover:underline"
            >
              @{community.organizer.username}
            </Link>
          </div>
        </div>

        {/* Action Button */}
        {showJoinButton && isAuthenticated && user?.id !== community.organizer.id && (
          <button
            onClick={handleJoinLeave}
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${isMember
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'bg-blue-600 text-white hover:bg-blue-700'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Loading...' : isMember ? 'Leave Community' : 'Join Community'}
          </button>
        )}

        {/* View Community Button for non-authenticated users */}
        {!isAuthenticated && (
          <Link
            to={`/community/${community._id}`}
            className="block w-full py-2 px-4 bg-gray-100 text-gray-700 text-center rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            View Community
          </Link>
        )}

        {/* Owner indicator */}
        {isAuthenticated && user?.id === community.organizer.id && (
          <div className="w-full py-2 px-4 bg-green-100 text-green-700 text-center rounded-lg font-medium">
            You own this community
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityCard;
