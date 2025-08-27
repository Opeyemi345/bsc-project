import { useRef, useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { CiEdit } from "react-icons/ci";
import Button from "../../components/Button";
import Input, { MultilineInput } from "../../components/Input";
import { FaCamera, FaHeart, FaComment, FaEye } from "react-icons/fa";
import Modal from "../../components/Modal";
import { toast } from 'react-toastify';

import UserAvatar from "../../components/UserAvatar";
import { Popover } from "@mui/material";
import { userApi, contentApi, type Content } from "../../services/api";


// const CameraModal = lazy(()=> import('../../components/Modal'))

export default function UserProfile() {
    const { user } = useAuth();
    const [openProfileModal, setOpenProfileModal] = useState(false);
    const [openCameraModal, setOpenCameraModal] = useState(false);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [openPopover, setOpenPopover] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userPosts, setUserPosts] = useState<Content[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts');
    const cameraRef = useRef<HTMLVideoElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Form data for profile editing
    const [formData, setFormData] = useState({
        firstname: user?.firstname || '',
        lastname: user?.lastname || '',
        username: user?.username || '',
        bio: user?.bio || '',
        phone: ''
    });

    let streamRef = useRef<MediaStream>(null);

    // Fetch user posts
    const fetchUserPosts = async () => {
        if (!user?.id) {
            return;
        }

        setIsLoading(true);
        try {
            const response = await contentApi.getUserContent(user.id, 1, 20);

            if (response.success) {
                setUserPosts(response.data || []);
            } else {
                toast.error(response.message || 'Failed to load posts');
            }
        } catch (error) {
            console.error('Error fetching user posts:', error);
            toast.error('Failed to load user posts');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle profile update
    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.firstname || !formData.lastname || !formData.username) {
            toast.error('Please fill in all required fields');
            return;
        }

        setIsUpdating(true);
        try {
            const response = await userApi.updateProfile({
                firstname: formData.firstname,
                lastname: formData.lastname,
                username: formData.username,
                bio: formData.bio
            });

            if (response.success) {
                toast.success('Profile updated successfully!');
                setOpenProfileModal(false);
                // Update user context if needed
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setIsUpdating(false);
        }
    };

    // Handle input changes
    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Handle profile picture upload
    const handleProfilePictureUpload = async (file: File) => {
        setIsUploadingAvatar(true);
        try {
            const formData = new FormData();
            formData.append('avatar', file);

            const token = localStorage.getItem('authToken');
            const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';

            const response = await fetch(`${apiUrl}/upload/avatar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                toast.success('Profile picture updated successfully!');

                // Update the user's avatar in the backend
                try {
                    const updateResponse = await userApi.updateProfile({
                        avatar: result.data.url
                    });

                    if (updateResponse.success) {
                        // Refresh the page to show the new avatar
                        window.location.reload();
                    }
                } catch (updateError) {
                    toast.success('Avatar uploaded but profile update failed. Please refresh the page.');
                }
            } else {
                toast.error(result.message || 'Failed to upload profile picture');
            }
        } catch (error) {
            toast.error('Failed to upload profile picture');
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    // Handle file input change
    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error('Please select an image file');
                return;
            }

            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size must be less than 5MB');
                return;
            }

            handleProfilePictureUpload(file);
        }
    };

    async function openCamera(constraints: MediaStreamConstraints) {
        let stream;
        try {
            stream = await navigator.mediaDevices.getUserMedia(constraints);
            if (cameraRef.current) {
                cameraRef.current.srcObject = stream
            }
            streamRef.current = stream
        } catch (err: any) {
            console.log(err);
            setError(err.message)
        }
    }

    // Load user posts when user is available
    useEffect(() => {
        if (user?.id) {
            fetchUserPosts();
        }
    }, [user?.id]);
    return <div className="max-w-4xl mx-auto p-4">
        {/* Cover Photo */}
        <div className="bg-gradient-to-r from-blue-400 to-purple-500 h-52 rounded-lg relative">
            <CiEdit
                className="absolute top-4 right-4 w-8 h-8 cursor-pointer text-white hover:scale-110 transition-all bg-black bg-opacity-30 rounded-full p-1"
                title="Edit profile"
                onClick={() => setOpenProfileModal(true)}
            />
        </div>

        {/* Profile Info */}
        <div className="relative -mt-20 mb-8">
            <div className="flex flex-col items-center">
                <div className="mb-4">
                    <UserAvatar sx={{ width: 150, height: 150, border: '4px solid white' }} />
                </div>
                <h1 className="text-3xl font-bold text-gray-800">
                    {user?.firstname} {user?.lastname}
                </h1>
                <p className="text-lg text-gray-600 mb-2">@{user?.username}</p>
                <p className="text-gray-700 text-center max-w-md">
                    {user?.bio || 'No bio available'}
                </p>

                {/* Stats */}
                <div className="flex gap-6 mt-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-800">{userPosts.length}</div>
                        <div className="text-sm text-gray-600">Posts</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-800">
                            {userPosts.reduce((sum, post) => sum + (post.upvotes || 0), 0)}
                        </div>
                        <div className="text-sm text-gray-600">Likes</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-800">
                            {userPosts.reduce((sum, post) => sum + (post.views || 0), 0)}
                        </div>
                        <div className="text-sm text-gray-600">Views</div>
                    </div>
                    <div className="text-center">
                        <button
                            onClick={fetchUserPosts}
                            className="text-sm text-blue-600 hover:text-blue-800 underline"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Loading...' : 'Refresh Posts'}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
                <button
                    onClick={() => setActiveTab('posts')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'posts'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                >
                    Posts ({userPosts.length})
                </button>
                <button
                    onClick={() => setActiveTab('about')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'about'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                >
                    About
                </button>
            </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'posts' && (
            <div>
                {isLoading ? (
                    <div className="text-center py-8">
                        <div className="text-gray-600">Loading posts...</div>
                    </div>
                ) : userPosts.length > 0 ? (
                    <div className="grid gap-6">
                        {userPosts.map((post) => (
                            <div key={post._id} className="bg-white rounded-lg shadow-md p-6 border">
                                <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                                <p className="text-gray-700 mb-4">{post.content}</p>

                                {/* Post Stats */}
                                <div className="flex items-center gap-6 text-sm text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <FaHeart className="text-red-500" />
                                        <span>{post.upvotes}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <FaComment className="text-blue-500" />
                                        <span>{post.comments?.length || 0}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <FaEye className="text-gray-500" />
                                        <span>{post.views}</span>
                                    </div>
                                    <div className="ml-auto">
                                        {new Date(post.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-gray-500 text-lg">No posts yet</div>
                        <p className="text-gray-400 mt-2">Start sharing your thoughts with the community!</p>
                    </div>
                )}
            </div>
        )}

        {activeTab === 'about' && (
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-4">About</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <p className="text-gray-900">{user?.firstname} {user?.lastname}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Username</label>
                        <p className="text-gray-900">@{user?.username}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <p className="text-gray-900">{user?.email}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Bio</label>
                        <p className="text-gray-900">{user?.bio || 'No bio available'}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Member Since</label>
                        <p className="text-gray-900">
                            {user?.id ? 'Recently joined' : 'Unknown'}
                        </p>
                    </div>
                </div>
            </div>
        )}


        <Modal size="lg" title="Edit profile" openModal={openProfileModal} closeModal={() => setOpenProfileModal(false)}>
            <form onSubmit={handleProfileUpdate}>
                <div className="w-fit mx-auto relative" aria-describedby="profilepicture">
                    <UserAvatar sx={{ width: 155, height: 155 }} alt='account' />
                    {isUploadingAvatar && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                            <div className="text-white text-sm">Uploading...</div>
                        </div>
                    )}
                    <div className="w-8 h-8 right-2 bottom-4 rounded-full absolute bg-white flex justify-center items-center">
                        <FaCamera
                            size='20px'
                            className="hover:scale-95 transition-all cursor-pointer"
                            onClick={(e) => {
                                setOpenPopover(!openPopover)
                                setAnchorEl(e.currentTarget)
                            }}
                        />
                    </div>
                    <Popover
                        id="profilepicture"
                        open={openPopover}
                        onClose={() => setOpenPopover(false)}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right'
                        }}
                        anchorEl={anchorEl}
                    >
                        <ul className="p-3">
                            <li className="cursor-pointer hover:text-orange-700">View picture</li>
                            <li className="cursor-pointer my-2 hover:text-orange-700"
                                onClick={() => {
                                    setOpenCameraModal(true)
                                    setOpenPopover(false)
                                }}
                            >Open camera</li>
                            <li className="cursor-pointer hover:text-orange-700"
                                onClick={() => {
                                    fileInputRef.current?.click();
                                    setOpenPopover(false);
                                }}
                            >
                                Upload from device
                            </li>
                        </ul>
                    </Popover>

                    {/* Hidden file input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileInputChange}
                        className="hidden"
                    />
                </div>

                <div className="grid grid-cols-2 gap-x-6 mt-6">
                    <Input
                        text="First Name*"
                        value={formData.firstname}
                        onChange={(e) => handleInputChange('firstname', e.target.value)}
                        placeholder="Enter first name"
                    />
                    <Input
                        text="Last Name*"
                        value={formData.lastname}
                        onChange={(e) => handleInputChange('lastname', e.target.value)}
                        placeholder="Enter last name"
                    />
                    <Input
                        text="Username*"
                        value={formData.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        placeholder="Enter username"
                    />
                    <Input
                        text="Phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="Enter phone number"
                    />
                </div>

                <div className="mt-4">
                    <MultilineInput
                        text="Bio"
                        placeholder="Tell us about yourself..."
                        value={formData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        outerStyle="w-full"
                    />
                </div>

                <div className="flex gap-4 justify-center mt-6">
                    <div className="w-[120px]">
                        <Button
                            type="button"
                            styles="bg-gray-500 hover:bg-gray-600"
                            onClick={() => setOpenProfileModal(false)}
                            loading={false}
                        >
                            Cancel
                        </Button>
                    </div>
                    <div className="w-[120px]">
                        <Button
                            type="submit"
                            loading={isUpdating}
                            styles=""
                        >
                            Update
                        </Button>
                    </div>
                </div>
            </form>
        </Modal>
        {
            openCameraModal && <Modal openModal={openCameraModal} closeModal={() => {
                console.log('Stream ref on closing' + streamRef.current)
                streamRef.current?.getVideoTracks().forEach((track) => {
                    track.stop()
                })
                if (cameraRef.current) {
                    cameraRef.current.srcObject = null;
                }
                if (cameraRef.current) {
                    cameraRef.current.pause();
                    cameraRef.current.srcObject = null;
                }

                streamRef.current = null;
                console.log('Stream ref after closing' + streamRef.current)
                setOpenCameraModal(false)
            }}
                onRender={() => openCamera({ video: true, audio: false })}
                size="md"
            >   {
                    error ? <p className="text-red-600 text-center">Error: {error}, Please ensure you enable access to your camera.</p> :
                        <video className="h-max w-full" ref={cameraRef} autoPlay={true}></video>
                }
            </Modal>
        }
    </div>
}

export function AccountSettings() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/auth');
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!oldPassword || !newPassword) {
            toast.error('Please fill in both password fields');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('New password must be at least 6 characters long');
            return;
        }

        setIsChangingPassword(true);
        try {
            const response = await userApi.changePassword(oldPassword, newPassword);
            if (response.success) {
                toast.success('Password changed successfully!');
                setOldPassword('');
                setNewPassword('');
            } else {
                toast.error(response.message || 'Failed to change password');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to change password');
        } finally {
            setIsChangingPassword(false);
        }
    };

    return location.pathname === '/account' ?
        <div className="w-2/3 mx-auto mt-10 flex flex-col justify-between">
            <h3 className="text-3xl">Account</h3>
            <div className="my-5 ml-5">
                <p className="text-orange-600">Profile</p>
                <div className="flex my-5 items-center ">
                    <UserAvatar sx={{ width: 75, height: 75 }} />
                    <div className="ml-3">
                        <p>{user.firstname + ' ' + user.lastname}</p>
                        <small className="text-[#888787]">Joined july 19th 2024</small><br />
                        <Link to='profile'>
                            <small className="text-blue-600">view profile </small>
                        </Link>
                    </div>
                </div>
                <p className="text-[#888787]">Click on view profile above to edit your profile in the profile page.</p>
            </div>

            <h3 className="text-3xl">Settings</h3>
            <div className="my-5 ml-5">
                <p className="text-orange-600">Change password</p>
                <form onSubmit={handleChangePassword}>
                    <Input
                        text="Old password"
                        type="password"
                        placeholder='Enter old password'
                        outerStyle="w-[400px]"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                    />
                    <div className="my-4">
                        <Input
                            text="New password"
                            type="password"
                            placeholder='Enter new password'
                            outerStyle="w-[400px]"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>
                    <div className="w-[185px] mt-3">
                        <Button type="submit" loading={isChangingPassword}>
                            {isChangingPassword ? 'Changing...' : 'Change password'}
                        </Button>
                    </div>
                </form>
            </div>
            <div className="mt-10">
                <Button
                    styles=""
                    color="error"
                    onClick={handleLogout}
                    loading={false}
                >
                    Logout
                </Button>
            </div>
        </div> : <Outlet />
}