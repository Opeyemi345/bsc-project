import Input from "../../components/Input"
import Button from "../../components/Button"
import { GiPadlock } from "react-icons/gi";
import { TbUser } from "react-icons/tb";
import { FaRegUser } from "react-icons/fa";
import logo from '../../../src/assets/crop-removebg.png'
import {Link} from 'react-router'

export default function Login() {
    return <div className="w-1/2 flex items-center mt-20 flex-col">
        <img src={logo} alt="" className='block w-[300px] h-[400px]'/>
        <form className='w-2/3'>
            <Input text="Username" placeholder='username or email' icon={<FaRegUser />} innerStyle=''/>
            <Input text="Password" placeholder='password' icon={<GiPadlock />} innerStyle=''/>
            <div className='flex justify-between'>
            <Link className='text-blue-600 cursor-pointer' to='/auth/forget-password'>Forget password?</Link>
            </div>
            <div className='w-[150px] mx-auto'>
            <Button>Login</Button>
            </div>
            <Link className='text-blue-600 cursor-pointer text-center block mt-5 hover:underline' to='create-account'>Don't have an account yet? Create account</Link>
        </form>
    </div>
}