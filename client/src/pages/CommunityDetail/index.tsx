import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { toast } from 'react-toastify';
import { 
  FaUsers, 
  FaLock, 
  FaGlobe, 
  FaEdit, 
  FaTrash, 
  FaPlus, 
  FaCog,
  FaArrowLeft,
  FaUserPlus,
  FaUserMinus,
  FaEye,
  FaHeart,
  FaComment
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { communityApi, contentApi, type Community, type Content } from '../../services/api';
import UserAvatar from '../../components/UserAvatar';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Input, { MultilineInput } from '../../components/Input';

const CommunityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPostsLoading, setIsPostsLoading] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'members' | 'about'>('posts');
  
  // Modals
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showEditCommunity, setShowEditCommunity] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Forms
  const [postForm, setPostForm] = useState({
    title: '',
    content: '',
    tags: ''
  });
  
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    rules: [] as string[],
    isPrivate: false
  });

  // Load community data
  const loadCommunity = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const response = await communityApi.getCommunityById(id);
      
      if (response.success) {
        setCommunity(response.data);
        setIsMember(user ? response.data.members.some(member => member._id === user.id) : false);
        setEditForm({
          name: response.data.name,
          description: response.data.description,
          rules: response.data.rules || [],
          isPrivate: response.data.isPrivate
        });
      } else {
        toast.error('Community not found');
        navigate('/community');
      }
    } catch (error) {
      toast.error('Failed to load community');
      navigate('/community');
    } finally {
      setIsLoading(false);
    }
  };

  // Load community posts
  const loadPosts = async () => {
    if (!id) return;
    
    setIsPostsLoading(true);
    try {
      const response = await contentApi.getAllContent({
        communityId: id,
        page: 1,
        limit: 20,
        sortBy: 'createdAt'
      });
      
      if (response.success) {
        setPosts(response.data);
      }
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setIsPostsLoading(false);
    }
  };

  useEffect(() => {
    loadCommunity();
  }, [id, user]);

  useEffect(() => {
    if (community && activeTab === 'posts') {
      loadPosts();
    }
  }, [community, activeTab]);

  // Handle join/leave community
  const handleJoinLeave = async () => {
    if (!community || !isAuthenticated) return;
    
    setIsJoining(true);
    try {
      if (isMember) {
        const response = await communityApi.leaveCommunity(community._id);
        if (response.success) {
          setIsMember(false);
          setCommunity(prev => prev ? {
            ...prev,
            memberCount: Math.max(0, prev.memberCount - 1),
            members: prev.members.filter(member => member._id !== user?.id)
          } : null);
          toast.success('Successfully left the community');
        }
      } else {
        const response = await communityApi.joinCommunity(community._id);
        if (response.success) {
          setIsMember(true);
          setCommunity(prev => prev ? {
            ...prev,
            memberCount: prev.memberCount + 1,
            members: user ? [...prev.members, user] : prev.members
          } : null);
          toast.success('Successfully joined the community');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update membership');
    } finally {
      setIsJoining(false);
    }
  };

  // Handle create post
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!postForm.title.trim() || !postForm.content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const tags = postForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      const response = await contentApi.createContent({
        title: postForm.title,
        content: postForm.content,
        tags,
        communityId: community?._id,
        isPublic: !community?.isPrivate
      });

      if (response.success) {
        toast.success('Post created successfully!');
        setPostForm({ title: '', content: '', tags: '' });
        setShowCreatePost(false);
        loadPosts(); // Reload posts
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create post');
    }
  };

  // Handle edit community
  const handleEditCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!community) return;

    try {
      const response = await communityApi.updateCommunity(community._id, {
        name: editForm.name,
        description: editForm.description,
        rules: editForm.rules,
        isPrivate: editForm.isPrivate
      });

      if (response.success) {
        setCommunity(response.data);
        setShowEditCommunity(false);
        toast.success('Community updated successfully!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update community');
    }
  };

  // Handle delete community
  const handleDeleteCommunity = async () => {
    if (!community) return;

    try {
      const response = await communityApi.deleteCommunity(community._id);
      
      if (response.success) {
        toast.success('Community deleted successfully');
        navigate('/community');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete community');
    }
  };

  const isOrganizer = user && community && community.organizer._id === user.id;
  const canPost = isAuthenticated && (isMember || isOrganizer);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-xl">Loading community...</div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-xl text-gray-500">Community not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/community')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <FaArrowLeft />
          <span>Back to Communities</span>
        </button>

        {/* Community Banner */}
        {community.banner && (
          <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg mb-6 relative overflow-hidden">
            <img
              src={community.banner}
              alt={`${community.name} banner`}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Community Info */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              {/* Avatar */}
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-2xl font-bold">
                {community.avatar ? (
                  <img
                    src={community.avatar}
                    alt={community.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  community.name.charAt(0).toUpperCase()
                )}
              </div>

              {/* Details */}
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{community.name}</h1>
                  {community.isPrivate ? (
                    <FaLock className="text-gray-500" />
                  ) : (
                    <FaGlobe className="text-green-500" />
                  )}
                </div>
                
                <p className="text-gray-700 mb-4">{community.description}</p>
                
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <span className="flex items-center space-x-1">
                    <FaUsers />
                    <span>{community.memberCount} members</span>
                  </span>
                  <span>{community.isPrivate ? 'Private' : 'Public'} community</span>
                  <span>Created {new Date(community.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              {isOrganizer && (
                <>
                  <button
                    onClick={() => setShowEditCommunity(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <FaCog />
                    <span>Settings</span>
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <FaTrash />
                    <span>Delete</span>
                  </button>
                </>
              )}
              
              {isAuthenticated && !isOrganizer && (
                <button
                  onClick={handleJoinLeave}
                  disabled={isJoining}
                  className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                    isMember
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  } ${isJoining ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isMember ? <FaUserMinus /> : <FaUserPlus />}
                  <span>
                    {isJoining ? 'Loading...' : isMember ? 'Leave Community' : 'Join Community'}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {['posts', 'members', 'about'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
              activeTab === tab
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab} {tab === 'posts' && `(${posts.length})`}
            {tab === 'members' && `(${community.memberCount})`}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'posts' && (
          <div>
            {/* Create Post Button */}
            {canPost && (
              <div className="mb-6">
                <button
                  onClick={() => setShowCreatePost(true)}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FaPlus />
                  <span>Create Post</span>
                </button>
              </div>
            )}

            {/* Posts */}
            {isPostsLoading ? (
              <div className="text-center py-8">
                <div className="text-gray-600">Loading posts...</div>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <div className="text-gray-500 text-lg mb-2">No posts yet</div>
                <p className="text-gray-400">
                  {canPost ? 'Be the first to create a post!' : 'Join the community to see posts.'}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <div key={post._id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-start space-x-4">
                      <UserAvatar sx={{ width: 40, height: 40 }} />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-semibold text-gray-900">
                            {post.userId.firstname} {post.userId.lastname}
                          </span>
                          <span className="text-gray-500 text-sm">
                            @{post.userId.username}
                          </span>
                          <span className="text-gray-400 text-sm">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <Link
                          to={`/post/${post._id}`}
                          className="block hover:text-blue-600 transition-colors"
                        >
                          <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                          <p className="text-gray-700 mb-4 line-clamp-3">{post.content}</p>
                        </Link>

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

                        {/* Post Stats */}
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <span className="flex items-center space-x-1">
                            <FaHeart />
                            <span>{post.upvotes || 0}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <FaComment />
                            <span>{post.comments?.length || 0}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <FaEye />
                            <span>{post.views || 0}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Members ({community.memberCount})</h3>
            
            {/* Organizer */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Organizer</h4>
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                <UserAvatar sx={{ width: 40, height: 40 }} />
                <div>
                  <div className="font-semibold text-gray-900">
                    {community.organizer.firstname} {community.organizer.lastname}
                  </div>
                  <div className="text-sm text-gray-600">@{community.organizer.username}</div>
                </div>
                <div className="ml-auto">
                  <span className="px-2 py-1 bg-yellow-200 text-yellow-800 text-xs rounded-full">
                    Organizer
                  </span>
                </div>
              </div>
            </div>

            {/* Members */}
            {community.members.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                  Members ({community.members.length})
                </h4>
                <div className="space-y-3">
                  {community.members.map((member) => (
                    <div key={member._id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                      <UserAvatar sx={{ width: 40, height: 40 }} />
                      <div>
                        <div className="font-semibold text-gray-900">
                          {member.firstname} {member.lastname}
                        </div>
                        <div className="text-sm text-gray-600">@{member.username}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'about' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">About</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-gray-700">{community.description}</p>
              </div>

              {community.rules && community.rules.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Community Rules</h4>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700">
                    {community.rules.map((rule, index) => (
                      <li key={index}>{rule}</li>
                    ))}
                  </ol>
                </div>
              )}

              {community.tags && community.tags.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {community.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Community Info</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>Created: {new Date(community.createdAt).toLocaleDateString()}</div>
                  <div>Privacy: {community.isPrivate ? 'Private' : 'Public'}</div>
                  <div>Members: {community.memberCount}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      <Modal
        title="Create Post"
        openModal={showCreatePost}
        closeModal={() => setShowCreatePost(false)}
        size="lg"
      >
        <form onSubmit={handleCreatePost} className="space-y-4">
          <Input
            text="Title"
            placeholder="Enter post title"
            value={postForm.title}
            onChange={(e) => setPostForm(prev => ({ ...prev, title: e.target.value }))}
            outerStyle="w-full"
            required
          />
          
          <MultilineInput
            text="Content"
            placeholder="Write your post content..."
            value={postForm.content}
            onChange={(e) => setPostForm(prev => ({ ...prev, content: e.target.value }))}
            outerStyle="w-full"
            rows={6}
            required
          />
          
          <Input
            text="Tags (comma-separated)"
            placeholder="e.g. programming, javascript, tutorial"
            value={postForm.tags}
            onChange={(e) => setPostForm(prev => ({ ...prev, tags: e.target.value }))}
            outerStyle="w-full"
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              styles="bg-gray-500 hover:bg-gray-600"
              onClick={() => setShowCreatePost(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Create Post
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Community Modal */}
      <Modal
        title="Edit Community"
        openModal={showEditCommunity}
        closeModal={() => setShowEditCommunity(false)}
        size="lg"
      >
        <form onSubmit={handleEditCommunity} className="space-y-4">
          <Input
            text="Community Name"
            placeholder="Enter community name"
            value={editForm.name}
            onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
            outerStyle="w-full"
            required
          />
          
          <MultilineInput
            text="Description"
            placeholder="Describe your community..."
            value={editForm.description}
            onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
            outerStyle="w-full"
            rows={4}
            required
          />

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPrivate"
              checked={editForm.isPrivate}
              onChange={(e) => setEditForm(prev => ({ ...prev, isPrivate: e.target.checked }))}
              className="rounded"
            />
            <label htmlFor="isPrivate" className="text-sm text-gray-700">
              Make this community private
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              styles="bg-gray-500 hover:bg-gray-600"
              onClick={() => setShowEditCommunity(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Update Community
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Delete Community"
        openModal={showDeleteConfirm}
        closeModal={() => setShowDeleteConfirm(false)}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete this community? This action cannot be undone.
          </p>
          <p className="text-sm text-gray-500">
            All posts and data associated with this community will be permanently deleted.
          </p>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              styles="bg-gray-500 hover:bg-gray-600"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              styles="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteCommunity}
            >
              Delete Community
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CommunityDetail;
