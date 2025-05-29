import Input, {MultilineInput} from "../../components/Input"
import Button from "../../components/Button"
import { GiPadlock } from "react-icons/gi";
import { TbUser } from "react-icons/tb";
import { FaRegUser } from "react-icons/fa";
import logo from '../../../src/assets/logo.png'
import {Link} from 'react-router'
import { MdEmail } from "react-icons/md";


export default function Signup() {
    return <div className='w-1/2'>
        <div className='flex ml-[50px] items-center'>
        <img src={logo} alt="" className='w-[200px] h-[200px]'/>
        <div>

            <h3 className='text-4xl font-bold'>OAUSCONNECT</h3>
            <small className='text-orange-600 ml-2'>Create a free account for the first time.</small>
        </div>
        </div>
    <div className="w-full flex items-center mt-10 flex-col">
        <form className='w-2/3'>
        {/* <h2 className='text-2xl'>Sign up for the first time</h2> */}
            <Input text="Firstname" placeholder='firstname'  innerStyle=''/>
            <Input text="Lastname" placeholder='lastname' innerStyle=''/>
            <Input text="Username" placeholder='username' icon={<FaRegUser />} innerStyle=''/>
            <Input text="Email" placeholder='email' icon={<MdEmail />} innerStyle=''/>
            <Input text="Password" placeholder='password' icon={<GiPadlock />} innerStyle=''/>
            <div className='w-[80%]'>
            <MultilineInput text='Biography' placeholder='Tell us about yourself' innerStyle=''/>
            </div>
            <p className='p-2'>Already have an account? <Link className='text-blue-600 hover:underline' to='/auth'> Sign in </Link></p>
            <Button>Create account</Button>            
        </form>
    </div>
    </div> 
    }