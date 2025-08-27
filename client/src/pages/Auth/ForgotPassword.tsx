import { useState } from 'react';
import { toast } from 'react-toastify';
import logo from '../../../src/assets/crop-removebg.png'
import Input from "../../components/Input"
import Button from "../../components/Button"
import { GiPadlock } from "react-icons/gi";
import { MdEmail } from "react-icons/md";
import { useParams } from 'react-router';
import { authApi } from '../../services/api';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            toast.error('Please enter your email address');
            return;
        }

        setIsLoading(true);
        try {
            const response = await authApi.forgotPassword(email);
            if (response.success) {
                toast.success('Password reset instructions sent to your email!');
                setEmail('');
            } else {
                toast.error(response.message || 'Failed to send reset instructions');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to send reset instructions');
        } finally {
            setIsLoading(false);
        }
    };

    return <div className="w-1/2 flex items-center mt-20 flex-col">
        <img src={logo} alt="" className='block w-[300px] h-[400px]' />
        <form className='w-2/3' onSubmit={handleSubmit}>
            <p className='p-3'>Enter email registered with your account and click on the button below, you should get an instruction on resetting your password.</p>
            <Input
                type='email'
                placeholder='email'
                icon={<MdEmail />}
                innerStyle=''
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" loading={isLoading}>
                {isLoading ? 'Sending...' : 'Send instruction'}
            </Button>
        </form>
    </div>
}

export function ResetPassword() {
    const { token } = useParams();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newPassword) {
            toast.error('Please enter a new password');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (!token) {
            toast.error('Invalid reset token');
            return;
        }

        setIsLoading(true);
        try {
            const response = await authApi.resetPassword(token, newPassword);
            if (response.success) {
                toast.success('Password reset successful! You can now login with your new password.');
                setNewPassword('');
                setConfirmPassword('');
                // Optionally redirect to login page
                setTimeout(() => {
                    window.location.href = '/auth';
                }, 2000);
            } else {
                toast.error(response.message || 'Failed to reset password');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to reset password');
        } finally {
            setIsLoading(false);
        }
    };

    return <div className="w-1/2 flex items-center mt-20 flex-col">
        <img src={logo} alt="" className='block w-[300px] h-[400px]' />
        <form className='w-2/3' onSubmit={handleSubmit}>
            <p className='p-3 mb-4'>Enter your new password below.</p>
            <Input
                type='password'
                text="New password"
                placeholder='Enter new password'
                icon={<GiPadlock />}
                innerStyle=''
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
            />
            <div className="mt-4">
                <Input
                    type='password'
                    text="Confirm password"
                    placeholder='Confirm new password'
                    icon={<GiPadlock />}
                    innerStyle=''
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
            </div>
            <Button type="submit" loading={isLoading}>
                {isLoading ? 'Resetting...' : 'Reset password'}
            </Button>
        </form>
    </div>
}