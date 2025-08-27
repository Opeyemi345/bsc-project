import React, { useState } from 'react';
import { FaThumbsUp, FaThumbsDown, FaReply, FaEdit, FaTrash, FaEllipsisV } from 'react-icons/fa';
import { type Comment as CommentType } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import UserAvatar from './UserAvatar';
import { toast } from 'react-toastify';

interface CommentProps {
  comment: CommentType;
  onReply?: (commentId: string, replyText: string) => void;
  onEdit?: (commentId: string, newText: string) => void;
  onDelete?: (commentId: string) => void;
  onVote?: (commentId: string, voteType: 'upvote' | 'downvote' | 'remove') => void;
  depth?: number;
  maxDepth?: number;
}

const Comment: React.FC<CommentProps> = ({
  comment,
  onReply,
  onEdit,
  onDelete,
  onVote,
  depth = 0,
  maxDepth = 3
}) => {
  const { user } = useAuth();
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [editText, setEditText] = useState(comment.comment);
  const [showReplies, setShowReplies] = useState(false);

  const isOwner = user?.id === comment.userId._id;
  const canReply = depth < maxDepth;

  const handleReply = () => {
    if (replyText.trim() && onReply) {
      onReply(comment._id, replyText.trim());
      setReplyText('');
      setIsReplying(false);
      setShowReplies(true);
    }
  };

  const handleEdit = () => {
    if (editText.trim() && onEdit) {
      onEdit(comment._id, editText.trim());
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      if (onDelete) {
        onDelete(comment._id);
      }
    }
  };

  const handleVote = (voteType: 'upvote' | 'downvote') => {
    if (onVote) {
      onVote(comment._id, voteType);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className={`${depth > 0 ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''}`}>
      <div className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-100">
        {/* Comment Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <UserAvatar 
              user={comment.userId} 
              sx={{ width: 32, height: 32 }} 
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900">
                  {comment.userId.firstname} {comment.userId.lastname}
                </span>
                <span className="text-sm text-gray-500">
                  @{comment.userId.username}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {formatTimeAgo(comment.createdAt)}
              </span>
            </div>
          </div>

          {/* Menu */}
          {isOwner && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <FaEllipsisV size={12} />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <FaEdit size={12} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => {
                      handleDelete();
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <FaTrash size={12} />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Comment Content */}
        <div className="mb-3">
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Edit your comment..."
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleEdit}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditText(comment.comment);
                  }}
                  className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-800 whitespace-pre-wrap">{comment.comment}</p>
          )}
        </div>

        {/* Comment Actions */}
        <div className="flex items-center space-x-4 text-sm">
          {/* Vote buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleVote('upvote')}
              className="flex items-center space-x-1 text-gray-500 hover:text-green-600 transition-colors"
            >
              <FaThumbsUp size={14} />
              <span>{comment.upvotes || 0}</span>
            </button>
            <button
              onClick={() => handleVote('downvote')}
              className="flex items-center space-x-1 text-gray-500 hover:text-red-600 transition-colors"
            >
              <FaThumbsDown size={14} />
              <span>{comment.downvotes || 0}</span>
            </button>
          </div>

          {/* Reply button */}
          {canReply && user && (
            <button
              onClick={() => setIsReplying(!isReplying)}
              className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors"
            >
              <FaReply size={14} />
              <span>Reply</span>
            </button>
          )}

          {/* Show replies button */}
          {comment.replies && comment.replies.length > 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              {showReplies ? 'Hide' : 'Show'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
            </button>
          )}
        </div>

        {/* Reply Form */}
        {isReplying && (
          <div className="mt-4 space-y-2">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
              placeholder="Write a reply..."
            />
            <div className="flex space-x-2">
              <button
                onClick={handleReply}
                disabled={!replyText.trim()}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Reply
              </button>
              <button
                onClick={() => {
                  setIsReplying(false);
                  setReplyText('');
                }}
                className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Replies */}
      {showReplies && comment.replies && comment.replies.length > 0 && (
        <div className="space-y-2">
          {comment.replies.map((reply) => (
            <Comment
              key={reply._id}
              comment={reply}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              onVote={onVote}
              depth={depth + 1}
              maxDepth={maxDepth}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Comment;
