import React, { useState, useEffect } from 'react';
import { FaPaperPlane } from 'react-icons/fa';
import { commentApi, type Comment as CommentType } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Comment from './Comment';
import UserAvatar from './UserAvatar';
import { toast } from 'react-toastify';

interface CommentSectionProps {
  contentId: string;
  initialCommentCount?: number;
  onCommentCountChange?: (count: number) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({
  contentId,
  initialCommentCount = 0,
  onCommentCountChange
}) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalComments, setTotalComments] = useState(initialCommentCount);

  // Load comments
  const loadComments = async (page = 1, append = false) => {
    setIsLoading(true);
    try {
      const response = await commentApi.getComments(contentId, page, 10);
      
      if (response.success) {
        const newComments = response.data || [];
        
        if (append) {
          setComments(prev => [...prev, ...newComments]);
        } else {
          setComments(newComments);
        }
        
        setHasMore(response.pagination?.hasNext || false);
        setTotalComments(response.pagination?.total || newComments.length);
        
        if (onCommentCountChange) {
          onCommentCountChange(response.pagination?.total || newComments.length);
        }
      }
    } catch (error) {
      toast.error('Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  };

  // Load more comments
  const loadMoreComments = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    loadComments(nextPage, true);
  };

  // Submit new comment
  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user) return;

    setIsSubmitting(true);
    try {
      const response = await commentApi.createComment(contentId, newComment.trim());
      
      if (response.success) {
        // Add new comment to the beginning of the list
        setComments(prev => [response.data, ...prev]);
        setNewComment('');
        setTotalComments(prev => prev + 1);
        
        if (onCommentCountChange) {
          onCommentCountChange(totalComments + 1);
        }
        
        toast.success('Comment posted successfully!');
      }
    } catch (error) {
      toast.error('Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle reply to comment
  const handleReply = async (parentCommentId: string, replyText: string) => {
    if (!user) return;

    try {
      const response = await commentApi.createComment(contentId, replyText, parentCommentId);
      
      if (response.success) {
        // Add reply to the parent comment
        setComments(prev => prev.map(comment => {
          if (comment._id === parentCommentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), response.data]
            };
          }
          return comment;
        }));
        
        setTotalComments(prev => prev + 1);
        
        if (onCommentCountChange) {
          onCommentCountChange(totalComments + 1);
        }
        
        toast.success('Reply posted successfully!');
      }
    } catch (error) {
      toast.error('Failed to post reply');
    }
  };

  // Handle edit comment
  const handleEdit = async (commentId: string, newText: string) => {
    try {
      const response = await commentApi.updateComment(commentId, newText);
      
      if (response.success) {
        // Update comment in the list
        setComments(prev => prev.map(comment => {
          if (comment._id === commentId) {
            return { ...comment, comment: newText };
          }
          // Check replies
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map(reply => 
                reply._id === commentId ? { ...reply, comment: newText } : reply
              )
            };
          }
          return comment;
        }));
        
        toast.success('Comment updated successfully!');
      }
    } catch (error) {
      toast.error('Failed to update comment');
    }
  };

  // Handle delete comment
  const handleDelete = async (commentId: string) => {
    try {
      const response = await commentApi.deleteComment(commentId);
      
      if (response.success) {
        // Remove comment from the list
        setComments(prev => {
          // Check if it's a top-level comment
          const filteredComments = prev.filter(comment => comment._id !== commentId);
          
          // If not found in top-level, check replies
          if (filteredComments.length === prev.length) {
            return prev.map(comment => ({
              ...comment,
              replies: comment.replies?.filter(reply => reply._id !== commentId) || []
            }));
          }
          
          return filteredComments;
        });
        
        setTotalComments(prev => prev - 1);
        
        if (onCommentCountChange) {
          onCommentCountChange(totalComments - 1);
        }
        
        toast.success('Comment deleted successfully!');
      }
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  // Handle vote on comment
  const handleVote = async (commentId: string, voteType: 'upvote' | 'downvote' | 'remove') => {
    try {
      const response = await commentApi.voteComment(commentId, voteType);
      
      if (response.success) {
        // Update vote counts in the comment
        setComments(prev => prev.map(comment => {
          if (comment._id === commentId) {
            return {
              ...comment,
              upvotes: response.data.upvotes,
              downvotes: response.data.downvotes
            };
          }
          // Check replies
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map(reply => 
                reply._id === commentId 
                  ? { ...reply, upvotes: response.data.upvotes, downvotes: response.data.downvotes }
                  : reply
              )
            };
          }
          return comment;
        }));
        
        toast.success(`Comment ${voteType}d!`);
      }
    } catch (error) {
      toast.error(`Failed to ${voteType} comment`);
    }
  };

  // Load comments on mount
  useEffect(() => {
    loadComments();
  }, [contentId]);

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment();
    }
  };

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      {user && (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex space-x-3">
            <UserAvatar user={user} sx={{ width: 40, height: 40 }} />
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Write a comment..."
                disabled={isSubmitting}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-500">
                  Press Enter to post, Shift+Enter for new line
                </span>
                <button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || isSubmitting}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <FaPaperPlane size={14} />
                  <span>{isSubmitting ? 'Posting...' : 'Post Comment'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comments Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Comments ({totalComments})
        </h3>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading && comments.length === 0 ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-500">Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          <>
            {comments.map((comment) => (
              <Comment
                key={comment._id}
                comment={comment}
                onReply={handleReply}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onVote={handleVote}
              />
            ))}
            
            {/* Load More Button */}
            {hasMore && (
              <div className="text-center">
                <button
                  onClick={loadMoreComments}
                  disabled={isLoading}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Loading...' : 'Load More Comments'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
