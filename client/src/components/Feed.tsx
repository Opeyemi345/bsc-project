import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import PostCard from './PostCard';
import CreatePost from './CreatePost';
import { contentApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Post {
  _id: string;
  title: string;
  content: string;
  media?: any[];
  tags?: string[];
  upvotes: number;
  downvotes: number;
  views: number;
  comments?: any[];
  userId: {
    _id: string;
    firstname: string;
    lastname: string;
    username: string;
    avater?: string;
  };
  createdAt: string;
  updatedAt: string;
}

const Feed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useAuth();

  const fetchPosts = async (pageNum: number = 1, append: boolean = false) => {
    try {
      setIsLoading(true);
      const response = await contentApi.getAllContent({
        page: pageNum,
        limit: 10,
        sortBy: 'createdAt'
      });

      if (response.success && response.data) {
        if (append) {
          setPosts(prev => [...prev, ...response.data]);
        } else {
          setPosts(response.data);
        }

        // Check if there are more posts
        setHasMore(response.pagination?.hasNext || false);
      }
    } catch (error) {
      toast.error('Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePostCreated = () => {
    setShowCreatePost(false);
    setPage(1);
    setHasMore(true);
    fetchPosts(1, false); // Refresh the feed
  };

  const handleUpvote = async (postId: string) => {
    try {
      const response = await contentApi.voteContent(postId, 'upvote');
      if (response.success) {
        // Update the post in the local state
        setPosts(prev => prev.map(post =>
          post._id === postId
            ? { ...post, upvotes: response.data.upvotes, downvotes: response.data.downvotes }
            : post
        ));
        toast.success('Post upvoted!');
      }
    } catch (error) {
      toast.error('Failed to upvote post');
    }
  };

  const handleComment = (postId: string) => {
    // Navigate to post detail page with comments section
    window.location.href = `/post/${postId}#comments`;
  };

  const handleShare = (postId: string) => {
    // TODO: Implement share functionality
    const post = posts.find(p => p._id === postId);
    if (post) {
      const shareUrl = `${window.location.origin}/post/${postId}`;
      navigator.clipboard.writeText(shareUrl);
      toast.success('Post link copied to clipboard!');
    }
  };

  const loadMorePosts = () => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage, true);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6">
      {/* Create Post Button */}
      <div className="mb-6">
        {!showCreatePost ? (
          <div className="bg-white rounded-lg shadow-md p-4">
            <button
              onClick={() => setShowCreatePost(true)}
              className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span className="text-gray-500">What's on your mind, {user?.firstname}?</span>
            </button>
          </div>
        ) : (
          <CreatePost
            onPostCreated={handlePostCreated}
            onCancel={() => setShowCreatePost(false)}
          />
        )}
      </div>

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.length === 0 && !isLoading ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">No posts yet</div>
            <p className="text-gray-400">Be the first to share something!</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onUpvote={handleUpvote}
              onComment={handleComment}
              onShare={handleShare}
              currentUserId={user?.id}
            />
          ))
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-500">Loading posts...</p>
          </div>
        )}

        {/* Load More Button */}
        {!isLoading && hasMore && posts.length > 0 && (
          <div className="text-center py-6">
            <button
              onClick={loadMorePosts}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Load More Posts
            </button>
          </div>
        )}

        {/* End of posts message */}
        {!hasMore && posts.length > 0 && (
          <div className="text-center py-6">
            <p className="text-gray-500">You've reached the end of the feed!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
