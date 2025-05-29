import logo from '../../../src/assets/crop-removebg.png'
import Input from "../../components/Input"
import Button from "../../components/Button"
import { GiPadlock } from "react-icons/gi";
import { MdEmail } from "react-icons/md";
import { useParams } from 'react-router';

export default function ForgotPassword() {
    return <div className="w-1/2 flex items-center mt-20 flex-col">
        <img src={logo} alt="" className='block w-[300px] h-[400px]'/>
        <form className='w-2/3'>
        <p className='p-3'>Enter email registered with your account and click on the button below, you should get an instruction on resetting your password.</p>
            <Input type='email' placeholder='email' icon={<MdEmail />} innerStyle=''/>
            <Button>Send instruction</Button>
        </form>
    </div>
}

export function ResetPassword() {
    const param = useParams();
    return <div className="w-1/2 flex items-center mt-20 flex-col">
        <img src={logo} alt="" className='block w-[300px] h-[400px]'/>
        <form className='w-2/3'> 
            <Input type='password' text="New passowrd" placeholder='Enter new password' icon={<GiPadlock />} innerStyle=''/>
            <Button>Reset password</Button>
        </form>
    </div>
}