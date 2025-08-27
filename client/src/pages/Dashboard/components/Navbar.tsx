import Modal from '../../../components/Modal';
import logo from '../../../assets/logo.png'
import { VscBell } from "react-icons/vsc";
import { VscBellDot } from "react-icons/vsc";
import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import UserAvatar from '../../../components/UserAvatar';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-toastify';

interface Notification {
    _id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    isRead: boolean;
    createdAt: string;
}

export default function Navbar() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [openNotificationModal, setOpenNotificationModal] = useState(false);
    const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
    const { user } = useAuth();

    const hasUnreadNotifications = notifications.some(n => !n.isRead);

    // Fetch notifications
    const fetchNotifications = async () => {
        if (!user) return;

        setIsLoadingNotifications(true);
        try {
            const token = localStorage.getItem('authToken');
            const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';

            const response = await fetch(`${apiUrl}/notifications`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();

            if (result.success) {
                setNotifications(result.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            // For demo purposes, add some mock notifications
            setNotifications([
                {
                    _id: '1',
                    title: 'Welcome to OausConnect!',
                    message: 'Thank you for joining our community. Start by creating your first post or joining a community.',
                    type: 'info',
                    isRead: false,
                    createdAt: new Date().toISOString()
                },
                {
                    _id: '2',
                    title: 'New Feature Available',
                    message: 'Check out the new chat feature! You can now send direct messages and create group chats.',
                    type: 'success',
                    isRead: false,
                    createdAt: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
                },
                {
                    _id: '3',
                    title: 'Profile Update',
                    message: 'Don\'t forget to complete your profile by adding a bio and profile picture.',
                    type: 'warning',
                    isRead: true,
                    createdAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
                }
            ]);
        } finally {
            setIsLoadingNotifications(false);
        }
    };

    // Mark notification as read
    const markAsRead = async (notificationId: string) => {
        try {
            const token = localStorage.getItem('authToken');
            const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';

            await fetch(`${apiUrl}/notifications/${notificationId}/read`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Update local state
            setNotifications(prev =>
                prev.map(n =>
                    n._id === notificationId ? { ...n, isRead: true } : n
                )
            );
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
            // Still update local state for demo
            setNotifications(prev =>
                prev.map(n =>
                    n._id === notificationId ? { ...n, isRead: true } : n
                )
            );
        }
    };

    // Mark all as read
    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';

            await fetch(`${apiUrl}/notifications/read-all`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            toast.success('All notifications marked as read');
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
            // Still update local state for demo
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            toast.success('All notifications marked as read');
        }
    };

    // Load notifications when component mounts or user changes
    useEffect(() => {
        if (user) {
            fetchNotifications();
        }
    }, [user]);

    // Format time ago
    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
    };

    return <nav className='flex justify-around items-center shadow-md py-2'>
        <Link to='/'>
            <section className='flex items-center'>
                <img src={logo} className='w-[100px] h-[100px] block' />
                <div>
                    <h1 className='text-2xl font-semibold'>OAUSCONNECT</h1>
                    <small className='text-orange-600'>Home of connection that lasts</small>
                </div>
            </section>
        </Link>
        <section className='flex'>
            {/* <VscAccount className='text-2xl'/> */}
            <Link to='account'>
                <UserAvatar sx={{ width: 25, height: 25 }} className='transition-all hover:scale-125 cursor-pointer' alt='account'></UserAvatar>
                {/* <Avatar ></Avatar> */}
            </Link>
            <div className="relative">
                {hasUnreadNotifications ? (
                    <VscBellDot
                        className='text-2xl mx-5 transition-all hover:scale-125 cursor-pointer text-orange-600'
                        title='You have unread notifications'
                        onClick={() => setOpenNotificationModal(true)}
                    />
                ) : (
                    <VscBell
                        className='text-2xl mx-5 transition-all hover:scale-125 cursor-pointer'
                        title='Notifications'
                        onClick={() => setOpenNotificationModal(true)}
                    />
                )}
                {hasUnreadNotifications && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                )}
            </div>
        </section>

        <Modal fixedTo='right' openModal={openNotificationModal} closeModal={() => setOpenNotificationModal(false)}>
            <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Notifications</h2>
                    {hasUnreadNotifications && (
                        <button
                            onClick={markAllAsRead}
                            className="text-sm text-blue-600 hover:text-blue-800"
                        >
                            Mark all as read
                        </button>
                    )}
                </div>

                {isLoadingNotifications ? (
                    <div className="text-center py-8">
                        <div className="text-gray-600">Loading notifications...</div>
                    </div>
                ) : notifications.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {notifications.map((notification) => (
                            <div
                                key={notification._id}
                                className={`p-3 rounded-lg border cursor-pointer transition-colors ${notification.isRead
                                        ? 'bg-gray-50 border-gray-200'
                                        : 'bg-blue-50 border-blue-200'
                                    }`}
                                onClick={() => !notification.isRead && markAsRead(notification._id)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-medium text-sm">{notification.title}</h3>
                                            {!notification.isRead && (
                                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-700 mb-2">
                                            {notification.message}
                                        </p>
                                        <small className="text-xs text-gray-500">
                                            {formatTimeAgo(notification.createdAt)}
                                        </small>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <div className="text-gray-500">No notifications yet</div>
                        <p className="text-sm text-gray-400 mt-1">
                            You'll see notifications here when you have new activity
                        </p>
                    </div>
                )}
            </div>
        </Modal>
    </nav>
}