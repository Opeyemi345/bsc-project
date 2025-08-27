import React, { useState, useEffect } from 'react';
import { FaSearch, FaUser, FaCheck } from 'react-icons/fa';
import { userApi, type User } from '../services/api';
import { toast } from 'react-toastify';

interface UserSearchProps {
  onUserSelect: (user: User) => void;
  onUserDeselect: (user: User) => void;
  selectedUsers: User[];
  excludeUserIds?: string[];
  placeholder?: string;
  className?: string;
}

const UserSearch: React.FC<UserSearchProps> = ({
  onUserSelect,
  onUserDeselect,
  selectedUsers,
  excludeUserIds = [],
  placeholder = "Search users...",
  className = ""
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await userApi.searchUsers(searchQuery);
        if (response.success) {
          // Filter out excluded users and already selected users
          const filteredUsers = response.data.filter(user => 
            !excludeUserIds.includes(user.id) && 
            !selectedUsers.some(selected => selected.id === user.id)
          );
          setSearchResults(filteredUsers);
          setShowResults(true);
        }
      } catch (error) {
        console.error('Error searching users:', error);
        toast.error('Failed to search users');
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, excludeUserIds, selectedUsers]);

  const handleUserClick = (user: User) => {
    const isSelected = selectedUsers.some(selected => selected.id === user.id);
    if (isSelected) {
      onUserDeselect(user);
    } else {
      onUserSelect(user);
    }
    setSearchQuery('');
    setShowResults(false);
  };

  const handleInputFocus = () => {
    if (searchResults.length > 0) {
      setShowResults(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding results to allow for clicks
    setTimeout(() => setShowResults(false), 200);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Search Results */}
      {showResults && searchResults.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {searchResults.map((user) => (
            <div
              key={user.id}
              onClick={() => handleUserClick(user)}
              className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                {user.avater ? (
                  <img
                    src={user.avater}
                    alt={user.firstname}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <FaUser className="w-4 h-4 text-gray-600" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {user.firstname} {user.lastname}
                </p>
                <p className="text-xs text-gray-500">@{user.username}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected Users */}
      {selectedUsers.length > 0 && (
        <div className="mt-3">
          <p className="text-sm font-medium text-gray-700 mb-2">Selected Users:</p>
          <div className="flex flex-wrap gap-2">
            {selectedUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
              >
                <span>{user.firstname} {user.lastname}</span>
                <button
                  onClick={() => onUserDeselect(user)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSearch;
