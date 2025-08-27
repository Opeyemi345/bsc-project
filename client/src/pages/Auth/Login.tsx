import { useState } from "react"
import { useNavigate, Link } from 'react-router'
import { toast } from 'react-toastify'
import Input from "../../components/Input"
import Button from "../../components/Button"
import { GiPadlock } from "react-icons/gi";
import { FaRegUser } from "react-icons/fa";
import logo from '../../../src/assets/crop-removebg.png'
import { useAuth } from "../../contexts/AuthContext"

export default function Login() {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.username || !formData.password) {
            toast.error('Please fill in all fields');
            return;
        }

        setIsLoading(true);
        try {
            const success = await login(formData.username, formData.password);
            if (success) {
                navigate('/');
            }
            // Error handling is already done in AuthContext
        } catch (error) {
            // Error handling is already done in AuthContext
            console.error('Login error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return <div className="w-1/2 flex items-center mt-20 flex-col">
        <img src={logo} alt="" className='block w-[300px] h-[400px]' />
        <form className='w-2/3' onSubmit={handleSubmit}>
            <Input
                text="Username"
                placeholder='username or email'
                icon={<FaRegUser />}
                innerStyle=''
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
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
            <div className='flex justify-between'>
                <Link className='text-blue-600 cursor-pointer' to='/auth/forget-password'>Forget password?</Link>
            </div>
            <div className='w-[150px] mx-auto'>
                <Button
                    loading={isLoading}
                    styles=""
                    type="submit"
                >
                    Login
                </Button>
            </div>
            <Link className='text-blue-600 cursor-pointer text-center block mt-5 hover:underline' to='create-account'>Don't have an account yet? Create account</Link>
        </form>
    </div>
}