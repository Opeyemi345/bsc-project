import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { FaArrowLeft, FaThumbsUp, FaThumbsDown, FaEye, FaShare } from 'react-icons/fa';
import { contentApi,type Content } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import UserAvatar from '../../components/UserAvatar';
import CommentSection from '../../components/CommentSection';
import { toast } from 'react-toastify';

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState<Content | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [commentCount, setCommentCount] = useState(0);

  // Load post details
  const loadPost = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const response = await contentApi.getContentById(id);
      
      if (response.success) {
        setPost(response.data);
        setCommentCount(response.data.comments?.length || 0);
      } else {
        toast.error('Post not found');
        navigate('/');
      }
    } catch (error) {
      toast.error('Failed to load post');
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle vote
  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!post || !user) return;

    try {
      const response = await contentApi.voteContent(post._id, voteType);
      
      if (response.success) {
        setPost(prev => prev ? {
          ...prev,
          upvotes: response.data.upvotes,
          downvotes: response.data.downvotes
        } : null);
        
        toast.success(`Post ${voteType}d!`);
      }
    } catch (error) {
      toast.error(`Failed to ${voteType} post`);
    }
  };

  // Handle share
  const handleShare = () => {
    if (!post) return;
    
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render media
  const renderMedia = () => {
    if (!post?.media || post.media.length === 0) return null;

    return (
      <div className="mt-4 space-y-4">
        {post.media.map((item, index) => (
          <div key={index} className="rounded-lg overflow-hidden">
            {item.type === 'image' ? (
              <img
                src={item.url}
                alt={item.filename}
                className="w-full h-auto max-h-96 object-cover"
              />
            ) : item.type === 'video' ? (
              <video
                src={item.url}
                controls
                className="w-full h-auto max-h-96"
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="p-4 bg-gray-100 rounded-lg">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  📎 {item.filename}
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  useEffect(() => {
    loadPost();
  }, [id]);

  // Scroll to comments if hash is present
  useEffect(() => {
    if (window.location.hash === '#comments') {
      setTimeout(() => {
        const commentsSection = document.getElementById('comments');
        if (commentsSection) {
          commentsSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
    }
  }, [post]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Post not found</h1>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <FaArrowLeft />
            <span>Back</span>
          </button>
        </div>

        {/* Post Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          {/* Post Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <UserAvatar user={post.userId} sx={{ width: 48, height: 48 }} />
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-gray-900">
                    {post.userId.firstname} {post.userId.lastname}
                  </h3>
                  <span className="text-gray-500">@{post.userId.username}</span>
                </div>
                <p className="text-sm text-gray-500">{formatDate(post.createdAt)}</p>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h1>
            
            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
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
          </div>

          {/* Post Body */}
          <div className="p-6">
            <div className="prose max-w-none mb-6">
              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                {post.content}
              </p>
            </div>

            {/* Media */}
            {renderMedia()}

            {/* Post Stats */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-6">
                {/* Upvote */}
                <button
                  onClick={() => handleVote('upvote')}
                  className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors"
                >
                  <FaThumbsUp />
                  <span>{post.upvotes}</span>
                </button>

                {/* Downvote */}
                <button
                  onClick={() => handleVote('downvote')}
                  className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
                >
                  <FaThumbsDown />
                  <span>{post.downvotes}</span>
                </button>

                {/* Comments */}
                <div className="flex items-center space-x-2 text-gray-600">
                  <span>💬</span>
                  <span>{commentCount} comments</span>
                </div>

                {/* Views */}
                <div className="flex items-center space-x-2 text-gray-600">
                  <FaEye />
                  <span>{post.views} views</span>
                </div>
              </div>

              {/* Share */}
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <FaShare />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div id="comments">
          <CommentSection
            contentId={post._id}
            initialCommentCount={commentCount}
            onCommentCountChange={setCommentCount}
          />
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
