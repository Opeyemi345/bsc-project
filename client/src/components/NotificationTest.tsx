import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FaBell, FaCheck, FaTimes } from 'react-icons/fa';

const NotificationTest: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const sendTestNotification = async () => {
    setIsLoading(true);
    setStatus('idle');

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast.error('Please log in to test notifications');
        setStatus('error');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/notifications/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: 'Test Notification 🎉',
          body: 'This is a test notification from OausConnect! If you see this, push notifications are working correctly.',
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Test notification sent! Check your browser notifications.');
        setStatus('success');
      } else {
        toast.info(data.message || 'Test notification sent (notifications may not be configured)');
        setStatus('success');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast.error('Failed to send test notification');
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const checkNotificationStatus = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/notifications/status`);
      const data = await response.json();

      if (data.success) {
        toast.info(data.data.message);
      }
    } catch (error) {
      console.error('Error checking notification status:', error);
      toast.error('Failed to check notification status');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <FaBell className="text-2xl text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Test Push Notifications
        </h3>
        <p className="text-sm text-gray-600">
          Test if push notifications are working correctly on your device.
        </p>
      </div>

      <div className="space-y-4">
        <button
          onClick={sendTestNotification}
          disabled={isLoading}
          className={`w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors ${
            isLoading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : status === 'success'
              ? 'bg-green-600 text-white hover:bg-green-700'
              : status === 'error'
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Sending...
            </>
          ) : status === 'success' ? (
            <>
              <FaCheck className="mr-2" />
              Test Sent!
            </>
          ) : status === 'error' ? (
            <>
              <FaTimes className="mr-2" />
              Try Again
            </>
          ) : (
            <>
              <FaBell className="mr-2" />
              Send Test Notification
            </>
          )}
        </button>

        <button
          onClick={checkNotificationStatus}
          className="w-full px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
        >
          Check Notification Status
        </button>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">
          How to enable notifications:
        </h4>
        <ol className="text-xs text-gray-600 space-y-1">
          <li>1. Click "Allow" when prompted for notification permission</li>
          <li>2. Make sure notifications are enabled in your browser settings</li>
          <li>3. Keep this tab open or pin it for background notifications</li>
          <li>4. Test notifications will appear in the top-right corner</li>
        </ol>
      </div>

      {status === 'success' && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            ✅ Test notification sent successfully! You should see a notification appear shortly.
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            ❌ Failed to send test notification. Make sure you're logged in and try again.
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationTest;
