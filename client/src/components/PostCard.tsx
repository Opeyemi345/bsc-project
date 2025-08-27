import React, { useState } from 'react';
import { FaHeart, FaComment, FaShare, FaEllipsisV, FaPaperPlane } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { commentApi } from '../services/api';
import { toast } from 'react-toastify';
import UserAvatar from './UserAvatar';

interface Media {
  url: string;
  type: 'image' | 'video' | 'file';
  filename?: string;
  size?: number;
}

interface User {
  _id: string;
  firstname: string;
  lastname: string;
  username: string;
  avater?: string;
}

interface PostData {
  _id: string;
  title: string;
  content: string;
  media?: Media[];
  tags?: string[];
  upvotes: number;
  downvotes: number;
  views: number;
  comments?: any[];
  userId: User;
  createdAt: string;
  updatedAt: string;
}

interface PostCardProps {
  post: PostData;
  onUpvote?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onEdit?: (postId: string) => void;
  onDelete?: (postId: string) => void;
  currentUserId?: string;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  onUpvote,
  onComment,
  onShare,
  onEdit,
  onDelete,
  currentUserId
}) => {
  const { user } = useAuth();
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [localCommentCount, setLocalCommentCount] = useState(post.comments?.length || 0);

  const isOwner = currentUserId === post.userId._id;

  const handleUpvote = () => {
    if (onUpvote) {
      onUpvote(post._id);
    }
  };

  const handleComment = () => {
    if (onComment) {
      onComment(post._id);
    } else {
      // Toggle inline comment form
      setShowCommentForm(!showCommentForm);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !user) return;

    setIsSubmittingComment(true);
    try {
      const response = await commentApi.createComment(post._id, commentText.trim());

      if (response.success) {
        setCommentText('');
        setShowCommentForm(false);
        setLocalCommentCount(prev => prev + 1);
        toast.success('Comment posted successfully!');
      }
    } catch (error) {
      toast.error('Failed to post comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment();
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare(post._id);
    }
  };

  const renderMedia = () => {
    if (!post.media || post.media.length === 0) return null;

    return (
      <div className="mt-3">
        {post.media.map((item, index) => (
          <div key={index} className="mb-2">
            {item.type === 'image' && (
              <img
                src={item.url}
                alt={item.filename || 'Post image'}
                className="w-full max-h-96 object-cover rounded-lg"
              />
            )}
            {item.type === 'video' && (
              <video
                src={item.url}
                controls
                className="w-full max-h-96 rounded-lg"
              >
                Your browser does not support the video tag.
              </video>
            )}
            {item.type === 'file' && (
              <div className="p-3 border border-gray-300 rounded-lg bg-gray-50">
                <p className="text-sm text-gray-600">
                  📎 {item.filename || 'File attachment'}
                </p>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  Download
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
            {post.userId.avater ? (
              <img
                src={post.userId.avater}
                alt={`${post.userId.firstname} ${post.userId.lastname}`}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <span className="text-gray-600 font-semibold">
                {post.userId.firstname[0]}{post.userId.lastname[0]}
              </span>
            )}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">
              {post.userId.firstname} {post.userId.lastname}
            </h4>
            <p className="text-sm text-gray-500">
              @{post.userId.username} • {formatDistanceToNow(new Date(post.createdAt))} ago
            </p>
          </div>
        </div>

        {isOwner && (
          <div className="relative">
            <button className="text-gray-500 hover:text-gray-700">
              <FaEllipsisV />
            </button>
            {/* Dropdown menu would go here */}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
        <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Media */}
        {renderMedia()}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
        <span>{post.upvotes} upvotes</span>
        <span>{post.views} views</span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <button
          onClick={handleUpvote}
          className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
        >
          <FaHeart />
          <span>Upvote</span>
        </button>

        <button
          onClick={handleComment}
          className={`flex items-center space-x-2 transition-colors ${showCommentForm
            ? 'text-blue-600'
            : 'text-gray-600 hover:text-blue-600'
            }`}
        >
          <FaComment />
          <span>{localCommentCount} Comments</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors"
        >
          <FaShare />
          <span>Share</span>
        </button>
      </div>

      {/* Inline Comment Form */}
      {showCommentForm && user && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex space-x-3">
            <UserAvatar user={user} sx={{ width: 32, height: 32 }} />
            <div className="flex-1">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                placeholder="Write a comment..."
                disabled={isSubmittingComment}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">
                  Press Enter to post, Shift+Enter for new line
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setShowCommentForm(false);
                      setCommentText('');
                    }}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitComment}
                    disabled={!commentText.trim() || isSubmittingComment}
                    className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <FaPaperPlane size={12} />
                    <span>{isSubmittingComment ? 'Posting...' : 'Post'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
