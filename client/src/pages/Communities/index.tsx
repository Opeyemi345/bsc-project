import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaPlus, FaUsers, FaLock, FaGlobe, FaSearch, FaFilter } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { communityApi, type Community } from '../../services/api';
import CommunityCard from '../../components/CommunityCard';
import CreateCommunityModal from '../../components/CreateCommunityModal';
import Input from '../../components/Input';

const Communities: React.FC = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [userCommunities, setUserCommunities] = useState<Community[]>([]);
  const [filteredCommunities, setFilteredCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'members' | 'name'>('createdAt');
  const { user, isAuthenticated } = useAuth();

  // Load all communities
  const loadCommunities = async () => {
    setIsLoading(true);
    try {
      const response = await communityApi.getAllCommunities({
        page: 1,
        limit: 50,
        sortBy
      });

      if (response.success) {
        setCommunities(response.data);
        setFilteredCommunities(response.data);
      } else {
        toast.error('Failed to load communities');
      }
    } catch (error) {
      console.error('Error loading communities:', error);
      toast.error('Failed to load communities');
    } finally {
      setIsLoading(false);
    }
  };

  // Load user's communities
  const loadUserCommunities = async () => {
    if (!isAuthenticated) {
      setUserCommunities([]);
      return;
    }

    try {
      // Filter communities where user is a member
      const userComms = communities.filter(community =>
        community.members.some(member => member._id === user?.id) ||
        community.organizer._id === user?.id
      );
      setUserCommunities(userComms);
    } catch (error) {
      console.error('Error loading user communities:', error);
    }
  };

  useEffect(() => {
    loadCommunities();
  }, [sortBy]);

  useEffect(() => {
    loadUserCommunities();
  }, [communities, user, isAuthenticated]);

  // Search and filter functionality
  useEffect(() => {
    let filtered = [...communities];

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(community =>
        community.name.toLowerCase().includes(term) ||
        community.description.toLowerCase().includes(term) ||
        community.tags?.some(tag => tag.toLowerCase().includes(term))
      );
    }

    setFilteredCommunities(filtered);
  }, [communities, searchTerm]);

  const handleJoinCommunity = async (communityId: string) => {
    if (!isAuthenticated) {
      toast.error('Please login to join communities');
      return;
    }

    try {
      const response = await communityApi.joinCommunity(communityId);
      if (response.success) {
        toast.success('Successfully joined the community!');

        // Update local state
        setCommunities(prev => prev.map(c =>
          c._id === communityId
            ? {
              ...c,
              memberCount: c.memberCount + 1,
              members: user ? [...c.members, user] : c.members
            }
            : c
        ));

        // Reload user communities
        loadUserCommunities();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to join community');
    }
  };

  const handleLeaveCommunity = async (communityId: string) => {
    try {
      const response = await communityApi.leaveCommunity(communityId);
      if (response.success) {
        toast.success('Successfully left the community!');

        // Update local state
        setCommunities(prev => prev.map(c =>
          c._id === communityId
            ? {
              ...c,
              memberCount: Math.max(0, c.memberCount - 1),
              members: c.members.filter(member => member._id !== user?.id)
            }
            : c
        ));

        // Reload user communities
        loadUserCommunities();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to leave community');
    }
  };

  const handleCommunityCreated = (newCommunity: Community) => {
    setCommunities(prev => [newCommunity, ...prev]);
    setFilteredCommunities(prev => [newCommunity, ...prev]);
    loadUserCommunities();
  };

  const displayCommunities = activeTab === 'all' ? filteredCommunities : userCommunities;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-xl">Loading communities...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Communities</h1>
        {isAuthenticated && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaPlus />
            <span>Create Community</span>
          </button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search communities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center space-x-2">
          <FaFilter className="text-gray-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="createdAt">Newest First</option>
            <option value="members">Most Members</option>
            <option value="name">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'all'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          All Communities ({filteredCommunities.length})
        </button>
        {isAuthenticated && (
          <button
            onClick={() => setActiveTab('my')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'my'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            My Communities ({userCommunities.length})
          </button>
        )}
      </div>

      {/* Communities Grid */}
      {displayCommunities.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <div className="text-gray-500 text-lg mb-4">
            {activeTab === 'all'
              ? (searchTerm ? 'No communities match your search' : 'No communities found')
              : 'You haven\'t joined any communities yet'
            }
          </div>
          <p className="text-gray-400 mb-4">
            {activeTab === 'all'
              ? (searchTerm ? 'Try adjusting your search terms' : 'Be the first to create a community!')
              : 'Explore and join communities that interest you!'
            }
          </p>
          {activeTab === 'all' && !searchTerm && isAuthenticated && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaPlus />
              <span>Create First Community</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayCommunities.map((community) => (
            <CommunityCard
              key={community._id}
              community={community}
              onJoin={handleJoinCommunity}
              onLeave={handleLeaveCommunity}
              showJoinButton={true}
            />
          ))}
        </div>
      )}

      {/* Create Community Modal */}
      <CreateCommunityModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCommunityCreated}
      />
    </div>
  );
};

export default Communities;
