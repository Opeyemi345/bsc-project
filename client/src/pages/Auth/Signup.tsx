import { useState } from "react"
import { useNavigate, Link } from 'react-router'
import { toast } from 'react-toastify'
import Input, { MultilineInput } from "../../components/Input"
import Button from "../../components/Button"
import { GiPadlock } from "react-icons/gi";
import { FaRegUser } from "react-icons/fa";
import logo from '../../../src/assets/logo.png'
import { MdEmail } from "react-icons/md";
import { useAuth } from "../../contexts/AuthContext"

export default function Signup() {
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        username: '',
        email: '',
        password: '',
        bio: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.firstname || !formData.lastname || !formData.username || !formData.email || !formData.password) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }

        setIsLoading(true);
        try {
            const success = await signup(formData);
            if (success) {
                toast.success('Account created successfully! Please login.');
                navigate('/auth');
            } else {
                toast.error('Failed to create account. Please try again.');
            }
        } catch (error) {
            toast.error('Account creation failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return <div className='w-1/2'>
        <div className='flex ml-[50px] items-center'>
            <img src={logo} alt="" className='w-[200px] h-[200px]' />
            <div>
                <h3 className='text-4xl font-bold'>OAUSCONNECT</h3>
                <small className='text-orange-600 ml-2'>Create a free account for the first time.</small>
            </div>
        </div>
        <div className="w-full flex items-center mt-10 flex-col">
            <form className='w-2/3' onSubmit={handleSubmit}>
                <Input
                    text="Firstname"
                    placeholder='firstname'
                    innerStyle=''
                    value={formData.firstname}
                    onChange={(e) => handleInputChange('firstname', e.target.value)}
                />
                <Input
                    text="Lastname"
                    placeholder='lastname'
                    innerStyle=''
                    value={formData.lastname}
                    onChange={(e) => handleInputChange('lastname', e.target.value)}
                />
                <Input
                    text="Username"
                    placeholder='username'
                    icon={<FaRegUser />}
                    innerStyle=''
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                />
                <Input
                    text="Email"
                    type="email"
                    placeholder='email'
                    icon={<MdEmail />}
                    innerStyle=''
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                />
                <Input
                    text="Password"
                    type="password"
                    placeholder='password'
                    icon={<GiPadlock />}
                    innerStyle=''
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                />
                <div className='w-[80%]'>
                    <MultilineInput
                        text='Biography'
                        placeholder='Tell us about yourself'
                        innerStyle=''
                        value={formData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                    />
                </div>
                <p className='p-2'>Already have an account? <Link className='text-blue-600 hover:underline' to='/auth'> Sign in </Link></p>
                <Button
                    loading={isLoading}
                    styles=""
                    type="submit"
                >
                    Create account
                </Button>
            </form>
        </div>
    </div>
}