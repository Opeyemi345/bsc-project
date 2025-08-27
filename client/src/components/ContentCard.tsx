import React, { useState } from 'react';
import { Link } from 'react-router';
import { FaThumbsUp, FaThumbsDown, FaComment, FaEye, FaShare } from 'react-icons/fa';
import { type Content } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { contentApi } from '../services/api';
import { toast } from 'react-toastify';

interface ContentCardProps {
  content: Content;
  onVote?: (contentId: string, voteType: 'upvote' | 'downvote' | 'remove') => void;
  showFullContent?: boolean;
}

const ContentCard: React.FC<ContentCardProps> = ({
  content,
  onVote,
  showFullContent = false
}) => {
  const { user, isAuthenticated } = useAuth();
  const [isVoting, setIsVoting] = useState(false);
  const [localUpvotes, setLocalUpvotes] = useState(content.upvotes);
  const [localDownvotes, setLocalDownvotes] = useState(content.downvotes);

  const handleVote = async (voteType: 'upvote' | 'downvote' | 'remove') => {
    if (!isAuthenticated) {
      toast.error('Please login to vote');
      return;
    }

    setIsVoting(true);
    try {
      const response = await contentApi.voteContent(content._id, voteType);
      if (response.success) {
        setLocalUpvotes(response.data.upvotes);
        setLocalDownvotes(response.data.downvotes);
        if (onVote) {
          onVote(content._id, voteType);
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to vote');
    } finally {
      setIsVoting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateContent = (text: string, maxLength: number = 200) => {
    if (showFullContent || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={content.userId.avatar || '/default-avatar.png'}
            alt={`${content.userId.firstname} ${content.userId.lastname}`}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <Link
              to={`/user/${content.userId.id}`}
              className="font-semibold text-gray-900 hover:text-blue-600"
            >
              {content.userId.firstname} {content.userId.lastname}
            </Link>
            <p className="text-sm text-gray-500">@{content.userId.username}</p>
          </div>
        </div>
        <span className="text-sm text-gray-500">{formatDate(content.createdAt)}</span>
      </div>

      {/* Content */}
      <div className="mb-4">
        <Link to={`/post/${content._id}`}>
          <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600">
            {content.title}
          </h3>
        </Link>
        <p className="text-gray-700 leading-relaxed">
          {truncateContent(content.content)}
        </p>
        {!showFullContent && content.content.length > 200 && (
          <Link
            to={`/post/${content._id}`}
            className="text-blue-600 hover:underline text-sm mt-2 inline-block"
          >
            Read more
          </Link>
        )}
      </div>

      {/* Tags */}
      {content.tags && content.tags.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {content.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Media */}
      {content.media && content.media.length > 0 && (
        <div className="mb-4">
          <div className="grid grid-cols-2 gap-2">
            {content.media.slice(0, 4).map((media, index) => (
              <div key={index} className="relative">
                {media.type === 'image' ? (
                  <img
                    src={media.url}
                    alt={media.filename}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ) : media.type === 'video' ? (
                  <video
                    src={media.url}
                    className="w-full h-32 object-cover rounded-lg"
                    controls
                  />
                ) : (
                  <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500 text-sm">{media.filename}</span>
                  </div>
                )}
                {content.media.length > 4 && index === 3 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                    <span className="text-white font-semibold">
                      +{content.media.length - 4} more
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-6">
          {/* Upvote */}
          <button
            onClick={() => handleVote('upvote')}
            disabled={isVoting}
            className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors"
          >
            <FaThumbsUp className="w-4 h-4" />
            <span>{localUpvotes}</span>
          </button>

          {/* Downvote */}
          <button
            onClick={() => handleVote('downvote')}
            disabled={isVoting}
            className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
          >
            <FaThumbsDown className="w-4 h-4" />
            <span>{localDownvotes}</span>
          </button>

          {/* Comments */}
          <Link
            to={`/post/${content._id}#comments`}
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <FaComment className="w-4 h-4" />
            <span>{content.comments?.length || 0}</span>
          </Link>

          {/* Views */}
          <div className="flex items-center space-x-2 text-gray-600">
            <FaEye className="w-4 h-4" />
            <span>{content.views}</span>
          </div>
        </div>

        {/* Share */}
        <button
          onClick={() => {
            navigator.clipboard.writeText(`${window.location.origin}/post/${content._id}`);
            toast.success('Link copied to clipboard!');
          }}
          className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
        >
          <FaShare className="w-4 h-4" />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
};

export default ContentCard;
